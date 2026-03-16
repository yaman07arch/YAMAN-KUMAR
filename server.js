// server.js - The Main Back-End Application
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize the Express app
const app = express();

// Middleware to allow our front-end to talk to our back-end and read JSON data
app.use(cors());
app.use(express.json());

// Serve the front-end (static site)
app.use(express.static(path.join(__dirname, '/')));

// Connect to a MongoDB Database (Replace with your actual MongoDB URI later)
mongoose.connect('mongodb://localhost:27017/doctorDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to the Professional Database!"))
  .catch(err => console.error("Database connection error:", err));

// Define the "Blueprint" (Schema) for a Doctor Record
const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialty: { type: String, required: true },
    contact: { type: String, required: true }
});

// Create the Database Model
const Doctor = mongoose.model('Doctor', doctorSchema);

// --- API ROUTES (The Endpoints your Front-End will talk to) ---

// 1. GET Route: Send all doctor records to the front-end
app.get('/api/doctors', async (req, res) => {
    try {
        const doctors = await Doctor.find(); // Fetches all records from MongoDB
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: "Error fetching records" });
    }
});

// 2. POST Route: Receive new doctor data from the front-end and save it
app.post('/api/doctors', async (req, res) => {
    try {
        const newDoctor = new Doctor({
            name: req.body.name,
            specialty: req.body.specialty,
            contact: req.body.contact
        });

        const savedDoctor = await newDoctor.save(); // Saves the new record to MongoDB
        res.status(201).json(savedDoctor);
    } catch (error) {
        res.status(400).json({ message: "Error saving the record" });
    }
});

// Start the server and listen for requests on port 5000
const PORT = process.env.PORT || 5000;
// Fallback for SPA routes (keeps client-side routing working for clean URLs)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running and listening on http://localhost:${PORT}`);
});