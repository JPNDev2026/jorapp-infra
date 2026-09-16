/* ==========================================================================
   Donnees fictives — a remplacer par de vraies fiches Acteurs des que
   collectees. geo = {lat, lon} reelles (WGS84). REFERENCE simule le site
   du projet (a terme : coordonnees de la Realisation / du Projet actif).
   Le fond de carte se recentre sur REFERENCE et son echelle (pxPerKm)
   est recalculee a chaque changement de rayon : plus le rayon augmente,
   plus le zoom arriere est important, de sorte que le cercle de selection
   reste toujours entierement visible dans le cadre.
   Ce fond de carte est un placeholder stylise — a brancher sur une vraie
   librairie cartographique (Leaflet/Mapbox) le moment venu.
   ========================================================================== */
var REFERENCE = { lat: 46.66, lon: 6.70 };
var METIERS = ["scieur","menuisier","charpentier","ebeniste","serrurier","architecte-paysagiste","installateur-genie civile"];

/* Cercle de selection = CIRCLE_FRACTION * (plus petite dimension du panneau carte),
   quel que soit le rayon choisi. C'est ce ratio fixe qui garantit que le cercle
   ne deborde jamais du cadre. */
var CIRCLE_FRACTION = 0.74;

var ACTEURS = [
  { nom:"Scierie du Jorat", types:["premiere transformation"], metiers:["scieur"],
    adresse:"Route des Cerisiers 4, Ropraz", site_web:"https://example.ch",
    label_bois_suisse:"certifie", statuts:"reference", capacite:"moyenne serie (< 100)",
    sur_mesure:false, geo:{lat:46.658, lon:6.678} },
  { nom:"Groupement forestier Haut-Jorat", types:["groupement forestier"], metiers:[],
    adresse:"Mezieres VD", site_web:"",
    label_bois_suisse:"certifie", statuts:"reference", capacite:"grande serie ( > 100)",
    sur_mesure:false, geo:{lat:46.702, lon:6.702} },
  { nom:"Atelier Fontaine", types:["deuxieme transformation","concepteur-designer"], metiers:["menuisier","ebeniste"],
    adresse:"Rue du Chateau 8, Lucens", site_web:"https://example.ch",
    label_bois_suisse:"partiellement certifie", statuts:"en cours", capacite:"piece unique",
    sur_mesure:true, geo:{lat:46.701, lon:6.831} },
  { nom:"Charpente Rey & Fils", types:["deuxieme transformation"], metiers:["charpentier"],
    adresse:"Route de Fribourg 21, Chatel-Saint-Denis FR", site_web:"",
    label_bois_suisse:"en cours", statuts:"en cours", capacite:"moyenne serie (< 100)",
    sur_mesure:false, geo:{lat:46.524, lon:6.901} },
  { nom:"Serrurerie Meyer", types:["deuxieme transformation"], metiers:["serrurier"],
    adresse:"Rue du Village 3, Broc FR", site_web:"https://example.ch",
    label_bois_suisse:"non applicable", statuts:"pressenti", capacite:"petite serrie (2-20)",
    sur_mesure:true, geo:{lat:46.617, lon:7.106} },
  { nom:"Proxybois", types:["groupement forestier","premiere transformation","concepteur-designer"], metiers:["scieur","menuisier"],
    adresse:"1261 Marchissy", site_web:"https://proxybois.ch",
    label_bois_suisse:"certifie", statuts:"reference", capacite:"moyenne serie (< 100)",
    sur_mesure:true, geo:{lat:46.508, lon:6.198} },
  { nom:"Serrurerie du Simmental", types:["deuxieme transformation"], metiers:["serrurier"],
    adresse:"Dorfstrasse 14, Saanen BE", site_web:"https://example.ch",
    label_bois_suisse:"non applicable", statuts:"pressenti", capacite:"petite serrie (2-20)",
    sur_mesure:true, geo:{lat:46.489, lon:7.258} }
];

