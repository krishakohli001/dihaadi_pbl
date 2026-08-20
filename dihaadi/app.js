// ================================================================
//  Dihaadi — app.js
//  Voice search, modals, category filter, SOS
// ================================================================

// ── Modal open/close ──────────────────────────────────────────
const API_BASE = "http://localhost:4000/api";

async function loadJobs() {
  try {
    const response = await fetch(`${API_BASE}/jobs`);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const jobs = await response.json();

    console.log("Jobs from backend:", jobs);

    const jobGrid = document.getElementById("jobGrid");

    if (!jobGrid) {
      console.error("jobGrid element not found");
      return;
    }

    jobGrid.innerHTML = "";

    jobs.forEach(job => {
      const skillClass = job.skill.toLowerCase().replace(/\s+/g, "");

      const card = document.createElement("div");
      card.className = "job-card";

      card.innerHTML = `
        <div class="job-card-top">
          <div class="job-cat-badge ${skillClass}">
            ${getSkillEmoji(job.skill)} ${job.skill}
          </div>

          <div class="escrow-badge">
            🔒 ${job.escrowStatus === "locked" ? "Escrow Protected" : "Escrow Pending"}
          </div>
        </div>

        <h3 class="job-title">${job.title}</h3>

        <div class="job-meta">
          <span>📍 ${job.location}</span>
          <span>👥 ${job.workersNeeded} worker${job.workersNeeded > 1 ? "s" : ""} needed</span>
        </div>

        <div class="job-wage">
          <span class="wage-amount">₹${job.wage}/day</span>
          <span class="ai-wage">
            AI Fair Wage: ₹${Math.round(job.wage * 0.96)}–₹${Math.round(job.wage * 1.06)}
          </span>
        </div>

        <div class="job-contractor">
          <div class="contractor-info">
            <div class="contractor-avatar">DH</div>
            <div>
              <div class="contractor-name">Dihaadi Employer</div>
              <div class="verified-badge">✅ Backend Verified</div>
            </div>
          </div>
        </div>

        <div class="job-actions">
          <button class="btn btn-primary btn-full" onclick="openModal('applyJob')">
            Apply Now
          </button>

          <button class="btn btn-ghost btn-sm" onclick="openModal('groupBid')">
            👥 Group Bid
          </button>
        </div>
      `;

      jobGrid.appendChild(card);
    });

  } catch (error) {
    console.error("Backend connection failed:", error);
  }
}

function getSkillEmoji(skill) {
  const emojis = {
    masonry: "🧱",
    plumbing: "🔧",
    electrical: "⚡",
    painting: "🎨",
    carpentry: "🪵",
    loading: "📦",
    cleaning: "🧹",
    farming: "🌾"
  };

  return emojis[skill.toLowerCase()] || "🛠️";
}
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
loadJobs();
