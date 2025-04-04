import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  remove,
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
const reportsRef = ref(database, "lost_found");

document.addEventListener("DOMContentLoaded", () => {
  const reportsList = document.getElementById("adminReportsList");
  const reportTemplate = document.getElementById("admin-report-template");

  // Real-time updates listener
  onValue(reportsRef, (snapshot) => {
    reportsList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
      const report = childSnapshot.val();
      const reportCard = createReportCard(childSnapshot.key, report);
      reportsList.appendChild(reportCard);
    });
  });

  function createReportCard(reportId, report) {
    const template = reportTemplate.content.cloneNode(true);
    const card = template.querySelector(".report-card");

    // Set report type
    const typeElement = card.querySelector(".report-type");
    typeElement.textContent = `${report.type.toUpperCase()} ITEM`;
    card.classList.add(`report-type-${report.type}`);

    // Populate data
    card.querySelector(".item-name").textContent = report.itemName;
    card.querySelector(".report-date").textContent = new Date(
      report.timestamp
    ).toLocaleString();
    card.querySelector(".bus-route").textContent = report.busRoute;
    card.querySelector(
      ".contact-info"
    ).textContent = `${report.contactName} (${report.contactEmail} | ${report.contactPhone})`;
    card.querySelector(".additional-info").textContent =
      report.additionalInfo || "None";

    // Delete functionality
    const deleteBtn = card.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", async () => {
      if (confirm("Are you sure you want to delete this report?")) {
        try {
          await remove(ref(database, `lost_found/${reportId}`));
        } catch (error) {
          console.error("Delete error:", error);
          alert("Failed to delete report");
        }
      }
    });

    return card;
  }
});
