// --- Exhibitions App ---
// תלוי ב- Leaflet.js + Firebase (במידה ואת משתמשת בהתראות)

/////////////////////////////
// Map init
/////////////////////////////
const map = L.map('map').setView([32.08, 34.78], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

/////////////////////////////
// Exhibitions Data (42 items)
/////////////////////////////
const EXHIBITIONS = [
  {id:"tlv-001", title:"New Forms", artist:"Maya Cohen", venue:"Tel Aviv Museum of Art", city:"Tel Aviv", address:"27 Sderot Sha'ul HaMelech", coords:[32.0776,34.7864], start:"2025-01-15", end:"2025-04-10", tags:["museum","painting"], images:["https://picsum.photos/seed/tlv001/800/500"]},
  {id:"tlv-002", title:"Light Mechanics", artist:"Omer Levi", venue:"Helena Rubinstein Pavilion", city:"Tel Aviv", address:"6 Tarsat St", coords:[32.0737,34.7834], start:"2025-02-01", end:"2025-05-01", tags:["installation","light"], images:["https://picsum.photos/seed/tlv002/800/500"]},
  {id:"tlv-003", title:"Coastal Lines", artist:"Yael Katz", venue:"Eretz Israel Museum (MUZA)", city:"Tel Aviv", address:"2 Haim Levanon St", coords:[32.1008,34.8044], start:"2025-03-05", end:"2025-06-20", tags:["photography"], images:["https://picsum.photos/seed/tlv003/800/500"]},
  {id:"tlv-004", title:"City Fragments", artist:"Nadav Azulay", venue:"Design Museum Holon – Pop-Up TLV", city:"Tel Aviv", address:"Rothschild 112", coords:[32.0633,34.7745], start:"2025-02-10", end:"2025-04-30", tags:["design","urban"], images:["https://picsum.photos/seed/tlv004/800/500"]},
  // ... כל 42 התערוכות ממשיכות כאן בדיוק כפי שנתתי לך בהודעה הקודמת ...
  {id:"tlv-305", title:"Quiet Bodies", artist:"Ronit K.", venue:"Beit Bialik – Gallery", city:"Tel Aviv", address:"22 Bialik St", coords:[32.0733,34.7743], start:"2025-03-11", end:"2025-05-03", tags:["sculpture"], images:["https://picsum.photos/seed/tlv305/800/500"]}
];

/////////////////////////////
// Functions
/////////////////////////////

// Add exhibitions to map
function renderExhibitions() {
  EXHIBITIONS.forEach(ex => {
    const marker = L.marker(ex.coords).addTo(map);
    let imgHtml = "";
    if (ex.images && ex.images.length > 0) {
      imgHtml = `<div style="max-width:220px">` +
                ex.images.map(src => `<img src="${src}" style="width:100%;margin-bottom:4px;border:1px solid #ccc;border-radius:4px">`).join("") +
                `</div>`;
    }
    marker.bindPopup(`
      <b>${ex.title}</b><br>
      ${ex.artist}<br>
      <i>${ex.venue}</i><br>
      ${ex.address}<br>
      ${ex.start} → ${ex.end}<br>
      ${imgHtml}
      <button onclick="followArtist('${ex.artist}')">Follow ${ex.artist}</button>
    `);
  });
}

// Follow artist (demo with localStorage)
function followArtist(artist) {
  let followed = JSON.parse(localStorage.getItem("followedArtists") || "[]");
  if (!followed.includes(artist)) {
    followed.push(artist);
    localStorage.setItem("followedArtists", JSON.stringify(followed));
    alert(`You are now following ${artist}. You’ll get alerts for new shows!`);
  } else {
    alert(`You already follow ${artist}`);
  }
}

// Example filter by artist name
function searchByArtist(name) {
  return EXHIBITIONS.filter(ex => ex.artist.toLowerCase().includes(name.toLowerCase()));
}

/////////////////////////////
// Init
/////////////////////////////
renderExhibitions();
