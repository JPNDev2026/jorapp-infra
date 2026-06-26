/// <reference path="../pb_data/types.d.ts" />
//
// JorApp - Concours partenaires (preuve de concept)
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

// QR d'EMPLACEMENT (hors commercant) : participation NON liee, jouable chez n'importe quel partenaire
routerAdd("GET", "/lieu/{loc}", (e) => {
  const LS_SURVEY_URL = "https://survey.jorapp.org/index.php/268839";
  const loc = e.request.pathValue("loc");
  const session = $security.randomString(40);
  const col = $app.findCollectionByNameOrId("participations");
  const rec = new Record(col);
  rec.set("session", session);
  rec.set("partenaire", "");   // vide = code libre, attribue au commercant qui le validera
  rec.set("lieu", loc);
  rec.set("statut", "en_attente");
  rec.set("scan_ms", Date.now());
  $app.save(rec);
  const url = LS_SURVEY_URL + "?session=" + session + "&utm_source=" + encodeURIComponent(loc) + "&utm_medium=qr&newtest=Y";
  return e.redirect(302, url);
});

// SOURCE WEB (email, réseaux sociaux) : participation NON liée, comme un QR d'emplacement
routerAdd("GET", "/web/{source}", (e) => {
  const LS_SURVEY_URL = "https://survey.jorapp.org/index.php/268839";
  const source = e.request.pathValue("source");
  const session = $security.randomString(40);
  const col = $app.findCollectionByNameOrId("participations");
  const rec = new Record(col);
  rec.set("session", session);
  rec.set("partenaire", "");           // vide = code libre, attribué au commerçant qui valide
  rec.set("lieu", source);             // provenance : email / instagram / facebook
  rec.set("statut", "en_attente");
  rec.set("scan_ms", Date.now());
  $app.save(rec);
  const url = LS_SURVEY_URL + "?session=" + session + "&utm_source=" + encodeURIComponent(source) + "&utm_medium=web&newtest=Y";
  return e.redirect(302, url);
});

// Mini-API publique : nom + URL du logo d'un partenaire (n'expose RIEN d'autre de la collection)
routerAdd("GET", "/partner/{slug}", (e) => {
  const slug = e.request.pathValue("slug");
  let rec;
  try { rec = $app.findFirstRecordByFilter("commercants", "partenaire = {:p}", { p: slug }); }
  catch (err) { return e.json(404, { message: "Partenaire inconnu." }); }
  const hasLogo = !!rec.get("logo");
  return e.json(200, {
    nom_complet: rec.get("nom_complet") || "",
    logo_url: hasLogo ? ("/partner/" + encodeURIComponent(slug) + "/logo") : ""
  });
});

// Sert le logo en lisant le fichier directement (la collection commercants reste fermée)
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

// Liste publique des partenaires (nom, logo, localisation) — n'expose aucun champ sensible
routerAdd("GET", "/partners", (e) => {

  // GeoPoint PocketBase -> "lat,lng" pour Google Maps
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
      localisation: toLatLng(r.get("Localisation")),   // <-- champ "Localisation"
      logo_url: r.get("logo") ? ("/partner/" + encodeURIComponent(slug) + "/logo") : ""
    });
  }
  return e.json(200, { partenaires: out });
});

