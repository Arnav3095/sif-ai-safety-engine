from datetime import datetime
from . import db

class LifeSavingRule(db.Model):
    __tablename__ = 'life_saving_rules'
    
    id = db.Column(db.Integer, primary_key=True)
    rule_code = db.Column(db.String(50), unique=True, nullable=False)
    rule_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    keywords = db.Column(db.String(500))
    precursor_indicators = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'rule_code': self.rule_code,
            'rule_name': self.rule_name,
            'description': self.description,
            'keywords': self.keywords.split(',') if self.keywords else []
        }
