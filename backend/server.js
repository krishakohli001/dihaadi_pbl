const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 4000;

// =========================
// Middleware
// =========================

app.use(cors());
app.use(express.json());


// =========================
// Uploads folder
// =========================

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.use("/uploads", express.static(uploadDir));


// =========================
// SQLite Database
// =========================

const db = new Database("dihaadi.db");

db.pragma("foreign_keys = ON");


// =========================
// Create Tables
// =========================

db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        skill TEXT NOT NULL,
        location TEXT NOT NULL,
        wage REAL NOT NULL,
        workersNeeded INTEGER DEFAULT 1,
        escrowStatus TEXT DEFAULT 'not_deposited'
    );

    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jobId INTEGER NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        eshramId TEXT,
        insurance TEXT DEFAULT 'No',
        FOREIGN KEY (jobId) REFERENCES jobs(id)
    );

    CREATE TABLE IF NOT EXISTS group_bids (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jobId INTEGER NOT NULL,
        leadName TEXT NOT NULL,
        teamSize INTEGER NOT NULL,
        phones TEXT,
        FOREIGN KEY (jobId) REFERENCES jobs(id)
    );

    CREATE TABLE IF NOT EXISTS proofs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workerId INTEGER NOT NULL,
        jobId INTEGER NOT NULL,
        filePath TEXT NOT NULL,
        description TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS khata (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workerId INTEGER NOT NULL,
        jobTitle TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        proofPath TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
`);


// =========================
// Seed Jobs
// =========================

const jobCount = db
    .prepare("SELECT COUNT(*) AS count FROM jobs")
    .get();

if (jobCount.count === 0) {

    const insertJob = db.prepare(`
        INSERT INTO jobs
        (title, skill, location, wage, workersNeeded, escrowStatus)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertJob.run(
        "House Painting",
        "Painter",
        "Jaipur",
        800,
        2,
        "locked"
    );

    insertJob.run(
        "Construction Helper",
        "Construction",
        "Delhi",
        700,
        4,
        "not_deposited"
    );

    insertJob.run(
        "Electrician Required",
        "Electrician",
        "Jaipur",
        1000,
        1,
        "locked"
    );
}


// =========================
// Multer Configuration
// =========================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },

    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});

const upload = multer({ storage });


// =========================
// GET /api/health
// =========================

app.get("/api/health", (req, res) => {

    res.json({
        status: "OK",
        message: "Dihaadi backend is running"
    });

});


// =========================
// GET /api/jobs
// =========================

app.get("/api/jobs", (req, res) => {

    const jobs = db
        .prepare("SELECT * FROM jobs ORDER BY id DESC")
        .all();

    res.json(jobs);

});


// =========================
// POST /api/jobs
// =========================

