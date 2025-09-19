// --- Mock data (real-ish Tel Aviv locations) ---
const EXHIBITIONS = [
  {
    id: 'tlv-1',
    title: 'Light & Dust',
    artist: ['Sigalit Landau'],
    venue: 'Tel Aviv Museum of Art — Herta & Paul Amir Building',
    address: '27 Shaul Hamelech Blvd, Tel Aviv',
    coords: [32.077106, 34.786635],
    start: '2025-09-01',
    end: '2025-10-31',
    images: [
      'https://images.unsplash.com/photo-1529101091764-c3526daf38fe?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop'
    ]
  },
  {
    id: 'tlv-2',
    title: 'Strata / Layers',
    artist: ['Michal Rovner'],
    venue: 'Helena Rubinstein Pavilion',
    address: '6 Tarsat Ave, Tel Aviv',
    coords: [32.074842, 34.781638],
    start: '2025-08-15',
    end: '2025-11-10',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1600&auto=format&fit=crop'
    ]
  },
  {
    id: 'tlv-3',
    title: 'Analog Echo',
    artist: ['Guy Yanai'],
    venue: 'Rothschild 69 — Gallery Cluster',
    address: '69 Rothschild Blvd, Tel Aviv',
    coords: [32.0649, 34.7742],
    start: '2025-09-10',
    end: '2025-10-20',
    images: [
      'https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1520697222862-79bcdfe9c4ee?q=80&w=1600&auto=format&fit=crop'
    ]
  },
  {
    id: 'tlv-4',
    title: 'Material Poems',
    artist: ['Nelly Agassi'],
    venue: 'Gordon Gallery',
    address: '5 Hapelech St, Tel Aviv',
    coords: [32.05885, 34.7702],
    start: '2025-09-05',
    end: '2025-12-05',
    images: [
      'https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517697471339-4aa32003c11a?q=80&w=1600&auto=format&fit=crop'
    ]
  },
  {
    id: 'tlv-5',
    title: 'Urban Skin',
    artist: ['Tsibi Geva'],
    venue: 'Dvir Gallery',
    address: '4 Hapelech St, Tel Aviv',
    coords: [32.05845, 34.7707],
    start: '2025-08-20',
    end: '2025-10-25',
    images: [
      'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop'
    ]
  },
  {
    id: 'tlv-6',
    title: 'Studio Dreams',
    artist: ['Rami Maymon'],
    venue: 'RawArt Gallery (Kiryat Hamelacha)',
    address: '3 HaAmal St, Tel Aviv',
    coords: [32.0506, 34.7726],
    start: '2025-09-12',
    end: '2025-11-30',
    images: [
      'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop'
    ]
  }
];

// --- Helpers ---
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function kmDistance(a, b){
  const [lat1,lon1] = a, [lat2,lon2] = b;
  const R = 6371;
  const dLat = (lat2-lat1)*Math.PI/180;
  const dLon = (lon2-lon1)*Math.PI/180;
  const s1 = Math.sin(dLat/2)*Math.sin(dLat/2);
  const s2 = Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
  return 2*R*Math.asin(Math.sqrt(s1+s2));
}

function inRange(d, a, b){
  const x = new Date(d).getTime();
  return (!a || x>=new Date(a).getTime()) && (!b || x<=new Date(b).getTime());
}

// --- Map ---
let map, userMarker, markersLayer;
function initMap(){
  map = L.map('map', { zoomControl:true, scrollWheelZoom:true }).setView([32.066,34.777], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:'© OpenStreetMap'
  }).addTo(map);

  // locate control
  const locate = L.control({position:'topleft'});
  locate.onAdd = function(){
    const div = L.DomUtil.create('div','leaflet-control-locate');
    div.textContent = 'My location';
    div.onclick = () => getMyLocation(true);
    return div;
  };
  locate.addTo(map);

  markersLayer = L.layerGroup().addTo(map);
}

function setUserMarker(latlng){
  if(!userMarker){
    const catIcon = L.divIcon({
      className:'',
      html:`<div style="font-size:26px">🐈</div>`
    });
    userMarker = L.marker(latlng,{icon:catIcon}).addTo(map);
  }else{
    userMarker.setLatLng(latlng);
  }
}

