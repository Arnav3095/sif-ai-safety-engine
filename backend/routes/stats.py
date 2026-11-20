import logging
from flask import Blueprint, jsonify
from sqlalchemy import func
from models import db, Report, SiteRiskSummary

logger = logging.getLogger(__name__)

stats_bp = Blueprint('stats', __name__, url_prefix='/api/stats')

@stats_bp.route('/classification-distribution', methods=['GET'])
def classification_stats():
    """Get classification distribution"""
    try:
        stats = db.session.query(
            Report.sif_classification,
            func.count(Report.id).label('count')
        ).group_by(Report.sif_classification).all()
        
        return jsonify({
            'distribution': {s[0]: s[1] for s in stats if s[0]}
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        return jsonify({'error': str(e)}), 500

@stats_bp.route('/site-comparison', methods=['GET'])
def site_comparison():
    """Compare risk across sites"""
    try:
        sites = SiteRiskSummary.query.order_by(SiteRiskSummary.risk_score.desc()).all()
        
        data = {
            'sites': [s.site_name for s in sites],
            'risk_scores': [round(s.risk_score, 2) for s in sites],
            'sif_percentages': [round(s.sif_percentage, 2) for s in sites],
            'total_reports': [s.total_reports for s in sites]
        }
        
        return jsonify(data), 200
    
    except Exception as e:
        logger.error(f"Error fetching comparison: {e}")
        return jsonify({'error': str(e)}), 500
