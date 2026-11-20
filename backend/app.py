import logging
from datetime import datetime
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models import db
from init import init_db
from routes import auth_bp, reports_bp, dashboard_bp, stats_bp
from services.classifier import model, local_classifier, device

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app():
    """Application factory for SIH 2026 AI Safety Platform"""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    CORS(app)
    db.init_app(app)

    # Register API blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(stats_bp)

    # Global Health Check Endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'model_loaded': model is not None or local_classifier is not None,
            'model_type': 't5' if model is not None else 'voting_ensemble',
            'device': str(device)
        }), 200

    # Error Handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404

    @app.errorhandler(500)
    def server_error(error):
        return jsonify({'error': 'Internal server error'}), 500

    return app

app = create_app()

if __name__ == '__main__':
    # Initialize SQLite database tables, run column migrations, and seed demo accounts
    init_db(app)

    # Run application
    app.run(
        debug=True,
        host='0.0.0.0',
        port=Config.PORT
    )
