// Replace with your AeonFree domain
const API_URL = "https://YOUR-AEONFREE-SITE.com/";

function addRide(origin, destination, remarks) {
  fetch(API_URL + "addRide.php", {
    method: "POST",
    body: new URLSearchParams({ origin, destination, remarks })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    loadRides();
  });
}

function loadRides() {
  fetch(API_URL + "getRides.php")
    .then(res => res.json())
    .then(data => {
      let html = "";
      data.forEach(r => {
        html += `
          <div class="col-12">
            <div class="card shadow-sm p-3">
              <h5>Ride #${r.id}</h5>
              <p><strong>${r.origin}</strong> → <strong>${r.destination}</strong></p>
              <p class="text-muted">${r.remarks || ''}</p>
              <span class="badge bg-${r.status === 'open' ? 'warning' : (r.status === 'hired' ? 'info' : 'success')}">
                ${r.status}
              </span>
            </div>
          </div>`;
      });
      document.getElementById("rides").innerHTML = html;
    });
}

function addBid(ride_id, amount, location) {
  fetch(API_URL + "addBid.php", {
    method: "POST",
    body: new URLSearchParams({ ride_id, amount, location })
  })
  .then(res => res.json())
  .then(data => alert(data.message));
}

function closeRide(ride_id) {
  fetch(API_URL + "closeRide.php", {
    method: "POST",
    body: new URLSearchParams({ ride_id })
  })
  .then(res => res.json())
  .then(data => alert(data.message));
}

function loadCommissions() {
  fetch(API_URL + "getCommissions.php")
    .then(res => res.json())
    .then(data => {
      let html = "";
      data.forEach(c => {
        html += `
          <div class="col-12">
            <div class="card shadow-sm p-3">
              <h5>Rider #${c.rider_id}</h5>
              <p>Total Due: <strong>₱${c.total_due}</strong></p>
              ${c.unpaid > 0 ? '<span class="badge bg-danger">Unpaid</span>' : '<span class="badge bg-success">Paid</span>'}
            </div>
          </div>`;
      });
      document.getElementById("commissions").innerHTML = html;
    });
}