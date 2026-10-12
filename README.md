# DLT TESTBED - Distributed Ledger Benchmark Engine

A full-stack, enterprise-grade testbed for simulating, benchmarking, and analyzing consensus protocols across distributed ledger topologies (Proof of Stake, PBFT, Proof of Authority, and Raft).

![DLT TESTBED](https://img.shields.io/badge/DLT-Testbed-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)
![License](https://img.shields.io/badge/License-MIT-purple.svg)

---

## Features

- **Live Benchmark Lab**: Real-time consensus performance tracking (TPS throughput, block latency, Byzantine node fault tolerance, confirmation distribution).
- **Stress Lab**: Controlled stress testing under high concurrency, bandwidth throttling, and network partitions.
- **Protocol Comparison**: Multi-dimensional radar comparisons across PoS, PBFT, PoA, and Raft architectures.
- **AI Consensus Advisor**: Automated recommendations on parameter tuning and network topologies.
- **Reports & Export Engine**: Automated report generation with downloadable PDF and CSV summaries.
- **Authentication & Role-Based Profiles**:
  - Secure PBKDF2-HMAC-SHA256 password hashing and Bearer session tokens.
  - 1-Click demo logins for **Lead Architect**, **System Admin**, and **Consensus Researcher**.
  - Route guarding and session management.
- **Settings System**:
  - **Account**: Editable profile, role, organization details with persistence.
  - **Infrastructure**: Configurable validator node counts, block intervals, and RPC endpoints.
  - **Notifications**: Granular toggles and live unread notification panel.
  - **Security**: Password management, 2FA toggle, session revocation, and API key generation.
  - **Preferences**: Dark/light mode theme toggle and automated report creation.
- **Global Quick Search (`Ctrl+K` / `⌘K`)**: Unified instant search across benchmarks, reports, and navigation.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend**: Python FastAPI, Uvicorn, SQLAlchemy, SQLite, Pydantic
- **Testing**: Pytest, Oxlint, TypeScript Compiler (`tsc`)

---

## Quick Start

### 1. Unified Launcher
Run both FastAPI backend and Vite frontend dev server with a single command:

```bash
python run_all.py
```

### 2. Manual Setup

#### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt   # or fastapi uvicorn sqlalchemy pytest httpx
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev
```

The application will be accessible at:
- **Web Interface**: [http://localhost:5173](http://localhost:5173)
- **API Documentation (Swagger)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## Demo Credentials

For quick evaluation, use the 1-click demo buttons on the login screen, or sign in manually:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Lead Architect** | `demo@dlttestbed.com` | `password123` |
| **System Admin** | `admin@dlttestbed.com` | `admin123` |
| **Researcher** | `researcher@dlttestbed.com` | `research123` |

---

## Running Automated Tests

```bash
# Backend Tests
cd backend
python -m pytest tests/test_api.py -v

# Frontend Quality Checks
cd frontend
npm run lint
npm run build
```

---

## License
MIT License. Distributed Systems Research Labs.
