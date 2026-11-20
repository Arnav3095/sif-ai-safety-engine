import logging
from datetime import datetime
from sqlalchemy import text
from models import db, User, LifeSavingRule, PrecursorPattern
from utils import hash_password
from .data import DEMO_USERS, LIFE_SAVING_RULES_DATA, PRECURSOR_PATTERNS_DATA

logger = logging.getLogger(__name__)

def run_migrations():
    """Auto-migrate SQLite/MySQL schema if new columns are missing"""
    try:
        with db.engine.connect() as conn:
            migration_statements = [
                "ALTER TABLE reports ADD COLUMN action_taken TEXT;",
                "ALTER TABLE reports ADD COLUMN assigned_to VARCHAR(100);",
                "ALTER TABLE reports ADD COLUMN submitted_by VARCHAR(100) DEFAULT 'Field Staff';"
            ]
            for stmt in migration_statements:
                try:
                    conn.execute(text(stmt))
                except Exception:
                    pass
            conn.commit()
            logger.info("Schema migrations checked/applied.")
    except Exception as ex:
        logger.warning(f"Schema migration note: {ex}")

def seed_demo_users():
    """Ensure default Staff and Admin demo accounts exist"""
    try:
        for u in DEMO_USERS:
            if not User.query.filter_by(email=u['email']).first():
                user = User(
                    user_id=u['user_id'],
                    full_name=u['full_name'],
                    email=u['email'],
                    password_hash=hash_password(u['password']),
                    role=u['role'],
                    site_name=u['site_name'],
                    department=u['department']
                )
                db.session.add(user)
        db.session.commit()
        logger.info("✅ Demo user accounts verified: staff@oil.com / admin@oil.com")
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error seeding demo users: {e}")

def seed_life_saving_rules():
    """Ensure default Life-Saving Rules exist in database"""
    try:
        for r in LIFE_SAVING_RULES_DATA:
            existing = LifeSavingRule.query.filter_by(rule_code=r['rule_code']).first()
            if not existing:
                rule = LifeSavingRule(
                    rule_code=r['rule_code'],
                    rule_name=r['rule_name'],
                    description=r['description'],
                    keywords=r['keywords']
                )
                db.session.add(rule)
        db.session.commit()
        logger.info("✅ Life-Saving Rules verified/seeded into database.")
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error seeding Life-Saving Rules: {e}")

def seed_precursor_patterns():
    """Ensure default safety precursor patterns exist in database"""
    try:
        for p in PRECURSOR_PATTERNS_DATA:
            existing = PrecursorPattern.query.filter_by(pattern_id=p['pattern_id']).first()
            if not existing:
                pattern = PrecursorPattern(
                    pattern_id=p['pattern_id'],
                    precursor_type=p['precursor_type'],
                    activity=p['activity'],
                    site_name=p['site_name'],
                    frequency=p['frequency'],
                    sif_precursor_count=p['sif_precursor_count'],
                    non_sif_count=p['non_sif_count'],
                    sif_probability=p['sif_probability'],
                    severity_index=p['severity_index'],
                    last_occurrence=datetime.utcnow()
                )
                db.session.add(pattern)
        db.session.commit()
        logger.info("✅ Precursor patterns verified/seeded into database.")
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error seeding precursor patterns: {e}")

def seed_all():
    """Seed all initial data"""
    seed_demo_users()
    seed_life_saving_rules()
    seed_precursor_patterns()

def init_db(app):
    """Initialize database tables, migrations, and default data"""
    with app.app_context():
        db.create_all()
        run_migrations()
        seed_all()
        logger.info("Database tables and seed data initialized successfully.")
