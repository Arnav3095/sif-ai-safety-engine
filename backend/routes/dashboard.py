import logging
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from sqlalchemy import and_
from models import db, Report, SiteRiskSummary, ActivityRiskSummary, PrecursorPattern, LifeSavingRule

logger = logging.getLogger(__name__)

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/overview', methods=['GET'])
def dashboard_overview():
    """Get dashboard overview data"""
    try:
        total_reports = Report.query.count()
        critical_reports = Report.query.filter_by(sif_classification='CRITICAL').count()
        medium_reports = Report.query.filter_by(sif_classification='MEDIUM').count()
        low_reports = Report.query.filter_by(sif_classification='LOW').count()
        
        # Calculate percentages
        critical_pct = (critical_reports / total_reports * 100) if total_reports > 0 else 0
        medium_pct = (medium_reports / total_reports * 100) if total_reports > 0 else 0
        low_pct = (low_reports / total_reports * 100) if total_reports > 0 else 0
        
        # Recent 7 days
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        reports_7d = Report.query.filter(Report.date_submitted >= seven_days_ago).count()
        critical_7d = Report.query.filter(
            and_(Report.date_submitted >= seven_days_ago, Report.sif_classification == 'CRITICAL')
        ).count()
        
        return jsonify({
            'total_reports': total_reports,
            'critical_reports': critical_reports,
            'medium_reports': medium_reports,
            'low_reports': low_reports,
            'critical_percentage': round(critical_pct, 2),
            'medium_percentage': round(medium_pct, 2),
            'low_percentage': round(low_pct, 2),
            'reports_last_7_days': reports_7d,
            'critical_last_7_days': critical_7d
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching overview: {e}")
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/top-sites', methods=['GET'])
def top_sites():
    """Get top risk sites"""
    try:
        sites = SiteRiskSummary.query.order_by(SiteRiskSummary.risk_score.desc()).limit(10).all()
        
        return jsonify({
            'sites': [s.to_dict() for s in sites]
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching top sites: {e}")
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/top-activities', methods=['GET'])
def top_activities():
    """Get top risk activities"""
    try:
        activities = ActivityRiskSummary.query.order_by(ActivityRiskSummary.risk_score.desc()).limit(10).all()
        
        return jsonify({
            'activities': [a.to_dict() for a in activities]
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching top activities: {e}")
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/precursors', methods=['GET'])
def precursor_patterns():
    """Get precursor patterns"""
    try:
        precursors = PrecursorPattern.query.order_by(
            PrecursorPattern.sif_probability.desc()
        ).limit(20).all()
        
        return jsonify({
            'precursors': [p.to_dict() for p in precursors]
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching precursors: {e}")
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/life-saving-rules', methods=['GET'])
def life_saving_rules():
    """Get all Life-Saving Rules"""
    try:
        rules = LifeSavingRule.query.all()
        
        return jsonify({
            'rules': [r.to_dict() for r in rules]
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching rules: {e}")
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/life-saving-rules', methods=['POST'])
def add_life_saving_rule():
    """Add a new Life-Saving Rule (Admin)"""
    try:
        data = request.get_json() or {}
        rule_code = data.get('rule_code', '').strip().upper()
        rule_name = data.get('rule_name', '').strip()
        description = data.get('description', '').strip()
        keywords = data.get('keywords', '').strip()

        if not rule_code or not rule_name or not description:
            return jsonify({'error': 'Rule code, rule name, and description are required'}), 400

        if LifeSavingRule.query.filter_by(rule_code=rule_code).first():
            return jsonify({'error': f"A rule with code '{rule_code}' already exists"}), 400

        rule = LifeSavingRule(
            rule_code=rule_code,
            rule_name=rule_name,
            description=description,
            keywords=keywords
        )
        db.session.add(rule)
        db.session.commit()

        logger.info(f"✅ New Life-Saving Rule added: {rule.rule_code} - {rule.rule_name}")

        return jsonify({
            'success': True,
            'message': 'Rule added successfully',
            'rule': rule.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error adding Life-Saving Rule: {e}")
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/recent-critical', methods=['GET'])
def recent_critical():
    """Get recent critical reports"""
    try:
        reports = Report.query.filter_by(
            sif_classification='CRITICAL'
        ).order_by(Report.date_submitted.desc()).limit(10).all()
        
        return jsonify({
            'reports': [r.to_dict() for r in reports]
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching critical reports: {e}")
        return jsonify({'error': str(e)}), 500
