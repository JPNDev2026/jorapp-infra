/// <reference path="../pb_data/types.d.ts" />
//
// JorApp - Concours partenaires
// PIEGE JSVM : config + fonctions definies DANS chaque handler. Cible : PocketBase v0.23+ (v0.39).

routerAdd("GET", "/go/{partner}", (e) => {
  const LS_SURVEY_URL = "https://survey.jorapp.org/index.php/268839";
  const partner = e.request.pathValue("partner");
  const lieu = e.requestInfo().query["lieu"] || partner;
  const session = $security.randomString(40);
  const col = $app.findCollectionByNameOrId("participations");
  const rec = new Record(col);
  rec.set("session", session);
  rec.set("partenaire", partner);
  rec.set("lieu", lieu);
  rec.set("statut", "en_attente");
  rec.set("scan_ms", Date.now());
  $app.save(rec);
  const url = LS_SURVEY_URL + "?session=" + session + "&utm_source=" + encodeURIComponent(partner) + "&utm_medium=qr&newtest=Y";
  return e.redirect(302, url);
});

routerAdd("GET", "/lieu/{loc}", (e) => {
  const LS_SURVEY_URL = "https://survey.jorapp.org/index.php/268839";
  const loc = e.request.pathValue("loc");
  const session = $security.randomString(40);
  const col = $app.findCollectionByNameOrId("participations");
  const rec = new Record(col);
  rec.set("session", session);
  rec.set("partenaire", "");
  rec.set("lieu", loc);
  rec.set("statut", "en_attente");
  rec.set("scan_ms", Date.now());
  $app.save(rec);
  const url = LS_SURVEY_URL + "?session=" + session + "&utm_source=" + encodeURIComponent(loc) + "&utm_medium=qr&newtest=Y";
  return e.redirect(302, url);
});

routerAdd("GET", "/web/{source}", (e) => {
  const LS_SURVEY_URL = "https://survey.jorapp.org/index.php/268839";
  const source = e.request.pathValue("source");
  const session = $security.randomString(40);
  const col = $app.findCollectionByNameOrId("participations");
  const rec = new Record(col);
  rec.set("session", session);
  rec.set("partenaire", "");
  rec.set("lieu", source);
  rec.set("statut", "en_attente");
  rec.set("scan_ms", Date.now());
  $app.save(rec);
  const url = LS_SURVEY_URL + "?session=" + session + "&utm_source=" + encodeURIComponent(source) + "&utm_medium=web&newtest=Y";
  return e.redirect(302, url);
});

// Mini-API publique : nom + logo + gain d'un partenaire
routerAdd("GET", "/partner/{slug}", (e) => {
  const slug = e.request.pathValue("slug");
  let rec;
  try { rec = $app.findFirstRecordByFilter("commercants", "partenaire = {:p}", { p: slug }); }
  catch (err) { return e.json(404, { message: "Partenaire inconnu." }); }
  const hasLogo = !!rec.get("logo");
  return e.json(200, {
    nom_complet: rec.get("nom_complet") || "",
    gain: rec.get("gain") || "",
    logo_url: hasLogo ? ("/partner/" + encodeURIComponent(slug) + "/logo") : ""
  });
});

routerAdd("GET", "/partner/{slug}/logo", (e) => {
  const slug = e.request.pathValue("slug");
  let rec;
  try { rec = $app.findFirstRecordByFilter("commercants", "partenaire = {:p}", { p: slug }); }
  catch (err) { return e.json(404, { message: "Partenaire inconnu." }); }
  const filename = rec.get("logo");
  if (!filename) return e.json(404, { message: "Pas de logo." });
  const fsys = $app.newFilesystem();
  try {
    return fsys.serve(e.response, e.request, rec.baseFilesPath() + "/" + filename, filename);
  } finally {
    fsys.close();
  }
});

