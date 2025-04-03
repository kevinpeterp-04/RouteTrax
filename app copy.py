from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
from datetime import datetime
import os
import logging
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore, auth, db
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from werkzeug.security import generate_password_hash, check_password_hash
from wtforms.validators import DataRequired, Length, Email, EqualTo
import geopy.distance
from logging.handlers import RotatingFileHandler


# Load environment variables
load_dotenv(dotenv_path='db.env')

# Firebase Configuration from .env
firebase_config = {
    "type": "service_account",
    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace('\\n', '\n'),
    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
    "client_id": os.getenv("FIREBASE_CLIENT_ID"),
    "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
    "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
    "auth_provider_x509_cert_url": os.getenv("FIREBASE_AUTH_PROVIDER_X509_CERT_URL"),
    "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_X509_CERT_URL"),
}

# Initialize Firebase for Firestore and Realtime Database
cred = credentials.Certificate(firebase_config)
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://routetrax-5e817-default-rtdb.firebaseio.com/'  # Replace with your database URL
})


# Configure logging BEFORE any logger instances
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]',
    handlers=[
        RotatingFileHandler('app.log', maxBytes=10000, backupCount=3),
        logging.StreamHandler()
    ]
)

# Then create logger instance
logger = logging.getLogger(__name__)



# Firestore and Realtime Database references
firestore_db = firestore.client()  # Firestore
realtime_db = db.reference()  # Realtime Database

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "your_default_secret_key")

# CSRF protection and form validation
class SignupForm(FlaskForm):
    first_name = StringField('First Name', validators=[DataRequired()])
    last_name = StringField('Last Name', validators=[DataRequired()])
    department = StringField('Department', validators=[DataRequired()])
    semester_division = StringField('Semester/Division', validators=[DataRequired()])
    phone = StringField('Phone', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=8)])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password', message="Passwords must match")])
    submit = SubmitField('Sign Up')

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Login')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    form = SignupForm()
    if form.validate_on_submit():
        try:
            email = form.email.data
            password = form.password.data
            
            # Check if user already exists
            user_ref = firestore_db.collection('users').where("email", "==", email).stream()
            existing_user = next(user_ref, None)

            if existing_user:
                flash("Email already registered! Please log in.", 'error')
                return redirect(url_for('login'))

            hashed_password = generate_password_hash(password)
            user_data = {
                'first_name': form.first_name.data,
                'last_name': form.last_name.data,
                'department': form.department.data,
                'semester_division': form.semester_division.data,
                'phone': form.phone.data,
                'email': email,
                'password': hashed_password  # Store hashed password
            }
            
            # Save user to Firestore
            firestore_db.collection('users').document(email).set(user_data)
            print(f"✅ User {email} added successfully to Firestore!")  # Debugging
            
            flash('Account created successfully! Please log in.', 'success')
            return redirect(url_for('login'))

        except Exception as e:
            print(f"🔥 Error creating user: {e}")  # Debugging
            flash(f'Error creating account: {e}', 'error')

    return render_template('signupnew.html', form=form)

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        try:
            user = auth.get_user_by_email(form.email.data)
            session['user'] = {'email': form.email.data, 'uid': user.uid}
            flash('Login successful!', 'success')
            return redirect(url_for('home'))
        except Exception as e:
            flash('Invalid credentials. Try again.', 'error')
    return render_template('login2.html', form=form)

@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/lost')
def lost():
    return render_template('lost.html')

@app.route('/admincomplaint')
def admincomplaint():
    return render_template('admin.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')


@app.route('/notifadmin')
def notifadmin():
    return render_template('notifadmin.html')

@app.route('/map')
def map():
    return render_template('mapcode.html')

