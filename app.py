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




from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
from werkzeug.security import generate_password_hash, check_password_hash
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Length, Email, EqualTo

app = Flask(__name__)
app.secret_key = "your_secret_key"

# Initialize Firebase
cred = credentials.Certificate("firebase_key.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

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

# Home Route
@app.route('/')
def index():
    return render_template('index.html')

# Signup Route
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    form = SignupForm()
    if request.method == 'POST' and form.validate_on_submit():
        # Check if email already exists
        user_doc = db.collection('users').document(form.email.data).get()
        if user_doc.exists:
            flash('Email already registered. Please log in.', 'error')
            return redirect(url_for('login'))

        # Store user data
        user_data = {
            'first_name': form.first_name.data,
            'last_name': form.last_name.data,
            'department': form.department.data,
            'semester_division': form.semester_division.data,
            'phone': form.phone.data,
            'email': form.email.data,
            'password': generate_password_hash(form.password.data)  # Secure password
        }
        
        try:
            db.collection('users').document(user_data['email']).set(user_data)
            flash('Account created successfully! Please log in.', 'success')
            return redirect(url_for('login'))
        except Exception as e:
            flash(f'Error creating account: {e}', 'error')
            return redirect(url_for('signup'))

    return render_template('signupnew.html', form=form)

# Login Route
@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if request.method == 'POST' and form.validate_on_submit():
        email = form.email.data
        password = form.password.data

        user_doc = db.collection('users').document(email).get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            if check_password_hash(user_data['password'], password):
                session['user'] = {'email': email, 'first_name': user_data['first_name']}
                flash('Login successful!', 'success')
                return redirect(url_for('home'))
        flash('Invalid credentials. Try again.', 'error')
    
    return render_template('login2.html', form=form)

# Home Route
@app.route('/home')
def home():
    if 'user' not in session:
        flash('You need to log in first!', 'error')
        return redirect(url_for('login'))
    return render_template('home.html')

# Admin Dashboard (Access Control)
@app.route('/admin')
def admin():
    if 'user' not in session or session.get('user').get('role') != 'admin':
        flash('Unauthorized access.', 'error')
        return redirect(url_for('home'))
    return render_template('admin.html')

# Admin Notification Panel
@app.route('/admin/notifications', methods=['GET', 'POST'])
def admin_notifications_panel():
    if request.method == 'POST':
        notification = {
            'message': request.form['message'],
            'date': datetime.utcnow().isoformat()
        }
        try:
            db.collection('admin_notifications').add(notification)
            flash('Notification added successfully!', 'success')
        except Exception as e:
            flash(f'Error adding notification: {e}', 'error')
        return redirect(url_for('admin_notifications_panel'))

    notifications = [doc.to_dict() for doc in db.collection('admin_notifications').stream()]
    return render_template('notifadmin.html', notifications=notifications)

# Notifications for Users
@app.route('/notifications')
def notifications_panel():
    notifications = [doc.to_dict() for doc in db.collection('admin_notifications').stream()]
    return render_template('notif.html', notifications=notifications)

# Add New Notification
@app.route('/notifications/add', methods=['POST'])
def add_notification():
    data = request.get_json()
    notification = {
        'title': data['title'],
        'message': data['message'],
        'date': datetime.utcnow().isoformat(),
        'favorite': False,
        'reminder': None
    }
    try:
        db.collection('notifications').add(notification)
        return jsonify({'status': 'success', 'notification': notification})
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error: {e}'}), 500

# Update Notification (Favorite or Reminder)
@app.route('/notifications/update', methods=['POST'])
def update_notification():
    data = request.get_json()
    docs = db.collection('notifications').stream()
    
    for doc in docs:
        notification = doc.to_dict()
        if notification['title'] == data['title']:
            updated_data = {}
            if 'favorite' in data:
                updated_data['favorite'] = data['favorite']
            if 'reminder' in data:
                updated_data['reminder'] = data['reminder']
            try:
                db.collection('notifications').document(doc.id).update(updated_data)
                return jsonify({'status': 'success', 'notification': updated_data})
            except Exception as e:
                return jsonify({'status': 'error', 'message': f'Error updating notification: {e}'}), 500
    
    return jsonify({'status': 'error', 'message': 'Notification not found'}), 404

# Student Profile
@app.route('/profile', methods=['GET', 'POST'])
def profile():
    if 'user' not in session:
        flash('You need to log in first!', 'error')
        return redirect(url_for('login'))

    email = session['user']['email']
    user_doc = db.collection('users').document(email).get()

    if request.method == 'POST':
        updated_data = {
            'fullName': request.form['fullName'],
            'studentId': request.form['studentId'],
            'course': request.form['course'],
            'year': request.form['year'],
            'phone': request.form['phone'],
            'email': request.form['email'],
            'address': request.form['address'],
            'busRoute': request.form['busRoute'],
            'pickupPoint': request.form['pickupPoint']
        }
        try:
            db.collection('users').document(email).update(updated_data)
            session['user'].update(updated_data)
            flash('Profile updated successfully!', 'success')
        except Exception as e:
            flash(f'Error updating profile: {e}', 'error')

    user_data = user_doc.to_dict()
    return render_template('profile.html', user=user_data)

# Admin Complaints Route
@app.route('/admin/complaints')
def admin_complaints():
    if 'user' not in session or session.get('user').get('role') != 'admin':
        flash('Unauthorized access.', 'error')
        return redirect(url_for('home'))
    return render_template('admincomplaint.html')

# Logout Route
@app.route('/logout')
def logout():
    session.pop('user', None)
    flash('Logged out successfully!', 'success')
    return redirect(url_for('login'))

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
