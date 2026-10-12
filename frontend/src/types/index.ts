export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  role?: string;
  organization?: string;
}

export interface UserPreferences {
  dark_mode: boolean;
  auto_generate_reports: boolean;
}

export interface InfrastructureConfig {
  default_node_count: number;
  default_block_interval_ms: number;
  max_concurrency: number;
  network_bandwidth: string;
  rpc_endpoint: string;
  engine_timeout_sec: number;
  storage_driver: string;
}

export interface NotificationSettings {
  benchmark_complete: boolean;
  stress_test_alerts: boolean;
  system_status_alerts: boolean;
  email_digest: boolean;
}

export interface SecuritySettings {
  two_factor_enabled: boolean;
  active_sessions_count: number;
  last_password_change: string;
  api_key_masked: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: string;
  link?: string | null;
}

export interface ReportItem {
  id: string;
  name: string;
  date: string;
  status: string;
  type: string;
  summary: string;
}

export interface SearchResultItem {
  id: string;
  title: string;
  category: string;
  description: string;
  link: string;
  badge?: string;
}

export interface ExperimentItem {
  id: string;
  name: string;
  network_type: string;
  consensus: string;
  nodes: number;
  transactions: number;
  concurrency: number;
  status: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role?: string;
  organization?: string;
}