# Enhanced Bus Route Endpoints
@app.route('/add-bus-route', methods=['POST'])
def add_bus_route():
    try:
        data = request.json
        bus_number = data.get("busNo")
        route = data.get("route")
        
        if not bus_number or not route:
            return jsonify({'error': 'Bus number and route are required'}), 400
        
        if not isinstance(route, list) or len(route) < 2:
            return jsonify({'error': 'Route must be an array with at least 2 coordinates'}), 400

        route_data = {
            'busNo': bus_number,
            'route': route,
            'created_at': firestore.SERVER_TIMESTAMP,
            'route_name': data.get('routeName', 'Default Route'),
            'stops': data.get('stops', [])
        }

        firestore_db.collection('bus_routes').document(str(bus_number)).set(route_data)
        logger.info(f"Added route for bus {bus_number}")
        
        return jsonify({'message': 'Bus route added successfully', 'busNo': bus_number})

    except Exception as e:
        logger.error(f"Route addition error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/get-bus-route', methods=['GET'])
def get_bus_route():
    try:
        bus_number = request.args.get('bus')
        if not bus_number:
            return jsonify({'error': 'Bus number not provided'}), 400

        doc_ref = firestore_db.collection('bus_routes').document(str(bus_number)).get()
        if not doc_ref.exists:
            return jsonify({'error': 'Route not found'}), 404

        bus_data = doc_ref.to_dict()
        return jsonify({
            'route': bus_data.get('route', []),
            'stops': bus_data.get('stops', []),
            'route_name': bus_data.get('route_name', 'Unnamed Route'),
            'created_at': bus_data.get('created_at', 'Unknown')
        })
    except Exception as e:
        logger.error(f"Route fetch error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Enhanced Bus Location Endpoint with Timestamp
@app.route('/bus-location')
def bus_location():
    try:
        bus_number = request.args.get('bus', "20")  # Now accepts ?bus= parameter
        ref = realtime_db.child(f'buses/{bus_number}/location')
        data = ref.get()

        if data and 'latitude' in data and 'longitude' in data:
            # Include timestamp in response
            return jsonify({
                'latitude': data['latitude'],
                'longitude': data['longitude'],
                'timestamp': data.get('timestamp', datetime.utcnow().isoformat())
            })
        return jsonify({'error': 'Bus location not found'}), 404

    except Exception as e:
        logger.error(f"Location error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# New Endpoint for Speed Calculation
@app.route('/bus-speed')
def bus_speed():
    try:
        bus_number = request.args.get('bus', "20")
        ref = realtime_db.child(f'buses/{bus_number}/location')
        history = ref.order_by_key().limit_to_last(2).get()
        
        if not history or len(history) < 2:
            return jsonify({'speed': 0, 'message': 'Insufficient data points'})

        points = [(float(v['latitude']), float(v['longitude']), v['timestamp']) 
                for v in history.values() if 'latitude' in v and 'longitude' in v]

        if len(points) < 2:
            return jsonify({'speed': 0, 'message': 'Valid points missing'})

        # Calculate distance and time difference
        coords1 = (points[0][0], points[0][1])
        coords2 = (points[1][0], points[1][1])
        distance = geopy.distance.distance(coords1, coords2).km
        
        time_diff = (datetime.fromisoformat(points[1][2]) - 
                   datetime.fromisoformat(points[0][2])).total_seconds() / 3600
        
        speed = distance / time_diff if time_diff > 0 else 0
        return jsonify({'speed': round(speed, 2), 'unit': 'km/h'})

    except Exception as e:
        logger.error(f"Speed calculation error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Add these new routes to your existing Flask app

@app.route('/admin')
def admin_dashboard():
    # if not session.get('admin'):
    #     return redirect(url_for('login'))
    return render_template('admin_dashboard.html')

@app.route('/admin/lost-found')
def admin_lost_found():
    if not session.get('admin'):
        return redirect(url_for('login'))
    
    # Get all lost & found items
    items = []
    docs = firestore_db.collection('lost_found').stream()
    for doc in docs:
        items.append(doc.to_dict())
    
    return render_template('admin_lost_found.html', items=items)

@app.route('/admin/notices', methods=['GET', 'POST'])
def admin_notices():
    if not session.get('admin'):
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        notice_data = {
            'title': request.form['title'],
            'content': request.form['content'],
            'created_at': firestore.SERVER_TIMESTAMP,
            'is_active': True
        }
        firestore_db.collection('notices').add(notice_data)
        flash('Notice added successfully!', 'success')
    
    notices = []
    docs = firestore_db.collection('notices').order_by('created_at', direction=firestore.Query.DESCENDING).stream()
    for doc in docs:
        notices.append(doc.to_dict())
    
    return render_template('admin_notices.html', notices=notices)

@app.route('/admin/complaints')
def admin_complaints():
    if not session.get('admin'):
        return redirect(url_for('login'))
    
    complaints = []
    docs = firestore_db.collection('complaints').stream()
    for doc in docs:
        complaints.append(doc.to_dict())
    
    return render_template('admin_complaints.html', complaints=complaints)

# Add this to your initialization code
def initialize_firebase_tables():
    collections = ['lost_found', 'notices', 'complaints']
    for collection in collections:
        if not firestore_db.collection(collection).get():
            firestore_db.collection(collection).add({})  # Create empty collection
            print(f"Created Firestore collection: {collection}")

# Call this function after Firebase initialization
initialize_firebase_tables()

if __name__ == '__main__':
    app.run(debug=True)