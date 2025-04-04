// notifadmin.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Replace with your actual Firebase config

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
const auth = getAuth(app);
const notificationsRef = ref(database, "notifications");

class NotificationManager {
  constructor() {
    this.initializeAuth();
  }

  initializeAuth() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.initApp();
      } else {
        signInAnonymously(auth).catch((error) => {
          console.error("Anonymous sign-in failed:", error);
          alert("Authentication failed. Please refresh the page.");
        });
      }
    });
  }

  initApp() {
    this.setupEventListeners();
    this.setupRealTimeUpdates();
    console.log("Firebase initialized successfully");
  }

  setupEventListeners() {
    const publishBtn = document.getElementById("publishBtn");
    const messageInput = document.getElementById("notificationMessage");

    publishBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const message = messageInput.value.trim();
      if (message) {
        this.publishNotification(message);
        messageInput.value = "";
      }
    });
  }

  async publishNotification(message) {
    try {
      const newNotification = {
        message: message,
        timestamp: new Date().toISOString(),
      };

      await push(notificationsRef, newNotification);
      console.log("Notification published successfully");
    } catch (error) {
      console.error("Publish error:", error);
      alert(`Publish failed: ${error.message}`);
    }
  }

  setupRealTimeUpdates() {
    onValue(
      notificationsRef,
      (snapshot) => {
        const notifications = [];
        snapshot.forEach((childSnapshot) => {
          notifications.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          });
        });
        this.renderNotifications(notifications.reverse());
      },
      (error) => {
        console.error("Real-time updates error:", error);
      }
    );
  }

  async deleteNotification(notificationId) {
    try {
      const notificationRef = ref(database, `notifications/${notificationId}`);
      await remove(notificationRef);
      console.log("Notification deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      alert(`Delete failed: ${error.message}`);
    }
  }

  formatDate(dateString) {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  }

  renderNotifications(notifications) {
    const notificationList = document.getElementById("notificationList");
    notificationList.innerHTML = notifications
      .map(
        (notification) => `
        <li class="notification-item">
          <div class="notification-content">
            <p class="notification-message">${notification.message}</p>
            <small class="notification-time">
              ${this.formatDate(notification.timestamp)}
            </small>
          </div>
          <button 
            class="delete-btn" 
            data-id="${notification.id}"
            title="Delete notification"
          >
            ×
          </button>
        </li>
      `
      )
      .join("");

    // Add delete handlers
    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this notification?")) {
          this.deleteNotification(id);
        }
      });
    });
  }
}

// Initialize app
window.addEventListener("load", () => {
  new NotificationManager();
});
