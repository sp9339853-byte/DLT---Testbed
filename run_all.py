"""
DLT TESTBED - Unified Orchestrator Script
Starts FastAPI backend server on port 8000 and Vite frontend on port 5173.
"""

import os
import sys
import time
import subprocess

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(base_dir, "backend")
    frontend_dir = os.path.join(base_dir, "frontend")

    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

    print("=" * 60)
    print(" [DLT TESTBED] Distributed Ledger Benchmark Engine")
    print("=" * 60)

    # 1. Initialize SQLite Database
    print("\n[1/3] Initializing DLT Testbed database...")
    sys.path.insert(0, backend_dir)
    try:
        from app.database.init_db import init_db
        init_db()
        print("[OK] Database verified & seeded.")
    except Exception as e:
        print(f"Database note: {e}")

    # 2. Start FastAPI Backend Microservice
    print("\n[2/3] Starting FastAPI backend on http://127.0.0.1:8000...")
    backend_cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"]
    backend_proc = subprocess.Popen(backend_cmd, cwd=backend_dir)
    time.sleep(2)

    # 3. Start Vite Frontend Dev Server
    print("\n[3/3] Launching Vite Frontend on http://localhost:5173...")
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_proc = subprocess.Popen([npm_cmd, "run", "dev"], cwd=frontend_dir)

    print("\n[OK] Platform running:")
    print("  - Web Application: http://localhost:5173")
    print("  - REST API & Docs: http://127.0.0.1:8000/docs")
    print("\nPress Ctrl+C to terminate both servers.")

    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                print("Backend process exited.")
                break
            if frontend_proc.poll() is not None:
                print("Frontend process exited.")
                break
    except KeyboardInterrupt:
        pass
    finally:
        print("\nShutting down DLT Testbed servers...")
        try:
            backend_proc.terminate()
        except Exception:
            pass
        try:
            frontend_proc.terminate()
        except Exception:
            pass
        print("[OK] Clean shutdown complete.")

if __name__ == "__main__":
    main()
