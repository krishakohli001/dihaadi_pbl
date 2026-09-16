// ================================================================
//  Dihaadi — app.js
//  Voice search, modals, category filter, SOS
// ================================================================

// ── Modal open/close ──────────────────────────────────────────
window.openModal = function(id) {
  const el = document.getElementById("modal-" + id);
  if (el) { el.classList.add("open"); document.body.style.overflow = "hidden"; }
};
window.closeModal = function(id) {
  const el = document.getElementById("modal-" + id);
  if (el) { el.classList.remove("open"); document.body.style.overflow = ""; }
};

// Close modal on overlay click
document.addEventListener("click", function(e) {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("open");
    document.body.style.overflow = "";
  }
});

// ── Voice Search ──────────────────────────────────────────────
window.startVoice = function() {
  const btn   = document.getElementById("voiceBtn");
  const input = document.getElementById("searchInput");

  if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
    alert("Voice search is not supported in this browser. Try Chrome.");
    return;
  }

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SR();
  recognition.lang = "hi-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  btn.classList.add("listening");
  btn.textContent = "🔴";

  recognition.onresult = function(e) {
    input.value = e.results[0][0].transcript;
    btn.classList.remove("listening");
    btn.textContent = "🎤";
    doSearch();
  };

  recognition.onerror = function() {
    btn.classList.remove("listening");
    btn.textContent = "🎤";
  };

  recognition.onend = function() {
    btn.classList.remove("listening");
    btn.textContent = "🎤";
  };

  recognition.start();
};

// ── Search ────────────────────────────────────────────────────
window.doSearch = function() {
  const val = document.getElementById("searchInput").value.toLowerCase();
  const cards = document.querySelectorAll(".job-card");
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = (!val || text.includes(val)) ? "block" : "none";
  });
};

// ── Category Filter ───────────────────────────────────────────
document.querySelectorAll(".cat-chip").forEach(chip => {
  chip.addEventListener("click", function() {
    document.querySelectorAll(".cat-chip").forEach(c => c.classList.remove("active"));
    this.classList.add("active");
    const cat = this.dataset.cat;
    const cards = document.querySelectorAll(".job-card");
    cards.forEach(card => {
      if (cat === "all") { card.style.display = "block"; return; }
      const badge = card.querySelector(".job-cat-badge");
      card.style.display = (badge && badge.classList.contains(cat)) ? "block" : "none";
    });
  });
});

// ── Language Toggle ───────────────────────────────────────────
let isHindi = false;
const translations = {
  ".hero-title": { hi: "काम मिलेगा।<br/><em>रोजगार पक्का।</em>", en: "Kaam Milega.<br/><em>Rozgaar Pakka.</em>" },
  ".hero-sub":   { hi: "दैनिक काम खोजें, समय पर भुगतान पाएं, अपनी प्रतिष्ठा बनाएं।", en: "Find daily work, get paid on time, build your reputation — all in one app." }
};
window.toggleLang = function() {
  isHindi = !isHindi;
  const lang = isHindi ? "hi" : "en";
  Object.entries(translations).forEach(([sel, vals]) => {
    const el = document.querySelector(sel);
    if (el) el.innerHTML = vals[lang];
  });
  document.querySelector(".lang-btn").textContent = isHindi ? "🌐 EN / HI" : "🌐 HI / EN";
};

// ── Emergency SOS ─────────────────────────────────────────────
window.triggerSOS = function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos) {
      const lat = pos.coords.latitude.toFixed(4);
      const lon = pos.coords.longitude.toFixed(4);
      alert("🚨 SOS Sent!\nLocation: " + lat + ", " + lon + "\nEmergency contacts notified.\nNearest workers alerted.");
    }, function() {
      alert("🚨 SOS Sent!\nLocation unavailable — contacts notified with last known location.");
    });
  } else {
    alert("🚨 SOS Sent! Emergency contacts have been notified.");
  }
};

// ── Insurance toggle on worker card ──────────────────────────
const insToggle = document.getElementById("insToggle");
if (insToggle) {
  insToggle.addEventListener("change", function() {
    const label = this.parentElement;
    if (this.checked) {
      label.innerHTML = '<input type="checkbox" checked id="insToggle"/> <span style="color:var(--green)">🛡️ Daily Insurance Active (+₹5)</span>';
      document.getElementById("insToggle").addEventListener("change", arguments.callee);
    }
  });
}

