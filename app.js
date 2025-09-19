/* ---------------------------- Exhibitions data ---------------------------- */
/* דוגמאות – אפשר להרחיב כרצונך. תאריכים בפורמט YYYY-MM-DD */
const EXHIBITIONS = [
  {
    id: "tlv1",
    title: "City Layers",
    artist: "Noa Ben-David",
    venue: "Tel Aviv Museum of Art",
    address: "27 Shaul Hamelech Blvd, Tel Aviv",
    lat: 32.07777, lng: 34.78644,
    startDate: "2025-09-01", endDate: "2025-12-31",
    website: "https://www.tamuseum.org.il/",
    description: "Large-scale installation exploring urban patterns and memory.",
    images: [
      "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1548092372-0d1bd40894a3?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "tlv2",
    title: "Soft Machines",
    artist: "Ariel Cohen",
    venue: "Cuckoo's Nest Gallery",
    address: "5 Shvil HaMeretz, Tel Aviv",
    lat: 32.0537, lng: 34.7646,
    startDate: "2025-09-10", endDate: "2025-11-30",
    website: "https://www.facebook.com/ckcknest/",
    description: "Kinetic sculptures that blur the line between craft and code.",
    images: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "tlv3",
    title: "Chromatic Walks",
    artist: "Maya Levi",
    venue: "Florentin 45",
    address: "45 Florentin St, Tel Aviv",
    lat: 32.0567, lng: 34.7707,
    startDate: "2025-08-20", endDate: "2025-10-30",
    website: "https://www.instagram.com/florentin45/",
    description: "Painting series inspired by daily strolls through South Tel Aviv.",
    images: [
      "https://images.unsplash.com/photo-1513351105270-0f9ffda96511?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "jer1",
    title: "Stone & Light",
    artist: "Yael Azulay",
    venue: "Israel Museum",
    address: "Ruppin Blvd, Jerusalem",
    lat: 31.7733, lng: 35.2033,
    startDate: "2025-09-05", endDate: "2026-01-15",
    website: "https://www.imj.org.il/en",
    description: "New media works dialoguing with archeology collections.",
    images: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop"
    ]
  }
];

/* ------------------------------ App state -------------------------------- */
let userLoc = null;     // {lat, lng}
let map, userMarker;
let markersLayer;

const qs = (sel) => document.querySelector(sel);
const radiusInput = qs("#radiusKm");
const radiusLabel = qs("#radiusLabel");
const locStatus   = qs("#locStatus");

/* ------------------------------ Utilities -------------------------------- */
const toRad = (deg) => deg * Math.PI / 180;
function haversineKm(a, b){
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s1 = Math.sin(dLat/2)**2 +
             Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(s1));
}
function fmtDate(iso){ return new Date(iso).toLocaleDateString(); }
function inDateRange(show, startISO, endISO){
  const s = startISO ? new Date(startISO) : null;
  const e = endISO   ? new Date(endISO)   : null;
  const a = new Date(show.startDate);
  const b = new Date(show.endDate);
  if(s && b < s) return false;
  if(e && a > e) return false;
  return true;
}

