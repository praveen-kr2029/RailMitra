# 🚆 RailMitra - Premium Railway Management System

RailMitra is a full-stack web application designed to simulate India's fastest rail network. It features a dual-portal system for both Administrators and Customers, allowing for real-time train management and ticket booking.

## 🚀 Live Demo
https://railmitra-1-waby.onrender.com/

## ✨ Features
- **Admin Portal:** Add new trains, delete existing routes, and increase seat capacity.
- **Customer Portal:** Secure Sign-up/Sign-in and a personal dashboard.
- **Booking System:** Generate unique PNR numbers and manage passenger details.
- **Search Engine:** Filter trains by source, destination, and date.

## 🛠️ Tech Stack
- **Frontend:** HTML5, CSS3 (Modern UI), JavaScript (ES6+)
- **Backend:** Node.js, Express.js
- **Database:** Local File System (`fs` module)

## 💻 Local Setup
To run this project on your machine:

1. **Clone the repository:**
   ```bash
   Install dependencies:

Bash
npm install
Start the server:

Bash
node server.js
Open in Browser:
Go to http://localhost:3000


---

## 2. Add a `.gitignore` File
You don't want to upload "junk" files to GitHub (like the 50MB `node_modules` folder). Create a file named `.gitignore` (yes, with a dot at the start) and add these lines:

```text
node_modules/
*.log
trains.txt
users.txt
tickets.txt
.env
├── server.js        # Express backend & API logic
├── index.html       # Main frontend UI
├── script.js        # Frontend logic & API calls
├── package.json     # Project dependencies
└── trains.txt       # Data storage (Auto-generated)
   git clone [https://github.com/your-username/RailMitra.git](https://github.com/your-username/RailMitra.git)
