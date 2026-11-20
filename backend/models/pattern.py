from datetime import datetime
from . import db

class PrecursorPattern(db.Model):
    __tablename__ = 'precursor_patterns'
    
    id = db.Column(db.Integer, primary_key=True)
    pattern_id = db.Column(db.String(50), unique=True, nullable=False)
    precursor_type = db.Column(db.String(100), nullable=False)
    activity = db.Column(db.String(100))
    site_name = db.Column(db.String(100))
    location = db.Column(db.String(100))
    frequency = db.Column(db.Integer, default=1)
    sif_precursor_count = db.Column(db.Integer, default=0)
    non_sif_count = db.Column(db.Integer, default=0)
    sif_probability = db.Column(db.Float, default=0.0)
    severity_index = db.Column(db.Float, default=0.0)
    last_occurrence = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'pattern_id': self.pattern_id,
            'precursor_type': self.precursor_type,
            'activity': self.activity,
            'site_name': self.site_name,
            'frequency': self.frequency,
            'sif_probability': round(self.sif_probability, 4),
            'severity_index': round(self.severity_index, 4)
        }
