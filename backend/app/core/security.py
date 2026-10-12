import os
import secrets
import hashlib

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        bytes.fromhex(salt),
        100000
    ).hex()
    return f"{salt}:{key}"

def verify_password(stored_hash: str, provided_password: str) -> bool:
    try:
        if not stored_hash or ":" not in stored_hash:
            return False
        salt, key = stored_hash.split(":", 1)
        new_key = hashlib.pbkdf2_hmac(
            'sha256',
            provided_password.encode('utf-8'),
            bytes.fromhex(salt),
            100000
        ).hex()
        return secrets.compare_digest(key, new_key)
    except Exception:
        return False

def generate_session_token() -> str:
    return f"dlt_sess_{secrets.token_urlsafe(32)}"
