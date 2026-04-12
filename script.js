let loggedInUser = null;

function openTab(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active-section'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active-section');
    
    // Set active class to the correct tab button
    if(id === 'guest') document.getElementById('tab-guest').classList.add('active');
    if(id === 'customer') document.getElementById('tab-customer').classList.add('active');
    if(id === 'admin') document.getElementById('tab-admin').classList.add('active');
}

function showSection(id) {
    document.getElementById('book-form').style.display = 'none';
    document.getElementById('my-bookings-list').innerHTML = '';
    if(id === 'book-form') document.getElementById('book-form').style.display = 'block';
}

// ================= LOGOUT LOGIC (NEW) =================
function logout() {
    loggedInUser = null;
    
    // UI Reset
    document.getElementById('user-display').innerHTML = `Logged in as: <b>Guest</b>`;
    document.getElementById('logout-btn').style.display = 'none';
    
    // Show all tabs again
    document.getElementById('tab-customer').style.display = 'inline-block';
    document.getElementById('tab-admin').style.display = 'inline-block';

    // Reset Customer Portal
    document.getElementById('auth-form').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('uName').value = '';
    document.getElementById('uPass').value = '';

    // Reset Admin Portal
    document.getElementById('admin-login-area').style.display = 'block';
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('adminKey').value = '';

    // Go back to Guest view
    openTab('guest');
    alert("Logged out successfully!");
}

// ================= ADMIN LOGIC =================
function checkAdmin() {
    if(document.getElementById('adminKey').value === '123') {
        document.getElementById('admin-panel').style.display = 'block';
        document.getElementById('admin-login-area').style.display = 'none'; // Hide login box
        
        // HIDE CUSTOMER TAB & SHOW LOGOUT
        document.getElementById('tab-customer').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'inline-block';
        document.getElementById('user-display').innerHTML = `Logged in as: <b>ADMIN</b>`;
    } else alert("Invalid Admin Key!");
}

async function addTrain() {
    const data = {
        trainNo: document.getElementById('tNo').value,
        name: document.getElementById('tName').value,
        source: document.getElementById('tSrc').value,
        dest: document.getElementById('tDest').value,
        date: document.getElementById('tDate').value,
        totalSeats: document.getElementById('tSeats').value
    };
    if(!data.trainNo || !data.name || !data.source) return alert("Fill all details!");

    const res = await fetch('/api/admin/add', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)});
    const result = await res.json();
    if(result.success) {
        alert(`Train Added Successfully!`);
        document.querySelectorAll('#admin-panel input').forEach(inp => inp.value = ''); 
    }
}

async function deleteTrain() {
    const tNo = document.getElementById('modTNo').value;
    if(!tNo) return alert("Enter Train No to delete!");
    const res = await fetch('/api/admin/delete', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({trainNo: tNo})});
    const result = await res.json();
    if(result.success) { alert("Train Deleted Successfully!"); document.getElementById('modTNo').value = ''; }
    else alert(result.message);
}

async function increaseSeats() {
    const tNo = document.getElementById('modTNo').value;
    const seats = document.getElementById('addSeatsCount').value;
    if(!tNo || !seats) return alert("Enter Train No and Seats to add!");
    const res = await fetch('/api/admin/increase', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({trainNo: tNo, seats: seats})});
    const result = await res.json();
    if(result.success) { alert("Seats Increased Successfully!"); document.getElementById('modTNo').value = ''; document.getElementById('addSeatsCount').value = ''; }
    else alert(result.message);
}

async function viewAllBookings() {
    const res = await fetch('/api/admin/bookings');
    const bookings = await res.json();
    let html = "<ul>";
    if(bookings.length === 0) html += "<li>No bookings in system.</li>";
    bookings.forEach(b => {
        html += `<li><b>PNR ${b.pnr}</b>: User '${b.customerUser}' booked ${b.trainName} (${b.pDetails.length} Passengers)</li>`;
    });
    html += "</ul>";
    document.getElementById('all-bookings-display').innerHTML = html;
}

