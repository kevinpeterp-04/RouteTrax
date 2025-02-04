class NotificationManager {
    constructor() {
        this.notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        this.setupEventListeners();
        this.renderNotifications();
    }

    setupEventListeners() {
        const publishBtn = document.getElementById('publishBtn');
        const messageInput = document.getElementById('notificationMessage');

        publishBtn.addEventListener('click', () => {
            const message = messageInput.value.trim();
            if (message) {
                this.publishNotification(message);
                messageInput.value = '';
            }
        });
    }

    publishNotification(message) {
        const notification = {
            id: Date.now(),
            message,
            timestamp: new Date().toISOString()
        };

        this.notifications.unshift(notification);
        this.saveNotifications();
        this.renderNotifications();
    }

    saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }

    formatDate(dateString) {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    renderNotifications() {
        const notificationList = document.getElementById('notificationList');
        notificationList.innerHTML = this.notifications
            .map(notification => `
                <li>
                    <div class="notification-content">
                        <div>${notification.message}</div>
                        <div class="timestamp">${this.formatDate(notification.timestamp)}</div>
                    </div>
                </li>
            `)
            .join('');
    }
}

// Initialize the notification manager
new NotificationManager();