routerAdd("GET", "/complete", (e) => {
  const MIN_SECONDS = 25;
  const DEVICE_CHECK_ENABLED = false;          // <-- false pendant tes tests, true en prod
  const PARTICIPATED_COOKIE  = "jorapp_participated";
  const COOKIE_DAYS          = 60;             // duree de vie du cookie (~ duree du concours)
  const BASE                 = "https://concours.jorapp.org";

  function genCode() {
    const A = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let s = ""; for (let i = 0; i < 6; i++) s += A.charAt(Math.floor(Math.random() * A.length)); return s;
  }

  // Destination de la page de merci selon l'origine du scan :
  //   partenaire rempli (/go)        -> page partenaire (logo + nom du commercant)
  //   partenaire vide (/lieu, /web)  -> page generale
  function merciUrl(r) {
    const code = encodeURIComponent(r.get("code"));
    const partner = r.get("partenaire");
    return partner
      ? BASE + "/merci_partenaires.html?code=" + code + "&partner=" + encodeURIComponent(partner)
      : BASE + "/merci.html?code=" + code;
  }

  const session = e.requestInfo().query["session"];
  if (!session) return e.html(400, "Session manquante.");
  let rec;
  try { rec = $app.findFirstRecordByFilter("participations", "session = {:s}", { s: session }); }
  catch (err) { return e.html(404, "Participation introuvable."); }

  const statut = rec.get("statut");

  // Sessions deja traitees : renvoi idempotent, sans toucher au cookie (rechargement legitime)
  if (statut !== "en_attente") {
    if (statut === "doublon") return e.redirect(302, BASE + "/deja-participe.html");
    // emis / gagnant / perdu : la participation a deja un code -> on reaffiche le bon
    return e.redirect(302, merciUrl(rec));
  }

  // Premiere completion : cap par appareil (si active)
  if (DEVICE_CHECK_ENABLED) {
    let dejaParticipe = false;
    try {
      const c = e.request.cookie(PARTICIPATED_COOKIE);   // jette une exception si absent
      if (c && c.value) dejaParticipe = true;
    } catch (_) { dejaParticipe = false; }

    if (dejaParticipe) {
      // doublon : on marque pour les stats, AUCUN code genere -> n'atteint jamais /draw
      rec.set("statut", "doublon");
      $app.save(rec);
      return e.redirect(302, BASE + "/deja-participe.html");
    }
  }

  // Generation du code
  const elapsed = Math.round((Date.now() - rec.get("scan_ms")) / 1000);
  rec.set("code", genCode());
  rec.set("completed_ms", Date.now());
  rec.set("elapsed_s", elapsed);
  rec.set("time_flag", elapsed < MIN_SECONDS);
  rec.set("statut", "emis");
  $app.save(rec);

  // Poser le cookie AVANT la redirection (sinon l'en-tete arrive apres la reponse)
  if (DEVICE_CHECK_ENABLED) {
    e.setCookie(new Cookie({
      name: PARTICIPATED_COOKIE, value: "1", path: "/",
      maxAge: COOKIE_DAYS * 24 * 60 * 60,
      secure: true, httpOnly: true, sameSite: 2,   // 2 = Lax (passe sur la navigation top-level depuis le sondage)
    }));
  }

  return e.redirect(302, merciUrl(rec));
});

// La page comptoir est désormais statique (comptoir.html). On garde juste la redirection
// pour que le QR du bon (/comptoir?code=XXX) continue de fonctionner.
routerAdd("GET", "/comptoir", (e) => {
  const code = e.requestInfo().query["code"] || "";
  return e.redirect(302, code ? ("/comptoir.html?code=" + encodeURIComponent(code)) : "/comptoir.html");
});

routerAdd("POST", "/draw", (e) => {
  const WIN_PROBABILITY = 0.50;
  const partner = e.auth.get("partenaire");
  const code = String(e.requestInfo().body.code || "").toUpperCase().trim();
  if (!code) return e.json(400, { error: "Code requis." });
  let gagne = false;
  $app.runInTransaction((tx) => {
    let rec;
    try { rec = tx.findFirstRecordByFilter("participations", "code = {:c}", { c: code }); }
    catch (err) { throw new BadRequestError("Code inconnu."); }
    if (rec.get("statut") !== "emis")      throw new BadRequestError("Code deja utilise.");
    const lie = rec.get("partenaire"); // vide = QR d'emplacement, jouable partout
    if (lie && lie !== partner) throw new BadRequestError("Ce code ne depend pas de votre commerce.");
    if (!lie) rec.set("partenaire", partner); // attribution au commercant qui valide
    gagne = Math.random() < WIN_PROBABILITY;
    if (rec.get("time_flag")) gagne = false;
    rec.set("statut", gagne ? "gagnant" : "perdu");
    rec.set("drawn_ms", Date.now());
    tx.save(rec);
  });
  return e.json(200, { resultat: gagne ? "gagnant" : "perdu" });
}, $apis.requireAuth("commercants"));

routerAdd("GET", "/recap", (e) => {
  const gagnants = $app.findRecordsByFilter("participations", "statut = 'gagnant'", "-drawn_ms", 500, 0);
  const parPartenaire = {};
  for (const r of gagnants) { const p = r.get("partenaire"); parPartenaire[p] = (parPartenaire[p] || 0) + 1; }
  return e.json(200, { gagnants_par_partenaire: parPartenaire, total_gagnants: gagnants.length });
}, $apis.requireSuperuserAuth());
