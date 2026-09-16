var REALISATIONS = [
  {
    id: "r1",
    nom: "Aménagement espace vert",
    objet: "Banc trois assises",
    commune: "Gland",
    date: "Octobre 2024",
    geo: { lat: 46.4188, lon: 6.2699 },
    photo: "Images_mobilier/Banc-espace-vert-Gland-2024.jpg"
  },
  {
    id: "r2",
    nom: "Arrêt de bus",
    objet: "Abri-bus",
    commune: "Luins",
    date: "2023",
    geo: { lat: 46.4372, lon: 6.2467 },
    photo: "Images_mobilier/abri-bus-luins.jpg"
  },
  {
    id: "r3",
    nom: "Parklet — Rue du Midi",
    objet: "Placette urbaine",
    commune: "Lausanne",
    date: "2019",
    geo: { lat: 46.520, lon: 6.634 },
    photo: "Images_mobilier/Parklet_de_la_rue_du_midi_à_Lausanne.jpg"
  },
  {
    id: "r4",
    nom: "Arrêt de bus — Girarde",
    objet: "Abri-bus Épalinges",
    commune: "Épalinges",
    date: "2024",
    geo: { lat: 46.5433, lon: 6.6472 },
    photo: "Images_mobilier/Arrêt bus Epalinges (1).jpg"
  }
];

var OBJETS_LIST = [];
REALISATIONS.forEach(function(r){
  if(OBJETS_LIST.indexOf(r.objet) === -1) OBJETS_LIST.push(r.objet);
});

var filters = { objet: "" };
var selectedId = REALISATIONS.length ? REALISATIONS[0].id : null;

/* Fond de carte reel — tuiles OpenStreetMap via Leaflet. */
var map = L.map("leaflet-map", { zoomControl: true, scrollWheelZoom: true });
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
}).addTo(map);

var markerLayer = L.layerGroup().addTo(map);

(function fitToRealisations(){
  var latlngs = REALISATIONS.map(function(r){ return [r.geo.lat, r.geo.lon]; });
  if(latlngs.length){
    map.fitBounds(latlngs, { padding: [40, 40] });
  } else {
    map.setView([46.5, 6.6], 9);
  }
})();

function initObjetSelect(){
  var sel = document.getElementById("objet-select");
  sel.innerHTML = "";
  var optAll = document.createElement("option");
  optAll.value = "";
  optAll.textContent = "Tous les objets";
  sel.appendChild(optAll);
  OBJETS_LIST.forEach(function(o){
    var opt = document.createElement("option");
    opt.value = o;
    opt.textContent = o;
    sel.appendChild(opt);
  });
  sel.addEventListener("change", function(){
    filters.objet = sel.value;
    renderAll();
  });
}

function passesFilters(r){
  if(filters.objet && r.objet !== filters.objet) return false;
  return true;
}

function renderList(){
  var list = document.getElementById("list");
  var head = document.getElementById("list-head");
  var visible = REALISATIONS.filter(passesFilters);
  head.textContent = visible.length + " réalisation(s)";
  list.innerHTML = "";
  if(!visible.length){
    list.innerHTML = '<div class="empty-hint">Aucune réalisation pour ce filtre.</div>';
    return;
  }
  visible.forEach(function(r){
    var row = document.createElement("div");
    row.className = "real-row" + (r.id === selectedId ? " sel" : "");
    row.innerHTML =
      '<img class="thumb-round" src="' + r.photo + '" alt="">' +
      '<div class="rrow-txt">' +
        '<div class="rrow-nm">' + r.nom + '</div>' +
        '<div class="rrow-sub">' + r.commune + ' · ' + r.objet + '</div>' +
      '</div>';
    row.addEventListener("click", function(){
      selectedId = r.id;
      renderAll();
    });
    list.appendChild(row);
  });
}

function renderPins(){
  markerLayer.clearLayers();
  REALISATIONS.filter(passesFilters).forEach(function(r){
    var icon = L.divIcon({
      className: "pin" + (r.id === selectedId ? " sel" : ""),
      html:
        '<div class="mount"><img src="' + r.photo + '" alt=""></div>' +
        '<div class="tip">' + r.nom + ' — ' + r.commune + '</div>',
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });
    var marker = L.marker([r.geo.lat, r.geo.lon], { icon: icon });
    marker.on("click", function(){
      selectedId = r.id;
      renderAll();
    });
    marker.addTo(markerLayer);
  });
}

function renderDetail(){
  var detail = document.getElementById("detail");
  var r = REALISATIONS.filter(function(x){ return x.id === selectedId; })[0];
  if(!r){
    detail.innerHTML = '<div class="d-body"><p class="empty-hint">Sélectionnez une réalisation sur la carte ou dans la liste.</p></div>';
    return;
  }
  detail.innerHTML =
    '<div class="d-photo" id="d-photo">' +
      '<img src="' + r.photo + '" alt="">' +
      '<span class="expand"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg></span>' +
    '</div>' +
    '<div class="d-body">' +
      '<div class="d-top">' +
        '<div>' +
          '<h2 class="d-name">' + r.nom + '</h2>' +
          '<div class="badges"><span class="badge a">' + r.objet + '</span></div>' +
        '</div>' +
        '<a class="cta" href="objets-fiche.html">' +
          '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="15" rx="1.5"/><circle cx="9" cy="10" r="1.6"/><path d="m4 18 5.5-5.5a1.8 1.8 0 0 1 2.5 0L20 20"/></svg>' +
          'Voir la fiche objet' +
        '</a>' +
      '</div>' +
      '<div class="d-grid">' +
        '<div class="d-fact"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.3"/></svg>' + r.commune + '</div>' +
        '<div class="d-fact"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>' + r.date + '</div>' +
      '</div>' +
    '</div>';

  var photo = document.getElementById("d-photo");
  photo.addEventListener("click", function(){ openLightbox(r.photo); });
}

function renderAll(){
  renderList();
  renderPins();
  renderDetail();
}

/* Visionneuse plein ecran — agrandit la photo de la realisation selectionnee. */
var lightbox = document.getElementById("lightbox");
var lightboxImg = document.getElementById("lightbox-img");

function openLightbox(src){
  lightboxImg.src = src;
  lightbox.showModal();
}
document.getElementById("lightbox-close").addEventListener("click", function(){
  lightbox.close();
});
lightbox.addEventListener("click", function(e){
  if(e.target === lightbox){ lightbox.close(); }
});

document.getElementById("reset-filters").addEventListener("click", function(){
  filters.objet = "";
  document.getElementById("objet-select").value = "";
  renderAll();
});
window.addEventListener("resize", function(){ map.invalidateSize(); });

initObjetSelect();
renderAll();
