/// <reference path="../pb_data/types.d.ts" />
// Aligne "metadonnee" (table/attribut) sur les renommages effectués par les migrations
// du 2026-07-16 (Plans -> Objets, Coalitions -> Consortium, Realisation -> Realisations,
// et les champs renommés en conséquence : Modules.plan -> objets, Projets.collectivite ->
// collectivites, Projets.plans_envisages -> objet, Realisation.coalitions_impliquees ->
// consortium_impliques, Plans.licence -> licences).
//
// Sans ce correctif, schema_doc.pb.js cherche la description sur la clé
// "<table>::<attribut>" ACTUELLE (ex. "Objets::fonctionnalites") mais ne trouve que
// l'ancienne ligne seedée sous "Plans::fonctionnalites" -> aucune définition ne
// remonte dans l'inspecteur de schema.html, même en direct.
migrate((app) => {
  const RENAMES = [
    ["Plans", "nom", "Objets", "nom"],
    ["Plans", "famille", "Objets", "famille"],
    ["Plans", "fonctionnalites", "Objets", "fonctionnalites"],
    ["Plans", "service", "Objets", "service"],
    ["Plans", "description", "Objets", "description"],
    ["Plans", "statut_maturite", "Objets", "statut_maturite"],
    ["Plans", "licence", "Plans", "licences"],
    ["Plans", "essences_compatibles", "Objets", "essences_compatibles"],
    ["Modules", "plan", "Modules", "objets"],
    ["Projets", "collectivite", "Projets", "collectivites"],
    ["Projets", "plans_envisages", "Projets", "objet"],
    ["Coalitions", "type", "Consortium", "type"],
    ["Coalitions", "acteurs", "Consortium", "acteurs"],
    ["Coalitions", "porteurs", "Consortium", "porteurs"],
    ["Coalitions", "projet", "Consortium", "projet"],
    ["Realisation", "plan", "Realisations", "objets"],
    ["Realisation", "collectivite", "Realisations", "collectivite"],
    ["Realisation", "acteurs_implique", "Realisations", "acteurs_implique"],
    ["Realisation", "coalitions_impliquees", "Realisations", "consortium_impliques"],
    ["Realisation", "localisation", "Realisations", "localisation"],
    ["Realisation", "photos", "Realisations", "photos"],
    ["Realisation", "commentaires", "Realisations", "commentaires"],
    ["Realisation", "bilan_carbone", "Realisations", "bilan_carbone"],
    ["Realisation", "date", "Realisations", "date"],
  ];

  const collection = app.findCollectionByNameOrId("metadonnee");
  const all = app.findAllRecords(collection);
  const byKey = {};
  for (const r of all) byKey[r.get("table") + "::" + r.get("attribut")] = r;

  for (const [oldTable, oldAttr, newTable, newAttr] of RENAMES) {
    const rec = byKey[oldTable + "::" + oldAttr];
    if (!rec) continue;
    rec.set("table", newTable);
    rec.set("attribut", newAttr);
    app.save(rec);
  }
}, (app) => {
  const RENAMES = [
    ["Plans", "nom", "Objets", "nom"],
    ["Plans", "famille", "Objets", "famille"],
    ["Plans", "fonctionnalites", "Objets", "fonctionnalites"],
    ["Plans", "service", "Objets", "service"],
    ["Plans", "description", "Objets", "description"],
    ["Plans", "statut_maturite", "Objets", "statut_maturite"],
    ["Plans", "licence", "Plans", "licences"],
    ["Plans", "essences_compatibles", "Objets", "essences_compatibles"],
    ["Modules", "plan", "Modules", "objets"],
    ["Projets", "collectivite", "Projets", "collectivites"],
    ["Projets", "plans_envisages", "Projets", "objet"],
    ["Coalitions", "type", "Consortium", "type"],
    ["Coalitions", "acteurs", "Consortium", "acteurs"],
    ["Coalitions", "porteurs", "Consortium", "porteurs"],
    ["Coalitions", "projet", "Consortium", "projet"],
    ["Realisation", "plan", "Realisations", "objets"],
    ["Realisation", "collectivite", "Realisations", "collectivite"],
    ["Realisation", "acteurs_implique", "Realisations", "acteurs_implique"],
    ["Realisation", "coalitions_impliquees", "Realisations", "consortium_impliques"],
    ["Realisation", "localisation", "Realisations", "localisation"],
    ["Realisation", "photos", "Realisations", "photos"],
    ["Realisation", "commentaires", "Realisations", "commentaires"],
    ["Realisation", "bilan_carbone", "Realisations", "bilan_carbone"],
    ["Realisation", "date", "Realisations", "date"],
  ];

  const collection = app.findCollectionByNameOrId("metadonnee");
  const all = app.findAllRecords(collection);
  const byKey = {};
  for (const r of all) byKey[r.get("table") + "::" + r.get("attribut")] = r;

  for (const [oldTable, oldAttr, newTable, newAttr] of RENAMES) {
    const rec = byKey[newTable + "::" + newAttr];
    if (!rec) continue;
    rec.set("table", oldTable);
    rec.set("attribut", oldAttr);
    app.save(rec);
  }
});