app.post("/api/jobs", (req, res) => {

    const {
        title,
        skill,
        location,
        wage,
        workersNeeded
    } = req.body;

    if (!title || !skill || !location || !wage) {

        return res.status(400).json({
            error: "Missing required job details"
        });

    }

    const result = db.prepare(`
        INSERT INTO jobs
        (title, skill, location, wage, workersNeeded, escrowStatus)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(
        title,
        skill,
        location,
        Number(wage),
        Number(workersNeeded) || 1,
        "not_deposited"
    );

    const job = db
        .prepare("SELECT * FROM jobs WHERE id = ?")
        .get(result.lastInsertRowid);

    res.status(201).json(job);

});


// =========================
// POST /api/applications
// =========================

app.post("/api/applications", (req, res) => {

    const {
        jobId,
        name,
        phone,
        eshramId,
        insurance
    } = req.body;

    if (!jobId || !name || !phone) {

        return res.status(400).json({
            error: "jobId, name and phone are required"
        });

    }

    const job = db
        .prepare("SELECT * FROM jobs WHERE id = ?")
        .get(jobId);

    if (!job) {

        return res.status(404).json({
            error: "Job not found"
        });

    }

    const result = db.prepare(`
        INSERT INTO applications
        (jobId, name, phone, eshramId, insurance)
        VALUES (?, ?, ?, ?, ?)
    `).run(
        jobId,
        name,
        phone,
        eshramId || "SIMULATED",
        insurance || "No"
    );

    res.status(201).json({
        message: "Application submitted successfully",
        applicationId: result.lastInsertRowid
    });

});


// =========================
// POST /api/group-bids
// =========================

app.post("/api/group-bids", (req, res) => {

    const {
        jobId,
        leadName,
        teamSize,
        phones
    } = req.body;

    if (!jobId || !leadName || !teamSize) {

        return res.status(400).json({
            error: "jobId, leadName and teamSize are required"
        });

    }

    const result = db.prepare(`
        INSERT INTO group_bids
        (jobId, leadName, teamSize, phones)
        VALUES (?, ?, ?, ?)
    `).run(
        jobId,
        leadName,
        Number(teamSize),
        phones || ""
    );

    res.status(201).json({
        message: "Group bid submitted",
        groupBidId: result.lastInsertRowid
    });

});


// =========================
// POST /api/proofs
// =========================

app.post(
    "/api/proofs",
    upload.single("proof"),
    (req, res) => {

        if (!req.file) {

            return res.status(400).json({
                error: "Proof file is required"
            });

        }

        const {
            workerId,
            jobId,
            description
        } = req.body;

        if (!workerId || !jobId) {

            return res.status(400).json({
                error: "workerId and jobId are required"
            });

        }

        const filePath =
            `/uploads/${req.file.filename}`;

        const result = db.prepare(`
            INSERT INTO proofs
            (workerId, jobId, filePath, description)
            VALUES (?, ?, ?, ?)
        `).run(
            Number(workerId),
            Number(jobId),
            filePath,
            description || ""
        );

        // Add an entry to Digital Khata
        const job = db
            .prepare("SELECT * FROM jobs WHERE id = ?")
            .get(jobId);

        if (job) {

            db.prepare(`
                INSERT INTO khata
                (workerId, jobTitle, amount, status, proofPath)
                VALUES (?, ?, ?, ?, ?)
            `).run(
                Number(workerId),
                job.title,
                job.wage,
                "proof_submitted",
                filePath
            );

        }

        res.status(201).json({

            message: "Proof uploaded successfully",

            proof: {
                id: result.lastInsertRowid,
                workerId,
                jobId,
                filePath,
                description
            }

        });

    }
);


// =========================
// GET /api/khata/:workerId
// =========================

app.get("/api/khata/:workerId", (req, res) => {

    const workerId = Number(req.params.workerId);

    const entries = db.prepare(`
        SELECT *
        FROM khata
        WHERE workerId = ?
        ORDER BY createdAt DESC
    `).all(workerId);

    res.json(entries);

});


// =========================
// POST /api/escrow/deposit
// =========================

app.post("/api/escrow/deposit", (req, res) => {

    const { jobId } = req.body;

    const job = db
        .prepare("SELECT * FROM jobs WHERE id = ?")
        .get(jobId);

    if (!job) {

        return res.status(404).json({
            error: "Job not found"
        });

    }

    db.prepare(`
        UPDATE jobs
        SET escrowStatus = 'locked'
        WHERE id = ?
    `).run(jobId);

    res.json({

        message: "Escrow simulated successfully",

        jobId: jobId,

        escrowStatus: "locked",

        note: "This is a simulated escrow system for the project demo."

    });

});


// =========================
// POST /api/escrow/release
// =========================

app.post("/api/escrow/release", (req, res) => {

    const { jobId } = req.body;

    const job = db
        .prepare("SELECT * FROM jobs WHERE id = ?")
        .get(jobId);

    if (!job) {

        return res.status(404).json({
            error: "Job not found"
        });

    }

    db.prepare(`
        UPDATE jobs
        SET escrowStatus = 'released'
        WHERE id = ?
    `).run(jobId);

    res.json({

        message: "Escrow released successfully",

        jobId: jobId,

        escrowStatus: "released",

        note: "This is a simulated escrow release for the project demo."

    });

});


// =========================
// POST /api/fair-wage
// =========================

app.post("/api/fair-wage", (req, res) => {

    const {
        skill,
        location,
        wage
    } = req.body;

    const minimumWage = 500;

    const fair =
        Number(wage) >= minimumWage;

    res.json({

        skill,
        location,
        submittedWage: Number(wage),

        minimumRecommendedWage: minimumWage,

        fairWage: fair,

        message: fair
            ? "Wage appears fair according to simulated rules."
            : "Wage may be below the recommended amount.",

        note: "Fair wage analysis is simulated for the project demo."

    });

});


// =========================
// Start Server
// =========================

app.listen(PORT, () => {

    console.log(`
========================================
  DIHAADI BACKEND
========================================

Server running on:
http://localhost:${PORT}

API:
http://localhost:${PORT}/api/health

========================================
`);

});