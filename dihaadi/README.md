# Dihaadi ⚒️ — AI-Powered Daily Wage Labour Platform

> Connecting India's 500 million daily wage workers with employers — eliminating middlemen, preventing wage theft, and building verifiable work reputations for informal workers.

**Live Demo:** https://krishakohli001.github.io/pbl_project2427030094-dihaadi/

---

## The Problem

India's daily wage workers — masons, plumbers, electricians, painters — have no digital identity, no protection against wage theft, and no way to prove their skills. The current "system" is standing at a chowk at 6am and hoping a contractor shows up.

**Dihaadi replaces luck with technology.**

---

## What I Built

A mobile-first web application with four integrated systems:

### 🔒 Escrow Payment System
Employer deposits wages before work starts. GPS marks check-in and check-out. Money releases automatically — zero wage theft possible.

### 🏆 Skill Badge Gamification + AI Fair Wage
Complete 10 jobs with 4+ stars → earn "Certified Master" badge → AI automatically suggests 10% higher fair wage. Workers build reputation that compounds over time.

### 👥 Group Bidding (Toli System)
Most daily wage jobs need a "Toli" (team). One lead worker bids for a group of up to 10 — no need for 5 separate registrations. The whole team gets the job together.

### 📸 Proof of Work
Upload a 5-second video or photo of completed work after every job. Builds a visual portfolio in the Digital Khata. Better portfolio = more job offers = higher wages.

### 🛡️ Micro-Insurance
₹5/day accidental coverage. Active only during GPS-registered shift hours. One toggle. Linked to e-Shram ID. No paperwork.

### 🎤 Voice Search (Hindi)
Workers say "Mujhe masonry ka kaam chahiye" — app finds nearby jobs instantly. No typing required. Supports Hindi (hi-IN) via Web Speech API.

### 📊 Digital Khata
Every job, every payment, every proof upload — permanently recorded. Works like a bank statement + portfolio in one.

---

## Features

| Feature | Status |
|---|---|
| Voice search (Hindi) | ✅ Live |
| Job listings with AI Fair Wage | ✅ Live |
| Escrow payment badges | ✅ Live |
| Worker profiles + skill badges | ✅ Live |
| Group bidding (Toli) | ✅ Live |
| Proof of work upload UI | ✅ Live |
| Digital Khata | ✅ Live |
| Micro-insurance toggle | ✅ Live |
| Emergency SOS with GPS | ✅ Live |
| Verified contractor badges | ✅ Live |
| Multilingual toggle (HI/EN) | ✅ Live |
| Firebase backend | 🔜 Phase 2 |
| Real GPS escrow release | 🔜 Phase 2 |
| Razorpay payment integration | 🔜 Phase 2 |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Voice | Web Speech API (native browser) |
| Location | Navigator.geolocation (native) |
| Fonts | Cabinet Grotesk + Instrument Sans |
| Hosting | GitHub Pages |
| Database (planned) | Firebase Firestore |
| Payments (planned) | Razorpay Escrow API |
| Insurance (planned) | ACKO API |

**Why no framework?** Daily wage workers use budget phones with weak browsers. Vanilla JS loads in 0.3s vs 3s for React. Every kilobyte matters when you're on 2G.

---

## Design Decisions

### Mobile-First, High Contrast
- Minimum 44px tap targets (thumb-friendly)
- Dark background: OLED battery-efficient
- 7.2:1 contrast ratio — exceeds WCAG AA
- Large text, icon-heavy navigation

### Dark Theme
```css
:root {
  --bg:    #080810;  /* Deep dark — OLED-efficient */
  --amber: #f59e0b;  /* Primary CTA — maximum visibility */
  --green: #10b981;  /* Paid/success states */
  --red:   #f43f5e;  /* SOS/danger */
}
```

### Navigation Architecture
Emergency SOS moved to a collapsible top bar — keeps the main navigation focused on the core job: **finding work**.

---

## Project Structure

```
dihaadi/
├── index.html     ← Complete single-page application
├── style.css      ← Full design system (dark theme)
├── app.js         ← Voice search, modals, filters, SOS
├── README.md      ← This file
└── REPORT.md      ← Full project report
```

---

## Running Locally

```bash
git clone https://github.com/krishakohli001/pbl_project2427030094-dihaadi.git
cd pbl_project2427030094-dihaadi

# Open index.html with Live Server (VS Code)
# OR just double-click index.html
```

No build step. No npm. No dependencies. Just open and run.

---

## Impact

| Metric | Value |
|---|---|
| Target users | 500 million daily wage workers |
| Wage theft prevented | ₹45,000 crore/year (national estimate) |
| Insurance gap | 25 million uninsured accidents/year |
| Addressable market | Construction, farming, manufacturing, services |

---

## Roadmap

**Phase 1 (Current):** Frontend MVP — all features visible and interactive
**Phase 2:** Firebase backend, real GPS escrow, Razorpay payments
**Phase 3:** ACKO insurance API, e-Shram verification, Android app

---

## 👩‍💻 Developer

**Krisha Kohli**
B.Tech Computer Science — Manipal University Jaipur
Roll No: 2427030094

---

## License

MIT License — open source, free to use and build upon.
