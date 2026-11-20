import uuid
import logging
from datetime import datetime
from flask import Blueprint, request, jsonify
from sqlalchemy import func, or_
from models import db, Report
from services import classify_report
from utils import tag_life_saving_rules, extract_precursors, update_risk_summaries

logger = logging.getLogger(__name__)

reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')

@reports_bp.route('/submit', methods=['POST'])
def submit_report():
    """Submit a new safety report"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('title') or not data.get('description'):
            return jsonify({'error': 'Title and description are required'}), 400
        
        # Create new report
        report = Report(
            report_id=str(uuid.uuid4()),
            title=data.get('title'),
            description=data.get('description'),
            original_text=data.get('description'),
            site_name=data.get('site_name', 'Unknown'),
            location=data.get('location', 'Unknown'),
            activity_type=data.get('activity_type', 'Other'),
            date_incident=datetime.fromisoformat(data.get('date_incident')) if data.get('date_incident') else None,
            submitted_by=data.get('submitted_by', 'Field Staff')
        )
        
        # Combine title and description for comprehensive NLP context
        full_text = f"{report.title}. {report.description}"
        
        # Classify report
        report.sif_classification, report.sif_confidence = classify_report(full_text)
        
        # Tag Life-Saving Rules
        report.life_saving_rule, report.secondary_rules = tag_life_saving_rules(full_text)
        
        # Extract precursors
        precursors = extract_precursors(full_text)
        report.precursors = ','.join(precursors) if precursors else None
        
        # Set status
        report.status = 'classified'
        
        # Add to database
        db.session.add(report)
        db.session.commit()
        
        # Update summaries
        update_risk_summaries(report)
        
        logger.info(f"Report submitted: {report.report_id}")
        
        return jsonify({
            'success': True,
            'report_id': report.report_id,
            'classification': report.sif_classification,
            'confidence': round(report.sif_confidence, 4),
            'life_saving_rule': report.life_saving_rule,
            'precursors': report.precursors
        }), 201
    
    except Exception as e:
        logger.error(f"Error submitting report: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/classify-preview', methods=['POST'])
def classify_preview():
    """Instant live AI preview for Staff submission form"""
    try:
        data = request.get_json() or {}
        title = data.get('title', '')
        description = data.get('description', '')
        text = f"{title}. {description}".strip()

        if not text or len(text) < 3:
            return jsonify({
                'classification': 'LOW',
                'confidence': 0.0,
                'life_saving_rule': None,
                'precursors': []
            }), 200

        label, conf = classify_report(text)
        primary_rule, secondary = tag_life_saving_rules(text)
        precursors = extract_precursors(text)

        return jsonify({
            'classification': label,
            'confidence': round(conf, 4),
            'life_saving_rule': primary_rule,
            'secondary_rules': secondary,
            'precursors': precursors
        }), 200
    except Exception as e:
        logger.error(f"Error generating classification preview: {e}")
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/<report_id>/review', methods=['PUT'])
def review_report(report_id):
    """Admin endpoint to review, override classification, assign officer, and add resolution notes"""
    try:
        report = Report.query.filter_by(report_id=report_id).first()
        if not report:
            return jsonify({'error': 'Report not found'}), 404

        data = request.get_json() or {}
        
        if 'sif_classification' in data:
            report.sif_classification = data['sif_classification']
        if 'status' in data:
            report.status = data['status']
        if 'assigned_to' in data:
            report.assigned_to = data['assigned_to']
        if 'action_taken' in data:
            report.action_taken = data['action_taken']
        if 'notes' in data:
            report.notes = data['notes']
        
        report.reviewed_by = data.get('reviewed_by', 'HSSE Admin')
        report.date_reviewed = datetime.utcnow()

        db.session.commit()
        
        # Recalculate site and activity summaries
        update_risk_summaries(report)
        
        return jsonify({
            'success': True,
            'message': 'Report updated successfully',
            'report': report.to_dict()
        }), 200
    except Exception as e:
        logger.error(f"Error reviewing report: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@reports_bp.route('', methods=['GET'])
def get_reports():
    """Get reports with optional filtering by submitted_by (Staff), classification, or status"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        submitted_by = request.args.get('submitted_by', None)
        classification = request.args.get('classification', None)
        status = request.args.get('status', None)

        query = Report.query

        if submitted_by and str(submitted_by).strip():
            target_user = str(submitted_by).strip()
            query = query.filter(
                or_(
                    Report.submitted_by == target_user,
                    func.lower(Report.submitted_by) == target_user.lower()
                )
            )

        if classification and str(classification).strip():
            query = query.filter_by(sif_classification=classification.strip())

        if status and str(status).strip():
            query = query.filter_by(status=status.strip())

        reports = query.order_by(Report.date_submitted.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return jsonify({
            'total': reports.total,
            'pages': reports.pages,
            'current_page': page,
            'reports': [r.to_dict() for r in reports.items]
        }), 200

    except Exception as e:
        logger.error(f"Error fetching reports: {e}")
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/<report_id>', methods=['GET'])
def get_report(report_id):
    """Get a specific report"""
    try:
        report = Report.query.filter_by(report_id=report_id).first()
        
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        return jsonify(report.to_dict()), 200
    
    except Exception as e:
        logger.error(f"Error fetching report: {e}")
        return jsonify({'error': str(e)}), 500
