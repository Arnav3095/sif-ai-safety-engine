from datetime import datetime
from . import db

class Report(db.Model):
    __tablename__ = 'reports'
    
    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.String(50), unique=True, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    original_text = db.Column(db.Text)
    site_name = db.Column(db.String(100))
    location = db.Column(db.String(100))
    activity_type = db.Column(db.String(100))
    date_submitted = db.Column(db.DateTime, default=datetime.utcnow)
    date_incident = db.Column(db.DateTime)
    
    # Classification
    sif_classification = db.Column(db.String(20))
    sif_score = db.Column(db.Float, default=0.0)
    sif_confidence = db.Column(db.Float, default=0.0)
    
    # Life-Saving Rules
    life_saving_rule = db.Column(db.String(50))
    secondary_rules = db.Column(db.String(255))
    
    # Precursors
    precursors = db.Column(db.String(255))
    keywords = db.Column(db.String(255))
    
    # Metadata
    status = db.Column(db.String(20), default='pending')
    reviewed_by = db.Column(db.String(100))
    date_reviewed = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    action_taken = db.Column(db.Text)
    assigned_to = db.Column(db.String(100))
    submitted_by = db.Column(db.String(100), default='Field Staff')
    
    def to_dict(self):
        return {
            'id': self.id,
            'report_id': self.report_id,
            'title': self.title,
            'description': self.description,
            'site_name': self.site_name,
            'location': self.location,
            'activity_type': self.activity_type,
            'date_submitted': self.date_submitted.isoformat() if self.date_submitted else None,
            'sif_classification': self.sif_classification,
            'sif_confidence': round(self.sif_confidence, 4) if self.sif_confidence else 0.0,
            'life_saving_rule': self.life_saving_rule,
            'secondary_rules': self.secondary_rules,
            'precursors': self.precursors,
            'status': self.status,
            'reviewed_by': self.reviewed_by,
            'date_reviewed': self.date_reviewed.isoformat() if self.date_reviewed else None,
            'notes': self.notes,
            'action_taken': self.action_taken,
            'assigned_to': self.assigned_to,
            'submitted_by': self.submitted_by
        }
