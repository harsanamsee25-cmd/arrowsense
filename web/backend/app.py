import os

from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

load_dotenv()

from models import db
from routes import api
from seed import seed
from simulation import start_simulation
from models import Industry, SensorReading, SafeLimit


def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///aerosense.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # For demo: no expiry

    db.init_app(app)
    JWTManager(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    app.register_blueprint(api, url_prefix='/api')

    return app


app = create_app()
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading', logger=False, engineio_logger=False)


@socketio.on('connect')
def on_connect():
    print(f'[SOCKET] Client connected')


@socketio.on('disconnect')
def on_disconnect():
    print(f'[SOCKET] Client disconnected')


if __name__ == '__main__':
    seed(app)
    start_simulation(app, socketio, db, Industry, SensorReading, SafeLimit)
    print("[SERVER] AeroSense backend running on http://localhost:5000")
    socketio.run(app, host='0.0.0.0', port=5000, debug=False)
