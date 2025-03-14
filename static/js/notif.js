// Mock admin notifications
const mockNotifications = [
    {
        id: 1,
        title: "Delay",
        message: "Buses may be delayed by a few minutes due to heavy traffic along the route.",
        date: "2025-02-03T14:00:00",
    },
    {
        id: 2,
        title: "Early Departure",
        message: "The buses will leave the college at 3:45 PM.",
        date: "2025-02-02T15:00:00",
    },
    {
        id: 3,
        title: "Fee payment",
        message: "Bus fees should be paid before 2/7/2025.",
        date: "2025-02-01T16:45:00",
    }
];

class NotificationManager {
    constructor() {
        this.notifications = mockNotifications;
        this.favorites = new Set(JSON.parse(localStorage.getItem('favorites')) || []);
        this.reminders = new Map(JSON.parse(localStorage.getItem('reminders')) || []);
        
        this.initializeElements();
        this.addEventListeners();
        this.renderNotifications();
    }

    initializeElements() {
        this.notificationsContainer = document.getElementById('notifications');
        this.notificationTemplate = document.getElementById('notification-template');
        this.filterButtons = {
            all: document.getElementById('showAll'),
            favorites: document.getElementById('showFavorites'),
            reminders: document.getElementById('showReminders')
        };
    }

    addEventListeners() {
        // Filter buttons
        Object.entries(this.filterButtons).forEach(([type, button]) => {
            button.addEventListener('click', () => {
                this.setActiveFilter(type);
                this.renderNotifications(type);
            });
        });
    }

    setActiveFilter(type) {
        Object.values(this.filterButtons).forEach(button => {
            button.classList.remove('active');
        });
        this.filterButtons[type].classList.add('active');
    }

    renderNotifications(filter = 'all') {
        this.notificationsContainer.innerHTML = '';
        
        let filteredNotifications = this.notifications;
        if (filter === 'favorites') {
            filteredNotifications = this.notifications.filter(n => this.favorites.has(n.id));
        } else if (filter === 'reminders') {
            filteredNotifications = this.notifications.filter(n => this.reminders.has(n.id));
        }

        filteredNotifications.forEach(notification => {
            const card = this.createNotificationCard(notification);
            this.notificationsContainer.appendChild(card);
        });
    }

    createNotificationCard(notification) {
        const template = this.notificationTemplate.content.cloneNode(true);
        const card = template.querySelector('.notification-card');
        
        // Set content
        card.querySelector('.notification-title').textContent = notification.title;
        card.querySelector('.notification-message').textContent = notification.message;
        card.querySelector('.notification-date').textContent = 
            new Date(notification.date).toLocaleString();

        // Setup favorite button
        const favoriteBtn = card.querySelector('.favorite-btn');
        if (this.favorites.has(notification.id)) {
            favoriteBtn.classList.add('active');
            favoriteBtn.querySelector('.star-icon').textContent = '★';
        }
        
        favoriteBtn.addEventListener('click', () => this.toggleFavorite(notification.id, favoriteBtn));

        // Setup reminder functionality
        const reminderBtn = card.querySelector('.reminder-btn');
        const reminderInput = card.querySelector('.reminder-input');
        const reminderText = card.querySelector('.reminder-text');
        const removeReminderBtn = card.querySelector('.remove-reminder-btn');

        reminderBtn.addEventListener('click', () => {
            reminderInput.classList.remove('hidden');
            reminderBtn.classList.add('hidden');
        });

        // Handle existing reminder
        if (this.reminders.has(notification.id)) {
            this.updateReminderDisplay(notification.id, reminderText, reminderBtn, removeReminderBtn);
        }

        // Setup reminder save/cancel
        card.querySelector('.save-reminder-btn').addEventListener('click', () => {
            const datetime = card.querySelector('.datetime-picker').value;
            if (datetime) {
                this.setReminder(notification.id, datetime);
                this.updateReminderDisplay(notification.id, reminderText, reminderBtn, removeReminderBtn);
                reminderInput.classList.add('hidden');
            }
        });

        card.querySelector('.cancel-reminder-btn').addEventListener('click', () => {
            reminderInput.classList.add('hidden');
            reminderBtn.classList.remove('hidden');
        });

        removeReminderBtn.addEventListener('click', () => {
            this.removeReminder(notification.id);
            reminderText.classList.add('hidden');
            removeReminderBtn.classList.add('hidden');
            reminderBtn.classList.remove('hidden');
        });

        return card;
    }

    toggleFavorite(id, button) {
        if (this.favorites.has(id)) {
            this.favorites.delete(id);
            button.classList.remove('active');
            button.querySelector('.star-icon').textContent = '☆';
        } else {
            this.favorites.add(id);
            button.classList.add('active');
            button.querySelector('.star-icon').textContent = '★';
        }
        localStorage.setItem('favorites', JSON.stringify([...this.favorites]));
    }

    setReminder(id, datetime) {
        this.reminders.set(id, datetime);
        localStorage.setItem('reminders', JSON.stringify([...this.reminders]));
        this.checkReminders();
    }

    removeReminder(id) {
        this.reminders.delete(id);
        localStorage.setItem('reminders', JSON.stringify([...this.reminders]));
    }

    updateReminderDisplay(id, textElement, reminderBtn, removeBtn) {
        const reminderTime = this.reminders.get(id);
        if (reminderTime) {
            textElement.textContent = `Reminder set for: ${new Date(reminderTime).toLocaleString()}`;
            textElement.classList.remove('hidden');
            removeBtn.classList.remove('hidden');
            reminderBtn.classList.add('hidden');
        }
    }

    checkReminders() {
        setInterval(() => {
            const now = new Date();
            this.reminders.forEach((datetime, id) => {
                const reminderTime = new Date(datetime);
                if (now >= reminderTime) {
                    const notification = this.notifications.find(n => n.id === id);
                    if (notification) {
                        this.showReminderNotification(notification);
                        this.removeReminder(id);
                        this.renderNotifications();
                    }
                }
            });
        }, 1000);
    }

    showReminderNotification(notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Reminder', {
                body: notification.title + '\n' + notification.message
            });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showReminderNotification(notification);
                }
            });
        }
    }
}

// Initialize the notification manager
document.addEventListener('DOMContentLoaded', () => {
    new NotificationManager();
});