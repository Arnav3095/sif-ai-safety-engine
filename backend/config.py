import os
from dotenv import load_dotenv
import werkzeug

# Compatibility patch for modern Werkzeug versions with Flask
if not hasattr(werkzeug, '__version__'):
    werkzeug.__version__ = '3.0.0'

load_dotenv()

class Config:
    """Application configuration settings"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'sih2026-secret-safety-key')
    
    # Database Configuration
    DATABASE_URL = os.getenv('DATABASE_URL')
    if not DATABASE_URL:
        # SQLite database fallback in backend directory
        db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sih26165_db.sqlite')
        DATABASE_URL = f'sqlite:///{db_path}'
        
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False
    PORT = int(os.getenv('PORT', '8000'))
