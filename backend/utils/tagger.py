from models import db, SiteRiskSummary, ActivityRiskSummary

def tag_life_saving_rules(text):
    """Tag relevant Life-Saving Rules based on keyword patterns"""
    if not text:
        return None, None
        
    text_lower = text.lower()
    
    rules = {
        'ES01': ['energy', 'isolation', 'lockout', 'tagout', 'pressure release', 'electrical'],
        'HW01': ['hot work', 'welding', 'cutting', 'torch', 'permit', 'fire watch'],
        'CS01': ['confined space', 'entry', 'rescue', 'ventilation', 'monitoring', 'safe entry'],
        'LOF01': ['line of fire', 'struck by', 'moving equipment', 'crane', 'lifting', 'mobile'],
        'WH01': ['height', 'fall', 'ladder', 'scaffold', 'harness', 'working at height'],
        'MVS01': ['moving equipment', 'vibration', 'machinery', 'guard', 'mobile'],
        'HPE01': ['high pressure', 'pressure', 'relief valve', 'rupture', 'leak'],
        'CT01': ['critical lift', 'heavy lift', 'crane', 'load calculation', 'rigging']
    }
    
    matched_rules = []
    for rule_code, keywords in rules.items():
        if any(keyword in text_lower for keyword in keywords):
            matched_rules.append(rule_code)
    
    primary_rule = matched_rules[0] if matched_rules else None
    secondary_rules = ','.join(matched_rules[1:]) if len(matched_rules) > 1 else None
    
    return primary_rule, secondary_rules

def extract_precursors(text):
    """Extract safety precursors from text"""
    if not text:
        return []
        
    text_lower = text.lower()
    precursors = []
    
    precursor_map = {
        'Equipment_Degradation': ['equipment', 'valve', 'pressure', 'fail', 'worn', 'corrosion', 'damage'],
        'Lack_Supervision': ['alone', 'no supervision', 'untrained', 'no ppe', 'without', 'unsupervised'],
        'Gas_Release': ['gas', 'leak', 'leaking', 'release', 'uncontrolled', 'volatile', 'vapor'],
        'Environmental_Factor': ['fire', 'ignition', 'heat', 'temperature', 'weather', 'wind'],
        'Procedural_Violation': ['failure', 'ignored', 'did not', 'not followed', 'skipped', 'bypass']
    }
    
    for precursor_type, keywords in precursor_map.items():
        if any(kw in text_lower for kw in keywords):
            precursors.append(precursor_type)
    
    return precursors

def update_risk_summaries(report):
    """Update site and activity risk summaries upon report submission or review"""
    # 1. Update Site Risk Summary
    site_summary = SiteRiskSummary.query.filter_by(site_name=report.site_name).first()
    
    if not site_summary:
        site_summary = SiteRiskSummary(site_name=report.site_name, location=report.location)
        db.session.add(site_summary)
    
    site_summary.total_reports = site_summary.total_reports or 0
    site_summary.critical_reports = site_summary.critical_reports or 0
    site_summary.medium_reports = site_summary.medium_reports or 0
    site_summary.low_reports = site_summary.low_reports or 0
    site_summary.total_reports += 1
    
    if report.sif_classification == 'CRITICAL':
        site_summary.critical_reports += 1
    elif report.sif_classification == 'MEDIUM':
        site_summary.medium_reports += 1
    else:
        site_summary.low_reports += 1
    
    site_summary.sif_percentage = (site_summary.critical_reports / site_summary.total_reports * 100) if site_summary.total_reports > 0 else 0
    site_summary.risk_score = (site_summary.critical_reports * 30 + site_summary.medium_reports * 15 + site_summary.low_reports * 5) / site_summary.total_reports if site_summary.total_reports > 0 else 0
    site_summary.last_report_date = report.date_submitted
    site_summary.primary_rule = report.life_saving_rule
    
    # 2. Update Activity Risk Summary
    activity_summary = ActivityRiskSummary.query.filter_by(activity_type=report.activity_type).first()
    
    if not activity_summary:
        activity_summary = ActivityRiskSummary(activity_type=report.activity_type)
        db.session.add(activity_summary)
    
    activity_summary.total_reports = activity_summary.total_reports or 0
    activity_summary.critical_reports = activity_summary.critical_reports or 0
    activity_summary.medium_reports = activity_summary.medium_reports or 0
    activity_summary.low_reports = activity_summary.low_reports or 0
    activity_summary.total_reports += 1
    
    if report.sif_classification == 'CRITICAL':
        activity_summary.critical_reports += 1
    elif report.sif_classification == 'MEDIUM':
        activity_summary.medium_reports += 1
    else:
        activity_summary.low_reports += 1
    
    activity_summary.sif_percentage = (activity_summary.critical_reports / activity_summary.total_reports * 100) if activity_summary.total_reports > 0 else 0
    activity_summary.risk_score = (activity_summary.critical_reports * 30 + activity_summary.medium_reports * 15 + activity_summary.low_reports * 5) / activity_summary.total_reports if activity_summary.total_reports > 0 else 0
    activity_summary.last_report_date = report.date_submitted
    activity_summary.primary_rule = report.life_saving_rule
    
    db.session.commit()
