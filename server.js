const express = require('express');

const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// --- SECURE ROUTING ---
// Instead of serving the whole folder, we only serve what the browser needs
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script.js'));
});

let trains = [];
let customers = [];
let bookings = [];

// --- FILE SAVING LOGIC ---
const updateFiles = () => {
    let tData = "TR_NO\tNAME\t\tSOURCE\tDEST\tDATE\t\tTOTAL\tAVAIL\n";
    tData += "------------------------------------------------------------\n";
    trains.forEach(t => {
        tData += `${t.trainNo}\t${t.name}\t${t.source}\t${t.dest}\t${t.date}\t${t.totalSeats}\t${t.availableSeats}\n`;
    });
    fs.writeFileSync('trains.txt', tData);

    let uData = "USERNAME\tPASSWORD\tPHONE\n----------------------------------------\n";
    customers.forEach(c => { uData += `${c.username}\t${c.password}\t${c.phone}\n`; });
    fs.writeFileSync('users.txt', uData);

    let bData = "PNR\tUSER\tTRAIN\tPASSENGERS(NAME, AGE)\n";
    bData += "------------------------------------------------------------\n";
    bookings.forEach(b => {
        let passengers = b.pDetails.map(p => `[${p.pName}, ${p.pAge}]`).join(" ");
        bData += `${b.pnr}\t${b.customerUser}\t${b.trainName}\t${passengers}\n`;
    });
    fs.writeFileSync('tickets.txt', bData);
};

// ================= ADMIN ROUTES =================
app.post('/api/admin/add', (req, res) => {
    const t = req.body;
    t.availableSeats = parseInt(t.totalSeats);
    t.totalSeats = parseInt(t.totalSeats);
    trains.push(t);
    updateFiles();
    res.json({ success: true });
});

app.post('/api/admin/delete', (req, res) => {
    const initialLength = trains.length;
    trains = trains.filter(t => t.trainNo != req.body.trainNo);
    if(trains.length < initialLength) {
        updateFiles();
        res.json({ success: true });
    } else res.json({ success: false, message: "Train not found!" });
});

app.post('/api/admin/increase', (req, res) => {
    let t = trains.find(train => train.trainNo == req.body.trainNo);
    if(t) {
        let seatsToAdd = parseInt(req.body.seats);
        t.totalSeats += seatsToAdd;
        t.availableSeats += seatsToAdd;
        updateFiles();
        res.json({ success: true });
    } else res.json({ success: false, message: "Train not found!" });
});

app.get('/api/admin/bookings', (req, res) => {
    res.json(bookings);
});

// ================= CUSTOMER ROUTES =================
app.post('/api/signup', (req, res) => {
    customers.push(req.body);
    updateFiles();
    res.json({ success: true });
});

app.post('/api/signin', (req, res) => {
    const user = customers.find(c => c.username === req.body.username && c.password === req.body.password);
    if(user) res.json({ success: true, user });
    else res.json({ success: false });
});

app.get('/api/search', (req, res) => {
    const { src, dest, date } = req.query;
    const results = trains.filter(t => 
        t.source.toLowerCase() === src.toLowerCase() && 
        t.dest.toLowerCase() === dest.toLowerCase() && 
        t.date === date
    );
    res.json(results);
});

app.post('/api/book', (req, res) => {
    const { username, trainNo, passengers } = req.body;
    let t = trains.find(train => train.trainNo == trainNo);
    
    if(t && t.availableSeats >= passengers.length) {
        t.availableSeats -= passengers.length;
        const newBooking = {
            pnr: Math.floor(10000 + Math.random() * 90000),
            customerUser: username,
            trainName: t.name,
            trainNo: t.trainNo,
            pDetails: passengers
        };
        bookings.push(newBooking);
        updateFiles();
        res.json({ success: true, pnr: newBooking.pnr });
    } else {
        res.json({ success: false, message: "Train not found or No seats available!" });
    }
});

app.get('/api/my-bookings/:user', (req, res) => {
    const myBookings = bookings.filter(b => b.customerUser === req.params.user);
    res.json(myBookings);
});

app.post('/api/cancel', (req, res) => {
    const pnr = req.body.pnr;
    const bIndex = bookings.findIndex(b => b.pnr == pnr);
    
    if(bIndex !== -1) {
        let bookingToCancel = bookings[bIndex];
        let t = trains.find(train => train.trainNo == bookingToCancel.trainNo);
        if(t) {
            t.availableSeats += bookingToCancel.pDetails.length;
        }
        bookings.splice(bIndex, 1);
        updateFiles();
        res.json({ success: true });
    } else {
        res.json({ success: false, message: "PNR not found!" });
    }
});

app.listen(PORT, () => {
    console.log("RailMitra running on port " + PORT);
});
