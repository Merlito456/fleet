// ====== Backend Base URL (AeonFree) ======
const API_URL = "https://fleet.zya.me/";

// Helpers
const qs = (o) => new URLSearchParams(o);

const post = (path, data) =>
  fetch(API_URL + path, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: qs(data),
  })
  .then(async r => {
    const text = await r.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("❌ POST response was not JSON:", path, text);
      return { success: false, message: "Server did not return JSON" };
    }
  });

const get = (path) =>
  fetch(API_URL + path, { credentials: "include" })
  .then(async r => {
    const text = await r.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("❌ GET response was not JSON:", path, text);
      return { success: false, message: "Server did not return JSON" };
    }
  });

// ---------------- FIREBASE AUTH ----------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDlLV0mC6SoU061JNJanMX_7CMJ6dj9jFs",
  authDomain: "fleet-acd5e.firebaseapp.com",
  projectId: "fleet-acd5e",
  storageBucket: "fleet-acd5e.firebasestorage.app",
  messagingSenderId: "29073738872",
  appId: "1:29073738872:web:c944b84447a6d36e80f18d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Register with Firebase + Firestore
async function register(name, email, phone, password, role){
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save to Firestore
    await addDoc(collection(db, "users"), { uid: user.uid, name, email, phone, role });

    localStorage.setItem("user", JSON.stringify({ uid: user.uid, name, email, phone, role }));
    return true;
  } catch (err) {
    alert(err.message);
    return false;
  }
}

// Login with Firebase + Firestore
async function login(email, password){
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get role & profile from Firestore
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const profile = snap.docs[0].data();
      localStorage.setItem("user", JSON.stringify(profile));
    }

    return true;
  } catch (err) {
    alert(err.message);
    return false;
  }
}

// Logout
async function logout(){
  try { await signOut(auth); } catch(e){}
  localStorage.removeItem("user");
  location.href = "login.html";
}

function currentUser(){
  try { return JSON.parse(localStorage.getItem("user") || "null"); }
  catch(e){ return null; }
}

// 🚦 Redirect by role
function redirectByRole() {
  const u = currentUser();
  if (!u) { location.href = "login.html"; return; }
  if (u.role === "user")  location.href = "index.html";
  if (u.role === "rider") location.href = "riders.html";
  if (u.role === "admin") location.href = "admin.html";
}

// ---------------- EXISTING APP FLOWS (rides, bids, admin) ----------------
function addRide(origin, destination, remarks) {
  post("addRide.php", { origin, destination, remarks })
    .then(data => {
      alert(data.message || "OK");
      loadRides();
    });
}

function loadRides() {
  get("getRides.php").then(data => {
    let html = "";
    (data || []).forEach(r => {
      html += `
        <div class="col-12 mb-3">
          <div class="card shadow-sm p-3 rounded-3">
            <h5 class="mb-1">Ride #${r.id}</h5>
            <p class="mb-1"><strong>${r.origin}</strong> → <strong>${r.destination}</strong></p>
            <p class="text-muted small">${r.remarks || ""}</p>
            <span class="badge bg-${r.status === "open" ? "warning" : (r.status === "hired" ? "info" : "success")}">
              ${r.status}
            </span>
          </div>
        </div>`;
    });
    if (document.getElementById("rides")) document.getElementById("rides").innerHTML = html;
  });
}

function hireRider(ride_id, rider_id) {
  post("hireRider.php", { ride_id, rider_id })
    .then(data => {
      alert(data.message);
      loadRides();
    });
}

function addBid(ride_id, amount, location) {
  post("addBid.php", { ride_id, amount, location })
    .then(data => alert(data.message || "OK"));
}

function closeRide(ride_id) {
  post("closeRide.php", { ride_id })
    .then(data => alert(data.message || "OK"));
}

function loadCommissions() {
  get("getCommissions.php").then(data => {
    let html = "";
    (data || []).forEach(c => {
      html += `
        <div class="col-12 mb-3">
          <div class="card shadow-sm p-3 rounded-3">
            <h5 class="mb-1">Rider #${c.rider_id}</h5>
            <p class="mb-1">Total Due: <strong>₱${(+c.total_due).toFixed(2)}</strong></p>
            ${(+c.unpaid_count) > 0
              ? '<span class="badge bg-danger">Unpaid</span>'
              : '<span class="badge bg-success">Paid</span>'}
          </div>
        </div>`;
    });
    if (document.getElementById("commissions")) document.getElementById("commissions").innerHTML = html;
  });
}
