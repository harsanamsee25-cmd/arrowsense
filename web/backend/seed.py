from models import db, User, Industry, SafeLimit, AdminComment
from auth import hash_password


INDUSTRIES = [
    {'name': 'Bhilai Steel Plant', 'type': 'Steel Industry',
     'location': 'Bhilai, Chhattisgarh', 'email': 'compliance@bhilaisteel.in',
     'lat': 21.2088, 'lng': 81.4285},
    {'name': 'NTPC Vindhyachal', 'type': 'Thermal Plant',
     'location': 'Singrauli, Madhya Pradesh', 'email': 'env@ntpcvindhya.in',
     'lat': 24.0986, 'lng': 82.6692},
    {'name': 'Rourkela Steel Plant', 'type': 'Steel Industry',
     'location': 'Rourkela, Odisha', 'email': 'env@rourkela.sail.in',
     'lat': 22.2604, 'lng': 84.8536},
    {'name': 'Adani Mundra Thermal', 'type': 'Thermal Plant',
     'location': 'Mundra, Gujarat', 'email': 'pcb@adanimundra.com',
     'lat': 22.7992, 'lng': 69.7068},
    {'name': 'Tata Steel Jamshedpur', 'type': 'Steel Industry',
     'location': 'Jamshedpur, Jharkhand', 'email': 'env@tatasteel.com',
     'lat': 22.8046, 'lng': 86.2029},
    {'name': 'NTPC Ramagundam', 'type': 'Thermal Plant',
     'location': 'Ramagundam, Telangana', 'email': 'env@ntpcramagundam.in',
     'lat': 18.7569, 'lng': 79.4775},
]

SAFE_LIMITS = [
    {'type': 'Steel Industry', 'pm25': 60, 'pm10': 100, 'no2': 80,  'so2': 80,  'co2': 1000},
    {'type': 'Thermal Plant',  'pm25': 50, 'pm10': 90,  'no2': 70,  'so2': 70,  'co2': 900},
]


def seed(app):
    with app.app_context():
        db.create_all()

        # Admin user
        if not User.query.filter_by(username='admin').first():
            db.session.add(User(
                username='admin',
                password_hash=hash_password('admin123'),
                role='admin',
            ))
            print('[SEED] Created admin user (admin / admin123)')

        # Safe limits
        for sl in SAFE_LIMITS:
            if not SafeLimit.query.filter_by(industry_type=sl['type']).first():
                db.session.add(SafeLimit(
                    industry_type=sl['type'],
                    pm25=sl['pm25'], pm10=sl['pm10'],
                    no2=sl['no2'],  so2=sl['so2'],  co2=sl['co2'],
                ))

        # Industries
        for ind in INDUSTRIES:
            if not Industry.query.filter_by(name=ind['name']).first():
                db.session.add(Industry(
                    name=ind['name'],
                    industry_type=ind['type'],
                    location=ind['location'],
                    contact_email=ind['email'],
                    lat=ind['lat'],
                    lng=ind['lng'],
                ))

        db.session.commit()
        print('[SEED] Database seeded successfully.')
