from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

class UserProfileSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=3, max_length=100)
    role: Optional[str] = "Lead Architect"
    organization: Optional[str] = "DLT Research Labs"

class UserProfileResponse(UserProfileSchema):
    id: str

class UserPreferencesSchema(BaseModel):
    dark_mode: bool
    auto_generate_reports: bool

class InfrastructureConfigSchema(BaseModel):
    default_node_count: int = Field(..., ge=1, le=100)
    default_block_interval_ms: int = Field(..., ge=100, le=60000)
    max_concurrency: int = Field(..., ge=1, le=10000)
    network_bandwidth: str
    rpc_endpoint: str
    engine_timeout_sec: int = Field(..., ge=5, le=3600)
    storage_driver: str

class NotificationSettingsSchema(BaseModel):
    benchmark_complete: bool
    stress_test_alerts: bool
    system_status_alerts: bool
    email_digest: bool

class ChangePasswordSchema(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8)

class NotificationSchema(BaseModel):
    id: str
    title: str
    message: str
    timestamp: str
    read: bool
    type: str
    link: Optional[str] = None

class NotificationCreateSchema(BaseModel):
    title: str
    message: str
    type: str = "system"
    link: Optional[str] = None

class ReportSchema(BaseModel):
    id: str
    name: str
    date: str
    status: str
    type: str
    summary: str

class ReportCreateSchema(BaseModel):
    name: str
    type: str = "PDF"
    summary: str = ""

class SearchResultItem(BaseModel):
    id: str
    title: str
    category: str
    description: str
    link: str
    badge: Optional[str] = None

class Experiment(BaseModel):
    id: str
    name: str
    network_type: str
    consensus: str
    nodes: int
    transactions: int
    concurrency: int
    status: str

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6, max_length=100)
    role: Optional[str] = "Lead Architect"
    organization: Optional[str] = "DLT Research Labs"

class AuthResponse(BaseModel):
    token: str
    user: UserProfileResponse
