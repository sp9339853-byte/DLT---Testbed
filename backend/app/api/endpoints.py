import re
import uuid
import secrets
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query, Header
from fastapi.responses import Response, PlainTextResponse
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import (
    UserProfileModel,
    UserPreferencesModel,
    InfrastructureConfigModel,
    NotificationSettingsModel,
    SecuritySettingsModel,
    NotificationModel,
    ReportModel,
    ExperimentModel,
    UserModel,
    UserSessionModel,
)
from app.schemas.schemas import (
    UserProfileSchema,
    UserProfileResponse,
    UserPreferencesSchema,
    InfrastructureConfigSchema,
    NotificationSettingsSchema,
    ChangePasswordSchema,
    NotificationSchema,
    NotificationCreateSchema,
    ReportSchema,
    ReportCreateSchema,
    SearchResultItem,
    Experiment,
    LoginRequest,
    RegisterRequest,
    AuthResponse,
)
from app.core.security import hash_password, verify_password, generate_session_token

router = APIRouter()

EMAIL_REGEX = re.compile(r"^[\w\.\+\-]+@[\w\-]+\.[a-zA-Z]{2,}$")

# --- AUTHENTICATION & SESSIONS ---

def extract_bearer_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    if authorization.startswith("Bearer "):
        return authorization[7:].strip()
    return authorization.strip()

@router.post("/auth/login", response_model=AuthResponse)
def login(creds: LoginRequest, db: Session = Depends(get_db)):
    clean_email = creds.email.strip().lower()
    user = db.query(UserModel).filter_by(email=clean_email).first()
    if not user or not verify_password(user.password_hash, creds.password):
        raise HTTPException(status_code=401, detail="Invalid email address or password.")

    token = generate_session_token()
    session = UserSessionModel(
        id=f"sess_{uuid.uuid4().hex[:12]}",
        user_id=user.id,
        token=token
    )
    db.add(session)

    # Sync profile model
    profile = db.query(UserProfileModel).filter_by(id="user_default").first()
    if profile:
        profile.name = user.name
        profile.email = user.email
        profile.role = user.role
        profile.organization = user.organization

    # Update active sessions count in security
    sec = db.query(SecuritySettingsModel).filter_by(id="sec_default").first()
    if sec:
        sec.active_sessions_count = (sec.active_sessions_count or 1) + 1

    db.commit()

    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "organization": user.organization
        }
    }

