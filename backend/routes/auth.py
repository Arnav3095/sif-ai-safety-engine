import logging
import uuid
from flask import Blueprint, request, jsonify
from sqlalchemy import func, or_
from models import db, User
from utils import hash_password

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register_user():
    """Register a new Staff or Admin user account"""
    try:
        data = request.get_json() or {}
        email = data.get('email', '').strip().lower()
        password = data.get('password', '').strip()
        full_name = data.get('full_name', '').strip()
        role = data.get('role', 'staff').strip().lower()
        site_name = data.get('site_name', 'Mumbai Offshore Platform').strip()
        user_id = data.get('user_id', '').strip() or f"EMP-{uuid.uuid4().hex[:6].upper()}"

        if not email or not password or not full_name:
            return jsonify({'error': 'Email, password, and full name are required'}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'An account with this email address already exists.'}), 400

        user = User(
            user_id=user_id,
            full_name=full_name,
            email=email,
            password_hash=hash_password(password),
            role=role if role in ['staff', 'admin'] else 'staff',
            site_name=site_name
        )

        db.session.add(user)
        db.session.commit()

        logger.info(f"✅ User registered: {user.email} (Role: {user.role})")

        return jsonify({
            'success': True,
            'message': 'Account registered successfully',
            'user': user.to_dict(),
            'token': f"session-{user.user_id}"
        }), 201
    except Exception as e:
        logger.error(f"Error registering user: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login_user():
    """Authenticate user login credentials"""
    try:
        data = request.get_json() or {}
        login_input = data.get('email', '').strip().lower()
        password = data.get('password', '').strip()
        expected_role = data.get('role', None)

        if not login_input or not password:
            return jsonify({'error': 'Email / Employee ID and password are required'}), 400

        user = User.query.filter(
            or_(func.lower(User.email) == login_input, func.lower(User.user_id) == login_input)
        ).first()

        if not user or user.password_hash != hash_password(password):
            return jsonify({'error': 'Invalid email/employee ID or password. Please try again.'}), 401

        # Check role match if role tab was selected
        if expected_role and user.role != expected_role:
            return jsonify({
                'error': f"This account is registered as '{user.role.upper()}'. Please switch to the '{user.role.upper()}' login tab."
            }), 403

        logger.info(f"✅ User logged in: {user.email} (Role: {user.role})")

        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': user.to_dict(),
            'token': f"session-{user.user_id}"
        }), 200
    except Exception as e:
        logger.error(f"Error logging in user: {e}")
        return jsonify({'error': str(e)}), 500
