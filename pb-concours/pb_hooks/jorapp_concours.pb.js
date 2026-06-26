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

routerAdd("GET", "/comptoir", (e) => {

  function comptoirpage() {
    return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Comptoir &mdash; Concours</title>
<script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
<style>
  :root{--accent:#1f7a5a}
  *{box-sizing:border-box} body{margin:0;font-family:'Archivo',system-ui,-apple-system,sans-serif;
    background:#f5f4f0;color:#1a1a1a;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}
  .card{background:#fff;border:1px solid #e3e1da;border-radius:14px;max-width:380px;width:100%;padding:32px 28px}
  h1{font-size:20px;margin:0 0 20px;letter-spacing:-.02em}
  label{display:block;font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#999;margin:14px 0 6px}
  input{width:100%;padding:12px 14px;border:1px solid #d8d6cf;border-radius:8px;font-size:16px;font-family:inherit}
  input#code{text-transform:uppercase;letter-spacing:.15em;font-weight:700;text-align:center}
  button{width:100%;margin-top:14px;padding:13px;border:0;border-radius:8px;background:var(--accent);
    color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit}
  button.secondary{background:#fff;color:var(--accent);border:1px solid var(--accent)}
  button.logout{background:none;color:#999;border:1px solid #d8d6cf;margin-top:18px;font-weight:600}
  button:disabled{opacity:.5} .hide{display:none}
  #reader{margin-top:16px;border-radius:10px;overflow:hidden}
  .sep{margin:18px 0 4px;text-align:center;font-size:12px;color:#aaa;text-transform:uppercase;letter-spacing:.1em}
  .result{text-align:center;padding:28px 0}
  .result .big{font-size:40px;font-weight:800;letter-spacing:-.02em}
  .win{color:var(--accent)} .lose{color:#999}
  .msg{font-size:14px;margin-top:10px;color:#666;text-align:center;min-height:20px}
</style></head><body>
  <div class="card">
    <div id="login">
      <h1>Connexion commer&ccedil;ant</h1>
      <label>E-mail</label><input id="email" type="email" autocomplete="username">
      <label>Mot de passe</label><input id="pass" type="password" autocomplete="current-password">
      <button onclick="login()">Se connecter</button>
      <div class="msg" id="loginmsg"></div>
    </div>
    <div id="panel" class="hide">
      <h1>Valider un code</h1>
      <button id="scanbtn" onclick="toggleScan()">&#128247; Scanner un code</button>
      <div id="reader"></div>
      <div class="sep">ou saisie manuelle</div>
      <input id="code" maxlength="6" placeholder="ABCDEF">
      <button id="drawbtn" onclick="draw()">Lancer le tirage</button>
      <div class="msg" id="drawmsg"></div>
      <div id="result" class="result hide"></div>
      <button class="logout" onclick="logout()">Se d&eacute;connecter</button>
    </div>
  </div>
<script>
  const params = new URLSearchParams(location.search);
  const pendingCode = (params.get('code')||'').toUpperCase().trim();
  let token = localStorage.getItem('cmp_token') || "";
  let scanner = null, scanning = false;

  function showLogin(){
    document.getElementById('login').classList.remove('hide');
    document.getElementById('panel').classList.add('hide');
  }
  function showPanel(){
    document.getElementById('login').classList.add('hide');
    document.getElementById('panel').classList.remove('hide');
    if(pendingCode){ document.getElementById('code').value = pendingCode; draw(); }
  }
  function logout(){
    stopScan();
    localStorage.removeItem('cmp_token'); token = "";
    document.getElementById('result').classList.add('hide');
    document.getElementById('drawmsg').textContent = "";
    showLogin();
  }
  async function login(){
    const m = document.getElementById('loginmsg'); m.textContent = "\u2026";
    try{
      const r = await fetch('/api/collections/commercants/auth-with-password',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({identity:document.getElementById('email').value,password:document.getElementById('pass').value})
      });
      const d = await r.json();
      if(!r.ok) throw new Error(d.message||'Echec de connexion');
      token = d.token; localStorage.setItem('cmp_token', token);
      showPanel();
    }catch(err){ m.textContent = err.message; }
  }

  function extractCode(text){
    // le QR encode .../comptoir?code=XXXXXX ; on tolere aussi un code brut
    try{ const u = new URL(text); const c = u.searchParams.get('code'); if(c) return c.toUpperCase().trim(); }catch(e){}
    return String(text).toUpperCase().trim();
  }
  function toggleScan(){ scanning ? stopScan() : startScan(); }
  function startScan(){
    if(typeof Html5Qrcode === 'undefined'){ document.getElementById('drawmsg').textContent = "Scanner indisponible (vérifiez la connexion)."; return; }
    scanner = new Html5Qrcode("reader");
    scanning = true;
    document.getElementById('scanbtn').textContent = "\u2715 Fermer la cam\u00e9ra";
    scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: 220 },
      (decoded) => {
        const code = extractCode(decoded);
        document.getElementById('code').value = code;
        stopScan();
        draw();
      },
      () => {} // ignore les frames sans QR
    ).catch(err => {
      scanning = false;
      document.getElementById('drawmsg').textContent = "Acc\u00e8s cam\u00e9ra refus\u00e9 ou indisponible.";
      document.getElementById('scanbtn').textContent = "\u{1F4F7} Scanner un code";
    });
  }
  function stopScan(){
    document.getElementById('scanbtn').textContent = "\u{1F4F7} Scanner un code";
    if(scanner && scanning){ scanner.stop().then(()=>{ try{scanner.clear();}catch(e){} }).catch(()=>{}); }
    scanning = false;
  }

  async function draw(){
    const btn=document.getElementById('drawbtn'), msg=document.getElementById('drawmsg'),
          res=document.getElementById('result'), code=document.getElementById('code').value.trim();
    if(!code) return;
    btn.disabled=true; msg.textContent="Tirage en cours\u2026"; res.classList.add('hide');
    try{
      const r = await fetch('/draw',{method:'POST',
        headers:{'Content-Type':'application/json','Authorization':token},
        body:JSON.stringify({code:code})});
      if(r.status===401){ btn.disabled=false; msg.textContent="Session expir\u00e9e, reconnectez-vous."; logout(); return; }
      const d = await r.json();
      if(!r.ok) throw new Error(d.message||'Erreur');
      setTimeout(function(){
        msg.textContent="";
        res.className="result";
        res.innerHTML = d.resultat==='gagnant'
          ? '<div class="big win">GAGN&Eacute; \ud83c\udf89</div><div class="msg">Remettez la r&eacute;compense convenue.</div>'
          : '<div class="big lose">Perdu</div><div class="msg">Merci, pas de gain cette fois.</div>';
        document.getElementById('code').value="";
        btn.disabled=false;
      }, 900);
    }catch(err){ msg.textContent=err.message; btn.disabled=false; }
  }
  if(token) showPanel(); else showLogin();
</script>
</body></html>`;
  }
  return e.html(200, comptoirpage());
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
