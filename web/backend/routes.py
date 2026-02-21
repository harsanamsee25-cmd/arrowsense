from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import create_access_token, get_jwt_identity
from models import db, User, Industry, SensorReading, SafeLimit, AdminComment
from auth import check_password, admin_required
from email_service import send_notice_email, generate_pdf_bytes
import io
from datetime import datetime

api = Blueprint('api', __name__)


# ── Auth ────────────────────────────────────────────────────────────────────
@api.route('/login', methods=['POST'])
def login():
    data = request.json or {}
    user = User.query.filter_by(username=data.get('username')).first()
    if not user or not check_password(data.get('password', ''), user.password_hash):
        return jsonify({'error': 'Invalid credentials'}), 401
    token = create_access_token(identity=user.username)
    return jsonify({'token': token, 'username': user.username, 'role': user.role})


# ── Industries ───────────────────────────────────────────────────────────────
@api.route('/industries', methods=['GET'])
def get_industries():
    industries = Industry.query.all()
    result = []
    for ind in industries:
        latest = (SensorReading.query
                  .filter_by(industry_id=ind.id)
                  .order_by(SensorReading.timestamp.desc())
                  .first())
        limits = SafeLimit.query.filter_by(industry_type=ind.industry_type).first()

        compliance_score = _calc_compliance(latest, limits) if latest and limits else None
        violations_count = SensorReading.query.filter_by(industry_id=ind.id, is_violation=True).count()

        result.append({
            'id': ind.id,
            'name': ind.name,
            'industry_type': ind.industry_type,
            'location': ind.location,
            'contact_email': ind.contact_email,
            'lat': ind.lat,
            'lng': ind.lng,
            'compliance_score': compliance_score,
            'violations_count': violations_count,
            'last_reading_at': latest.timestamp.isoformat() if latest else None,
        })
    return jsonify(result)


@api.route('/industries/<int:industry_id>', methods=['GET'])
def get_industry(industry_id):
    ind = Industry.query.get_or_404(industry_id)
    limits = SafeLimit.query.filter_by(industry_type=ind.industry_type).first()
    latest = (SensorReading.query
              .filter_by(industry_id=ind.id)
              .order_by(SensorReading.timestamp.desc())
              .first())
    return jsonify({
        'id': ind.id,
        'name': ind.name,
        'industry_type': ind.industry_type,
        'location': ind.location,
        'contact_email': ind.contact_email,
        'limits': _limits_dict(limits) if limits else None,
        'latest': _reading_dict(latest) if latest else None,
    })


# ── Live reading ─────────────────────────────────────────────────────────────
@api.route('/live/<int:industry_id>', methods=['GET'])
def get_live(industry_id):
    latest = (SensorReading.query
              .filter_by(industry_id=industry_id)
              .order_by(SensorReading.timestamp.desc())
              .first())
    if not latest:
        return jsonify({'error': 'No readings yet'}), 404
    ind = Industry.query.get(industry_id)
    limits = SafeLimit.query.filter_by(industry_type=ind.industry_type).first()
    data = _reading_dict(latest)
    data['limits'] = _limits_dict(limits) if limits else None
    return jsonify(data)


# ── History ──────────────────────────────────────────────────────────────────
@api.route('/history/<int:industry_id>', methods=['GET'])
def get_history(industry_id):
    limit = request.args.get('limit', 50, type=int)
    readings = (SensorReading.query
                .filter_by(industry_id=industry_id)
                .order_by(SensorReading.timestamp.desc())
                .limit(limit).all())
    readings.reverse()
    return jsonify([_reading_dict(r) for r in readings])


# ── Safe Limits ──────────────────────────────────────────────────────────────
@api.route('/safe-limits/<string:industry_type>', methods=['GET'])
def get_safe_limits(industry_type):
    limits = SafeLimit.query.filter_by(industry_type=industry_type).first()
    if not limits:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(_limits_dict(limits))


# ── Violations ───────────────────────────────────────────────────────────────
@api.route('/violations', methods=['GET'])
@admin_required
def get_violations():
    readings = (SensorReading.query
                .filter_by(is_violation=True)
                .order_by(SensorReading.timestamp.desc())
                .limit(100).all())
    result = []
    for r in readings:
        ind = Industry.query.get(r.industry_id)
        limits = SafeLimit.query.filter_by(industry_type=ind.industry_type).first()
        d = _reading_dict(r)
        d['industry_name'] = ind.name
        d['industry_type'] = ind.industry_type
        d['limits'] = _limits_dict(limits) if limits else None
        result.append(d)
    return jsonify(result)