function initials(nom){
  var parts = (nom || "").split(" ").filter(Boolean);
  return ((parts[0] || "")[0] || "") + ((parts[1] || "")[0] || "");
}
function isCert(a){ return a.label_bois_suisse === "certifie"; }

function distanceKm(a, b){
  var R = 6371;
  var dLat = (b.lat - a.lat) * Math.PI / 180;
  var dLon = (b.lon - a.lon) * Math.PI / 180;
  var s1 = Math.sin(dLat / 2), s2 = Math.sin(dLon / 2);
  var aa = s1 * s1 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * s2 * s2;
  var c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c;
}

/* Projection centree sur REFERENCE. pxPerKm depend du rayon courant (voir
   getViewport) : c'est ce qui fait "zoomer" la carte a chaque changement
   de rayon plutot que de se baser sur une emprise geographique fixe. */
function getViewport(){
  var panel = document.querySelector(".map-panel");
  var w = panel.clientWidth || 1, h = panel.clientHeight || 1;
  var minDim = Math.min(w, h);
  var diameterPx = minDim * CIRCLE_FRACTION;
  var pxPerKm = diameterPx / (2 * Math.max(filters.radiusKm, 0.5));
  return { w: w, h: h, pxPerKm: pxPerKm, diameterPx: diameterPx };
}

function project(geo, vp){
  var dLatKm = (geo.lat - REFERENCE.lat) * 111;
  var dLonKm = (geo.lon - REFERENCE.lon) * 111 * Math.cos(REFERENCE.lat * Math.PI / 180);
  var xPx = vp.w / 2 + dLonKm * vp.pxPerKm;
  var yPx = vp.h / 2 - dLatKm * vp.pxPerKm;
  return { xPct: (xPx / vp.w) * 100, yPct: (yPx / vp.h) * 100 };
}

var filters = { radiusKm: 5, metier: "" };
var selected = 0;

function passesFilters(a){
  if(distanceKm(REFERENCE, a.geo) > filters.radiusKm) return false;
  if(filters.metier && (a.metiers || []).indexOf(filters.metier) === -1) return false;
  return true;
}

function initMetierSelect(){
  var sel = document.getElementById("metier-select");
  var opts = ['<option value="">Tous les metiers</option>'];
  METIERS.forEach(function(m){ opts.push('<option value="' + m + '">' + m + '</option>'); });
  sel.innerHTML = opts.join("");
  sel.addEventListener("change", function(e){
    filters.metier = e.target.value;
    renderAll();
  });
}

function renderList(visible){
  document.getElementById("list-head").textContent = visible.length + " acteur(s) dans un rayon de " + filters.radiusKm + " km";
  var list = document.getElementById("list");
  list.innerHTML = "";
  if(!visible.length){
    list.innerHTML = '<p class="empty-hint">Aucun acteur ne correspond aux filtres actuels.</p>';
    return;
  }
  visible.forEach(function(a){
    var i = ACTEURS.indexOf(a);
    var row = document.createElement("div");
    row.className = "actor-row" + (i === selected ? " sel" : "");
    row.innerHTML =
      '<div class="avatar">' + initials(a.nom).toUpperCase() + '</div>' +
      '<div class="arow-txt"><div class="arow-nm">' + a.nom + '</div>' +
      '<div class="arow-sub">' + (a.types[0] || "") + ' - ' + Math.round(distanceKm(REFERENCE, a.geo)) + ' km</div></div>';
    row.addEventListener("click", function(){ selected = i; renderAll(); });
    list.appendChild(row);
  });
}

function renderPins(visible, vp){
  var pins = document.getElementById("pins");
  pins.innerHTML = "";
  visible.forEach(function(a){
    var i = ACTEURS.indexOf(a);
    var pos = project(a.geo, vp);
    var p = document.createElement("div");
    p.className = "pin" + (isCert(a) ? " cert" : "") + (i === selected ? " sel" : "");
    p.style.left = pos.xPct + "%";
    p.style.top = pos.yPct + "%";
    p.innerHTML = '<div class="tip">' + a.nom + '</div><div class="dot"><span>' + initials(a.nom).toUpperCase() + '</span></div>';
    p.addEventListener("click", function(){ selected = i; renderAll(); });
    pins.appendChild(p);
  });
}

