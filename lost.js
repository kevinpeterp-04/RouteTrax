document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reportForm');
    const reportsList = document.getElementById('reportsList');
    
    // Load existing reports from localStorage
    let reports = JSON.parse(localStorage.getItem('reports')) || [];
    
    // Display existing reports
    displayReports();
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const report = {
            id: Date.now(),
            type: document.getElementById('itemType').value,
            itemName: document.getElementById('itemName').value,
            date: document.getElementById('date').value,
            busRoute: document.getElementById('busRoute').value,
            contactName: document.getElementById('contactName').value,
            contactEmail: document.getElementById('contactEmail').value,
            contactPhone: document.getElementById('contactPhone').value,
            additionalInfo: document.getElementById('additionalInfo').value,
            timestamp: new Date().toLocaleString()
        };
        
        // Add new report to array
        reports.unshift(report);
        
        // Save to localStorage
        localStorage.setItem('reports', JSON.stringify(reports));
        
        // Update display
        displayReports();
        
        // Reset form
        form.reset();
        
        // Show success message
        alert('Report submitted successfully!');
    });
    
    function displayReports() {
        reportsList.innerHTML = '';
        
        reports.forEach(report => {
            const reportCard = document.createElement('div');
            reportCard.className = `report-card report-type-${report.type}`;
            
            reportCard.innerHTML = `
                <h3>${report.type === 'lost' ? 'Lost' : 'Found'} Item: ${report.itemName}</h3>
                <p><strong>Date:</strong> ${report.date}</p>
                <p><strong>Bus Route:</strong> ${report.busRoute}</p>
                <p><strong>Contact:</strong> ${report.contactName}</p>
                <p><strong>Email:</strong> ${report.contactEmail}</p>
                <p><strong>Phone:</strong> ${report.contactPhone}</p>
                ${report.additionalInfo ? `<p><strong>Additional Info:</strong> ${report.additionalInfo}</p>` : ''}
                <p><small>Reported on: ${report.timestamp}</small></p>
            `;
            
            reportsList.appendChild(reportCard);
        });
    }
});