function render(exhibitions, center){
  markersLayer.clearLayers();
  $('#list').innerHTML = '';

  exhibitions.forEach(ex => {
    // marker
    const m = L.marker(ex.coords).addTo(markersLayer);
    m.bindPopup(`<b>${ex.title}</b><br>${ex.venue}`);
    m.on('click', () => openModal(ex));

    // list card
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
      <h3>${ex.title}</h3>
      <div class="muted">${ex.artist.join(', ')}</div>
      <div class="address">${ex.venue}</div>
      <div class="muted">${ex.start} → ${ex.end}</div>
      <div style="margin-top:8px"><span class="badge">details</span></div>
    `;
    el.addEventListener('click', () => openModal(ex));
    $('#list').appendChild(el);
  });

  if(center) map.setView(center, 13);
}

function openModal(ex){
  const body = $('#modalBody');
  body.innerHTML = `
    <h2 style="margin-top:0">${ex.title}</h2>
    <div class="muted">${ex.artist.join(', ')}</div>
    <div class="address">${ex.venue} — ${ex.address}</div>
    <div class="muted">${ex.start} → ${ex.end}</div>
    <div class="gallery">
      <button id="prevImg">‹</button>
      <img id="galImg" src="${ex.images[0]}" alt="${ex.title}" />
      <button id="nextImg">›</button>
    </div>
    <p><button class="primary" id="dirBtn">Open in Maps</button></p>
  `;
  let idx = 0;
  const update = ()=> $('#galImg').src = ex.images[idx];
  $('#prevImg').onclick = ()=>{ idx=(idx-1+ex.images.length)%ex.images.length; update(); };
  $('#nextImg').onclick = ()=>{ idx=(idx+1)%ex.images.length; update(); };
  $('#dirBtn').onclick = ()=>{
    const [lat,lng] = ex.coords;
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,'_blank');
  };
  $('#modal').classList.remove('hidden');
}
$('#modalClose').onclick = ()=> $('#modal').classList.add('hidden');
$('#modal').addEventListener('click', (e)=>{ if(e.target.id==='modal') $('#modal').classList.add('hidden'); });

// --- Filters & location ---
let userLocation = null;

function applyFilters(){
  const artistQ = $('#artistInput').value.trim().toLowerCase();
  const from = $('#dateFrom').value || null;
  const to = $('#dateTo').value || null;
  const radiusKm = +$('#radius').value;

  let list = EXHIBITIONS.filter(ex => {
    const byArtist = !artistQ || ex.artist.join(' ').toLowerCase().includes(artistQ);
    const byDate = inRange(ex.start, from, to) || inRange(ex.end, from, to) || (from==null && to==null);
    let byDistance = true;
    if(userLocation){
      byDistance = kmDistance(userLocation, ex.coords) <= radiusKm;
    }
    return byArtist && byDate && byDistance;
  });

  render(list, null);
}

async function geocodeAddress(){
  const q = $('#addressInput').value.trim();
  if(!q) return;
  $('#locStatus').textContent = 'Searching address...';
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {headers:{'Accept-Language':'en'}});
  const json = await res.json();
  if(json && json[0]){
    const lat = +json[0].lat, lon = +json[0].lon;
    userLocation = [lat, lon];
    setUserMarker(userLocation);
    $('#locStatus').textContent = `Location set: ${json[0].display_name}`;
    applyFilters();
    map.setView(userLocation, 13);
  }else{
    $('#locStatus').textContent = 'Address not found';
  }
}

function getMyLocation(pan=false){
  if(!navigator.geolocation){
    $('#locStatus').textContent = 'Geolocation is not supported';
    return;
  }
  $('#locStatus').textContent = 'Locating...';
  navigator.geolocation.getCurrentPosition(pos => {
    userLocation = [pos.coords.latitude, pos.coords.longitude];
    setUserMarker(userLocation);
    $('#locStatus').textContent = `Using your location`;
    if(pan) map.setView(userLocation, 13);
    applyFilters();
  }, err => {
    $('#locStatus').textContent = 'Location permission denied';
  });
}

// --- UI wiring ---
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  render(EXHIBITIONS, [32.066,34.777]);

  $('#radius').addEventListener('input', () => {
    $('#radiusVal').textContent = $('#radius').value;
    applyFilters();
  });
  $('#btnFilter').addEventListener('click', applyFilters);
  $('#btnReset').addEventListener('click', () => {
    $('#addressInput').value = '';
    $('#artistInput').value = '';
    $('#dateFrom').value = '';
    $('#dateTo').value = '';
    userLocation = null;
    $('#locStatus').textContent = 'No location selected yet';
    if(userMarker){ map.removeLayer(userMarker); userMarker = null; }
    render(EXHIBITIONS, [32.066,34.777]);
  });
  $('#btnSearchAddress').addEventListener('click', geocodeAddress);
  $('#btnMyLoc').addEventListener('click', () => getMyLocation(true));
});
