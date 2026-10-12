import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import BenchmarkLab from './pages/BenchmarkLab';
import LiveBenchmark from './pages/LiveBenchmark';
import ResultsPage from './pages/ResultsPage';
import StressLab from './pages/StressLab';
import Compare from './pages/Compare';
import AIAdvisor from './pages/AIAdvisor';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Application Suite */}
            <Route path="/app" element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="benchmark" element={<BenchmarkLab />} />
                <Route path="benchmark/live" element={<LiveBenchmark />} />
                <Route path="benchmark/results" element={<ResultsPage />} />
                <Route path="stress-lab" element={<StressLab />} />
                <Route path="compare" element={<Compare />} />
                <Route path="ai" element={<AIAdvisor />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