// Liste publique (nom, logo, coordonnees)
routerAdd("GET", "/partners", (e) => {

  function toLatLng(v) {
    if (!v) return "";
    if (Array.isArray(v)) return v.length < 2 ? "" : (v[1] + "," + v[0]);
    if (typeof v === "object") {
      const lat = (v.lat !== undefined ? v.lat : (v.latitude !== undefined ? v.latitude : v.Latitude));
      const lng = (v.lon !== undefined ? v.lon : (v.lng !== undefined ? v.lng : (v.longitude !== undefined ? v.longitude : v.Longitude)));
      return (lat !== undefined && lat !== null && lng !== undefined && lng !== null) ? (lat + "," + lng) : "";
    }
    const nums = String(v).replace(/,/g, ".").match(/-?\d+\.?\d*/g);
    return (!nums || nums.length < 2) ? "" : (nums[1] + "," + nums[0]);
  }

  const recs = $app.findRecordsByFilter("commercants", "id != ''", "nom_complet", 200, 0);
  const out = [];
  for (const r of recs) {
    const slug = r.get("partenaire");
    out.push({
      slug: slug,
      nom_complet: r.get("nom_complet") || "",
      localisation: toLatLng(r.get("Localisation")),
      logo_url: r.get("logo") ? ("/partner/" + encodeURIComponent(slug) + "/logo") : ""
    });
  }
  return e.json(200, { partenaires: out });
});


// /complete : tirage IMMEDIAT
//   - garde-fou temps mord AVANT Math.random
//   - /go : le partenaire est fixe (le commercant scanne le bon)
//   - /lieu, /web : si gain -> attribution d'un partenaire au hasard parmi ceux qui ont un "gain"
routerAdd("GET", "/complete", (e) => {
  const MIN_SECONDS = 25;
  const WIN_PROBABILITY = 0.3;
  const DEVICE_CHECK_ENABLED = false;
  const PARTICIPATED_COOKIE  = "jorapp_participated";
  const COOKIE_DAYS          = 60;
  const BASE                 = "https://concours.jorapp.org";

  function genCode() {
    const A = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let s = ""; for (let i = 0; i < 6; i++) s += A.charAt(Math.floor(Math.random() * A.length)); return s;
  }

  function randomPartner() {
    const pool = $app.findRecordsByFilter("commercants", "gain != ''", "", 500, 0);
    if (!pool.length) return "";
    return pool[Math.floor(Math.random() * pool.length)].get("partenaire") || "";
  }

  const session = e.requestInfo().query["session"];
  if (!session) return e.html(400, "Session manquante.");
  let rec;
  try { rec = $app.findFirstRecordByFilter("participations", "session = {:s}", { s: session }); }
  catch (err) { return e.html(404, "Participation introuvable."); }

  const statut = rec.get("statut");

  // Idempotence : session deja traitee -> retour au sas merci selon ORIGINE
  if (statut !== "en_attente") {
    if (statut === "doublon") return e.redirect(302, BASE + "/deja-participe.html");
    const origine = rec.get("origine_partenaire") || "";
    return e.redirect(302, origine
      ? BASE + "/merci_partenaires.html?session=" + encodeURIComponent(session) + "&partner=" + encodeURIComponent(origine)
      : BASE + "/merci.html?session=" + encodeURIComponent(session));
  }

  // Cap par appareil
  if (DEVICE_CHECK_ENABLED) {
    let dejaParticipe = false;
    try {
      const c = e.request.cookie(PARTICIPATED_COOKIE);
      if (c && c.value) dejaParticipe = true;
    } catch (_) { dejaParticipe = false; }
    if (dejaParticipe) {
      rec.set("statut", "doublon");
      $app.save(rec);
      return e.redirect(302, BASE + "/deja-participe.html");
    }
  }

  // Tirage immediat
  const elapsed = Math.round((Date.now() - rec.get("scan_ms")) / 1000);
  rec.set("completed_ms", Date.now());
  rec.set("elapsed_s", elapsed);
  rec.set("time_flag", elapsed < MIN_SECONDS);

  // Origine memorisee AVANT toute reattribution (permet le bon sas au rechargement)
  const origineLiee = !!rec.get("partenaire");
  rec.set("origine_partenaire", origineLiee ? rec.get("partenaire") : "");

  let gagne = false;
  if (!rec.get("time_flag")) gagne = Math.random() < WIN_PROBABILITY;

  if (gagne && !origineLiee) {
    const p = randomPartner();
    if (p) rec.set("partenaire", p); else gagne = false; // aucun lot dispo -> pas de gagnant
  }

  if (gagne) {
    rec.set("code", genCode());
    rec.set("statut", "gagnant");
  } else {
    rec.set("statut", "perdu");
  }
  rec.set("drawn_ms", Date.now());
  $app.save(rec);

  if (DEVICE_CHECK_ENABLED) {
    e.setCookie(new Cookie({
      name: PARTICIPATED_COOKIE, value: "1", path: "/",
      maxAge: COOKIE_DAYS * 24 * 60 * 60,
      secure: true, httpOnly: true, sameSite: 2,
    }));
  }

  return e.redirect(302, origineLiee
    ? BASE + "/merci_partenaires.html?session=" + encodeURIComponent(session) + "&partner=" + encodeURIComponent(rec.get("origine_partenaire"))
    : BASE + "/merci.html?session=" + encodeURIComponent(session));
});


