// ================= FIREBASE SETUP =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDlLV0mC6SoU061JNJanMX_7CMJ6dj9jFs",
  authDomain: "fleet-acd5e.firebaseapp.com",
  projectId: "fleet-acd5e",
  storageBucket: "fleet-acd5e.firebasestorage.app",
  messagingSenderId: "29073738872",
  appId: "1:29073738872:web:c944b84447a6d36e80f18d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ==================== AUTH FUNCTIONS ====================

// Register user
export async function register(name, email, phone, password, role){
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await addDoc(collection(db, "users"), {
      uid: user.uid,
      name,
      email,
      phone,
      role,
      createdAt: new Date()
    });

    const profile = { uid: user.uid, name, email, phone, role };
    localStorage.setItem("user", JSON.stringify(profile));
    return profile;
  } catch (err) {
    alert(err.message);
    return null;
  }
}

// Login user
export async function login(email, password){
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const profile = snap.docs[0].data();
      localStorage.setItem("user", JSON.stringify(profile));
      return profile;
    } else {
      alert("Profile not found in Firestore");
      return null;
    }
  } catch (err) {
    alert(err.message);
    return null;
  }
}

// Logout
export async function logout(){
  try { await signOut(auth); } catch(e){}
  localStorage.removeItem("user");
  location.href = "login.html";
}

// Get current user from localStorage
export function currentUser(){
  try { return JSON.parse(localStorage.getItem("user") || "null"); }
  catch(e){ return null; }
}

// Redirect based on role
export function redirectByRole(role = null){
  const u = role ? { role } : currentUser();
  if (!u) { location.href = "login.html"; return; }
  if (u.role === "user")  location.href = "index.html";
  if (u.role === "rider") location.href = "riders.html";
  if (u.role === "admin") location.href = "admin.html";
}

// ==================== RIDE / APP FUNCTIONS ====================

const API_URL = "https://fleet.zya.me/"; // Existing PHP backend for rides

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
    try { return JSON.parse(text); }
    catch(e){ return { success: false, message: "Server did not return JSON" }; }
  });

const get = (path) =>
  fetch(API_URL + path, { credentials: "include" })
    .then(async r => {
      const text = await r.text();
      try { return JSON.parse(text); }
      catch(e){ return { success: false, message: "Server did not return JSON" }; }
    });

// User flows
export function addRide(origin, destination, remarks){
  post("addRide.php", { origin, destination, remarks })
    .then(data => { alert(data.message || "OK"); loadRides(); });
}

export function loadRides(){
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

// Rider flows
export function hireRider(ride_id, rider_id){
  post("hireRider.php", { ride_id, rider_id })
    .then(data => { alert(data.message); loadRides(); });
}

export function addBid(ride_id, amount, location){
  post("addBid.php", { ride_id, amount, location })
    .then(data => alert(data.message || "OK"));
}

export function closeRide(ride_id){
  post("closeRide.php", { ride_id })
    .then(data => alert(data.message || "OK"));
}

// Admin / Reports
export function loadCommissions(){
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