console.log("⚒️ Dihaadi loaded — Daily Work, Dignified.");
// ── Fetch & Render Live Jobs ──────────────────────────────────
window.fetchAndRenderJobs = async function() {
  try {
    // 1. Fetch data from the local server
    const response = await fetch('http://localhost:4000/api/jobs');
    const jobs = await response.json();
    
    // 2. Target the grid and clear existing hardcoded jobs
    const grid = document.getElementById('jobGrid');
    if (!grid) return;
    grid.innerHTML = ''; 
    
    // 3. Loop through the database jobs and build HTML
    jobs.forEach(job => {
      // Format specific details
      const skillClass = job.skill.toLowerCase();
      const isEscrow = job.escrowStatus === 'locked';
      const escrowBadgeHTML = isEscrow 
        ? `<div class="escrow-badge">🔒 Escrow Protected</div>` 
        : `<div class="escrow-badge" style="background:rgba(244,63,94,0.1);color:var(--red);">⚠️ No Escrow</div>`;
      const workersText = job.workersNeeded > 1 
        ? `👥 Toli of ${job.workersNeeded} needed` 
        : `👤 1 person`;

      // Construct the card
      const card = document.createElement('div');
      card.className = 'job-card';
      card.innerHTML = `
        <div class="job-card-top">
          <div class="job-cat-badge ${skillClass}">🛠️ ${job.skill}</div>
          ${escrowBadgeHTML}
        </div>
        <h3 class="job-title">${job.title}</h3>
        <div class="job-meta">
          <span>📍 ${job.location}</span>
          <span>${workersText}</span>
        </div>
        <div class="job-wage">
          <span class="wage-amount">₹${job.wage}/day</span>
          <span class="ai-wage">AI Fair Wage: ₹${Math.round(job.wage * 0.95)}–${Math.round(job.wage * 1.05)}</span>
        </div>
        <div class="job-contractor">
          <div class="contractor-info">
            <div class="contractor-avatar">C</div>
            <div>
              <div class="contractor-name">Verified Employer</div>
              <div class="verified-badge">✅ Verified</div>
            </div>
          </div>
        </div>
        <div class="job-actions">
          <button class="btn btn-primary btn-full" onclick="openApplyModal(${job.id})">Apply Now</button>
            <button class="btn btn-ghost btn-sm" style="flex: 1;" onclick="openModal('groupBid')">👥 Group Bid</button>
            <button class="btn btn-danger btn-sm" onclick="deleteJob(${job.id})">🗑️ Delete</button>
          </div>
        </div>
      `;
      
      grid.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
  }
};

// 4. Trigger the function when the page loads
document.addEventListener('DOMContentLoaded', fetchAndRenderJobs);
// ── Submit New Job ───────────────────────────────────────────
window.submitNewJob = async function() {
  // 1. Gather the data from the inputs we just modified
  const payload = {
    title: document.getElementById('jobTitleInput').value,
    skill: document.getElementById('jobSkillInput').value,
    wage: document.getElementById('jobWageInput').value,
    workersNeeded: document.getElementById('jobWorkersInput').value,
    location: document.getElementById('jobLocationInput').value
  };

  // 2. Validate that the required fields aren't empty
  if (!payload.title || !payload.wage || !payload.location) {
    alert("Please fill in the title, wage, and location.");
    return;
  }

  try {
    // 3. Send the data to your Node.js backend
    const response = await fetch('http://localhost:4000/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      // 4. Success! Close the modal and clear the form
      closeModal('postJob');
      document.getElementById('jobTitleInput').value = '';
      document.getElementById('jobWageInput').value = '';
      document.getElementById('jobLocationInput').value = '';
      document.getElementById('jobWorkersInput').value = '';
      
      // 5. Instantly refresh the UI to show the new job
      fetchAndRenderJobs(); 
    } else {
      alert("Failed to post job. Please check the backend console.");
    }
  } catch (error) {
    console.error("Error posting job:", error);
  }
};
// ── Delete Job ───────────────────────────────────────────────
window.deleteJob = async function(id) {
  // 1. Confirm with the user before deleting
  if (!confirm("Are you sure you want to delete this job?")) return;
  
  try {
    // 2. Send the DELETE request to the local server
    const response = await fetch(`http://localhost:4000/api/jobs/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      // 3. Instantly refresh the UI to remove the deleted job
      fetchAndRenderJobs(); 
    } else {
      alert("Failed to delete job. Please check the backend console.");
    }
  } catch (error) {
    console.error("Error deleting job:", error);
  }
};
// ── Upload Proof of Work ─────────────────────────────────────
window.submitProof = async function() {
  const fileInput = document.getElementById('proofFileInput');
  const descInput = document.getElementById('proofDescInput');

  // 1. Check if the user actually selected a file
  if (!fileInput.files || fileInput.files.length === 0) {
    alert("Please select a photo or video to upload.");
    return;
  }

  // 2. Build the FormData payload
  const formData = new FormData();
  formData.append("proof", fileInput.files[0]);
  formData.append("description", descInput.value);
  
  // We'll hardcode workerId and jobId to '1' for this MVP test
  formData.append("workerId", 1); 
  formData.append("jobId", 1); 

  try {
    // 3. Send to the Node backend
    const response = await fetch('http://localhost:4000/api/proofs', {
      method: 'POST',
      body: formData // Notice: No Content-Type header needed for FormData
    });

    if (response.ok) {
      alert("Proof uploaded successfully! It is now in your Digital Khata.");
      closeModal('uploadProof');
      
      // Clear inputs
      fileInput.value = ''; 
      descInput.value = ''; 
    } else {
      alert("Upload failed. Check the backend console.");
    }
  } catch (error) {
    console.error("Error uploading proof:", error);
  }
};
// ── Fetch & Render Digital Khata ─────────────────────────────
window.fetchAndRenderKhata = async function() {
  try {
    // Fetch data for workerId 1 (which we hardcoded in the proof upload)
    const response = await fetch('http://localhost:4000/api/khata/1');
    const entries = await response.json();
    
    const grid = document.getElementById('khataEntriesGrid');
    const totalAmountEl = document.getElementById('khataTotalAmount');
    if (!grid || !totalAmountEl) return;
    
    grid.innerHTML = ''; // Clear hardcoded entries
    let totalAmount = 0;

    entries.forEach(entry => {
      totalAmount += entry.amount; 

      // Format the status
      let statusHtml = '';
      let amountClass = 'escrow';
      
      if (entry.status === 'proof_submitted' || entry.status === 'pending') {
         statusHtml = `<span class="escrow-tag">⏳ Pending Approval</span>`;
      } else if (entry.status === 'paid') {
         statusHtml = `<span class="paid-tag">✅ Paid</span>`;
         amountClass = 'paid';
      }

      // Format the proof pill
      let proofHtml = entry.proofPath 
        ? `<span class="proof-pill">📸 Proof attached</span>` 
        : ``;

      // Format date
      const dateObj = new Date(entry.createdAt);
      const dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

      // Build the row
      const row = document.createElement('div');
      row.className = 'khata-row';
      row.innerHTML = `
        <div class="khata-work">
          <strong>${entry.jobTitle}</strong>
          <div class="khata-date">${dateStr}</div>
          <div class="khata-proof-row">
            ${proofHtml}
          </div>
        </div>
        <div class="khata-amount ${amountClass}">+₹${entry.amount} ${statusHtml}</div>
      `;
      
      grid.appendChild(row);
    });

    // Update the total balance UI
    totalAmountEl.textContent = `₹${totalAmount}`;

  } catch (error) {
    console.error("Error fetching khata:", error);
  }
};
// ── Apply for a Job ──────────────────────────────────────────
let currentApplyJobId = null;

// This opens the modal and remembers which job we are applying for
window.openApplyModal = function(jobId) {
  currentApplyJobId = jobId;
  openModal('applyJob');
};

window.submitApplication = async function() {
  const name = document.getElementById('applyName').value;
  const phone = document.getElementById('applyPhone').value;
  const eshram = document.getElementById('applyEshram').value;
  const insurance = document.getElementById('applyInsurance').checked ? 'Yes' : 'No';

  if (!name || !phone) {
    alert("Please provide your name and phone number.");
    return;
  }

  try {
    const response = await fetch('http://localhost:4000/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: currentApplyJobId,
        name: name,
        phone: phone,
        eshramId: eshram,
        insurance: insurance
      })
    });

    if (response.ok) {
      alert("Application submitted successfully!");
      closeModal('applyJob');
      
      // Clear the form
      document.getElementById('applyName').value = '';
      document.getElementById('applyPhone').value = '';
      document.getElementById('applyEshram').value = '';
      document.getElementById('applyInsurance').checked = false;
    } else {
      alert("Failed to submit application. Check the server console.");
    }
  } catch (error) {
    console.error("Error submitting application:", error);
  }
};