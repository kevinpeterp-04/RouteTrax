from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
from datetime import datetime
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore, auth
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Length, Email, EqualTo

# Load the environment variables from db.env file
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

# Initialize Firebase
cred = credentials.Certificate(firebase_config)
firebase_admin.initialize_app(cred)
db = firestore.client()

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
    print("Signup route accessed")  # Debug print
    form = SignupForm()
    
    if request.method == 'POST':
        print("Received POST request")  # Debug print
        print("Form Data:", request.form.to_dict())  # Print all form data
    
    if form.validate_on_submit():
        try:
            print("Form validation successful")  # Debug print
            user = auth.create_user(
                email=form.email.data,
                password=form.password.data,
                display_name=f"{form.first_name.data} {form.last_name.data}"
            )
            user_data = {
                'first_name': form.first_name.data,
                'last_name': form.last_name.data,
                'department': form.department.data,
                'semester_division': form.semester_division.data,
                'phone': form.phone.data,
                'email': form.email.data,
                'uid': user.uid
            }
            db.collection('users').document(user.uid).set(user_data)
            flash('Account created successfull y! Please log in.', 'success')
            return redirect(url_for('login'))
        except Exception as e:
            print(f"Error creating account: {e}")  # Debug print
            flash(f'Error creating account: {e}', 'error')
    else:
        print("Validation errors:", form.errors)  # Print validation errors
    
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
    if 'user' not in session:
        flash('You need to log in first!', 'error')
        return redirect(url_for('login'))
    return render_template('home.html')

@app.route('/logout')
def logout():
    session.pop('user', None)
    flash('Logged out successfully!', 'success')
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)

# from flask import Flask, render_template, request, redirect, url_for, session, jsonify
# from datetime import datetime
# import firebase_admin
# from firebase_admin import credentials, firestore
# from werkzeug.security import generate_password_hash, check_password_hash

# app = Flask(__name__)
# app.secret_key = "your_secret_key"

# # Initialize Firebase
# cred = credentials.Certificate("firebase_key.json")
# firebase_admin.initialize_app(cred)
# db = firestore.client()

# # Home Route
# @app.route('/')
# def index():
#     return render_template('index.html')

# # Signup Route
# @app.route('/signup', methods=['GET', 'POST'])
# def signup():
#     if request.method == 'POST':
#         user_data = {
#             'first_name': request.form['first_name'],
#             'last_name': request.form['last_name'],
#             'department': request.form['department'],
#             'semester_division': request.form['semester_division'],
#             'phone': request.form['phone'],
#             'email': request.form['email'],
#             'password': generate_password_hash(request.form['password'])  # Secure password
#         }
#         db.collection('users').document(user_data['email']).set(user_data)
#         return redirect(url_for('login'))
    
#     return render_template('signupnew.html')

# # Login Route
# @app.route('/login', methods=['GET', 'POST'])
# def login():
#     if request.method == 'POST':
#         email = request.form['email']
#         password = request.form['password']

#         user_doc = db.collection('users').document(email).get()
#         if user_doc.exists:
#             user_data = user_doc.to_dict()
#             if check_password_hash(user_data['password'], password):
#                 session['user'] = {'email': email, 'first_name': user_data['first_name']}
#                 return redirect(url_for('home'))
#         return "Invalid credentials. Try again."
    
#     return render_template('login2.html')

# # Home Route
# @app.route('/home')
# def home():
#     if 'user' not in session:
#         return redirect(url_for('login'))
#     return render_template('home.html')

# # Admin Dashboard
# @app.route('/admin')
# def admin():
#     return render_template('admin.html')

# # Admin Notification Panel
# @app.route('/admin/notifications', methods=['GET', 'POST'])
# def admin_notifications_panel():
#     if request.method == 'POST':
#         notification = {
#             'message': request.form['message'],
#             'date': datetime.utcnow().isoformat()
#         }
#         db.collection('admin_notifications').add(notification)
#         return jsonify({'status': 'success', 'notification': notification})

#     notifications = [doc.to_dict() for doc in db.collection('admin_notifications').stream()]
#     return render_template('notifadmin.html', notifications=notifications)

# # Notifications for Users
# @app.route('/notifications')
# def notifications_panel():
#     notifications = [doc.to_dict() for doc in db.collection('admin_notifications').stream()]
#     return render_template('notif.html', notifications=notifications)

# # Add New Notification
# @app.route('/notifications/add', methods=['POST'])
# def add_notification():
#     data = request.get_json()
#     notification = {
#         'title': data['title'],
#         'message': data['message'],
#         'date': datetime.utcnow().isoformat(),
#         'favorite': False,
#         'reminder': None
#     }
#     db.collection('notifications').add(notification)
#     return jsonify({'status': 'success', 'notification': notification})

# # Update Notification (Favorite or Reminder)
# @app.route('/notifications/update', methods=['POST'])
# def update_notification():
#     data = request.get_json()
#     docs = db.collection('notifications').stream()
    
#     for doc in docs:
#         notification = doc.to_dict()
#         if notification['title'] == data['title']:
#             updated_data = {}
#             if 'favorite' in data:
#                 updated_data['favorite'] = data['favorite']
#             if 'reminder' in data:
#                 updated_data['reminder'] = data['reminder']
#             db.collection('notifications').document(doc.id).update(updated_data)
#             return jsonify({'status': 'success', 'notification': updated_data})
    
#     return jsonify({'status': 'error', 'message': 'Notification not found'}), 404

