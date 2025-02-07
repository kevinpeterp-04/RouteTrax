// Profile Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profileForm');
    const photoUpload = document.getElementById('photoUpload');
    const profileImage = document.getElementById('profileImage');

    // Handle profile photo upload
    photoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profileImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle form submission
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = {
            fullName: document.getElementById('fullName').value,
            studentId: document.getElementById('studentId').value,
            course: document.getElementById('course').value,
            year: document.getElementById('year').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            busRoute: document.getElementById('busRoute').value,
            pickupPoint: document.getElementById('pickupPoint').value,
            dropoffPoint: document.getElementById('dropoffPoint').value
        };

        // Save to localStorage (in a real app, this would be sent to a server)
        localStorage.setItem('studentProfile', JSON.stringify(formData));
        alert('Profile updated successfully!');
    });

    // Load saved profile data
    const savedProfile = localStorage.getItem('studentProfile');
    if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        Object.keys(profile).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = profile[key];
            }
        });
    }
});

// Generate Bus Pass
function generateBusPass() {
    const profile = JSON.parse(localStorage.getItem('studentProfile'));
    if (!profile) {
        alert('Please save your profile first!');
        return;
    }

    // Create a new window for the bus pass
    const busPassWindow = window.open('', '_blank');
    busPassWindow.document.write(`
        <html>
        <head>
            <title>Student Bus Pass</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .bus-pass { 
                    width: 400px; 
                    padding: 20px; 
                    border: 2px solid #000; 
                    margin: 0 auto; 
                }
                .qr-code { 
                    width: 100px; 
                    height: 100px; 
                    background: #eee; 
                    margin: 10px auto; 
                }
            </style>
        </head>
        <body>
            <div class="bus-pass">
                <h2>Student Bus Pass</h2>
                <img src="${document.getElementById('profileImage').src}" 
                     style="width: 100px; height: 100px; object-fit: cover;">
                <p><strong>Name:</strong> ${profile.fullName}</p>
                <p><strong>Student ID:</strong> ${profile.studentId}</p>
                <p><strong>Bus Route:</strong> ${profile.busRoute}</p>
                <p><strong>Valid From:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Valid To:</strong> ${new Date(new Date().setMonth(new Date().getMonth() + 6)).toLocaleDateString()}</p>
                <div class="qr-code"></div>
            </div>
        </body>
        </html>
    `);
}