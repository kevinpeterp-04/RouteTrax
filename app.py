<<<<<<< HEAD
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = "your_secret_key"

# Initialize Firebase
cred = credentials.Certificate("firebase_key.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Home Route
@app.route('/')
def index():
    return render_template('index.html')

# Signup Route
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        user_data = {
            'first_name': request.form['first_name'],
            'last_name': request.form['last_name'],
            'department': request.form['department'],
            'semester_division': request.form['semester_division'],
            'phone': request.form['phone'],
            'email': request.form['email'],
            'password': generate_password_hash(request.form['password'])  # Secure password
        }
        db.collection('users').document(user_data['email']).set(user_data)
        return redirect(url_for('login'))
    
    return render_template('signup.html')

# Login Route
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        user_doc = db.collection('users').document(email).get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            if check_password_hash(user_data['password'], password):
                session['user'] = {'email': email, 'first_name': user_data['first_name']}
                return redirect(url_for('home'))
        return "Invalid credentials. Try again."
    
    return render_template('login2.html')

# Home Route
@app.route('/home')
def home():
    if 'user' not in session:
        return redirect(url_for('login'))
    return render_template('home.html')

# Admin Dashboard
=======
from flask import Flask, render_template

app = Flask(__name__)

>>>>>>> 96d7133ba643c42339caf480a2e12f5316ac4df8
@app.route('/admin')
def admin():
    return render_template('admin.html')

<<<<<<< HEAD
# Admin Notification Panel
@app.route('/admin/notifications', methods=['GET', 'POST'])
def admin_notifications_panel():
    if request.method == 'POST':
        notification = {
            'message': request.form['message'],
            'date': datetime.utcnow().isoformat()
        }
        db.collection('admin_notifications').add(notification)
        return jsonify({'status': 'success', 'notification': notification})

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
    db.collection('notifications').add(notification)
    return jsonify({'status': 'success', 'notification': notification})

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
            db.collection('notifications').document(doc.id).update(updated_data)
            return jsonify({'status': 'success', 'notification': updated_data})
    
    return jsonify({'status': 'error', 'message': 'Notification not found'}), 404

# Student Profile
@app.route('/profile', methods=['GET', 'POST'])
def profile():
    if 'user' not in session:
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
        db.collection('users').document(email).update(updated_data)
        session['user'].update(updated_data)

    user_data = user_doc.to_dict()
    return render_template('profile.html', user=user_data)

# Admin Complaints Route
=======
if __name__ == '__main__':
    app.run(debug=True)

>>>>>>> 96d7133ba643c42339caf480a2e12f5316ac4df8
@app.route('/admin/complaints')
def admin_complaints():
    return render_template('admincomplaint.html')

<<<<<<< HEAD
# Logout Route
@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('login'))

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
=======
@app.route('/login')
def login():
    return render_template('login.html')
>>>>>>> 96d7133ba643c42339caf480a2e12f5316ac4df8
