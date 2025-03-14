from flask import Flask, render_template

app = Flask(__name__)

@app.route('/admin')
def admin():
    return render_template('admin.html')

if __name__ == '__main__':
    app.run(debug=True)

@app.route('/admin/complaints')
def admin_complaints():
    return render_template('admincomplaint.html')

@app.route('/login')
def login():
    return render_template('login.html')
