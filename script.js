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

// ---------------- AUTH ----------------
async function register(name, email, phone, password, role){
  const res = await post("auth_register.php", { name, email, phone, password, role });
  if (!res.success || !res.user) { 
    alert(res.message || "Registration failed"); 
    return false; 
  }
  localStorage.setItem("user", JSON.stringify(res.user));
  return true;
}

async function login(email, password){
  const res = await post("auth_login.php", { email, password });
  if (!res.success || !res.user) { 
    alert(res.message || "Login failed"); 
    return false; 
  }
  localStorage.setItem("user", JSON.stringify(res.user));
  return true;
}

// 🚦 Redirect by role
function redirectByRole() {
  const u = currentUser();
  if (!u) { location.href = "login.html"; return; }
  if (u.role === "user")  location.href = "index.html";
  if (u.role === "rider") location.href = "riders.html";
  if (u.role === "admin") location.href = "admin.html";
}

async function logout(){
  try { await post("auth_logout.php", {}); } catch(e){}
  localStorage.removeItem("user");
  location.href = "login.html";
}

async function me(){
  try {
    const res = await get("auth_me.php");
    if (res.user) {
      localStorage.setItem("user", JSON.stringify(res.user));
      return res.user;
    }
  } catch(e){}
  localStorage.removeItem("user");
  return null;
}

function currentUser(){
  try { return JSON.parse(localStorage.getItem("user") || "null"); }
  catch(e){ return null; }
}

async function requireRole(role, redirect = "login.html"){
  const u = await me();
  if (!u || u.role !== role) {
    location.href = redirect;
    return false;
  }
  return true;
}

// --------------- USER FLOWS ---------------
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

// --------------- RIDER FLOWS ---------------
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

// --------------- ADMIN/REPORTS ---------------
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
