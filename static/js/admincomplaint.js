// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const complaintsTableBody = document.getElementById('complaintsTableBody');
    const searchInput = document.getElementById('searchInput');
    const filterBus = document.getElementById('filterBus');
    const filterStatus = document.getElementById('filterStatus');
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');

    // Update statistics
    function updateStatistics() {
        const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
        document.getElementById('totalComplaints').textContent = complaints.length;
        document.getElementById('pendingComplaints').textContent = 
            complaints.filter(c => c.status === 'Pending').length;
        document.getElementById('resolvedComplaints').textContent = 
            complaints.filter(c => c.status === 'Resolved').length;
    }

    // Display complaints in table
    function displayComplaints(filtered = false) {
        let complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
        
        if (filtered) {
            complaints = complaints.filter(complaint => {
                const matchesSearch = complaint.description.toLowerCase()
                    .includes(searchInput.value.toLowerCase());
                const matchesBus = !filterBus.value || complaint.busNumber === filterBus.value;
                const matchesStatus = !filterStatus.value || complaint.status.toLowerCase() === filterStatus.value;
                const complaintDate = new Date(complaint.date);
                const matchesDateFrom = !dateFrom.value || complaintDate >= new Date(dateFrom.value);
                const matchesDateTo = !dateTo.value || complaintDate <= new Date(dateTo.value);

                return matchesSearch && matchesBus && matchesStatus && matchesDateFrom && matchesDateTo;
            });
        }

        complaintsTableBody.innerHTML = complaints
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(complaint => `
                <tr>
                    <td>${complaint.id}</td>
                    <td>Student Name</td>
                    <td>Bus ${complaint.busNumber}</td>
                    <td>${complaint.category}</td>
                    <td>${new Date(complaint.date).toLocaleString()}</td>
                    <td>${complaint.status}</td>
                    <td>
                        <select onchange="updateStatus(${complaint.id}, this.value)" class="status-select">
                            <option value="Pending" ${complaint.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Acknowledged" ${complaint.status === 'Acknowledged' ? 'selected' : ''}>Acknowledged</option>
                            <option value="Resolved" ${complaint.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                        </select>
                    </td>
                </tr>
            `).join('');
    }

    // Event listeners for filters
    searchInput.addEventListener('input', () => displayComplaints(true));
    filterBus.addEventListener('change', () => displayComplaints(true));
    filterStatus.addEventListener('change', () => displayComplaints(true));
    dateFrom.addEventListener('change', () => displayComplaints(true));
    dateTo.addEventListener('change', () => displayComplaints(true));

    // Initial display
    updateStatistics();
    displayComplaints();
});

// Update complaint status
function updateStatus(id, newStatus) {
    const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    const updatedComplaints = complaints.map(complaint => 
        complaint.id === id ? { ...complaint, status: newStatus } : complaint
    );
    localStorage.setItem('complaints', JSON.stringify(updatedComplaints));
    updateStatistics();
}