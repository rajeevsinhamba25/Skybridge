/* SkyBridge Air Cargo - script.js
   Handles: mobile menu, shipment tracking (business feature),
   dashboard KPIs + charts, and the enquiry form. */

// ---------- Mobile menu ----------
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
menuToggle.addEventListener("click", () => mainNav.classList.toggle("open"));
mainNav.querySelectorAll("a").forEach(a =>
  a.addEventListener("click", () => mainNav.classList.remove("open"))
);

// ---------- Shipment data (sample) ----------
const shipments = {
  AWB1001: { customer: "Meera Pharma Pvt Ltd", route: "Ahmedabad (AMD) to Delhi (DEL)", status: "In Transit", location: "Airborne, flight SB-201", eta: "08 Oct 2026, 07:30 AM", weight: "180 kg", contact: "+91 12345 67890" },
  AWB1002: { customer: "ShopKart Retail", route: "Mumbai (BOM) to Bengaluru (BLR)", status: "Delivered", location: "Delivered at consignee warehouse", eta: "06 Oct 2026, 11:15 AM", weight: "420 kg", contact: "+91 12345 67890" },
  AWB1003: { customer: "TechParts India", route: "Delhi (DEL) to Hyderabad (HYD)", status: "Delayed", location: "Held at Delhi cargo terminal (screening)", eta: "08 Oct 2026, 02:00 PM", weight: "95 kg", contact: "+91 12345 67890" },
  AWB1004: { customer: "GreenLeaf Exports", route: "Chennai (MAA) to Kolkata (CCU)", status: "Booked", location: "Pickup scheduled", eta: "09 Oct 2026, 10:00 AM", weight: "260 kg", contact: "+91 12345 67890" }
};

const badgeClass = {
  "Delivered": "b-delivered",
  "In Transit": "b-transit",
  "Delayed": "b-delayed",
  "Booked": "b-booked"
};

// ---------- Business feature: Track shipment ----------
document.getElementById("trackForm").addEventListener("submit", e => {
  e.preventDefault();
  const id = document.getElementById("awbInput").value.trim().toUpperCase();
  const out = document.getElementById("trackResult");
  const s = shipments[id];

  if (!s) {
    out.innerHTML = `<div class="box err"><strong>No shipment found for "${escapeHtml(id)}".</strong>
      Check the AWB number or <a href="#contact">contact our team</a>.</div>`;
    return;
  }

  out.innerHTML = `
    <div class="box">
      <strong>${id}</strong> <span class="badge ${badgeClass[s.status]}">${s.status}</span>
      <dl>
        <dt>Customer</dt><dd>${s.customer}</dd>
        <dt>Route</dt><dd>${s.route}</dd>
        <dt>Current location</dt><dd>${s.location}</dd>
        <dt>Expected delivery</dt><dd>${s.eta}</dd>
        <dt>Weight</dt><dd>${s.weight}</dd>
        <dt>Support</dt><dd><a href="tel:+911234567890">${s.contact}</a></dd>
      </dl>
    </div>`;
});

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---------- Dashboard ----------
const kpiData = [
  { label: "Total Shipments", value: "1,250", cls: "" },
  { label: "Delivered", value: "1,080", cls: "good" },
  { label: "In Transit", value: "120", cls: "" },
  { label: "Delayed", value: "50", cls: "warn" },
  { label: "On-Time Delivery", value: "86.4%", cls: "good" },
  { label: "Cargo Handled (tonnes)", value: "312", cls: "" },
  { label: "Avg Turnaround", value: "26 hrs", cls: "mid" },
  { label: "Customer Satisfaction", value: "4.3 / 5", cls: "good" }
];

document.getElementById("kpis").innerHTML = kpiData
  .map(k => `<div class="kpi ${k.cls}"><div class="val">${k.value}</div><div class="lbl">${k.label}</div></div>`)
  .join("");

// Bar chart: shipments per month (pure SVG, no external library)
function drawBarChart() {
  const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  const values = [160, 185, 205, 230, 255, 215];
  const W = 520, H = 280, pad = 40;
  const max = Math.max(...values) * 1.15;
  const bw = (W - pad * 2) / values.length;

  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart of shipments per month">`;
  for (let i = 0; i <= 4; i++) {
    const y = pad + ((H - pad * 2) / 4) * i;
    const label = Math.round(max - (max / 4) * i);
    svg += `<line x1="${pad}" y1="${y}" x2="${W - pad}" y2="${y}" stroke="#d7e2ee"/>
            <text x="${pad - 6}" y="${y + 4}" font-size="11" text-anchor="end" fill="#5f6c7b">${label}</text>`;
  }
  values.forEach((v, i) => {
    const h = (v / max) * (H - pad * 2);
    const x = pad + i * bw + bw * 0.18;
    const y = H - pad - h;
    svg += `<rect x="${x}" y="${y}" width="${bw * 0.64}" height="${h}" rx="4" fill="#1565c0"/>
            <text x="${x + bw * 0.32}" y="${y - 6}" font-size="11" text-anchor="middle" fill="#0b2545">${v}</text>
            <text x="${x + bw * 0.32}" y="${H - pad + 18}" font-size="12" text-anchor="middle" fill="#5f6c7b">${months[i]}</text>`;
  });
  svg += `</svg>`;
  document.getElementById("barChart").innerHTML = svg;
}

// Donut chart: shipment status mix
function drawStatusChart() {
  const parts = [
    { name: "Delivered", v: 1080, c: "#2e8b57" },
    { name: "In Transit", v: 120, c: "#1565c0" },
    { name: "Delayed", v: 50, c: "#c0392b" }
  ];
  const total = parts.reduce((a, p) => a + p.v, 0);
  const R = 80, r = 50, cx = 110, cy = 110;
  let angle = -Math.PI / 2;
  let svg = `<svg viewBox="0 0 220 220" role="img" aria-label="Donut chart of shipment status">`;

  parts.forEach(p => {
    const a = (p.v / total) * Math.PI * 2;
    const x1 = cx + R * Math.cos(angle), y1 = cy + R * Math.sin(angle);
    const x2 = cx + R * Math.cos(angle + a), y2 = cy + R * Math.sin(angle + a);
    const x3 = cx + r * Math.cos(angle + a), y3 = cy + r * Math.sin(angle + a);
    const x4 = cx + r * Math.cos(angle), y4 = cy + r * Math.sin(angle);
    const large = a > Math.PI ? 1 : 0;
    svg += `<path d="M${x1} ${y1} A${R} ${R} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${r} ${r} 0 ${large} 0 ${x4} ${y4} Z" fill="${p.c}"/>`;
    angle += a;
  });
  svg += `<text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="22" font-weight="700" fill="#0b2545">${total.toLocaleString("en-IN")}</text>
          <text x="${cx}" y="${cy + 16}" text-anchor="middle" font-size="11" fill="#5f6c7b">shipments</text></svg>`;

  const legend = parts
    .map(p => `<span style="--c:${p.c}">${p.name}: ${p.v} (${((p.v / total) * 100).toFixed(1)}%)</span>`)
    .join("");
  document.getElementById("statusChart").innerHTML = svg + `<div class="legend">${legend}</div>`;
}

drawBarChart();
drawStatusChart();

// ---------- Enquiry form ----------
document.getElementById("enquiryForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  document.getElementById("formMsg").textContent =
    `Thank you, ${name}. Your enquiry has been received. We will reply within one working day.`;
  e.target.reset();
});
