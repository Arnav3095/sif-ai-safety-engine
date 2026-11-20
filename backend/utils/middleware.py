import hashlib

def hash_password(password):
    """Hash password securely using SHA256"""
    return hashlib.sha256(str(password).encode('utf-8')).hexdigest()
