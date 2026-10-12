import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { 
  User, 
  Server, 
  Bell, 
  Shield, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Key, 
  Copy, 
  Check, 
  RefreshCw,
  LogOut,
  Moon,
  Sun,
  FileCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import type { 
  UserProfile, 
  InfrastructureConfig, 
  NotificationSettings, 
  SecuritySettings 
} from '../types';

type TabType = 'account' | 'infrastructure' | 'notifications' | 'security' | 'preferences';

export default function Settings() {
  const navigate = useNavigate();
  const { logout, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as TabType;
  const activeTab: TabType = ['account', 'infrastructure', 'notifications', 'security', 'preferences'].includes(tabParam)
    ? tabParam
    : 'account';

  const { darkMode, toggleDarkMode, autoGenerateReports, setAutoGenerateReports } = useTheme();

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  // Tab change handler syncs with URL
  const handleTabChange = (tab: TabType) => {
    setSearchParams({ tab });
  };

  // --- ACCOUNT STATE ---
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    role: '',
    organization: ''
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // --- INFRASTRUCTURE STATE ---
  const [infra, setInfra] = useState<InfrastructureConfig>({
    default_node_count: 10,
    default_block_interval_ms: 2000,
    max_concurrency: 500,
    network_bandwidth: '1 Gbps (Standard)',
    rpc_endpoint: 'http://node-cluster.internal:8545',
    engine_timeout_sec: 60,
    storage_driver: 'RocksDB'
  });
  const [infraLoading, setInfraLoading] = useState(true);
  const [infraSaving, setInfraSaving] = useState(false);
  const [infraSuccess, setInfraSuccess] = useState<string | null>(null);
  const [infraError, setInfraError] = useState<string | null>(null);

  // --- NOTIFICATIONS STATE ---
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    benchmark_complete: true,
    stress_test_alerts: true,
    system_status_alerts: true,
    email_digest: false
  });
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState<string | null>(null);

  // --- SECURITY STATE ---
  const [security, setSecurity] = useState<SecuritySettings>({
    two_factor_enabled: false,
    active_sessions_count: 2,
    last_password_change: '2026-09-15',
    api_key_masked: 'dlt_sec_••••••••4f9a'
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState(false);
  const [revokingSessions, setRevokingSessions] = useState(false);
  const [securityMsg, setSecurityMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    let isMounted = true;
    
    // Fetch profile
    api.getProfile().then((data) => {
      if (isMounted) {
        setProfile(data);
        setProfileLoading(false);
      }
    }).catch(() => {
      if (isMounted) setProfileLoading(false);
    });

    // Fetch infrastructure
    api.getInfrastructure().then((data) => {
      if (isMounted) {
        setInfra(data);
        setInfraLoading(false);
      }
    }).catch(() => {
      if (isMounted) setInfraLoading(false);
    });

    // Fetch notification settings
    api.getNotificationSettings().then((data) => {
      if (isMounted) setNotifSettings(data);
    }).catch(() => {});

    // Fetch security
    api.getSecurity().then((data) => {
      if (isMounted) setSecurity(data);
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // --- ACCOUNT HANDLERS ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);

    if (!profile.name.trim()) {
      setProfileError('Display Name cannot be empty.');
      return;
    }
    const emailRegex = /^[\w.\-+]+@[\w-]+\.[a-zA-Z]{2,}$/;
    if (!profile.email.trim() || !emailRegex.test(profile.email.trim())) {
      setProfileError('Please enter a valid email address.');
      return;
    }

    setProfileSaving(true);
    try {
      const updated = await api.updateProfile(profile);
      setProfile(updated);
      updateUser(updated);
      setProfileSuccess('Account profile updated successfully.');
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to save account changes.');
    } finally {
      setProfileSaving(false);
    }
  };

  // --- INFRASTRUCTURE HANDLERS ---
  const handleSaveInfra = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfraSuccess(null);
    setInfraError(null);

    if (infra.default_node_count < 1 || infra.default_node_count > 100) {
      setInfraError('Node count must be between 1 and 100 nodes.');
      return;
    }
    if (infra.default_block_interval_ms < 100 || infra.default_block_interval_ms > 60000) {
      setInfraError('Block interval must be between 100ms and 60,000ms.');
      return;
    }
    if (infra.max_concurrency < 1 || infra.max_concurrency > 10000) {
      setInfraError('Max concurrency must be between 1 and 10,000 clients.');
      return;
    }
    if (!infra.rpc_endpoint.startsWith('http://') && !infra.rpc_endpoint.startsWith('https://') && !infra.rpc_endpoint.startsWith('ws://') && !infra.rpc_endpoint.startsWith('wss://')) {
      setInfraError('RPC endpoint must be a valid HTTP or WebSocket URL.');
      return;
    }

    setInfraSaving(true);
    try {
      const updated = await api.updateInfrastructure(infra);
      setInfra(updated);
      setInfraSuccess('Infrastructure configuration updated.');
      setTimeout(() => setInfraSuccess(null), 4000);
    } catch (err: any) {
      setInfraError(err.message || 'Failed to save infrastructure configuration.');
    } finally {
      setInfraSaving(false);
    }
  };

  // --- NOTIFICATION HANDLERS ---
  const handleToggleNotif = async (key: keyof NotificationSettings) => {
    const next = { ...notifSettings, [key]: !notifSettings[key] };
    setNotifSettings(next);
    setNotifSaving(true);
    try {
      await api.updateNotificationSettings(next);
      setNotifSuccess('Notification preferences saved.');
      setTimeout(() => setNotifSuccess(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setNotifSaving(false);
    }
  };

  // --- SECURITY HANDLERS ---
  const handleToggle2FA = async () => {
    try {
      const res = await api.toggle2FA();
      setSecurity((prev) => ({ ...prev, two_factor_enabled: res.two_factor_enabled }));
      setSecurityMsg({
        type: 'success',
        text: `Two-Factor Authentication ${res.two_factor_enabled ? 'enabled' : 'disabled'}.`
      });
      setTimeout(() => setSecurityMsg(null), 4000);
    } catch (err: any) {
      setSecurityMsg({ type: 'error', text: err.message || 'Failed to toggle 2FA.' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError('New password cannot be identical to your current password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Password confirmation does not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSecurity((prev) => ({ ...prev, last_password_change: new Date().toISOString().split('T')[0] }));
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleRegenerateKey = async () => {
    if (!window.confirm('Are you sure you want to regenerate your API key? Any active scripts using the old key will fail.')) {
      return;
    }
    setRegeneratingKey(true);
    try {
      const res = await api.regenerateApiKey();
      setSecurity((prev) => ({ ...prev, api_key_masked: res.api_key_masked }));
      setSecurityMsg({ type: 'success', text: 'New API key generated successfully.' });
      setTimeout(() => setSecurityMsg(null), 4000);
    } catch (err: any) {
      setSecurityMsg({ type: 'error', text: err.message || 'Failed to regenerate key.' });
    } finally {
      setRegeneratingKey(false);
    }
  };

  const handleRevokeSessions = async () => {
    setRevokingSessions(true);
    try {
      const res = await api.revokeSessions();
      setSecurity((prev) => ({ ...prev, active_sessions_count: res.active_sessions_count }));
      setSecurityMsg({ type: 'success', text: 'All other active sessions have been revoked.' });
      setTimeout(() => setSecurityMsg(null), 4000);
    } catch (err: any) {
      setSecurityMsg({ type: 'error', text: err.message || 'Failed to revoke sessions.' });
    } finally {
      setRevokingSessions(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(security.api_key_masked);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-scaffold mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Settings</h1>
        <p className="text-text-secondary">Configure platform infrastructure, notifications, security, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="col-span-1 flex flex-col gap-1.5">
          <button
            onClick={() => handleTabChange('account')}
            className={`text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-colors ${
              activeTab === 'account'
                ? 'bg-primary/10 text-primary-interaction font-semibold'
                : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
            }`}
          >
            <User className="w-4 h-4 shrink-0" /> Account
          </button>

          <button
            onClick={() => handleTabChange('infrastructure')}
            className={`text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-colors ${
              activeTab === 'infrastructure'
                ? 'bg-primary/10 text-primary-interaction font-semibold'
                : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
            }`}
          >
            <Server className="w-4 h-4 shrink-0" /> Infrastructure
          </button>

          <button
            onClick={() => handleTabChange('notifications')}
            className={`text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-colors ${
              activeTab === 'notifications'
                ? 'bg-primary/10 text-primary-interaction font-semibold'
                : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
            }`}
          >
            <Bell className="w-4 h-4 shrink-0" /> Notifications
          </button>

          <button
            onClick={() => handleTabChange('security')}
            className={`text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-colors ${
              activeTab === 'security'
                ? 'bg-primary/10 text-primary-interaction font-semibold'
                : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
            }`}
          >
            <Shield className="w-4 h-4 shrink-0" /> Security
          </button>

          <button
            onClick={() => handleTabChange('preferences')}
            className={`text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-colors ${
              activeTab === 'preferences'
                ? 'bg-primary/10 text-primary-interaction font-semibold'
                : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
            }`}
          >
            <Sliders className="w-4 h-4 shrink-0" /> Preferences
          </button>
        </div>

        {/* Content Area */}
        <div className="col-span-1 md:col-span-3 space-y-6">

          {/* ========================================================= */}
          {/* 1. ACCOUNT SECTION */}
          {/* ========================================================= */}
          {activeTab === 'account' && (
            <Card>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-interaction" /> User Profile
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">Manage your identity and team organization details</p>
                </div>
              </div>

              {profileSuccess && (
                <div className="mb-6 p-4 rounded-lg bg-status-success/10 border border-status-success/30 text-status-success text-sm flex items-center gap-3 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="mb-6 p-4 rounded-lg bg-status-error/10 border border-status-error/30 text-status-error text-sm flex items-center gap-3 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {profileLoading ? (
                <div className="py-12 flex justify-center items-center gap-2 text-text-muted text-sm">
                  <Loader2 className="w-5 h-5 animate-spin text-primary-interaction" />
                  <span>Loading profile...</span>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-5 max-w-xl">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-text-secondary">
                      Display Name <span className="text-status-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="Your full name"
                      className="w-full border border-border rounded-lg px-3.5 py-2.5 bg-background focus:outline-none focus:border-primary-interaction transition-colors text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-text-secondary">
                      Email Address <span className="text-status-error">*</span>
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      placeholder="you@company.com"
                      className="w-full border border-border rounded-lg px-3.5 py-2.5 bg-background focus:outline-none focus:border-primary-interaction transition-colors text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-text-secondary">Role / Title</label>
                      <input
                        type="text"
                        value={profile.role || ''}
                        onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                        placeholder="e.g. Lead Architect"
                        className="w-full border border-border rounded-lg px-3.5 py-2.5 bg-background focus:outline-none focus:border-primary-interaction transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-text-secondary">Organization</label>
                      <input
                        type="text"
                        value={profile.organization || ''}
                        onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                        placeholder="e.g. DLT Labs"
                        className="w-full border border-border rounded-lg px-3.5 py-2.5 bg-background focus:outline-none focus:border-primary-interaction transition-colors text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="bg-primary-interaction text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm shadow-sm"
                    >
                      {profileSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="px-4 py-2.5 rounded-lg border border-border text-text-secondary hover:text-status-error hover:border-status-error/40 hover:bg-status-error/10 transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </form>
              )}
            </Card>
          )}

          {/* ========================================================= */}
          {/* 2. INFRASTRUCTURE SECTION */}
          {/* ========================================================= */}
          {activeTab === 'infrastructure' && (
            <Card>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Server className="w-5 h-5 text-primary-interaction" /> Infrastructure Configuration
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">Default topology limits and consensus simulation runtime settings</p>
                </div>
              </div>

              {infraSuccess && (
                <div className="mb-6 p-4 rounded-lg bg-status-success/10 border border-status-success/30 text-status-success text-sm flex items-center gap-3 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{infraSuccess}</span>
                </div>
              )}

              {infraError && (
                <div className="mb-6 p-4 rounded-lg bg-status-error/10 border border-status-error/30 text-status-error text-sm flex items-center gap-3 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{infraError}</span>
                </div>
              )}

              {infraLoading ? (
                <div className="py-12 flex justify-center items-center gap-2 text-text-muted text-sm">
                  <Loader2 className="w-5 h-5 animate-spin text-primary-interaction" />
                  <span>Loading configuration...</span>
                </div>
              ) : (
                <form onSubmit={handleSaveInfra} className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-text-secondary">
                        Default Node Count (1 – 100)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={infra.default_node_count}
                        onChange={(e) => setInfra({ ...infra, default_node_count: parseInt(e.target.value) || 1 })}
                        className="w-full border border-border rounded-lg px-3.5 py-2.5 bg-background focus:outline-none focus:border-primary-interaction transition-colors text-sm"
                        required
                      />
                      <span className="text-[11px] text-text-muted mt-1 block">Baseline validator count per simulation</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-text-secondary">
                        Block Interval (ms)
                      </label>
                      <input
                        type="number"
                        min={100}
                        max={60000}
                        step={100}
                        value={infra.default_block_interval_ms}
                        onChange={(e) => setInfra({ ...infra, default_block_interval_ms: parseInt(e.target.value) || 500 })}
                        className="w-full border border-border rounded-lg px-3.5 py-2.5 bg-background focus:outline-none focus:border-primary-interaction transition-colors text-sm"
                        required
                      />
                      <span className="text-[11px] text-text-muted mt-1 block">Minimum delay between blocks (100–60000ms)</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-text-secondary">
                        Max Concurrency (Clients)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10000}
                        value={infra.max_concurrency}
                        onChange={(e) => setInfra({ ...infra, max_concurrency: parseInt(e.target.value) || 100 })}
                        className="w-full border border-border rounded-lg px-3.5 py-2.5 bg-background focus:outline-none focus:border-primary-interaction transition-colors text-sm"
                        required
                      />
                      <span className="text-[11px] text-text-muted mt-1 block">Max simultaneous transaction injection clients</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-text-secondary">
                        Network Bandwidth
                      </label>
                      <select
                        value={infra.network_bandwidth}
                        onChange={(e) => setInfra({ ...infra, network_bandwidth: e.target.value })}
                        className="w-full border border-border rounded-lg px-3.5 py-2.5 bg-background focus:outline-none focus:border-primary-interaction transition-colors text-sm"
                      >
                        <option value="1 Gbps (Standard)">1 Gbps (Standard)</option>
                        <option value="10 Gbps (Enterprise)">10 Gbps (Enterprise)</option>
                        <option value="100 Mbps (Constrained)">100 Mbps (Constrained)</option>
                      </select>
                      <span className="text-[11px] text-text-muted mt-1 block">Inter-node link bandwidth profile</span>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-1.5 text-text-secondary">
                        RPC Endpoint
                      </label>
                      <input
                        type="text"
                        value={infra.rpc_endpoint}
                        onChange={(e) => setInfra({ ...infra, rpc_endpoint: e.target.value })}
                        placeholder="http://node-cluster.internal:8545"
                        className="w-full border border-border rounded-lg px-3.5 py-2.5 bg-background focus:outline-none focus:border-primary-interaction transition-colors text-sm font-mono"
                        required
                      />
                      <span className="text-[11px] text-text-muted mt-1 block">Cluster RPC gateway connection string</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-text-secondary">
                        Engine Timeout (seconds)
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={3600}
                        value={infra.engine_timeout_sec}
                        onChange={(e) => setInfra({ ...infra, engine_timeout_sec: parseInt(e.target.value) || 30 })}
                        className="w-full border border-border rounded-lg px-3.5 py-2.5 bg-background focus:outline-none focus:border-primary-interaction transition-colors text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-text-secondary">
                        Storage Engine Driver
                      </label>
                      <select
                        value={infra.storage_driver}
                        onChange={(e) => setInfra({ ...infra, storage_driver: e.target.value })}
                        className="w-full border border-border rounded-lg px-3.5 py-2.5 bg-background focus:outline-none focus:border-primary-interaction transition-colors text-sm"
                      >
                        <option value="RocksDB">RocksDB (High Throughput)</option>
                        <option value="LevelDB">LevelDB (Lightweight)</option>
                        <option value="Pebble">Pebble (Go Native)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={infraSaving}
                      className="bg-primary-interaction text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm shadow-sm"
                    >
                      {infraSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save Infrastructure Configuration
                    </button>
                  </div>
                </form>
              )}
            </Card>
          )}

          {/* ========================================================= */}
          {/* 3. NOTIFICATIONS SECTION */}
          {/* ========================================================= */}
          {activeTab === 'notifications' && (
            <Card>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary-interaction" /> Notification Preferences
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">Configure when and how DLT Testbed delivers alerts to your workstation</p>
                </div>
              </div>

              {notifSuccess && (
                <div className="mb-6 p-4 rounded-lg bg-status-success/10 border border-status-success/30 text-status-success text-sm flex items-center gap-3 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{notifSuccess}</span>
                </div>
              )}

              <div className="space-y-4 max-w-2xl">
                {/* 1. Benchmark Complete */}
                <div 
                  onClick={() => handleToggleNotif('benchmark_complete')}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-surface-secondary/40 hover:bg-surface-secondary cursor-pointer transition-colors"
                >
                  <div className="pr-4">
                    <h4 className="font-medium text-text-primary text-sm">Benchmark Completion Alerts</h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Receive an instant notification in the header bell when any benchmark run completes.
                    </p>
                  </div>
                  <div 
                    className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${
                      notifSettings.benchmark_complete ? 'bg-primary-interaction' : 'bg-surface-warm border border-border'
                    }`}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full absolute top-1 transition-all ${
                        notifSettings.benchmark_complete ? 'bg-white right-1' : 'bg-text-muted left-1'
                      }`} 
                    />
                  </div>
                </div>

                {/* 2. Stress Test Alerts */}
                <div 
                  onClick={() => handleToggleNotif('stress_test_alerts')}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-surface-secondary/40 hover:bg-surface-secondary cursor-pointer transition-colors"
                >
                  <div className="pr-4">
                    <h4 className="font-medium text-text-primary text-sm">Stress Test Saturation Warnings</h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Alert immediately when CPU, memory, or P99 tail latency degrades beyond safe boundaries.
                    </p>
                  </div>
                  <div 
                    className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${
                      notifSettings.stress_test_alerts ? 'bg-primary-interaction' : 'bg-surface-warm border border-border'
                    }`}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full absolute top-1 transition-all ${
                        notifSettings.stress_test_alerts ? 'bg-white right-1' : 'bg-text-muted left-1'
                      }`} 
                    />
                  </div>
                </div>

                {/* 3. System Status Alerts */}
                <div 
                  onClick={() => handleToggleNotif('system_status_alerts')}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-surface-secondary/40 hover:bg-surface-secondary cursor-pointer transition-colors"
                >
                  <div className="pr-4">
                    <h4 className="font-medium text-text-primary text-sm">System & Cluster Status Alerts</h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Broadcast status alerts whenever cluster nodes drop offline or reconnect.
                    </p>
                  </div>
                  <div 
                    className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${
                      notifSettings.system_status_alerts ? 'bg-primary-interaction' : 'bg-surface-warm border border-border'
                    }`}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full absolute top-1 transition-all ${
                        notifSettings.system_status_alerts ? 'bg-white right-1' : 'bg-text-muted left-1'
                      }`} 
                    />
                  </div>
                </div>

                {/* 4. Email Digest */}
                <div 
                  onClick={() => handleToggleNotif('email_digest')}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-surface-secondary/40 hover:bg-surface-secondary cursor-pointer transition-colors"
                >
                  <div className="pr-4">
                    <h4 className="font-medium text-text-primary text-sm">Weekly Performance Digest</h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Send a compiled summary report of all generated benchmarks to your registered email.
                    </p>
                  </div>
                  <div 
                    className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${
                      notifSettings.email_digest ? 'bg-primary-interaction' : 'bg-surface-warm border border-border'
                    }`}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full absolute top-1 transition-all ${
                        notifSettings.email_digest ? 'bg-white right-1' : 'bg-text-muted left-1'
                      }`} 
                    />
                  </div>
                </div>
              </div>

              {notifSaving && (
                <div className="mt-4 text-xs text-text-muted flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-interaction" />
                  <span>Saving notification preferences...</span>
                </div>
              )}
            </Card>
          )}

          {/* ========================================================= */}
          {/* 4. SECURITY SECTION */}
          {/* ========================================================= */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {securityMsg && (
                <div className={`p-4 rounded-lg text-sm flex items-center gap-3 animate-in fade-in ${
                  securityMsg.type === 'success' 
                    ? 'bg-status-success/10 border border-status-success/30 text-status-success' 
                    : 'bg-status-error/10 border border-status-error/30 text-status-error'
                }`}>
                  {securityMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                  <span>{securityMsg.text}</span>
                </div>
              )}

              {/* Password Change Card */}
              <Card>
                <div className="pb-4 mb-6 border-b border-border">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary-interaction" /> Change Password
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Last changed: <span className="font-mono text-text-primary">{security.last_password_change}</span>
                  </p>
                </div>

                {passwordSuccess && (
                  <div className="mb-6 p-4 rounded-lg bg-status-success/10 border border-status-success/30 text-status-success text-sm flex items-center gap-3 animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                {passwordError && (
                  <div className="mb-6 p-4 rounded-lg bg-status-error/10 border border-status-error/30 text-status-error text-sm flex items-center gap-3 animate-in fade-in">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-text-secondary">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full border border-border rounded-lg px-3.5 py-2.5 bg-background focus:outline-none focus:border-primary-interaction transition-colors text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-text-secondary">New Password (min 8 characters)</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full border border-border rounded-lg px-3.5 py-2.5 bg-background focus:outline-none focus:border-primary-interaction transition-colors text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-text-secondary">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full border border-border rounded-lg px-3.5 py-2.5 bg-background focus:outline-none focus:border-primary-interaction transition-colors text-sm"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="bg-primary-interaction text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm shadow-sm"
                    >
                      {passwordSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                      Update Password
                    </button>
                  </div>
                </form>
              </Card>

              {/* 2FA & Active Sessions & API Key */}
              <Card>
                <div className="pb-4 mb-6 border-b border-border">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary-interaction" /> Access & Authentication
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">Manage secondary security factors and active sessions</p>
                </div>

                <div className="space-y-6">
                  {/* Two-Factor Toggle */}
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-surface-secondary/30">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-text-primary text-sm">Two-Factor Authentication (2FA)</h4>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          security.two_factor_enabled ? 'bg-status-success/20 text-status-success' : 'bg-surface-warm text-text-muted'
                        }`}>
                          {security.two_factor_enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">Protect high-throughput benchmark runs with TOTP verification.</p>
                    </div>
                    <button
                      onClick={handleToggle2FA}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        security.two_factor_enabled
                          ? 'bg-status-error/10 text-status-error hover:bg-status-error/20'
                          : 'bg-primary-interaction text-white hover:bg-blue-700'
                      }`}
                    >
                      {security.two_factor_enabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </button>
                  </div>

                  {/* API Key Management */}
                  <div className="p-4 border border-border rounded-lg bg-surface-secondary/30">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-text-primary text-sm">API Access Token</h4>
                      <button
                        onClick={handleRegenerateKey}
                        disabled={regeneratingKey}
                        className="text-xs text-primary-interaction hover:underline flex items-center gap-1 font-medium disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${regeneratingKey ? 'animate-spin' : ''}`} /> Regenerate Key
                      </button>
                    </div>
                    <p className="text-xs text-text-secondary mb-3">Used for CLI benchmark execution and automation webhooks.</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 font-mono text-xs bg-background border border-border px-3.5 py-2.5 rounded-lg text-text-primary select-all">
                        {security.api_key_masked}
                      </div>
                      <button
                        onClick={handleCopyKey}
                        className="px-3 py-2.5 border border-border rounded-lg text-xs font-medium bg-background hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5 shrink-0"
                      >
                        {keyCopied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                        {keyCopied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-surface-secondary/30">
                    <div>
                      <h4 className="font-medium text-text-primary text-sm">Active Browser Sessions</h4>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Currently <strong className="text-text-primary">{security.active_sessions_count} active devices</strong> connected to this testbed.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRevokeSessions}
                        disabled={revokingSessions || security.active_sessions_count <= 1}
                        className="px-3.5 py-2 border border-border rounded-lg text-xs font-medium hover:bg-border text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Revoke Other Sessions
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="px-3.5 py-2 border border-border rounded-lg text-xs font-medium text-text-secondary hover:text-status-error hover:border-status-error/40 hover:bg-status-error/10 transition-colors flex items-center gap-1.5 shrink-0"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. PREFERENCES SECTION */}
          {/* ========================================================= */}
          {activeTab === 'preferences' && (
            <Card>
              <div className="pb-4 mb-6 border-b border-border">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-primary-interaction" /> Application Preferences
                </h3>
                <p className="text-xs text-text-secondary mt-1">Appearance and automated simulation workflows</p>
              </div>

              <div className="space-y-4 max-w-2xl">
                {/* Dark Mode Control */}
                <div 
                  onClick={toggleDarkMode}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-surface-secondary/40 hover:bg-surface-secondary cursor-pointer transition-colors"
                >
                  <div className="pr-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-text-primary text-sm">Dark Mode Appearance</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-warm text-text-muted border border-border">
                        {darkMode ? 'DARK' : 'LIGHT'}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Toggle dark theme aesthetics across all testbed command center dashboards.
                    </p>
                  </div>
                  <div 
                    className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${
                      darkMode ? 'bg-primary-interaction' : 'bg-surface-warm border border-border'
                    }`}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full absolute top-1 flex items-center justify-center transition-all ${
                        darkMode ? 'bg-white right-1' : 'bg-text-muted left-1'
                      }`}
                    >
                      {darkMode ? <Moon className="w-2.5 h-2.5 text-primary-interaction" /> : <Sun className="w-2.5 h-2.5 text-white" />}
                    </div>
                  </div>
                </div>

                {/* Auto-generate Reports Control */}
                <div 
                  onClick={() => setAutoGenerateReports(!autoGenerateReports)}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-surface-secondary/40 hover:bg-surface-secondary cursor-pointer transition-colors"
                >
                  <div className="pr-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-text-primary text-sm">Auto-generate Reports</h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        autoGenerateReports ? 'bg-status-success/20 text-status-success' : 'bg-surface-warm text-text-muted'
                      }`}>
                        {autoGenerateReports ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Automatically generate and store a performance report in the Reports archive immediately when a benchmark completes.
                    </p>
                  </div>
                  <div 
                    className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${
                      autoGenerateReports ? 'bg-primary-interaction' : 'bg-surface-warm border border-border'
                    }`}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full absolute top-1 transition-all ${
                        autoGenerateReports ? 'bg-white right-1' : 'bg-text-muted left-1'
                      }`} 
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary-interaction/20 text-xs text-text-secondary flex items-start gap-3">
                  <FileCheck className="w-4 h-4 text-primary-interaction shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-text-primary">Persistent Preferences:</strong> All preferences are saved to your account and synced with local storage so they remain active after page reloads or device restarts.
                  </div>
                </div>
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
