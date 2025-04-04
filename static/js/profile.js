import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

document.addEventListener("DOMContentLoaded", () => {
  const profileForm = document.getElementById("profileForm");
  const photoUpload = document.getElementById("photoUpload");
  const profileImage = document.getElementById("profileImage");
  let userId = null;
  let profileData = {};

  // Handle authentication state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userId = user.uid;
      loadProfileData(userId);
    } else {
      window.location.href = "/login";
    }
  });

  // Handle profile photo upload
  photoUpload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Upload to Firebase Storage
      const fileRef = storageRef(storage, `profile_photos/${userId}`);
      await uploadBytes(fileRef, file);

      // Get download URL and update profile image
      const downloadURL = await getDownloadURL(fileRef);
      profileImage.src = downloadURL;
      await set(ref(database, `users/${userId}/photoURL`), downloadURL);
    }
  });

  // Handle form submission
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form data
    const updatedData = {
      fullName: document.getElementById("fullName").value,
      studentId: document.getElementById("studentId").value,
      course: document.getElementById("course").value,
      year: document.getElementById("year").value,
      phone: document.getElementById("phone").value,
      email: document.getElementById("email").value,
      address: document.getElementById("address").value,
      busRoute: document.getElementById("busRoute").value,
      pickupPoint: document.getElementById("pickupPoint").value,
      dropoffPoint: document.getElementById("dropoffPoint").value,
      lastUpdated: new Date().toISOString(),
    };

    try {
      await set(ref(database, `users/${userId}`), updatedData);
      profileData = updatedData;
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile");
    }
  });

  async function loadProfileData(uid) {
    const userRef = ref(database, `users/${uid}`);

    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        profileData = data;
        // Populate form fields
        Object.keys(data).forEach((key) => {
          const element = document.getElementById(key);
          if (element) element.value = data[key];
        });
        if (data.photoURL) profileImage.src = data.photoURL;
      }
    });
  }
});

// Generate Bus Pass
window.generateBusPass = async function () {
  try {
    const userId = auth.currentUser.uid;
    const snapshot = await get(ref(database, `users/${userId}`));

    if (snapshot.exists()) {
      const profile = snapshot.val();
      generatePassWindow(profile);
    } else {
      alert("Please save your profile first!");
    }
  } catch (error) {
    console.error("Error generating bus pass:", error);
    alert("Failed to generate bus pass");
  }
};

function generatePassWindow(profile) {
  const busPassWindow = window.open("", "_blank");
  busPassWindow.document.write(`
        <html>
        <head>
            <title>Student Bus Pass</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .bus-pass { 
                    width: 400px; 
                    padding: 20px; 
                    border: 2px solid #000; 
                    margin: 0 auto; 
                }
                .qr-code { 
                    width: 100px; 
                    height: 100px; 
                    background: #eee; 
                    margin: 10px auto; 
                }
            </style>
        </head>
        <body>
            <div class="bus-pass">
                <h2>Student Bus Pass</h2>
                <img src="${profile.photoURL || ""}" 
                     style="width: 100px; height: 100px; object-fit: cover;">
                <p><strong>Name:</strong> ${profile.fullName}</p>
                <p><strong>Student ID:</strong> ${profile.studentId}</p>
                <p><strong>Bus Route:</strong> ${profile.busRoute}</p>
                <p><strong>Valid From:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Valid To:</strong> ${new Date(
                  new Date().setMonth(new Date().getMonth() + 6)
                ).toLocaleDateString()}</p>
                <div class="qr-code"></div>
            </div>
        </body>
        </html>
    `);
}