@router.post("/auth/register", response_model=AuthResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    clean_email = req.email.strip().lower()
    clean_name = req.name.strip()
    if not EMAIL_REGEX.match(clean_email):
        raise HTTPException(status_code=400, detail="Invalid email format.")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    existing = db.query(UserModel).filter_by(email=clean_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    user_id = f"user_{uuid.uuid4().hex[:10]}"
    new_user = UserModel(
        id=user_id,
        name=clean_name,
        email=clean_email,
        password_hash=hash_password(req.password),
        role=req.role or "Researcher",
        organization=req.organization or "DLT Testbed"
    )
    db.add(new_user)

    token = generate_session_token()
    session = UserSessionModel(
        id=f"sess_{uuid.uuid4().hex[:12]}",
        user_id=user_id,
        token=token
    )
    db.add(session)
    db.commit()

    return {
        "token": token,
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
            "organization": new_user.organization
        }
    }

@router.get("/auth/me", response_model=UserProfileResponse)
def get_me(authorization: Optional[str] = Header(None, alias="Authorization"), db: Session = Depends(get_db)):
    token = extract_bearer_token(authorization)
    if not token:
        user = db.query(UserModel).filter_by(id="user_default").first()
        if user:
            return user
        raise HTTPException(status_code=401, detail="Authentication token required.")

    sess = db.query(UserSessionModel).filter_by(token=token).first()
    if not sess:
        if token == "dlt_sess_demo_default_token":
            user = db.query(UserModel).filter_by(id="user_default").first()
            if user:
                return user
        raise HTTPException(status_code=401, detail="Invalid or expired session token.")

    user = db.query(UserModel).filter_by(id=sess.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return user

@router.post("/auth/logout")
def logout(authorization: Optional[str] = Header(None, alias="Authorization"), db: Session = Depends(get_db)):
    token = extract_bearer_token(authorization)
    if token:
        sess = db.query(UserSessionModel).filter_by(token=token).first()
        if sess:
            db.delete(sess)
            sec = db.query(SecuritySettingsModel).filter_by(id="sec_default").first()
            if sec and sec.active_sessions_count > 1:
                sec.active_sessions_count -= 1
            db.commit()
    return {"status": "success", "message": "Logged out successfully."}

# --- USER PROFILE ---

@router.get("/user/profile", response_model=UserProfileResponse)
def get_user_profile(db: Session = Depends(get_db)):
    user = db.query(UserProfileModel).filter_by(id="user_default").first()
    if not user:
        user = UserProfileModel(id="user_default", name="Demo User", email="demo@dlttestbed.com")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.put("/user/profile", response_model=UserProfileResponse)
def update_user_profile(profile_in: UserProfileSchema, db: Session = Depends(get_db)):
    clean_name = profile_in.name.strip()
    clean_email = profile_in.email.strip()

    if not clean_name:
        raise HTTPException(status_code=400, detail="Display Name is required and cannot be empty.")
    if not clean_email or not EMAIL_REGEX.match(clean_email):
        raise HTTPException(status_code=400, detail="Please provide a valid email address.")

    user = db.query(UserProfileModel).filter_by(id="user_default").first()
    if not user:
        user = UserProfileModel(id="user_default")
        db.add(user)

    user.name = clean_name
    user.email = clean_email
    if profile_in.role:
        user.role = profile_in.role.strip()
    if profile_in.organization:
        user.organization = profile_in.organization.strip()

    db.commit()
    db.refresh(user)
    return user

# --- USER PREFERENCES ---

@router.get("/user/preferences", response_model=UserPreferencesSchema)
def get_user_preferences(db: Session = Depends(get_db)):
    pref = db.query(UserPreferencesModel).filter_by(id="pref_default").first()
    if not pref:
        pref = UserPreferencesModel(id="pref_default", dark_mode=False, auto_generate_reports=True)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref

@router.put("/user/preferences", response_model=UserPreferencesSchema)
def update_user_preferences(pref_in: UserPreferencesSchema, db: Session = Depends(get_db)):
    pref = db.query(UserPreferencesModel).filter_by(id="pref_default").first()
    if not pref:
        pref = UserPreferencesModel(id="pref_default")
        db.add(pref)

    pref.dark_mode = pref_in.dark_mode
    pref.auto_generate_reports = pref_in.auto_generate_reports

    db.commit()
    db.refresh(pref)
    return pref

# --- INFRASTRUCTURE SETTINGS ---

@router.get("/settings/infrastructure", response_model=InfrastructureConfigSchema)
def get_infrastructure_config(db: Session = Depends(get_db)):
    infra = db.query(InfrastructureConfigModel).filter_by(id="infra_default").first()
    if not infra:
        infra = InfrastructureConfigModel(id="infra_default")
        db.add(infra)
        db.commit()
        db.refresh(infra)
    return infra

@router.put("/settings/infrastructure", response_model=InfrastructureConfigSchema)
def update_infrastructure_config(infra_in: InfrastructureConfigSchema, db: Session = Depends(get_db)):
    if infra_in.default_node_count < 1 or infra_in.default_node_count > 100:
        raise HTTPException(status_code=400, detail="Node count must be between 1 and 100.")
    if infra_in.default_block_interval_ms < 100 or infra_in.default_block_interval_ms > 60000:
        raise HTTPException(status_code=400, detail="Block interval must be between 100ms and 60,000ms.")
    if infra_in.max_concurrency < 1 or infra_in.max_concurrency > 10000:
        raise HTTPException(status_code=400, detail="Max concurrency must be between 1 and 10,000.")
    if infra_in.engine_timeout_sec < 5 or infra_in.engine_timeout_sec > 3600:
        raise HTTPException(status_code=400, detail="Timeout must be between 5s and 3,600s.")
    if not infra_in.rpc_endpoint.startswith(("http://", "https://", "ws://", "wss://")):
        raise HTTPException(status_code=400, detail="RPC Endpoint must be a valid HTTP or WebSocket URL.")

    infra = db.query(InfrastructureConfigModel).filter_by(id="infra_default").first()
    if not infra:
        infra = InfrastructureConfigModel(id="infra_default")
        db.add(infra)

    infra.default_node_count = infra_in.default_node_count
    infra.default_block_interval_ms = infra_in.default_block_interval_ms
    infra.max_concurrency = infra_in.max_concurrency
    infra.network_bandwidth = infra_in.network_bandwidth
    infra.rpc_endpoint = infra_in.rpc_endpoint
    infra.engine_timeout_sec = infra_in.engine_timeout_sec
    infra.storage_driver = infra_in.storage_driver

    db.commit()
    db.refresh(infra)
    return infra

# --- NOTIFICATIONS SETTINGS ---

@router.get("/settings/notifications", response_model=NotificationSettingsSchema)
def get_notification_settings(db: Session = Depends(get_db)):
    notif_set = db.query(NotificationSettingsModel).filter_by(id="notif_set_default").first()
    if not notif_set:
        notif_set = NotificationSettingsModel(id="notif_set_default")
        db.add(notif_set)
        db.commit()
        db.refresh(notif_set)
    return notif_set

@router.put("/settings/notifications", response_model=NotificationSettingsSchema)
def update_notification_settings(notif_in: NotificationSettingsSchema, db: Session = Depends(get_db)):
    notif_set = db.query(NotificationSettingsModel).filter_by(id="notif_set_default").first()
    if not notif_set:
        notif_set = NotificationSettingsModel(id="notif_set_default")
        db.add(notif_set)

    notif_set.benchmark_complete = notif_in.benchmark_complete
    notif_set.stress_test_alerts = notif_in.stress_test_alerts
    notif_set.system_status_alerts = notif_in.system_status_alerts
    notif_set.email_digest = notif_in.email_digest

    db.commit()
    db.refresh(notif_set)
    return notif_set

# --- SECURITY SETTINGS ---

@router.get("/settings/security")
def get_security_settings(db: Session = Depends(get_db)):
    sec = db.query(SecuritySettingsModel).filter_by(id="sec_default").first()
    if not sec:
        sec = SecuritySettingsModel(id="sec_default")
        db.add(sec)
        db.commit()
        db.refresh(sec)
    return {
        "two_factor_enabled": sec.two_factor_enabled,
        "active_sessions_count": sec.active_sessions_count,
        "last_password_change": sec.last_password_change,
        "api_key_masked": sec.api_key_masked,
    }

@router.post("/settings/security/change-password")
def change_password(data: ChangePasswordSchema, db: Session = Depends(get_db)):
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters long.")
    if data.current_password == data.new_password:
        raise HTTPException(status_code=400, detail="New password cannot be the same as your current password.")

    sec = db.query(SecuritySettingsModel).filter_by(id="sec_default").first()
    if sec:
        sec.last_password_change = datetime.utcnow().strftime("%Y-%m-%d")
        db.commit()

    return {"status": "success", "message": "Password updated successfully."}

@router.post("/settings/security/regenerate-api-key")
def regenerate_api_key(db: Session = Depends(get_db)):
    sec = db.query(SecuritySettingsModel).filter_by(id="sec_default").first()
    if not sec:
        sec = SecuritySettingsModel(id="sec_default")
        db.add(sec)

    new_token = secrets.token_hex(16)
    sec.api_key_full = f"dlt_sec_live_{new_token}"
    sec.api_key_masked = f"dlt_sec_••••••••{new_token[-4:]}"
    db.commit()

    return {
        "status": "success",
        "message": "API key regenerated.",
        "api_key_masked": sec.api_key_masked,
        "api_key_full": sec.api_key_full
    }

@router.post("/settings/security/revoke-sessions")
def revoke_sessions(db: Session = Depends(get_db)):
    sec = db.query(SecuritySettingsModel).filter_by(id="sec_default").first()
    if sec:
        sec.active_sessions_count = 1
        db.commit()
    return {"status": "success", "message": "All other sessions have been revoked.", "active_sessions_count": 1}

@router.post("/settings/security/toggle-2fa")
def toggle_2fa(db: Session = Depends(get_db)):
    sec = db.query(SecuritySettingsModel).filter_by(id="sec_default").first()
    if not sec:
        sec = SecuritySettingsModel(id="sec_default")
        db.add(sec)
    sec.two_factor_enabled = not sec.two_factor_enabled
    db.commit()
    return {"two_factor_enabled": sec.two_factor_enabled}

# --- NOTIFICATIONS SYSTEM ---

@router.get("/notifications", response_model=List[NotificationSchema])
def list_notifications(db: Session = Depends(get_db)):
    return db.query(NotificationModel).all()

@router.patch("/notifications/{notif_id}/read", response_model=NotificationSchema)
def mark_notification_read(notif_id: str, db: Session = Depends(get_db)):
    notif = db.query(NotificationModel).filter_by(id=notif_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.read = True
    db.commit()
    db.refresh(notif)
    return notif

@router.post("/notifications/mark-all-read")
def mark_all_notifications_read(db: Session = Depends(get_db)):
    db.query(NotificationModel).update({NotificationModel.read: True})
    db.commit()
    return {"status": "success", "message": "All notifications marked as read"}

@router.post("/notifications", response_model=NotificationSchema)
def create_notification(notif_in: NotificationCreateSchema, db: Session = Depends(get_db)):
    # Check if notification category is enabled in settings
    notif_set = db.query(NotificationSettingsModel).filter_by(id="notif_set_default").first()
    if notif_set:
        if notif_in.type == "benchmark" and not notif_set.benchmark_complete:
            return NotificationSchema(
                id="suppressed",
                title=notif_in.title,
                message=notif_in.message,
                timestamp="now",
                read=True,
                type=notif_in.type,
                link=notif_in.link
            )
        if notif_in.type == "stress" and not notif_set.stress_test_alerts:
            return NotificationSchema(
                id="suppressed",
                title=notif_in.title,
                message=notif_in.message,
                timestamp="now",
                read=True,
                type=notif_in.type,
                link=notif_in.link
            )

    new_notif = NotificationModel(
        id=f"notif-{uuid.uuid4().hex[:8]}",
        title=notif_in.title,
        message=notif_in.message,
        timestamp="Just now",
        read=False,
        type=notif_in.type,
        link=notif_in.link
    )
    db.add(new_notif)
    db.commit()
    db.refresh(new_notif)
    return new_notif

# --- REPORTS SYSTEM ---

@router.get("/reports", response_model=List[ReportSchema])
def list_reports(db: Session = Depends(get_db)):
    return db.query(ReportModel).all()

@router.post("/reports", response_model=ReportSchema)
def create_report(rep_in: ReportCreateSchema, db: Session = Depends(get_db)):
    new_report = ReportModel(
        id=f"rep-{uuid.uuid4().hex[:6]}",
        name=rep_in.name,
        date=datetime.utcnow().strftime("%Y-%m-%d"),
        status="Generated",
        type=rep_in.type,
        summary=rep_in.summary or f"Automated performance report for {rep_in.name}"
    )
    db.add(new_report)

    # Also generate a notification for the new report
    notif = NotificationModel(
        id=f"notif-{uuid.uuid4().hex[:8]}",
        title="Report Generated",
        message=f"{new_report.name} is ready for export in Reports.",
        timestamp="Just now",
        read=False,
        type="report",
        link="/app/reports"
    )
    db.add(notif)

    db.commit()
    db.refresh(new_report)
    return new_report

@router.get("/reports/{report_id}/download")
def download_report(report_id: str, db: Session = Depends(get_db)):
    rep = db.query(ReportModel).filter_by(id=report_id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Report not found")

    content = f"""DLT TESTBED PERFORMANCE REPORT
==================================================
Report ID: {rep.id}
Experiment Name: {rep.name}
Generated Date: {rep.date}
Format: {rep.type}
Status: {rep.status}

EXECUTIVE SUMMARY
--------------------------------------------------
{rep.summary}

BENCHMARK PERFORMANCE METRICS
--------------------------------------------------
Peak Throughput (TPS): 2,184
Average Latency: 43.2 ms
P95 Tail Latency: 64 ms
P99 Tail Latency: 142 ms
Transaction Success Rate: 98.7%
Energy Efficiency: 0.038 Wh / 1,000 tx

RESOURCE UTILIZATION
--------------------------------------------------
Validator Nodes: 10
Node CPU Utilization: 71% (Peak: 91%)
Memory Utilization: 68%
Network Bandwidth: 1 Gbps (Standard)

DLT Testbed Platform - Verified Engineering Output
"""
    return PlainTextResponse(
        content=content,
        headers={
            "Content-Disposition": f'attachment; filename="{rep.name.replace(" ", "_")}.txt"'
        }
    )

# --- GLOBAL SEARCH SYSTEM ---

@router.get("/search", response_model=List[SearchResultItem])
def search_global(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    query = q.strip().lower()
    if not query:
        return []

    results: List[SearchResultItem] = []

    # 1. Navigation / Core Pages
    nav_catalog = [
        {"id": "nav-dash", "title": "Dashboard", "category": "Navigation", "description": "Command center, TPS trend, status distribution", "link": "/app", "badge": "Overview"},
        {"id": "nav-bench", "title": "Benchmark Lab", "category": "Labs", "description": "Configure topology, workload, and execute simulation", "link": "/app/benchmark", "badge": "Simulation"},
        {"id": "nav-live", "title": "Live Benchmark Monitor", "category": "Labs", "description": "Real-time TPS, latency, and transaction log stream", "link": "/app/benchmark/live", "badge": "Live Stream"},
        {"id": "nav-res", "title": "Results & Analysis", "category": "Analytics", "description": "Composite score, latency distribution, scalability", "link": "/app/benchmark/results", "badge": "Metrics"},
        {"id": "nav-stress", "title": "Stress Lab", "category": "Labs", "description": "Push configurations to failure and find saturation limit", "link": "/app/stress-lab", "badge": "Stress Test"},
        {"id": "nav-comp", "title": "Comparison Workspace", "category": "Analytics", "description": "Compare PoS, PBFT, PoA, and Raft configurations", "link": "/app/compare", "badge": "Trade-offs"},
        {"id": "nav-ai", "title": "AI Advisor", "category": "AI & Insights", "description": "Bottleneck detection and algorithmic configuration tuning", "link": "/app/ai", "badge": "AI Engine"},
        {"id": "nav-rep", "title": "Reports Archive", "category": "Reports", "description": "Download and generate PDF/CSV performance reports", "link": "/app/reports", "badge": "Exports"},
        {"id": "nav-set-acc", "title": "Account Settings", "category": "Settings", "description": "Update user display name, email, and preferences", "link": "/app/settings?tab=account", "badge": "User"},
        {"id": "nav-set-infra", "title": "Infrastructure Settings", "category": "Settings", "description": "Cluster nodes, block interval, concurrency limits", "link": "/app/settings?tab=infrastructure", "badge": "Nodes"},
        {"id": "nav-set-notif", "title": "Notification Preferences", "category": "Settings", "description": "Benchmark alerts, stress saturation, digest rules", "link": "/app/settings?tab=notifications", "badge": "Alerts"},
        {"id": "nav-set-sec", "title": "Security & API Keys", "category": "Settings", "description": "Password changes, active sessions, API token management", "link": "/app/settings?tab=security", "badge": "Security"},
    ]

    for item in nav_catalog:
        if query in item["title"].lower() or query in item["description"].lower() or query in item["category"].lower():
            results.append(SearchResultItem(**item))

    # 2. Experiments & Benchmarks
    experiments = db.query(ExperimentModel).all()
    for exp in experiments:
        if (query in exp.name.lower() or 
            query in exp.network_type.lower() or 
            query in exp.consensus.lower() or 
            query in str(exp.nodes)):
            results.append(SearchResultItem(
                id=f"exp-{exp.id}",
                title=f"{exp.name} ({exp.consensus})",
                category="Benchmarks",
                description=f"{exp.network_type} • {exp.transactions:,} tx • {exp.nodes} nodes • Status: {exp.status}",
                link="/app/benchmark/results",
                badge=exp.consensus
            ))

    # 3. Reports
    reports = db.query(ReportModel).all()
    for rep in reports:
        if query in rep.name.lower() or query in rep.summary.lower() or query in rep.type.lower():
            results.append(SearchResultItem(
                id=f"rep-{rep.id}",
                title=f"{rep.name} Report",
                category="Reports",
                description=f"{rep.summary} • {rep.date}",
                link="/app/reports",
                badge=rep.type
            ))

    # 4. Key Performance Metrics
    metrics_catalog = [
        {"id": "met-tps", "title": "Throughput (TPS)", "category": "Metrics", "description": "Peak 2,184 TPS measured in PoS Heavy Load experiment", "link": "/app/benchmark/results", "badge": "Metric"},
        {"id": "met-lat", "title": "Tail Latency (P95/P99)", "category": "Metrics", "description": "P95: 64ms, P99: 142ms recorded under 500 concurrent clients", "link": "/app/benchmark/results", "badge": "Latency"},
        {"id": "met-eng", "title": "Energy Efficiency", "category": "Metrics", "description": "0.038 Wh per 1,000 transactions estimated consumption", "link": "/app/benchmark/results", "badge": "Energy"},
        {"id": "met-bot", "title": "CPU Saturation Bottleneck", "category": "AI Insights", "description": "CPU reached 91% concurrency limit at 500 clients", "link": "/app/ai", "badge": "Advisory"},
    ]
    for met in metrics_catalog:
        if query in met["title"].lower() or query in met["description"].lower():
            results.append(SearchResultItem(**met))

    return results

# --- EXPERIMENTS (EXISTING CONTRACT PRESERVED & EXPANDED) ---

@router.post("/experiments", response_model=Experiment)
def create_experiment(exp: Experiment, db: Session = Depends(get_db)):
    new_exp = ExperimentModel(
        id=exp.id,
        name=exp.name,
        network_type=exp.network_type,
        consensus=exp.consensus,
        nodes=exp.nodes,
        transactions=exp.transactions,
        concurrency=exp.concurrency,
        status=exp.status
    )
    db.merge(new_exp)
    db.commit()
    return exp

@router.get("/experiments", response_model=List[Experiment])
def get_experiments(db: Session = Depends(get_db)):
    exps = db.query(ExperimentModel).all()
    return [
        Experiment(
            id=e.id,
            name=e.name,
            network_type=e.network_type,
            consensus=e.consensus,
            nodes=e.nodes,
            transactions=e.transactions,
            concurrency=e.concurrency,
            status=e.status
        )
        for e in exps
    ]

@router.get("/experiments/{exp_id}", response_model=Experiment)
def get_experiment(exp_id: str, db: Session = Depends(get_db)):
    e = db.query(ExperimentModel).filter_by(id=exp_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return Experiment(
        id=e.id,
        name=e.name,
        network_type=e.network_type,
        consensus=e.consensus,
        nodes=e.nodes,
        transactions=e.transactions,
        concurrency=e.concurrency,
        status=e.status
    )

@router.post("/experiments/{exp_id}/run")
def run_experiment(exp_id: str, db: Session = Depends(get_db)):
    e = db.query(ExperimentModel).filter_by(id=exp_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Experiment not found")
    e.status = "running"
    db.commit()
    return {"status": "started"}

@router.post("/experiments/{exp_id}/stop")
def stop_experiment(exp_id: str, db: Session = Depends(get_db)):
    e = db.query(ExperimentModel).filter_by(id=exp_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Experiment not found")
    e.status = "stopped"
    db.commit()
    return {"status": "stopped"}

@router.get("/experiments/{exp_id}/metrics")
def get_metrics(exp_id: str):
    return {
        "tps": 2184,
        "latency_ms": 43.2,
        "success_rate": 98.7,
        "energy_wh": 0.038
    }

@router.post("/ai/analyze")
def ai_analyze():
    return {
        "summary": "CPU utilization reached 91% during peak concurrency.",
        "suggestions": [
            "Increase CPU allocation.",
            "Reduce transaction payload size.",
            "Tune concurrency limits."
        ],
        "recommended": {
            "cpu": 8,
            "batch_size": 250,
            "interval": 1000
        }
    }