// Verdict pour resultat.html (public, lecture seule via session)
routerAdd("GET", "/resultat", (e) => {
  const session = e.requestInfo().query["session"];
  if (!session) return e.json(400, { message: "Session manquante." });
  let rec;
  try { rec = $app.findFirstRecordByFilter("participations", "session = {:s}", { s: session }); }
  catch (err) { return e.json(404, { message: "Participation introuvable." }); }
  const statut = rec.get("statut");
  if (statut === "en_attente" || statut === "doublon") return e.json(200, { issue: "en_attente" });
  if (statut === "perdu") return e.json(200, { issue: "perdu" });
  const slug = rec.get("partenaire");
  let nom = "", gain = "", logo_url = "";
  if (slug) {
    try {
      const p = $app.findFirstRecordByFilter("commercants", "partenaire = {:p}", { p: slug });
      nom = p.get("nom_complet") || "";
      gain = p.get("gain") || "";
      if (p.get("logo")) logo_url = "/partner/" + encodeURIComponent(slug) + "/logo";
    } catch (_) {}
  }
  return e.json(200, {
    issue: statut,   // "gagnant" ou "encaisse"
    code: rec.get("code") || "",
    partenaire: { slug: slug, nom_complet: nom, gain: gain, logo_url: logo_url }
  });
});


// Validation d'un bon par le commercant : gagnant -> encaisse (transaction atomique)
routerAdd("POST", "/validate", (e) => {
  const auth = e.auth.get("partenaire");
  const code = String(e.requestInfo().body.code || "").toUpperCase().trim();
  if (!code) return e.json(400, { message: "Code requis." });
  let out = { code: code, nom_complet: "", gain: "" };
  $app.runInTransaction((tx) => {
    let rec;
    try { rec = tx.findFirstRecordByFilter("participations", "code = {:c}", { c: code }); }
    catch (err) { throw new BadRequestError("Code inconnu."); }
    const s = rec.get("statut");
    if (s === "perdu")     throw new BadRequestError("Ce bon est perdant.");
    if (s === "encaisse")  throw new BadRequestError("Bon deja encaisse.");
    if (s !== "gagnant")   throw new BadRequestError("Bon non valable.");
    if (rec.get("partenaire") !== auth) throw new BadRequestError("Ce bon ne depend pas de votre commerce.");
    rec.set("statut", "encaisse");
    rec.set("encaisse_ms", Date.now());
    tx.save(rec);
  });
  try {
    const p = $app.findFirstRecordByFilter("commercants", "partenaire = {:p}", { p: auth });
    out.nom_complet = p.get("nom_complet") || "";
    out.gain = p.get("gain") || "";
  } catch (_) {}
  return e.json(200, out);
}, $apis.requireAuth("commercants"));


routerAdd("GET", "/comptoir", (e) => {
  const code = e.requestInfo().query["code"] || "";
  return e.redirect(302, code ? ("/comptoir.html?code=" + encodeURIComponent(code)) : "/comptoir.html");
});


routerAdd("GET", "/recap", (e) => {
  const gagnants = $app.findRecordsByFilter("participations", "statut = 'gagnant' || statut = 'encaisse'", "-drawn_ms", 500, 0);
  const parPartenaire = {};
  for (const r of gagnants) { const p = r.get("partenaire"); parPartenaire[p] = (parPartenaire[p] || 0) + 1; }
  return e.json(200, { gagnants_par_partenaire: parPartenaire, total_gagnants: gagnants.length });
}, $apis.requireSuperuserAuth());
