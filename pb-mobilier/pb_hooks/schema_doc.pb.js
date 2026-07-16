/// <reference path="../pb_data/types.d.ts" />
//
// schema_doc.pb.js  —  À déposer dans /opt/pb-mobilier/pb_hooks/
//
// Expose le schéma RÉEL de l'instance PocketBase (tables, attributs, liens),
// fusionné avec les descriptions de la table "metadonee", sur une route
// publique en lecture seule :  GET /api/schema-doc
//
// La structure vient toujours du vrai PB (donc jamais désynchronisée) ;
// seules les descriptions viennent de "metadonee". Aucun credential côté client.
//
// Validé contre l'API JSVM PocketBase 0.23+ (routerAdd (e)=>e.json,
// $app.findAllCollections(), FieldsList.marshalJSON()). Fais un smoke-test
// après déploiement (voir README), je n'ai pas pu lancer ta version exacte.
//
// ─────────────────────────────────────────────────────────────────────────
//  CONFIG  — ajuste UNIQUEMENT ces noms aux champs réels de ta table metadonee
// ─────────────────────────────────────────────────────────────────────────
// NB PocketBase : chaque handler tourne dans une VM isolée qui NE VOIT PAS
// la portée du fichier. Toute config/fonction utilisée DANS le handler doit
// être déclarée DANS le handler. Seul REQUIRE_SUPERUSER reste dehors car il
// n'est lu qu'au moment de l'enregistrement de la route (ci-dessous).

// Mets true pour protéger la route (visualiseur authentifié superuser requis).
// false = route publique en lecture seule.
const REQUIRE_SUPERUSER = false
// ─────────────────────────────────────────────────────────────────────────

