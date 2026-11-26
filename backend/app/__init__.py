from pathlib import Path
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from .models import db
from config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config['CORS_ORIGINS'],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Initialize Database
    db.init_app(app)

    # Ensure required directories exist
    app.config['UPLOAD_FOLDER'].mkdir(parents=True, exist_ok=True)
    app.config['MODEL_FOLDER'].mkdir(parents=True, exist_ok=True)
    app.config['DB_PATH'].parent.mkdir(parents=True, exist_ok=True)

    # Register Blueprints
    from .routes.auth_routes import auth_bp
    from .routes.dataset_routes import dataset_bp
    from .routes.ml_routes import ml_bp
    from .routes.sender_routes import sender_bp
    from .routes.pgp_routes import pgp_bp
    from .routes.dashboard_routes import dashboard_bp
    from .routes.history_routes import history_bp
    from .routes.alert_routes import alert_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(dataset_bp, url_prefix='/api/dataset')
    app.register_blueprint(ml_bp, url_prefix='/api')
    app.register_blueprint(sender_bp, url_prefix='/api')
    app.register_blueprint(pgp_bp, url_prefix='/api/pgp')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(history_bp, url_prefix='/api/history')
    app.register_blueprint(alert_bp, url_prefix='/api/alerts')

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'HEALTHY',
            'application': 'FRESH AI Email Security Framework',
            'version': '1.0.0'
        }), 200

    # Serve static frontend build (Single-Service Deployment for Render & Cloud)
    dist_dir = Path(__file__).resolve().parent.parent.parent / 'frontend' / 'dist'

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        # Prevent intercepting unknown API routes
        if path.startswith('api/') or path == 'api':
            return jsonify({'error': 'API endpoint not found'}), 404
        # Serve existing static file (JS, CSS, images, etc.)
        if path != "" and (dist_dir / path).exists():
            return send_from_directory(dist_dir, path)
        # Serve index.html for client-side routing fallback
        if (dist_dir / 'index.html').exists():
            return send_from_directory(dist_dir, 'index.html')
        return jsonify({
            'status': 'OPERATIONAL',
            'application': 'FRESH AI Email Security Framework',
            'message': 'Backend REST API is operational. Frontend build not detected in frontend/dist.',
            'health_check': '/api/health'
        }), 200

    # Auto-initialize database tables and default admin on startup
    with app.app_context():
        db.create_all()
        from .services.auth_service import AuthService
        AuthService.ensure_default_admin()

        # Seed initial dataset and train initial model if none exists
        from .models import DatasetInfo, ModelMetric
        if not DatasetInfo.query.first():
            try:
                from .services.dataset_service import DatasetService
                from .services.ml_service import MLService
                print("[FRESH AI] Initializing demonstration dataset...")
                DatasetService.load_synthetic_sample()
                print("[FRESH AI] Training initial Machine Learning baseline model...")
                MLService.train_model()
                print("[FRESH AI] Initial training complete.")
            except Exception as e:
                print(f"[FRESH AI] Notice during initial training: {e}")

    return app
