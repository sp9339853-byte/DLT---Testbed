from sqlalchemy import Column, String, Integer, Boolean, DateTime
from datetime import datetime
from app.database.session import Base

class UserProfileModel(Base):
    __tablename__ = "user_profile"

    id = Column(String, primary_key=True, default="user_default")
    name = Column(String, nullable=False, default="Demo User")
    email = Column(String, nullable=False, default="demo@dlttestbed.com")
    role = Column(String, default="Lead Architect")
    organization = Column(String, default="DLT Research Labs")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UserPreferencesModel(Base):
    __tablename__ = "user_preferences"

    id = Column(String, primary_key=True, default="pref_default")
    dark_mode = Column(Boolean, default=False)
    auto_generate_reports = Column(Boolean, default=True)

class InfrastructureConfigModel(Base):
    __tablename__ = "infrastructure_config"

    id = Column(String, primary_key=True, default="infra_default")
    default_node_count = Column(Integer, default=10)
    default_block_interval_ms = Column(Integer, default=2000)
    max_concurrency = Column(Integer, default=500)
    network_bandwidth = Column(String, default="1 Gbps (Standard)")
    rpc_endpoint = Column(String, default="http://node-cluster.internal:8545")
    engine_timeout_sec = Column(Integer, default=60)
    storage_driver = Column(String, default="RocksDB")

class NotificationSettingsModel(Base):
    __tablename__ = "notification_settings"

    id = Column(String, primary_key=True, default="notif_set_default")
    benchmark_complete = Column(Boolean, default=True)
    stress_test_alerts = Column(Boolean, default=True)
    system_status_alerts = Column(Boolean, default=True)
    email_digest = Column(Boolean, default=False)

class SecuritySettingsModel(Base):
    __tablename__ = "security_settings"

    id = Column(String, primary_key=True, default="sec_default")
    two_factor_enabled = Column(Boolean, default=False)
    active_sessions_count = Column(Integer, default=2)
    last_password_change = Column(String, default="2026-09-15")
    api_key_masked = Column(String, default="dlt_sec_••••••••4f9a")
    api_key_full = Column(String, default="dlt_sec_live_9b4e8721c04f9a")

class NotificationModel(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)
    read = Column(Boolean, default=False)
    type = Column(String, default="system") # benchmark, stress, system, report
    link = Column(String, nullable=True)

class ReportModel(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    date = Column(String, nullable=False)
    status = Column(String, default="Generated")
    type = Column(String, default="PDF")
    summary = Column(String, default="")

class ExperimentModel(Base):
    __tablename__ = "experiments"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    network_type = Column(String, nullable=False)
    consensus = Column(String, nullable=False)
    nodes = Column(Integer, default=10)
    transactions = Column(Integer, default=50000)
    concurrency = Column(Integer, default=500)
    status = Column(String, default="completed")

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False, default="Demo User")
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="Lead Architect")
    organization = Column(String, default="DLT Research Labs")
    created_at = Column(DateTime, default=datetime.utcnow)

class UserSessionModel(Base):
    __tablename__ = "user_sessions"

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