function renderReferenceAndRadius(vp){
  var refHolder = document.getElementById("ref-pin-holder");
  refHolder.innerHTML = '<div class="ref-pin" style="left:50%;top:50%"><div class="diamond"></div></div>';

  var circleHolder = document.getElementById("radius-circle-holder");
  circleHolder.innerHTML = '<div class="radius-circle" style="left:50%;top:50%;width:' + vp.diameterPx + 'px;height:' + vp.diameterPx + 'px"></div>';
}

function renderDetail(){
  var a = ACTEURS[selected];
  var d = document.getElementById("detail");
  if(!a || !passesFilters(a)){
    d.innerHTML = '<p class="empty-hint">Selectionne un acteur visible sur la carte ou dans la liste.</p>';
    return;
  }

  var badges = "";
  badges += '<span class="badge ' + (isCert(a) ? "cert" : "a") + '">' + a.label_bois_suisse + '</span>';
  badges += '<span class="badge b">' + a.statuts + '</span>';
  (a.types || []).forEach(function(t){ badges += '<span class="badge b">' + t + '</span>'; });
  (a.metiers || []).forEach(function(m){ badges += '<span class="badge b">' + m + '</span>'; });
  if(a.sur_mesure){ badges += '<span class="badge a">sur mesure</span>'; }

  var siteRow = a.site_web
    ? '<div class="d-fact"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6H6a1.5 1.5 0 0 0-1.5 1.5V18A1.5 1.5 0 0 0 6 19.5h10.5A1.5 1.5 0 0 0 18 18v-3"/><path d="M13.5 4.5H19.5V10.5"/><path d="M19.5 4.5 11 13"/></svg><a href="' + a.site_web + '" target="_blank" rel="noopener">Site web</a></div>'
    : "";

  d.innerHTML =
    '<div class="d-top">' +
      '<div><h2 class="d-name">' + a.nom + '</h2><div class="badges">' + badges + '</div></div>' +
      '<a class="cta" href="modules-fiche.html"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M17 8h5M19.5 5.5v5"/></svg>Sélectionner ce prestataire</a>' +
    '</div>' +
    '<div class="d-grid">' +
      '<div class="d-fact"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.3"/></svg>' + a.adresse + ' - ' + Math.round(distanceKm(REFERENCE, a.geo)) + ' km</div>' +
      '<div class="d-fact"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16.5 16.5 3l4.5 4.5L7.5 21 3 16.5Z"/><path d="m14 6 2 2M11 9l2 2M8 12l2 2"/></svg>' + a.capacite + '</div>' +
      siteRow +
    '</div>';
}

function renderAll(){
  var visible = ACTEURS.filter(passesFilters);
  var stillSelected = false;
  for(var i=0;i<visible.length;i++){ if(ACTEURS.indexOf(visible[i]) === selected){ stillSelected = true; } }
  if(!stillSelected){ selected = visible.length ? ACTEURS.indexOf(visible[0]) : -1; }
  var vp = getViewport();
  renderList(visible);
  renderPins(visible, vp);
  renderReferenceAndRadius(vp);
  renderDetail();
}

document.getElementById("radius").addEventListener("input", function(e){
  filters.radiusKm = Number(e.target.value);
  document.getElementById("radius-val").textContent = filters.radiusKm + " km";
  renderAll();
});
document.getElementById("reset-filters").addEventListener("click", function(){
  filters = { radiusKm: 5, metier: "" };
  document.getElementById("radius").value = 5;
  document.getElementById("radius-val").textContent = "5 km";
  document.getElementById("metier-select").value = "";
  renderAll();
});
window.addEventListener("resize", renderAll);

initMetierSelect();
renderAll();
