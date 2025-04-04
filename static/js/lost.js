import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase configuration (same as other components)
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
const reportsRef = ref(database, "lost_found");

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reportForm");
  const reportsList = document.getElementById("reportsList");

  // Real-time listener for reports
  onValue(reportsRef, (snapshot) => {
    const reports = [];
    snapshot.forEach((childSnapshot) => {
      reports.push({
        id: childSnapshot.key,
        ...childSnapshot.val(),
      });
    });
    displayReports(reports.reverse());
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const report = {
      type: document.getElementById("itemType").value,
      itemName: document.getElementById("itemName").value,
      dateTime: document.getElementById("dateTime").value,
      busRoute: document.getElementById("busRoute").value,
      contactName: document.getElementById("contactName").value,
      contactEmail: document.getElementById("contactEmail").value,
      contactPhone: document.getElementById("contactPhone").value,
      additionalInfo: document.getElementById("additionalInfo").value,
      timestamp: new Date().toISOString(),
    };

    try {
      await push(reportsRef, report);
      alert("Report submitted successfully!");
      form.reset();
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    }
  });

  function displayReports(reports) {
    reportsList.innerHTML = reports
      .map(
        (report) => `
            <div class="report-card report-type-${report.type}">
                <h3>${report.type === "lost" ? "Lost" : "Found"} Item: ${
          report.itemName
        }</h3>
                <p><strong>Date and Time:</strong> ${new Date(
                  report.dateTime
                ).toLocaleString()}</p>
                <p><strong>Bus Route:</strong> ${report.busRoute}</p>
                <p><strong>Contact:</strong> ${report.contactName}</p>
                <p><strong>Email:</strong> ${report.contactEmail}</p>
                <p><strong>Phone:</strong> ${report.contactPhone}</p>
                ${
                  report.additionalInfo
                    ? `<p><strong>Additional Info:</strong> ${report.additionalInfo}</p>`
                    : ""
                }
                <p><small>Reported on: ${new Date(
                  report.timestamp
                ).toLocaleString()}</small></p>
            </div>
        `
      )
      .join("");
  }
});
