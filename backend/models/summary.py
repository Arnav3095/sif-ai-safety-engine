from datetime import datetime
from . import db

class SiteRiskSummary(db.Model):
    __tablename__ = 'site_risk_summary'
    
    id = db.Column(db.Integer, primary_key=True)
    site_name = db.Column(db.String(100), unique=True, nullable=False)
    location = db.Column(db.String(100))
    total_reports = db.Column(db.Integer, default=0)
    critical_reports = db.Column(db.Integer, default=0)
    medium_reports = db.Column(db.Integer, default=0)
    low_reports = db.Column(db.Integer, default=0)
    sif_percentage = db.Column(db.Float, default=0.0)
    precursor_density = db.Column(db.Float, default=0.0)
    risk_score = db.Column(db.Float, default=0.0)
    reports_last_7_days = db.Column(db.Integer, default=0)
    reports_last_30_days = db.Column(db.Integer, default=0)
    primary_rule = db.Column(db.String(50))
    secondary_rules = db.Column(db.String(255))
    highest_risk_activity = db.Column(db.String(100))
    last_report_date = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'site_name': self.site_name,
            'location': self.location,
            'total_reports': self.total_reports,
            'critical_reports': self.critical_reports,
            'medium_reports': self.medium_reports,
            'low_reports': self.low_reports,
            'sif_percentage': round(self.sif_percentage, 2),
            'precursor_density': round(self.precursor_density, 2),
            'risk_score': round(self.risk_score, 2),
            'primary_rule': self.primary_rule,
            'highest_risk_activity': self.highest_risk_activity
        }

class ActivityRiskSummary(db.Model):
    __tablename__ = 'activity_risk_summary'
    
    id = db.Column(db.Integer, primary_key=True)
    activity_type = db.Column(db.String(100), unique=True, nullable=False)
    total_reports = db.Column(db.Integer, default=0)
    critical_reports = db.Column(db.Integer, default=0)
    medium_reports = db.Column(db.Integer, default=0)
    low_reports = db.Column(db.Integer, default=0)
    sif_percentage = db.Column(db.Float, default=0.0)
    precursor_density = db.Column(db.Float, default=0.0)
    risk_score = db.Column(db.Float, default=0.0)
    primary_rule = db.Column(db.String(50))
    secondary_rules = db.Column(db.String(255))
    highest_risk_site = db.Column(db.String(100))
    last_report_date = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'activity_type': self.activity_type,
            'total_reports': self.total_reports,
            'critical_reports': self.critical_reports,
            'sif_percentage': round(self.sif_percentage, 2),
            'risk_score': round(self.risk_score, 2),
            'primary_rule': self.primary_rule,
            'highest_risk_site': self.highest_risk_site
        }