// ================= CUSTOMER LOGIC =================
async function handleSignUp() {
    const username = document.getElementById('uName').value;
    const password = document.getElementById('uPass').value;
    const phone = document.getElementById('uPhone').value;
    if(!username || !password || !phone) return alert("Fill all fields for Sign Up.");
    const res = await fetch('/api/signup', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({username, password, phone})});
    const data = await res.json();
    if(data.success) { alert("Account Created! You can Sign In now."); document.getElementById('uPhone').value = ''; }
}

async function handleSignIn() {
    const username = document.getElementById('uName').value;
    const password = document.getElementById('uPass').value;
    if(!username || !password) return alert("Enter Username and Password.");
    const res = await fetch('/api/signin', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({username, password})});
    const data = await res.json();
    if(data.success) {
        loggedInUser = data.user.username;
        document.getElementById('auth-form').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('user-display').innerHTML = `Logged in as: <b>${loggedInUser}</b>`;
        
        // HIDE ADMIN TAB & SHOW LOGOUT
        document.getElementById('tab-admin').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'inline-block';
    } else alert("Invalid Credentials!");
}

function createPassFields() {
    const n = document.getElementById('bCount').value;
    const div = document.getElementById('pass-fields');
    div.innerHTML = "";
    for(let i=1; i<=n; i++) {
        div.innerHTML += `<div class="input-group"><input placeholder="Passenger ${i} Name" class="pn"> <input type="number" placeholder="Age" class="pa"></div>`;
    }
}

async function confirmBooking() {
    const names = document.querySelectorAll('.pn');
    const ages = document.querySelectorAll('.pa');
    const pDetails = [];
    names.forEach((n, i) => pDetails.push({ pName: n.value, pAge: ages[i].value }));

    const res = await fetch('/api/book', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ username: loggedInUser, trainNo: document.getElementById('bTrainNo').value, passengers: pDetails })});
    const data = await res.json();
    if(data.success) {
        alert("🎉 TICKET BOOKED! PNR: " + data.pnr);
        document.getElementById('book-form').style.display = 'none';
        loadMyBookings();
    } else alert(data.message);
}

async function loadMyBookings() {
    showSection(''); 
    const res = await fetch(`/api/my-bookings/${loggedInUser}`);
    const bookings = await res.json();
    let html = "<h4>Your Bookings:</h4>";
    if(bookings.length === 0) html += "<p>You have no bookings yet.</p>";
    
    bookings.forEach(b => {
        let pList = b.pDetails.map(p => `${p.pName} (${p.pAge})`).join(", ");
        html += `
        <div class="list-item" style="display:flex; justify-content:space-between;">
            <div>
                <strong>PNR: ${b.pnr} | Train: ${b.trainName}</strong><br>
                <small>Passengers: ${pList}</small>
            </div>
            <button class="btn btn-danger" style="width:auto; padding:8px 15px;" onclick="cancelTicket('${b.pnr}')">Cancel Ticket</button>
        </div>`;
    });
    document.getElementById('my-bookings-list').innerHTML = html;
}

async function cancelTicket(pnr) {
    if(confirm("Are you sure you want to cancel this ticket? Seats will be returned.")) {
        const res = await fetch('/api/cancel', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ pnr: pnr }) });
        const data = await res.json();
        if(data.success) {
            alert("Ticket Cancelled Successfully!");
            loadMyBookings();
        } else alert(data.message);
    }
}

// ================= GUEST SEARCH =================
async function searchTrains() {
    const src = document.getElementById('sSrc').value;
    const dest = document.getElementById('sDest').value;
    const date = document.getElementById('sDate').value;
    if(!src || !dest || !date) return alert("Please fill Source, Destination and Date!");

    const res = await fetch(`/api/search?src=${src}&dest=${dest}&date=${date}`);
    const results = await res.json();
    let html = "<h4>Search Results:</h4>";
    results.forEach(t => {
        html += `<div class="list-item"><strong>${t.name} (${t.trainNo})</strong><br>
        <small>${t.source} ➔ ${t.dest} | Date: ${t.date} | <b style="color:#27ae60">${t.availableSeats} Seats Left</b></small></div>`;
    });
    document.getElementById('search-results').innerHTML = html || "<p style='color:red;'>No Trains Found.</p>";
}