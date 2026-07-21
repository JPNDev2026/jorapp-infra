/*
  shared.js — Linéo
  Helper commun a toutes les fiches : affiche un petit toast de confirmation
  pour les actions "Associer ..." qui n'entrainent pas de changement de page
  (contrairement aux boutons principaux, qui naviguent vers une autre fiche
  et beneficient de la transition geree par shared.css).
*/
function showToast(message){
  var t = document.getElementById("app-toast");
  if(!t){
    t = document.createElement("div");
    t.id = "app-toast";
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.innerHTML =
    '<svg class="t-ico" viewBox="0 0 24 24"><path d="M4 12.5 9.5 18 20 6.5"/></svg>' +
    message;
  t.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(function(){ t.classList.remove("show"); }, 2600);
}
