// app.js – גרסה בטוחה שלא שוברת אם יש כבר EXHIBITIONS
console.log("app.js loaded v66");

// אם כבר יש לך EXHIBITIONS מוגדרת איפשהו – נשתמש בה.
// אחרת נשים כמה דוגמאות כדי שהמפה תעלה.
const EXHIBITIONS = (window.EXHIBITIONS && Array.isArray(window.EXHIBITIONS) && window.EXHIBITIONS.length)
  ? window.EXHIBITIONS
  : [
      {id:"demo-1", title:"New Forms", artist:"Maya Cohen", venue:"Tel Aviv Museum of Art",
       address:"Shaul HaMelech 27", coords:[32.0776,34.7864], start:"2025-01-15", end:"2025-04-10",
       images:["https://picsum.photos/seed/tlv001/800/500"]},
      {id:"demo-2", title:"Light Mechanics", artist:"Omer Levi", venue:"Helena Rubinstein Pavilion",
       address:"Tarsat 6", coords:[32.0737,34.7834], start:"2025-02-01", end:"2025-05-01",
       images:["https://picsum.photos/seed/tlv002/800/500"]},
      {id:"demo-3", title:"Coastal Lines", artist:"Yael Katz", venue:"Eretz Israel Museum (MUZA)",
       address:"Haim Levanon 2", coords:[32.1008,34.8044], start:"2025-03-05", end:"2025-06-20",
       images:["https://picsum.photos/seed/tlv003/800/500"]}
    ];

// -------- Map --------
const map = L.map('map', { zoomControl: true }).setView([32.08, 34.78], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

// שכבת מרקרים
const markers = L.layerGroup().addTo(map);

// ציור תערוכות על המפה
function renderExhibitions(list) {
  markers.clearLayers();
  list.forEach(ex => {
    const m = L.marker(ex.coords).addTo(markers);
    const imgs = (ex.images || []).map(src => `<img src="${src}" style="width:100%;margin:6px 0;border:1px solid #000;border-radius:8px">`).join("");
    m.bindPopup(`
      <div style="min-width:220px">
        <div style="font-weight:900">${ex.title}</div>
        <div>${ex.artist}</div>
        <div style="font-style:italic">${ex.venue}</div>
        <div>${ex.address || ""}</div>
        <div style="margin:6px 0">${ex.start || ""} → ${ex.end || ""}</div>
        ${imgs}
        <button onclick="followArtist('${ex.artist.replace(/'/g,"&#39;")}')"
                style="border:2px solid #000;border-radius:8px;padding:6px 10px;background:#fff;font-weight:800;cursor:pointer">
          Follow ${ex.artist}
        </button>
      </div>
    `);
  });
}
renderExhibitions(EXHIBITIONS);

// כפתור "עקוב אחרי אמן" (שמירה ב-localStorage להדגמה)
window.followArtist = function(artist) {
  const key = "followedArtists";
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  if (!list.includes(artist)) {
    list.push(artist);
    localStorage.setItem(key, JSON.stringify(list));
    alert(`You are now following ${artist}`);
  } else {
    alert(`You already follow ${artist}`);
  }
};

// --- מיקום משתמש / חיפוש כתובת ---
const statusEl = document.getElementById('status');
document.getElementById('btnMyLoc').onclick = () => {
  statusEl.textContent = "Getting your location…";
  if (!navigator.geolocation) {
    statusEl.textContent = "Geolocation not supported";
    return;
  }
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    const here = [latitude, longitude];
    map.setView(here, 14);
    L.circleMarker(here, { radius:8, color:"#000", weight:2, fill:true, fillOpacity:1 }).addTo(map).bindPopup("You are here").openPopup();
    statusEl.textContent = `Location set`;
  }, err => {
    statusEl.textContent = "Location denied";
    console.error(err);
  });
};

document.getElementById('btnSearchAddr').onclick = async () => {
  const q = (document.getElementById('addr').value || "").trim();
  if (!q) return;
  statusEl.textContent = "Searching address…";
  try {
    // שימוש ב-Nominatim (OSM) – שירות חינמי
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { 'Accept-Language':'he' }});
    const data = await res.json();
    if (!data.length) { statusEl.textContent = "Address not found"; return; }
    const { lat, lon, display_name } = data[0];
    const p = [parseFloat(lat), parseFloat(lon)];
    map.setView(p, 14);
    L.marker(p).addTo(map).bindPopup(display_name).openPopup();
    statusEl.textContent = "Address located";
  } catch(e) {
    console.error(e);
    statusEl.textContent = "Address search failed";
  }
};
