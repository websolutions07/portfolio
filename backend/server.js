const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let db;

async function initializeDB() {
    db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullname TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            client_location TEXT NOT NULL,
            tags TEXT NOT NULL,
            url TEXT NOT NULL,
            image_url TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            tagline TEXT NOT NULL,
            description TEXT NOT NULL,
            chips TEXT NOT NULL
        );
    `);

    // Check if projects are empty and seed data
    const projectsCount = await db.get(`SELECT COUNT(*) as count FROM projects`);
    if (projectsCount.count === 0) {
        console.log('Seeding projects...');
        const projects = [
            { title: 'Vanguard Construction Group', client_location: 'Client • Austin, TX', tags: 'Commercial & Architecture,3D BIM Model View', url: 'https://vanguard-construction.us', image_url: 'assets/proj-construction.jpg' },
            { title: 'Lumina Dental Studio', client_location: 'Client • San Francisco, CA', tags: 'Cosmetic Dentistry,3D Smile Gallery', url: 'https://luminadental-sf.com', image_url: 'assets/proj-dental.jpg' },
            { title: 'PristinePro Cleaning Services', client_location: 'Client • Chicago, IL', tags: 'Commercial & Residential,Instant Quote Engine', url: 'https://pristineprocleaning.us', image_url: 'assets/proj-cleaning.jpg' }
        ];

        for (const p of projects) {
            await db.run(
                `INSERT INTO projects (title, client_location, tags, url, image_url) VALUES (?, ?, ?, ?, ?)`,
                [p.title, p.client_location, p.tags, p.url, p.image_url]
            );
        }
    }

    // Check if services are empty and seed data
    const servicesCount = await db.get(`SELECT COUNT(*) as count FROM services`);
    if (servicesCount.count === 0) {
        console.log('Seeding services...');
        const services = [
            { name: 'UI/UX & Product Design', tagline: 'UI / UX', description: 'Intuitive, human-centered digital experiences, wireframes, and interface systems crafted with precision for web and mobile platforms.', chips: 'Figma Architecture,User Flow Mapping,Wireframing,UX Research' },
            { name: 'Custom Web Design', tagline: 'WEB DESIGN', description: 'Visually stunning, bespoke website layouts tailored to elevate brand identity, engage visitors, and provide seamless responsiveness across all screen sizes.', chips: 'Bespoke Layouts,Fluid Typography,3D Asset Integration,Brand Identity' },
            { name: 'Design Systems', tagline: 'SYSTEMS', description: 'Scalable UI kits, component libraries, typography hierarchies, and design tokens that ensure visual consistency and streamlined development.', chips: 'Design Tokens,Figma Variables,Reusable UI Kits,Auto Layout 5.0' },
            { name: 'Interactive Prototyping', tagline: 'PROTOTYPE', description: 'High-fidelity interactive prototypes with dynamic micro-interactions, animations, and user flows to test, iterate, and validate design concepts.', chips: 'Micro-Interactions,60fps Motion,Clickable Prototypes,User Testing' },
            { name: 'Landing Page Optimization', tagline: 'GROWTH', description: 'High-impact, conversion-focused landing pages designed for optimal speed, visual storytelling, clear call-to-actions, and maximum engagement.', chips: 'Conversion Rate (CRO),Google Core Web Vitals,SEO Architecture,<0.8s Sub-Second Load' }
        ];

        for (const s of services) {
            await db.run(
                `INSERT INTO services (name, tagline, description, chips) VALUES (?, ?, ?, ?)`,
                [s.name, s.tagline, s.description, s.chips]
            );
        }
    }
}

// API Routes
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await db.all('SELECT * FROM projects ORDER BY id ASC');
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/services', async (req, res) => {
    try {
        const services = await db.all('SELECT * FROM services ORDER BY id ASC');
        res.json(services);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/contact', async (req, res) => {
    const { fullname, phone, email, message } = req.body;

    if (!fullname || !phone || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await db.run(
            `INSERT INTO contacts (fullname, phone, email, message) VALUES (?, ?, ?, ?)`,
            [fullname, phone, email, message]
        );
        res.status(201).json({ success: true, message: 'Message received successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

initializeDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
});