# # Student Profile
# @app.route('/profile', methods=['GET', 'POST'])
# def profile():
#     if 'user' not in session:
#         return redirect(url_for('login'))

#     email = session['user']['email']
#     user_doc = db.collection('users').document(email).get()

#     if request.method == 'POST':
#         updated_data = {
#             'fullName': request.form['fullName'],
#             'studentId': request.form['studentId'],
#             'course': request.form['course'],
#             'year': request.form['year'],
#             'phone': request.form['phone'],
#             'email': request.form['email'],
#             'address': request.form['address'],
#             'busRoute': request.form['busRoute'],
#             'pickupPoint': request.form['pickupPoint']
#         }
#         db.collection('users').document(email).update(updated_data)
#         session['user'].update(updated_data)

#     user_data = user_doc.to_dict()
#     return render_template('profile.html', user=user_data)

# # Admin Complaints Route
# @app.route('/admin/complaints')
# def admin_complaints():
#     return render_template('admincomplaint.html')

# # Logout Route
# @app.route('/logout')
# def logout():
#     session.pop('user', None)
#     return redirect(url_for('login'))

# # Run the app
# if __name__ == '__main__':
#     app.run(debug=True)








# FIREBASE_PROJECT_ID=routetrax-5e817
# FIREBASE_PRIVATE_KEY_ID=f791657b453056108d48521df87e4b0e7f63a9ea
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCZQvoPPe/eJrtk\n41aOeASHUUbzsJG1MhCaJtcMl5lRRVTShJvtimHcSqT1nuO1Imlip5zHEuzc6yFn\nnIqoJEgX4KRx4L54bYAqyQLf7eGofWhcN48uEG0DN+0ABxVBOvhLOMet3QRVnHkN\ngMgtK7wN/oe7oZdMliFydPegoOows7PrJ9tJcdW1DPJH+09AFfhGjOx5BpMOTGEL\nffMAqHKvHscn1ZScNy3XeHUxTCc1f+qnu9zeNYlSti4Y7ScELZ/ocpLz+c1lF0E7\n8KvqbKbG2is1gIM1dWiq8IJmk+eBvmLHcPEBIiy3dsBb79jrXwwiJX5mxd8g/Mvz\nLfVG+EXtAgMBAAECggEAA9Is6FOKZv7kYKX0qugjRW65ZrVx/d28lrnzAMQdz9jQ\nk3q4ECfJUU6bcWk6SEeOROX6DWeIzWg0+hTnyxHef0PmmFU6rRzJG31NS6EYur88\n/8GTLwTnUYjOfpfunSSie0Oe4imMDwiv5u4ymhezSvkGesnS+xc/cw+nUH36i2ds\nVWpQjZ6s+b7yg2UJLxab5QjnuW+lrqa14SC+QtS4bDKJLqEXAG+NCBmcimOpTUUv\n9VY5dZX4pvaKDIyqrndrOh57wm0Rdfk1EGKlKJ6FfmetMwUi9Hs5Mr+EnsA1B+V9\nwbwYBfj+hHM3fGOqmQYjN+p+z487xmJGlqDtt/dU6QKBgQDLDEEzlpYB1ovJSq4w\naWZzPZwbm1ouT+RLOsZ2xlpIxjqB+h1ElqABfhBin0LI3WZXBva+gvavfkTqgdQG\naSdWIBAC5TIaVvTZkaGMYByMvxYFzfejkR+PvFrPtp7tMdhGGPuAGaE9l8XOb4q9\niqOpl/d6nyIg2HFpmQsf0wcwRQKBgQDBOu0wM8T6C7fq+4SSihonv9edg2Gc9S6/\nwjsZiN6bnoB8GEBkxxtMNa/9/kHE3/6KNd+XDg2NG1KXnxTBoytP+oqc+MfZBGTb\nYlWrs0GUANHMzEQBD7KWDDPLX9RsPZBif6lM6PaWm+nvEtKZ7m/n+CyEU36cOf3U\nTHM74pM9iQKBgEejETX0QQRw/2yLTp2B8kViTTtoOg7w3Oi12eN548ydM3M8HStf\nwSAFrB4/dj6L7llx+YgJiKMt936NQ5LncptuQHflCSJF36kLOmXeWvRFTq3Jlz88\nKlh56cgy9CtXVKiWk9UENeEXNRC6RcbNrSRem0/F6TKRaqII/uXBfF3JAoGATGMz\nKP8OO5suVeKggh2+QUCByG8Lw7TZik0KeAm3luWN/YDI1A4yKGqA7HP7JA043wJ1\nJY4UpVfLyszEs9gBY1i0O2HN/2jRRjkVjQ8MOaopRkDqEVFXVCH2x8tWeoPL9GRr\nVVAzS07PqAdU4i10Z8ugLZ+kSbZTNf4S//WOJ6ECgYAc4IHJMaW09+GvyS0+59FU\n1RRm3Ag53hXSa0gtspZvnHsyOr92KU9NnPzxi/oE23LtqmIsWBrFw1o6UMZ6CzgA\n4eiY0Q6OiBNUcm4Xxo/2k+QptxhaE4YeVGJLo7Q+d8kTqbGoMLRDQXA10d2tZRvj\nyVeVIN8z7Yg+074qj6Z5CA==\n-----END PRIVATE KEY-----"
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@routetrax-5e817.iam.gserviceaccount.com
# FIREBASE_CLIENT_ID=117552770394729261708
# FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
# FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
# FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
# FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40routetrax-5e817.iam.gserviceaccount.com