const handler = (e) => {
 try {
  // ── config (doit rester DANS le handler) ──
  const META = {
    collection: "metadonee",                  // nom de ta table de métadonnées
    tableField: ["table", "collection", "tableName", "nom_table"],          // -> nom de la table décrite
    attrField:  ["attributs", "attribut", "attribute", "champ", "field"],   // -> nom de l'attribut décrit
    descField:  ["definition", "définition", "description", "desc", "details"], // -> texte de définition
  }
  // Inclure les collections système (_superusers, _mfas, _otps…) ? false recommandé.
  const INCLUDE_SYSTEM = false

  // bytes / number[] / ArrayBuffer / string  ->  string
  function toStr(v) {
    if (v == null) return ""
    if (typeof v === "string") return v
    if (v instanceof ArrayBuffer) v = new Uint8Array(v)
    try {
      let s = ""
      const CH = 8192
      for (let i = 0; i < v.length; i += CH) {
        s += String.fromCharCode.apply(null, Array.prototype.slice.call(v, i, i + CH))
      }
      return s
    } catch (_) {
      return String(v)
    }
  }

  // 1) Liste des collections + index id -> name (pour résoudre les relations)
  const all = $app.findAllCollections()
  const idToName = {}
  for (let i = 0; i < all.length; i++) {
    const c = all[i]
    if (!INCLUDE_SYSTEM && c.system) continue
    idToName[c.id] = c.name
  }

  // 2) metadonee  ->  map "table::attribut" -> description
  const descMap = {}
  const meta_debug = { found: false, resolved_collection: "", all_collection_names: [], real_fields: [], rows_total: 0, sample_rows: [], descmap_keys: 0, sample_keys: [] }

  // normalisation : minuscules + suppression des accents
  function norm(s) { return ("" + s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") }

  for (let i = 0; i < all.length; i++) meta_debug.all_collection_names.push(all[i].name)

  // -- résoudre la collection de métadonnées sans nom en dur --
  let metaColl = null
  const nameCandidates = ["metadonee", "metadonnee", "metadonnees", "metadonne", "metadata", "meta", "metadonnees"]
  for (let i = 0; i < all.length && !metaColl; i++) {
    if (nameCandidates.indexOf(norm(all[i].name)) !== -1) metaColl = all[i]
  }
  // repli : détection par structure (champ "table" + "attribut*" + "definition"/"description")
  if (!metaColl) {
    for (let i = 0; i < all.length && !metaColl; i++) {
      let fns = []
      try { fns = all[i].fields.fieldNames() } catch (_) {}
      let hasTable = false, hasAttr = false, hasDef = false
      for (let k = 0; k < fns.length; k++) {
        const n = norm(fns[k])
        if (n === "table") hasTable = true
        if (n.indexOf("attribut") === 0 || n === "champ" || n === "field") hasAttr = true
        if (n === "definition" || n === "description") hasDef = true
      }
      if (hasTable && hasAttr && hasDef) metaColl = all[i]
    }
  }

  if (metaColl) {
    meta_debug.resolved_collection = metaColl.name
    try {
      try { meta_debug.real_fields = metaColl.fields.fieldNames() } catch (_) {}

      const metaRecords = $app.findAllRecords(metaColl)   // on passe l'objet collection, jamais un nom en dur
      meta_debug.found = true
      meta_debug.rows_total = metaRecords.length

      for (let i = 0; i < metaRecords.length; i++) {
        const r = metaRecords[i]
        let t = "", a = "", d = ""
        for (let k = 0; k < META.tableField.length; k++) { const v = r.get(META.tableField[k]); if (v != null && v !== "") { t = "" + v; break } }
        for (let k = 0; k < META.attrField.length; k++)  { const v = r.get(META.attrField[k]);  if (v != null && v !== "") { a = "" + v; break } }
        for (let k = 0; k < META.descField.length; k++)  { const v = r.get(META.descField[k]);  if (v != null && v !== "") { d = "" + v; break } }
        if (i < 8) {
          const raw = {}
          const fn = meta_debug.real_fields.length ? meta_debug.real_fields : ["table", "attribut", "definition"]
          for (let k = 0; k < fn.length; k++) { try { raw[fn[k]] = "" + r.get(fn[k]) } catch (_) {} }
          meta_debug.sample_rows.push({ matched: { table: t, attribut: a, definition: d.slice(0, 40) }, raw: raw })
        }
        if (t && a) descMap[t + "::" + a] = d
      }
      meta_debug.descmap_keys = Object.keys(descMap).length
      meta_debug.sample_keys = Object.keys(descMap).slice(0, 8)
    } catch (err) {
      meta_debug.error = String((err && err.message) || err)
      $app.logger().warn("schema-doc: lecture metadonee impossible", "error", String(err))
    }
  } else {
    meta_debug.error = "Aucune collection de métadonnées détectée (ni par nom ni par structure)."
  }

  // 3) Construction du payload
  const collections = []
  const links = []

  for (let i = 0; i < all.length; i++) {
    const c = all[i]
    if (!INCLUDE_SYSTEM && c.system) continue

    let rawFields = []
    try {
      rawFields = JSON.parse(toStr(c.fields.marshalJSON())) // shape identique à l'API REST
    } catch (err) {
      rawFields = []
    }

    const fields = []
    for (let j = 0; j < rawFields.length; j++) {
      const f = rawFields[j]
      const out = {
        id: f.id,
        name: f.name,
        type: f.type,
        required: !!f.required,
        hidden: !!f.hidden,
        system: !!f.system,
        description: descMap[c.name + "::" + f.name] || "",
      }

      if (f.type === "relation" && f.collectionId) {
        const targetName = idToName[f.collectionId] || f.collectionId
        const multiple = !!(f.maxSelect && f.maxSelect > 1)
        out.relation = {
          targetId: f.collectionId,
          target: targetName,
          maxSelect: (f.maxSelect == null ? null : f.maxSelect),
          multiple: multiple,
        }
        if (idToName[f.collectionId] || INCLUDE_SYSTEM) {
          links.push({
            from: c.name,
            fromField: f.name,
            to: targetName,
            multiple: multiple,
            self: c.name === targetName,
          })
        }
      }

      // Valeurs réellement configurées pour un champ "select" (pas des exemples :
      // ce sont les options telles que définies dans la collection PocketBase).
      if (f.type === "select") {
        out.select = {
          values: f.values || [],
          maxSelect: (f.maxSelect == null ? null : f.maxSelect),
          multiple: !!(f.maxSelect && f.maxSelect > 1),
        }
      }

      fields.push(out)
    }

    collections.push({
      id: c.id,
      name: c.name,
      type: c.type,            // "base" | "auth" | "view"
      system: !!c.system,
      fields: fields,
    })
  }

  // Diagnostic : quelle instance / quel pb_data a réellement répondu ?
  // (à comparer entre les deux instances du serveur)
  let dataDir = "", reqHost = ""
  try { dataDir = "" + $app.dataDir() } catch (_) {}
  try { reqHost = "" + e.request.host } catch (_) {}

  return e.json(200, {
    generated_at: new Date().toISOString(),
    instance: { dataDir: dataDir, request_host: reqHost },
    meta_debug: meta_debug,
    counts: { collections: collections.length, links: links.length },
    collections: collections,
    links: links,
  })
 } catch (err) {
   // DEBUG — renvoie l'erreur réelle au lieu du 400 générique de PocketBase.
   // À retirer une fois le problème résolu.
   return e.json(500, {
     debug_error: String((err && err.message) || err),
     debug_stack: String((err && err.stack) || ""),
   })
 }
}

if (REQUIRE_SUPERUSER) {
  routerAdd("GET", "/api/schema-doc", handler, $apis.requireSuperuserAuth())
} else {
  routerAdd("GET", "/api/schema-doc", handler)
}
