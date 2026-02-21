import threading
import time
import random
from datetime import datetime

# Will be injected by app.py
socketio = None
app = None
db = None
Industry = None
SensorReading = None
SafeLimit = None

DRONE_STATES = ['traveling', 'scanning', 'uploading']

current_industry_index = 0
current_drone_state = 'traveling'
_lock = threading.Lock()


def _base_reading(limits):
    """Generate a reading with occasional violations."""
    factor = random.choices(
        [random.uniform(0.4, 0.78),   # safe
         random.uniform(0.80, 0.99),  # warning
         random.uniform(1.01, 1.45)], # violation
        weights=[55, 25, 20]
    )[0]
    return {
        'pm25':  round(limits.pm25 * factor * random.uniform(0.88, 1.12), 2),
        'pm10':  round(limits.pm10 * factor * random.uniform(0.88, 1.12), 2),
        'no2':   round(limits.no2  * factor * random.uniform(0.88, 1.12), 2),
        'so2':   round(limits.so2  * factor * random.uniform(0.88, 1.12), 2),
        'co2':   round(limits.co2  * factor * random.uniform(0.88, 1.12), 2),
        'temperature': round(random.uniform(25, 45), 1),
        'humidity':    round(random.uniform(30, 80), 1),
    }


def _is_violation(reading, limits):
    return (
        reading['pm25'] > limits.pm25 or
        reading['pm10'] > limits.pm10 or
        reading['no2']  > limits.no2  or
        reading['so2']  > limits.so2  or
        reading['co2']  > limits.co2
    )


def simulation_loop():
    global current_industry_index, current_drone_state

    with app.app_context():
        time.sleep(3)  # Wait for DB to be fully initialised

        cycle_count = 0
        while True:
            industries = Industry.query.all()
            if not industries:
                time.sleep(5)
                continue

            with _lock:
                current_industry_index = current_industry_index % len(industries)
                industry = industries[current_industry_index]

            limits = SafeLimit.query.filter_by(
                industry_type=industry.industry_type
            ).first()

            if not limits:
                with _lock:
                    current_industry_index += 1
                time.sleep(2)
                continue

            # Traveling state
            with _lock:
                current_drone_state = 'traveling'
            socketio.emit('drone_state', {
                'state': 'traveling',
                'industry_id': industry.id,
                'industry_name': industry.name
            })
            time.sleep(5)

            # Scanning state – emit readings every 5 seconds for ~20 seconds
            with _lock:
                current_drone_state = 'scanning'

            scan_readings = []
            for _ in range(4):
                reading_data = _base_reading(limits)
                violation = _is_violation(reading_data, limits)

                record = SensorReading(
                    industry_id=industry.id,
                    gps_lat=industry.lat + random.uniform(-0.005, 0.005),
                    gps_lng=industry.lng + random.uniform(-0.005, 0.005),
                    is_violation=violation,
                    **reading_data
                )
                db.session.add(record)
                db.session.commit()
                db.session.refresh(record)

                payload = {
                    'reading_id': record.id,
                    'industry_id': industry.id,
                    'industry_name': industry.name,
                    'industry_type': industry.industry_type,
                    'state': 'scanning',
                    'timestamp': record.timestamp.isoformat(),
                    'is_violation': violation,
                    'limits': {
                        'pm25': limits.pm25, 'pm10': limits.pm10,
                        'no2': limits.no2, 'so2': limits.so2, 'co2': limits.co2
                    },
                    **reading_data
                }
                socketio.emit('drone_update', payload)
                scan_readings.append(payload)
                time.sleep(5)

            # Uploading state
            with _lock:
                current_drone_state = 'uploading'
            socketio.emit('drone_state', {
                'state': 'uploading',
                'industry_id': industry.id,
                'industry_name': industry.name
            })
            time.sleep(3)

            # Move to next industry
            with _lock:
                current_industry_index = (current_industry_index + 1) % len(industries)

            cycle_count += 1


def start_simulation(flask_app, flask_socketio, flask_db, industry_model,
                     sensor_model, safelimit_model):
    global socketio, app, db, Industry, SensorReading, SafeLimit
    socketio = flask_socketio
    app = flask_app
    db = flask_db
    Industry = industry_model
    SensorReading = sensor_model
    SafeLimit = safelimit_model

    t = threading.Thread(target=simulation_loop, daemon=True)
    t.start()
    print("[SIMULATION] Drone simulation started.")
