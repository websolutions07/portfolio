require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: ['https://portfolio-frontend-uhpl.onrender.com', 'http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets if necessary (from previous server.js)
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// --- Mongoose Schemas & Models ---
const serviceSchema = new mongoose.Schema({
    title: String,
    description: String,
    icon: String,
    order: Number
});
const Service = mongoose.model('Service', serviceSchema);

const projectSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    tags: [String],
    liveUrl: String,
    githubUrl: String,
    featured: Boolean
});
const Project = mongoose.model('Project', projectSchema);

const contactSchema = new mongoose.Schema({
    fullName: String,
    mobileNo: String,
    email: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

// --- Database Connection & Seeding ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB successfully');
        await seedDatabase();
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

async function seedDatabase() {
    try {
        const serviceCount = await Service.countDocuments();
        if (serviceCount === 0) {
            console.log('Seeding Services...');
            const defaultServices = [
                { title: 'UI/UX & Product Design', description: 'Intuitive, human-centered digital experiences.', icon: 'palette', order: 1 },
                { title: 'Custom Web Design', description: 'Visually stunning, bespoke website layouts.', icon: 'code', order: 2 },
                { title: 'Design Systems', description: 'Scalable UI kits and component libraries.', icon: 'layers', order: 3 },
                { title: 'Interactive Prototyping', description: 'High-fidelity interactive prototypes.', icon: 'smartphone', order: 4 },
                { title: 'Landing Page Optimization', description: 'High-impact, conversion-focused landing pages.', icon: 'trending-up', order: 5 }
            ];
            await Service.insertMany(defaultServices);
            console.log('Services seeded successfully.');
        }

        const projectCount = await Project.countDocuments();
        if (projectCount === 0) {
            console.log('Seeding Projects...');
            const defaultProjects = [
                {
                    title: 'Vanguard Construction Group',
                    description: 'Commercial & Architecture 3D BIM Model View.',
                    image: 'assets/proj-construction.jpg',
                    tags: ['Commercial', 'Architecture'],
                    liveUrl: 'https://vanguard-construction.us',
                    githubUrl: '',
                    featured: true
                },
                {
                    title: 'Lumina Dental Studio',
                    description: 'Cosmetic Dentistry & 3D Smile Gallery.',
                    image: 'assets/proj-dental.jpg',
                    tags: ['Dentistry', '3D'],
                    liveUrl: 'https://luminadental-sf.com',
                    githubUrl: '',
                    featured: true
                },
                {
                    title: 'PristinePro Cleaning Services',
                    description: 'Commercial & Residential Instant Quote Engine.',
                    image: 'assets/proj-cleaning.jpg',
                    tags: ['Commercial', 'Residential'],
                    liveUrl: 'https://pristineprocleaning.us',
                    githubUrl: '',
                    featured: false
                }
            ];
            await Project.insertMany(defaultProjects);
            console.log('Projects seeded successfully.');
        }
    } catch (err) {
        console.error('Error seeding database:', err);
    }
}

// --- API Routes ---

// Root Health Check
app.get('/', (req, res, next) => {
    try {
        res.json({ status: "OK", message: "Portfolio Backend API is running" });
    } catch (err) {
        next(err);
    }
});

// Services API
app.get('/api/services', async (req, res, next) => {
    try {
        const services = await Service.find().sort({ order: 1, createdAt: 1 });
        res.json(services);
    } catch (err) {
        next(err);
    }
});

app.post('/api/services', async (req, res, next) => {
    try {
        const newService = new Service(req.body);
        const savedService = await newService.save();
        res.status(201).json(savedService);
    } catch (err) {
        next(err);
    }
});

// Projects API
app.get('/api/projects', async (req, res, next) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        next(err);
    }
});

app.post('/api/projects', async (req, res, next) => {
    try {
        const newProject = new Project(req.body);
        const savedProject = await newProject.save();
        res.status(201).json(savedProject);
    } catch (err) {
        next(err);
    }
});

// Contact Form API
app.post('/api/contact', async (req, res, next) => {
    try {
        const { fullName, mobileNo, email, message } = req.body;
        
        if (!fullName || !email || !message) {
            return res.status(400).json({ success: false, error: 'Please provide all required fields.' });
        }

        const newContact = new Contact({ fullName, mobileNo, email, message });
        await newContact.save();

        res.status(201).json({ success: true, message: "Message sent successfully" });
    } catch (err) {
        next(err);
    }
});

// --- Central Error-Handling Middleware ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: "Server error" });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
