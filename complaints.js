// Complaints Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const complaintForm = document.getElementById('complaintForm');
    const complaintsList = document.getElementById('complaintsList');

    // Handle complaint submission
    complaintForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const complaint = {
            id: Date.now(),
            busNumber: document.getElementById('busNumber').value,
            category: document.getElementById('category').value,
            description: document.getElementById('description').value,
            date: new Date().toISOString(),
            status: 'Pending'
        };

        // Save complaint
        const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
        complaints.push(complaint);
        localStorage.setItem('complaints', JSON.stringify(complaints));

        // Reset form and update display
        complaintForm.reset();
        displayComplaints();
        alert('Complaint submitted successfully!');
    });

    // Display complaints
    function displayComplaints() {
        const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
        complaintsList.innerHTML = complaints
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(complaint => `
                <div class="complaint-card">
                    <h3>Bus ${complaint.busNumber} - ${complaint.category}</h3>
                    <p>${complaint.description}</p>
                    <p><small>Submitted: ${new Date(complaint.date).toLocaleString()}</small></p>
                    <p><strong>Status: ${complaint.status}</strong></p>
                    <button onclick="deleteComplaint(${complaint.id})" class="feature-btn">
                        Delete
                    </button>
                </div>
            `).join('');
    }

    // Initial display
    displayComplaints();
});

// Delete complaint
function deleteComplaint(id) {
    if (confirm('Are you sure you want to delete this complaint?')) {
        const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
        const updatedComplaints = complaints.filter(c => c.id !== id);
        localStorage.setItem('complaints', JSON.stringify(updatedComplaints));
        document.getElementById('complaintsList').innerHTML = '';
        displayComplaints();
    }
}