# ── Admin Comment ─────────────────────────────────────────────────────────────
@api.route('/comment', methods=['POST'])
@admin_required
def add_comment():
    data = request.json or {}
    comment = AdminComment(
        industry_id=data['industry_id'],
        reading_id=data.get('reading_id'),
        comment=data['comment'],
        action=data.get('action', 'Notice Issued'),
        officer=get_jwt_identity(),
    )
    db.session.add(comment)
    db.session.commit()
    return jsonify({'success': True, 'id': comment.id})


@api.route('/comments/<int:industry_id>', methods=['GET'])
@admin_required
def get_comments(industry_id):
    comments = (AdminComment.query
                .filter_by(industry_id=industry_id)
                .order_by(AdminComment.created_at.desc())
                .all())
    return jsonify([{
        'id': c.id,
        'comment': c.comment,
        'action': c.action,
        'officer': c.officer,
        'reading_id': c.reading_id,
        'created_at': c.created_at.isoformat(),
    } for c in comments])


# ── Send Notice ───────────────────────────────────────────────────────────────
@api.route('/send-notice', methods=['POST'])
@admin_required
def send_notice():
    data = request.json or {}
    ind = Industry.query.get_or_404(data.get('industry_id'))
    limits = SafeLimit.query.filter_by(industry_type=ind.industry_type).first()
    latest = (SensorReading.query
              .filter_by(industry_id=ind.id)
              .order_by(SensorReading.timestamp.desc())
              .first())

    violations = []
    if latest and limits:
        fields = [('PM2.5', latest.pm25, limits.pm25),
                  ('PM10', latest.pm10, limits.pm10),
                  ('NO2', latest.no2, limits.no2),
                  ('SO2', latest.so2, limits.so2),
                  ('CO2', latest.co2, limits.co2)]
        for name, val, lim in fields:
            if val and val > lim:
                violations.append({'pollutant': name, 'value': val, 'limit': lim})

    email_data = {
        'industry_name': ind.name,
        'industry_type': ind.industry_type,
        'location': ind.location or 'N/A',
        'violations': violations,
        'action': data.get('action', 'Notice Issued'),
        'comment': data.get('comment', ''),
    }

    to_email = data.get('email') or ind.contact_email
    ok, mode = send_notice_email(to_email, email_data)
    return jsonify({'success': ok, 'email_sent_to': to_email, 'mode': mode})



# ── PDF Download ──────────────────────────────────────────────────────────────
@api.route('/pdf/<int:industry_id>', methods=['GET'])
@admin_required
def download_pdf(industry_id):
    ind = Industry.query.get_or_404(industry_id)
    limits = SafeLimit.query.filter_by(industry_type=ind.industry_type).first()
    latest = (SensorReading.query
              .filter_by(industry_id=ind.id)
              .order_by(SensorReading.timestamp.desc())
              .first())

    violations = []
    if latest and limits:
        fields = [('PM2.5', latest.pm25, limits.pm25),
                  ('PM10', latest.pm10, limits.pm10),
                  ('NO2', latest.no2, limits.no2),
                  ('SO2', latest.so2, limits.so2),
                  ('CO2', latest.co2, limits.co2)]
        for name, val, lim in fields:
            if val and val > lim:
                violations.append({'pollutant': name, 'value': val, 'limit': lim})

    pdf = generate_pdf_bytes({
        'industry_name': ind.name,
        'industry_type': ind.industry_type,
        'location': ind.location,
        'violations': violations,
        'action': 'Notice Issued',
        'comment': '',
    })
    return send_file(io.BytesIO(pdf), mimetype='application/pdf',
                     download_name='violation_notice.pdf', as_attachment=True)


# ── Helpers ───────────────────────────────────────────────────────────────────
def _reading_dict(r):
    return {
        'id': r.id,
        'industry_id': r.industry_id,
        'pm25': r.pm25, 'pm10': r.pm10,
        'no2': r.no2, 'so2': r.so2, 'co2': r.co2,
        'temperature': r.temperature,
        'humidity': r.humidity,
        'gps_lat': r.gps_lat, 'gps_lng': r.gps_lng,
        'is_violation': r.is_violation,
        'timestamp': r.timestamp.isoformat(),
    }


def _limits_dict(l):
    return {
        'industry_type': l.industry_type,
        'pm25': l.pm25, 'pm10': l.pm10,
        'no2': l.no2, 'so2': l.so2, 'co2': l.co2,
    }


def _calc_compliance(reading, limits):
    """Returns 0-100 score where 100 = fully compliant."""
    if not reading or not limits:
        return None
    ratios = []
    pairs = [(reading.pm25, limits.pm25), (reading.pm10, limits.pm10),
             (reading.no2, limits.no2), (reading.so2, limits.so2),
             (reading.co2, limits.co2)]
    for val, lim in pairs:
        if val and lim:
            ratios.append(min(val / lim, 2.0))
    if not ratios:
        return None
    avg = sum(ratios) / len(ratios)
    score = max(0, round((2.0 - avg) / 2.0 * 100, 1))
    return score
