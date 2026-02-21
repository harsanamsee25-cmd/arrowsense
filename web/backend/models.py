from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='admin')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Industry(db.Model):
    __tablename__ = 'industries'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    industry_type = db.Column(db.String(80), nullable=False)
    location = db.Column(db.String(200))
    contact_email = db.Column(db.String(120))
    lat = db.Column(db.Float, default=20.5937)
    lng = db.Column(db.Float, default=78.9629)
    readings = db.relationship('SensorReading', backref='industry', lazy=True)
    comments = db.relationship('AdminComment', backref='industry', lazy=True)


class SafeLimit(db.Model):
    __tablename__ = 'safe_limits'
    id = db.Column(db.Integer, primary_key=True)
    industry_type = db.Column(db.String(80), nullable=False)
    pm25 = db.Column(db.Float, nullable=False)
    pm10 = db.Column(db.Float, nullable=False)
    no2 = db.Column(db.Float, nullable=False)
    so2 = db.Column(db.Float, nullable=False)
    co2 = db.Column(db.Float, nullable=False)


class SensorReading(db.Model):
    __tablename__ = 'sensor_readings'
    id = db.Column(db.Integer, primary_key=True)
    industry_id = db.Column(db.Integer, db.ForeignKey('industries.id'), nullable=False)
    pm25 = db.Column(db.Float)
    pm10 = db.Column(db.Float)
    no2 = db.Column(db.Float)
    so2 = db.Column(db.Float)
    co2 = db.Column(db.Float)
    temperature = db.Column(db.Float)
    humidity = db.Column(db.Float)
    gps_lat = db.Column(db.Float)
    gps_lng = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    is_violation = db.Column(db.Boolean, default=False)


class AdminComment(db.Model):
    __tablename__ = 'admin_comments'
    id = db.Column(db.Integer, primary_key=True)
    industry_id = db.Column(db.Integer, db.ForeignKey('industries.id'), nullable=False)
    reading_id = db.Column(db.Integer, db.ForeignKey('sensor_readings.id'), nullable=True)
    comment = db.Column(db.Text, nullable=False)
    action = db.Column(db.String(80))   # Notice Issued, Fine Imposed, Closed
    officer = db.Column(db.String(120))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
