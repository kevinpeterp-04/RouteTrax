from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
from datetime import datetime
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore, auth, db
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from werkzeug.security import generate_password_hash, check_password_hash
from wtforms.validators import DataRequired, Length, Email, EqualTo

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
    return render_template('home.html', username="User1")

@app.route('/notifadmin')
def notifadmin():
    return render_template('notifadmin.html')

@app.route('/map')
def map():
    return render_template('mapcopy copy.html')

@app.route('/bus-location')
def bus_location():
    try:
        bus_number = "20"  # You can make this dynamic
        ref = realtime_db.child(f'buses/{bus_number}/location')  # Corrected Realtime Database query
        data = ref.get()

        if data and 'latitude' in data and 'longitude' in data:
            return jsonify({'latitude': data['latitude'], 'longitude': data['longitude']})
        else:
            return jsonify({'error': 'Bus location not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/lost')
def lost():
    return render_template('lost.html')

@app.route('/admincomplaint')
def admincomplaint():
    return render_template('admincomplaint.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

if __name__ == '__main__':
    app.run(debug=True)
