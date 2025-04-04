import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAYeyrhjBlujXAY58k5hZXo5j9fa_h5bmM",
  authDomain: "routetrax-5e817.firebaseapp.com",
  databaseURL: "https://routetrax-5e817-default-rtdb.firebaseio.com",
  projectId: "routetrax-5e817",
  storageBucket: "routetrax-5e817.firebasestorage.app",
  messagingSenderId: "891824394529",
  appId: "1:891824394529:web:b4c6ee464b895b91946e60",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const complaintsRef = ref(database, "complaints");

document.addEventListener("DOMContentLoaded", () => {
  const complaintForm = document.getElementById("complaintForm");
  const complaintsList = document.getElementById("complaintsList");

  // Real-time listener for complaints
  onValue(complaintsRef, (snapshot) => {
    complaintsList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
      const complaint = childSnapshot.val();
      complaintsList.appendChild(
        createComplaintCard(childSnapshot.key, complaint)
      );
    });
  });

  // Form submission handler
  complaintForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const complaintData = {
      busNumber: document.getElementById("busNumber").value.trim(),
      category: document.getElementById("category").value.trim(),
      description: document.getElementById("description").value.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      await push(complaintsRef, complaintData);
      complaintForm.reset();
    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert("Failed to submit complaint. Please try again.");
    }
  });

  function createComplaintCard(complaintId, complaint) {
    const card = document.createElement("div");
    card.className = "complaint-item";
    card.innerHTML = `
            <p><strong>Bus:</strong> ${complaint.busNumber}</p>
            <p><strong>Category:</strong> ${complaint.category}</p>
            <p><strong>Description:</strong> ${complaint.description}</p>
            <small>Submitted: ${new Date(
              complaint.timestamp
            ).toLocaleString()}</small>
        `;
    return card;
  }
});
