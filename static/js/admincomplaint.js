import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  update,
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
  const complaintsTableBody = document.getElementById("complaintsTableBody");
  const searchInput = document.getElementById("searchInput");
  const filterBus = document.getElementById("filterBus");
  const filterStatus = document.getElementById("filterStatus");
  const dateFrom = document.getElementById("dateFrom");
  const dateTo = document.getElementById("dateTo");

  let allComplaints = [];

  // Real-time listener for complaints
  onValue(complaintsRef, (snapshot) => {
    allComplaints = [];
    snapshot.forEach((childSnapshot) => {
      const complaint = {
        id: childSnapshot.key,
        ...childSnapshot.val(),
        status: childSnapshot.val().status || "Pending", // Default status
      };
      allComplaints.push(complaint);
    });
    updateStatistics();
    displayComplaints(true);
  });

  function updateStatistics() {
    document.getElementById("totalComplaints").textContent =
      allComplaints.length;
    document.getElementById("pendingComplaints").textContent =
      allComplaints.filter((c) => c.status === "Pending").length;
    document.getElementById("resolvedComplaints").textContent =
      allComplaints.filter((c) => c.status === "Resolved").length;
  }

  function displayComplaints() {
    const filtered = allComplaints.filter((complaint) => {
      const matchesSearch = complaint.description
        ?.toLowerCase()
        .includes(searchInput.value.toLowerCase());
      const matchesBus =
        !filterBus.value || complaint.busNumber === filterBus.value;
      const matchesStatus =
        !filterStatus.value ||
        complaint.status.toLowerCase() === filterStatus.value;
      const complaintDate = new Date(complaint.timestamp);
      const matchesDateFrom =
        !dateFrom.value || complaintDate >= new Date(dateFrom.value);
      const matchesDateTo =
        !dateTo.value || complaintDate <= new Date(dateTo.value + "T23:59:59");

      return (
        matchesSearch &&
        matchesBus &&
        matchesStatus &&
        matchesDateFrom &&
        matchesDateTo
      );
    });

    complaintsTableBody.innerHTML = filtered
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(
        (complaint) => `
                <tr>
                    <td>${complaint.id.substring(0, 8)}</td>
                    <td>${complaint.userName || "Anonymous"}</td>
                    <td>Bus ${complaint.busNumber}</td>
                    <td>${complaint.category}</td>
                    <td>${new Date(complaint.timestamp).toLocaleString()}</td>
                    <td class="status-${complaint.status.toLowerCase()}">${
          complaint.status
        }</td>
                    <td>
                        <select onchange="updateStatus('${
                          complaint.id
                        }', this.value)" class="status-select">
                            <option value="Pending" ${
                              complaint.status === "Pending" ? "selected" : ""
                            }>Pending</option>
                            <option value="Acknowledged" ${
                              complaint.status === "Acknowledged"
                                ? "selected"
                                : ""
                            }>Acknowledged</option>
                            <option value="Resolved" ${
                              complaint.status === "Resolved" ? "selected" : ""
                            }>Resolved</option>
                        </select>
                    </td>
                </tr>
            `
      )
      .join("");
  }

  // Event listeners for filters
  [searchInput, filterBus, filterStatus, dateFrom, dateTo].forEach(
    (element) => {
      element.addEventListener("input", () => displayComplaints());
    }
  );
});

window.updateStatus = async (id, newStatus) => {
  try {
    await update(ref(database, `complaints/${id}`), {
      status: newStatus,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    alert("Failed to update status");
  }
};