/* ------------------------------- Map init -------------------------------- */
function initMap(){
  map = L.map('map', { zoomControl:true }).setView([32.078,34.786], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom:19,
    attribution:'© OpenStreetMap'
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
}
initMap();

/* ---------------------------- Location helpers --------------------------- */
function setUserLocation(lat, lng, text = "Selected location"){
  userLoc = {lat, lng};
  if(userMarker){ userMarker.remove(); }
  userMarker = L.marker([lat,lng], {title: "You are here"}).addTo(map)
               .bindPopup(text);
  map.setView([lat,lng], 13);
  locStatus.textContent = `Location: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  render();
}

qs("#myLocBtn").addEventListener("click", () => {
  if(!navigator.geolocation){
    alert("Geolocation is not supported on this device.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos)=> setUserLocation(pos.coords.latitude, pos.coords.longitude, "My location"),
    (err)=> alert("Couldn't get your location: " + err.message),
    { enableHighAccuracy:true, timeout:10000 }
  );
});

qs("#searchAddrBtn").addEventListener("click", async () => {
  const q = qs("#addressInput").value.trim();
  if(!q){ alert("Type an address first."); return; }
  try{
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers:{'Accept-Language':'en'} });
    const data = await res.json();
    if(!data.length){ alert("Address not found."); return; }
    const { lat, lon, display_name } = data[0];
    setUserLocation(parseFloat(lat), parseFloat(lon), display_name);
  }catch(e){
    alert("Address lookup failed.");
  }
});

/* ------------------------------- Rendering ------------------------------- */
function render(){
  // update radius label
  radiusLabel.textContent = radiusInput.value;

  // clear markers & list
  markersLayer.clearLayers();
  const listEl = qs("#results");
  listEl.innerHTML = "";

  // filters
  const namePart = qs("#artistInput").value.trim().toLowerCase();
  const sDate = qs("#startDate").value || null;
  const eDate = qs("#endDate").value || null;
  const maxKm = parseInt(radiusInput.value, 10);

  const shows = EXHIBITIONS.filter(ex => {
    const matchName = !namePart || ex.artist.toLowerCase().includes(namePart) || ex.title.toLowerCase().includes(namePart);
    const matchDates = inDateRange(ex, sDate, eDate);
    const matchDist = !userLoc || haversineKm(userLoc, {lat:ex.lat,lng:ex.lng}) <= maxKm;
    return matchName && matchDates && matchDist;
  });

  // markers
  shows.forEach(ex => {
    const m = L.marker([ex.lat, ex.lng]).addTo(markersLayer);
    m.bindPopup(`<b>${ex.title}</b><br/>${ex.venue}<br/><small>${fmtDate(ex.startDate)}–${fmtDate(ex.endDate)}</small>`);
    m.on("click", () => openModal(ex));
  });

  // list
  if(!shows.length){
    listEl.innerHTML = `<div class="muted">No exhibitions match your filters.</div>`;
    return;
  }

  shows.forEach(ex => {
    const card = document.createElement("div");
    card.className = "show-card";
    card.innerHTML = `
      <div class="title">${ex.title}</div>
      <div class="meta">${ex.artist} • ${ex.venue} • ${fmtDate(ex.startDate)} – ${fmtDate(ex.endDate)}</div>
      <div class="actions">
        <button data-id="${ex.id}" class="btn btn-more">Read more</button>
        <button data-id="${ex.id}" class="btn btn-center">Center on map</button>
        <button data-artist="${ex.artist}" class="btn btn-follow">${isFollowing(ex.artist)?'Following':'Follow artist'}</button>
      </div>
    `;
    listEl.appendChild(card);
  });

  // attach actions
  listEl.querySelectorAll(".btn-more").forEach(b=>{
    b.addEventListener("click", ()=>{
      const ex = EXHIBITIONS.find(x => x.id === b.dataset.id);
      if(ex) openModal(ex);
    });
  });
  listEl.querySelectorAll(".btn-center").forEach(b=>{
    b.addEventListener("click", ()=>{
      const ex = EXHIBITIONS.find(x => x.id === b.dataset.id);
      if(ex){ map.setView([ex.lat, ex.lng], 15); }
    });
  });
  listEl.querySelectorAll(".btn-follow").forEach(b=>{
    b.addEventListener("click", ()=>{
      toggleFollow(b.dataset.artist);
      b.textContent = isFollowing(b.dataset.artist) ? 'Following' : 'Follow artist';
    });
  });
}

/* --------------------------- Modal (details) ----------------------------- */
const modal = qs("#modal");
const modalTitle = qs("#modalTitle");
const modalMeta  = qs("#modalMeta");
const modalDesc  = qs("#modalDesc");
const modalGallery = qs("#modalGallery");
const followBtn = qs("#followBtn");
const navigateBtn = qs("#navigateBtn");
const websiteBtn = qs("#websiteBtn");

qs("#modalClose").addEventListener("click", closeModal);
modal.addEventListener("click", (e)=>{ if(e.target === modal) closeModal(); });

let modalEx = null;

function openModal(ex){
  modalEx = ex;
  modalTitle.textContent = `${ex.title} — ${ex.artist}`;
  modalMeta.textContent  = `${ex.venue} · ${fmtDate(ex.startDate)} – ${fmtDate(ex.endDate)}`;
  modalDesc.textContent  = ex.description || "";
  modalGallery.innerHTML = ex.images.map(src=>`<img src="${src}" alt="">`).join("");

  followBtn.textContent = isFollowing(ex.artist) ? "Following" : "Follow artist";
  followBtn.onclick = () => {
    toggleFollow(ex.artist);
    followBtn.textContent = isFollowing(ex.artist) ? "Following" : "Follow artist";
  };

  navigateBtn.href = `https://www.google.com/maps?q=${encodeURIComponent(ex.venue)}@${ex.lat},${ex.lng}`;
  websiteBtn.href   = ex.website || "#";

  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");
}
function closeModal(){
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden","true");
  modalEx = null;
}

/* --------------------------- Followed artists ---------------------------- */
const FOLLOW_KEY = "iseeeee_follow_artists";
function getFollowed(){
  try{
    return JSON.parse(localStorage.getItem(FOLLOW_KEY) || "[]");
  }catch{ return []; }
}
function isFollowing(name){
  return getFollowed().includes(name);
}
function toggleFollow(name){
  const arr = getFollowed();
  const i = arr.indexOf(name);
  if(i>=0){ arr.splice(i,1); } else { arr.push(name); }
  localStorage.setItem(FOLLOW_KEY, JSON.stringify(arr));
}

/* ------------------------------ Listeners -------------------------------- */
radiusInput.addEventListener("input", render);
qs("#filterBtn").addEventListener("click", render);

/* פרה־רינדור */
render();
