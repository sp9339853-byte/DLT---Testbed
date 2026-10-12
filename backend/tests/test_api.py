import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.init_db import init_db

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    init_db()

@pytest.fixture
def client():
    return TestClient(app)

def test_root_status(client):
    res = client.get("/")
    assert res.status_code == 200
    assert res.json() == {"status": "DLT Testbed Backend Running"}

def test_user_profile_crud(client):
    # GET profile
    res = client.get("/api/v1/user/profile")
    assert res.status_code == 200
    data = res.json()
    assert "name" in data
    assert "email" in data

    # PUT invalid profile (empty name)
    bad_res = client.put("/api/v1/user/profile", json={"name": "", "email": "valid@example.com"})
    assert bad_res.status_code in [400, 422]

    # PUT invalid profile (invalid email)
    bad_email_res = client.put("/api/v1/user/profile", json={"name": "Architect", "email": "invalid-email"})
    assert bad_email_res.status_code in [400, 422]

    # PUT valid profile
    update_res = client.put("/api/v1/user/profile", json={
        "name": "Jane Doe",
        "email": "jane@dlttestbed.com",
        "role": "Principal Systems Engineer",
        "organization": "Consensus Core Labs"
    })
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["name"] == "Jane Doe"
    assert updated["email"] == "jane@dlttestbed.com"
    assert updated["role"] == "Principal Systems Engineer"

def test_user_preferences_crud(client):
    # GET preferences
    res = client.get("/api/v1/user/preferences")
    assert res.status_code == 200

    # PUT preferences
    update_res = client.put("/api/v1/user/preferences", json={
        "dark_mode": True,
        "auto_generate_reports": True
    })
    assert update_res.status_code == 200
    assert update_res.json()["dark_mode"] is True
    assert update_res.json()["auto_generate_reports"] is True

def test_infrastructure_settings_crud(client):
    # GET
    res = client.get("/api/v1/settings/infrastructure")
    assert res.status_code == 200

    # PUT invalid (node count > 100)
    bad_res = client.put("/api/v1/settings/infrastructure", json={
        "default_node_count": 999,
        "default_block_interval_ms": 1000,
        "max_concurrency": 500,
        "network_bandwidth": "1 Gbps",
        "rpc_endpoint": "http://node-cluster.internal:8545",
        "engine_timeout_sec": 60,
        "storage_driver": "RocksDB"
    })
    assert bad_res.status_code in [400, 422]

    # PUT valid
    good_res = client.put("/api/v1/settings/infrastructure", json={
        "default_node_count": 16,
        "default_block_interval_ms": 1500,
        "max_concurrency": 800,
        "network_bandwidth": "10 Gbps (Enterprise)",
        "rpc_endpoint": "http://node-cluster.internal:8545",
        "engine_timeout_sec": 120,
        "storage_driver": "Pebble"
    })
    assert good_res.status_code == 200
    assert good_res.json()["default_node_count"] == 16
    assert good_res.json()["storage_driver"] == "Pebble"

def test_notification_settings_crud(client):
    # GET
    res = client.get("/api/v1/settings/notifications")
    assert res.status_code == 200

    # PUT
    update_res = client.put("/api/v1/settings/notifications", json={
        "benchmark_complete": True,
        "stress_test_alerts": False,
        "system_status_alerts": True,
        "email_digest": True
    })
    assert update_res.status_code == 200
    assert update_res.json()["stress_test_alerts"] is False
    assert update_res.json()["email_digest"] is True

def test_security_settings(client):
    # GET
    res = client.get("/api/v1/settings/security")
    assert res.status_code == 200
    data = res.json()
    assert "two_factor_enabled" in data
    assert "active_sessions_count" in data

    # Toggle 2FA
    initial_2fa = data["two_factor_enabled"]
    tgl_res = client.post("/api/v1/settings/security/toggle-2fa")
    assert tgl_res.status_code == 200
    assert tgl_res.json()["two_factor_enabled"] != initial_2fa

    # Change password validation
    short_pw = client.post("/api/v1/settings/security/change-password", json={
        "current_password": "old_password_123",
        "new_password": "short"
    })
    assert short_pw.status_code in [400, 422]

    same_pw = client.post("/api/v1/settings/security/change-password", json={
        "current_password": "same_password_123",
        "new_password": "same_password_123"
    })
    assert same_pw.status_code == 400

    valid_pw = client.post("/api/v1/settings/security/change-password", json={
        "current_password": "old_password_123",
        "new_password": "new_super_secret_password_456"
    })
    assert valid_pw.status_code == 200

    # Regenerate API Key
    regen_res = client.post("/api/v1/settings/security/regenerate-api-key")
    assert regen_res.status_code == 200
    assert "api_key_masked" in regen_res.json()

    # Revoke sessions
    revoke_res = client.post("/api/v1/settings/security/revoke-sessions")
    assert revoke_res.status_code == 200
    assert revoke_res.json()["active_sessions_count"] == 1

def test_notifications_system(client):
    # List notifications
    res = client.get("/api/v1/notifications")
    assert res.status_code == 200
    notifs = res.json()
    assert len(notifs) > 0

    first_id = notifs[0]["id"]
    # Mark as read
    mark_res = client.patch(f"/api/v1/notifications/{first_id}/read")
    assert mark_res.status_code == 200
    assert mark_res.json()["read"] is True

    # Mark all as read
    all_res = client.post("/api/v1/notifications/mark-all-read")
    assert all_res.status_code == 200

def test_reports_system(client):
    # List reports
    res = client.get("/api/v1/reports")
    assert res.status_code == 200
    reps = res.json()
    assert len(reps) > 0

    # Create report
    new_rep = client.post("/api/v1/reports", json={
        "name": "Automated Raft Latency Audit",
        "type": "PDF",
        "summary": "Verified cluster latency metrics."
    })
    assert new_rep.status_code == 200
    rep_id = new_rep.json()["id"]

    # Download report
    dl_res = client.get(f"/api/v1/reports/{rep_id}/download")
    assert dl_res.status_code == 200
    assert "DLT TESTBED PERFORMANCE REPORT" in dl_res.text

def test_global_search(client):
    # Search for benchmark
    res = client.get("/api/v1/search?q=PoS")
    assert res.status_code == 200
    results = res.json()
    assert len(results) > 0
    assert any("PoS" in r["title"] or "PoS" in r["description"] for r in results)

    # Search for settings
    sec_res = client.get("/api/v1/search?q=Security")
    assert sec_res.status_code == 200
    sec_results = sec_res.json()
    assert len(sec_results) > 0

def test_auth_flow(client):
    # 1. Invalid login
    bad_login = client.post("/api/v1/auth/login", json={"email": "demo@dlttestbed.com", "password": "wrongpassword"})
    assert bad_login.status_code == 401

    # 2. Valid login
    login_res = client.post("/api/v1/auth/login", json={"email": "demo@dlttestbed.com", "password": "password123"})
    assert login_res.status_code == 200
    auth_data = login_res.json()
    assert "token" in auth_data
    token = auth_data["token"]
    assert auth_data["user"]["email"] == "demo@dlttestbed.com"

    # 3. Get /auth/me with Bearer token
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "demo@dlttestbed.com"

    # 4. Logout
    logout_res = client.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert logout_res.status_code == 200

    # 5. Token should now be invalid
    invalid_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert invalid_me.status_code == 401
