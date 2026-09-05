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

// Define the "Blueprint" (Schema) for a Patient Record
const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true, min: 0 },
    condition: { type: String, required: true },
    outcome: { type: String, enum: ['ongoing', 'successful', 'unsuccessful'], default: 'ongoing' },
    createdAt: { type: Date, default: Date.now }
});

// Create the Database Models
const Doctor = mongoose.model('Doctor', doctorSchema);
const Patient = mongoose.model('Patient', patientSchema);

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

// 3. GET Route: Send all patient records to the front-end
app.get('/api/patients', async (req, res) => {
    try {
        const patients = await Patient.find().sort({ createdAt: -1 });
        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({ message: "Error fetching patient records" });
    }
});

// 4. POST Route: Receive new patient data from the front-end and save it
app.post('/api/patients', async (req, res) => {
    try {
        // Validate input
        if (!req.body.name || !req.body.age || !req.body.condition) {
            return res.status(400).json({ message: "Please fill in all required fields" });
        }
        
        const newPatient = new Patient({
            name: req.body.name,
            age: req.body.age,
            condition: req.body.condition,
            outcome: req.body.outcome || 'ongoing'
        });

        const savedPatient = await newPatient.save();
        res.status(201).json(savedPatient);
    } catch (error) {
        res.status(400).json({ message: "Error saving patient record" });
    }
});

// 5. PATCH Route: Update a patient's outcome
app.patch('/api/patients/:id', async (req, res) => {
    try {
        const updatedPatient = await Patient.findByIdAndUpdate(
            req.params.id,
            { outcome: req.body.outcome },
            { new: true }
        );
        
        if (!updatedPatient) {
            return res.status(404).json({ message: "Patient not found" });
        }
        
        res.status(200).json(updatedPatient);
    } catch (error) {
        res.status(400).json({ message: "Error updating patient record" });
    }
});

// 6. DELETE Route: Remove a patient record
app.delete('/api/patients/:id', async (req, res) => {
    try {
        const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
        
        if (!deletedPatient) {
            return res.status(404).json({ message: "Patient not found" });
        }
        
        res.status(200).json({ message: "Patient deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: "Error deleting patient record" });
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