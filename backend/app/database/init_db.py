from datetime import datetime
from app.database.session import engine, Base, SessionLocal
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
from app.core.security import hash_password

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed Users
        demo_user = db.query(UserModel).filter_by(email="demo@dlttestbed.com").first()
        if not demo_user:
            demo_user = UserModel(
                id="user_default",
                name="Demo User",
                email="demo@dlttestbed.com",
                password_hash=hash_password("password123"),
                role="Lead Architect",
                organization="DLT Research Labs"
            )
            db.add(demo_user)

        admin_user = db.query(UserModel).filter_by(email="admin@dlttestbed.com").first()
        if not admin_user:
            admin_user = UserModel(
                id="user_admin",
                name="System Admin",
                email="admin@dlttestbed.com",
                password_hash=hash_password("admin123"),
                role="Principal Systems Engineer",
                organization="Consensus Core Labs"
            )
            db.add(admin_user)

        researcher_user = db.query(UserModel).filter_by(email="researcher@dlttestbed.com").first()
        if not researcher_user:
            researcher_user = UserModel(
                id="user_researcher",
                name="Elena Rostova",
                email="researcher@dlttestbed.com",
                password_hash=hash_password("research123"),
                role="Consensus Researcher",
                organization="Stanford DLT Lab"
            )
            db.add(researcher_user)

        # Seed default session token for demo user
        demo_session = db.query(UserSessionModel).filter_by(token="dlt_sess_demo_default_token").first()
        if not demo_session:
            demo_session = UserSessionModel(
                id="sess_default",
                user_id="user_default",
                token="dlt_sess_demo_default_token"
            )
            db.add(demo_session)

        # Seed User Profile
        user = db.query(UserProfileModel).filter_by(id="user_default").first()
        if not user:
            user = UserProfileModel(
                id="user_default",
                name="Demo User",
                email="demo@dlttestbed.com",
                role="Lead Architect",
                organization="DLT Research Labs"
            )
            db.add(user)

        # Seed Preferences
        pref = db.query(UserPreferencesModel).filter_by(id="pref_default").first()
        if not pref:
            pref = UserPreferencesModel(
                id="pref_default",
                dark_mode=False,
                auto_generate_reports=True
            )
            db.add(pref)

        # Seed Infrastructure
        infra = db.query(InfrastructureConfigModel).filter_by(id="infra_default").first()
        if not infra:
            infra = InfrastructureConfigModel(
                id="infra_default",
                default_node_count=10,
                default_block_interval_ms=2000,
                max_concurrency=500,
                network_bandwidth="1 Gbps (Standard)",
                rpc_endpoint="http://node-cluster.internal:8545",
                engine_timeout_sec=60,
                storage_driver="RocksDB"
            )
            db.add(infra)

        # Seed Notification Settings
        notif_set = db.query(NotificationSettingsModel).filter_by(id="notif_set_default").first()
        if not notif_set:
            notif_set = NotificationSettingsModel(
                id="notif_set_default",
                benchmark_complete=True,
                stress_test_alerts=True,
                system_status_alerts=True,
                email_digest=False
            )
            db.add(notif_set)

        # Seed Security Settings
        sec = db.query(SecuritySettingsModel).filter_by(id="sec_default").first()
        if not sec:
            sec = SecuritySettingsModel(
                id="sec_default",
                two_factor_enabled=False,
                active_sessions_count=2,
                last_password_change="2026-09-15",
                api_key_masked="dlt_sec_••••••••4f9a",
                api_key_full="dlt_sec_live_9b4e8721c04f9a"
            )
            db.add(sec)

        # Seed Notifications
        if db.query(NotificationModel).count() == 0:
            db.add_all([
                NotificationModel(
                    id="notif-1",
                    title="Benchmark Completed",
                    message="PoS Heavy Load benchmark finished with 2,184 TPS peak.",
                    timestamp="10m ago",
                    read=False,
                    type="benchmark",
                    link="/app/benchmark/results"
                ),
                NotificationModel(
                    id="notif-2",
                    title="Tail Latency Warning",
                    message="P99 tail latency exceeded 100ms at 500 concurrent clients.",
                    timestamp="1h ago",
                    read=False,
                    type="stress",
                    link="/app/stress-lab"
                ),
                NotificationModel(
                    id="notif-3",
                    title="Engine Online",
                    message="All 10 validator cluster nodes synchronized and ready.",
                    timestamp="3h ago",
                    read=True,
                    type="system",
                    link="/app"
                ),
            ])

        # Seed Reports
        if db.query(ReportModel).count() == 0:
            db.add_all([
                ReportModel(
                    id="rep-1",
                    name="PoS Heavy Load Benchmark",
                    date="2026-10-12",
                    status="Generated",
                    type="PDF",
                    summary="50,000 tx simulation under 500 concurrent clients with 10 validator nodes."
                ),
                ReportModel(
                    id="rep-2",
                    name="PBFT Standard Analysis",
                    date="2026-10-11",
                    status="Generated",
                    type="CSV",
                    summary="Baseline communication overhead analysis with 4 Byzantine nodes."
                ),
                ReportModel(
                    id="rep-3",
                    name="Network Degradation Study",
                    date="2026-10-08",
                    status="Archived",
                    type="PDF",
                    summary="Network bandwidth constraint simulation down to 100 Mbps."
                )
            ])

        # Seed Experiments
        if db.query(ExperimentModel).count() == 0:
            db.add_all([
                ExperimentModel(
                    id="exp-1",
                    name="PoS Heavy Load",
                    network_type="PoS Simulation",
                    consensus="Proof of Stake",
                    nodes=10,
                    transactions=50000,
                    concurrency=500,
                    status="completed"
                ),
                ExperimentModel(
                    id="exp-2",
                    name="PBFT Standard",
                    network_type="PBFT Network",
                    consensus="PBFT",
                    nodes=4,
                    transactions=10000,
                    concurrency=100,
                    status="completed"
                ),
                ExperimentModel(
                    id="exp-3",
                    name="PoA Fast Track",
                    network_type="PoA Network",
                    consensus="Proof of Authority",
                    nodes=8,
                    transactions=25000,
                    concurrency=250,
                    status="completed"
                ),
                ExperimentModel(
                    id="exp-4",
                    name="Raft Low Latency Cluster",
                    network_type="Raft Private Net",
                    consensus="Raft",
                    nodes=5,
                    transactions=30000,
                    concurrency=200,
                    status="completed"
                ),
            ])

        db.commit()
    finally:
        db.close()
