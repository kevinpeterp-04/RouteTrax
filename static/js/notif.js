import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAYeyrhjBlujXAY58k5hZXo5j9fa_h5bmM",
  authDomain: "routetrax-5e817.firebaseapp.com",
  databaseURL: "https://routetrax-5e817-default-rtdb.firebaseio.com",
  projectId: "routetrax-5e817",
  storageBucket: "routetrax-5e817.firebasestorage.app",
  messagingSenderId: "891824394529",
  appId: "1:891824394529:web:b4c6ee464b895b91946e60",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const notificationsRef = ref(database, "notifications");

class NotificationManager {
  constructor() {
    this.notifications = [];
    this.favorites = new Set(
      JSON.parse(localStorage.getItem("favorites")) || []
    );
    this.reminders = new Map(
      JSON.parse(localStorage.getItem("reminders")) || []
    );

    this.initializeElements();
    this.addEventListeners();
    this.setupRealTimeUpdates();
    this.checkReminders();
  }

  initializeElements() {
    this.notificationsContainer = document.getElementById("notifications");
    this.notificationTemplate = document.getElementById(
      "notification-template"
    );
    this.filterButtons = {
      all: document.getElementById("showAll"),
      favorites: document.getElementById("showFavorites"),
      reminders: document.getElementById("showReminders"),
    };
  }

  setupRealTimeUpdates() {
    onValue(notificationsRef, (snapshot) => {
      this.notifications = [];
      snapshot.forEach((childSnapshot) => {
        const notification = {
          id: childSnapshot.key,
          title: "Announcement",
          message: childSnapshot.val().message,
          date: childSnapshot.val().timestamp,
        };
        this.notifications.push(notification);
      });
      this.renderNotifications();
    });
  }

  addEventListeners() {
    Object.entries(this.filterButtons).forEach(([type, button]) => {
      button.addEventListener("click", () => {
        this.setActiveFilter(type);
        this.renderNotifications(type);
      });
    });
  }

  setActiveFilter(type) {
    Object.values(this.filterButtons).forEach((btn) =>
      btn.classList.remove("active")
    );
    this.filterButtons[type].classList.add("active");
  }

  renderNotifications(filter = "all") {
    this.notificationsContainer.innerHTML = "";

    let filtered = this.notifications;
    if (filter === "favorites") {
      filtered = filtered.filter((n) => this.favorites.has(n.id));
    } else if (filter === "reminders") {
      filtered = filtered.filter((n) => this.reminders.has(n.id));
    }

    filtered.forEach((notification) => {
      const card = this.createNotificationCard(notification);
      this.notificationsContainer.appendChild(card);
    });
  }

  createNotificationCard(notification) {
    const template = this.notificationTemplate.content.cloneNode(true);
    const card = template.querySelector(".notification-card");

    card.querySelector(".notification-title").textContent = notification.title;
    card.querySelector(".notification-message").textContent =
      notification.message;
    card.querySelector(".notification-date").textContent = new Date(
      notification.date
    ).toLocaleString();

    // Favorite functionality
    const favoriteBtn = card.querySelector(".favorite-btn");
    if (this.favorites.has(notification.id)) {
      favoriteBtn.classList.add("active");
      favoriteBtn.querySelector(".star-icon").textContent = "★";
    }

    favoriteBtn.addEventListener("click", () =>
      this.toggleFavorite(notification.id, favoriteBtn)
    );

    // Reminder functionality
    const reminderBtn = card.querySelector(".reminder-btn");
    const reminderInput = card.querySelector(".reminder-input");
    const reminderText = card.querySelector(".reminder-text");
    const removeReminderBtn = card.querySelector(".remove-reminder-btn");

    reminderBtn.addEventListener("click", () => {
      reminderInput.classList.remove("hidden");
      reminderBtn.classList.add("hidden");
    });

    if (this.reminders.has(notification.id)) {
      this.updateReminderDisplay(
        notification.id,
        reminderText,
        reminderBtn,
        removeReminderBtn
      );
    }

    card.querySelector(".save-reminder-btn").addEventListener("click", () => {
      const datetime = card.querySelector(".datetime-picker").value;
      if (datetime) {
        this.setReminder(notification.id, datetime);
        this.updateReminderDisplay(
          notification.id,
          reminderText,
          reminderBtn,
          removeReminderBtn
        );
        reminderInput.classList.add("hidden");
      }
    });

    card.querySelector(".cancel-reminder-btn").addEventListener("click", () => {
      reminderInput.classList.add("hidden");
      reminderBtn.classList.remove("hidden");
    });

    removeReminderBtn.addEventListener("click", () => {
      this.removeReminder(notification.id);
      reminderText.classList.add("hidden");
      removeReminderBtn.classList.add("hidden");
      reminderBtn.classList.remove("hidden");
    });

    return card;
  }

  toggleFavorite(id, button) {
    this.favorites.has(id) ? this.favorites.delete(id) : this.favorites.add(id);
    button.classList.toggle("active");
    button.querySelector(".star-icon").textContent = this.favorites.has(id)
      ? "★"
      : "☆";
    localStorage.setItem("favorites", JSON.stringify([...this.favorites]));
  }

  setReminder(id, datetime) {
    this.reminders.set(id, datetime);
    localStorage.setItem("reminders", JSON.stringify([...this.reminders]));
  }

  removeReminder(id) {
    this.reminders.delete(id);
    localStorage.setItem("reminders", JSON.stringify([...this.reminders]));
  }

  updateReminderDisplay(id, textElement, reminderBtn, removeBtn) {
    const reminderTime = this.reminders.get(id);
    textElement.textContent = `Reminder: ${new Date(
      reminderTime
    ).toLocaleString()}`;
    textElement.classList.remove("hidden");
    removeBtn.classList.remove("hidden");
    reminderBtn.classList.add("hidden");
  }

  checkReminders() {
    setInterval(() => {
      const now = new Date();
      this.reminders.forEach((time, id) => {
        if (new Date(time) <= now) {
          const notification = this.notifications.find((n) => n.id === id);
          if (notification) {
            this.showReminderAlert(notification);
            this.removeReminder(id);
            this.renderNotifications();
          }
        }
      });
    }, 1000);
  }

  showReminderAlert(notification) {
    if (Notification.permission === "granted") {
      new Notification(notification.title, { body: notification.message });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") this.showReminderAlert(notification);
      });
    }
  }
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", () => new NotificationManager());
