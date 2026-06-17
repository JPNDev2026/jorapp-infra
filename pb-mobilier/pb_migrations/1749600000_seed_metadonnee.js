/// <reference path="../pb_data/types.d.ts" />
// Seed de la collection "metadonnee" (74 attributs). La collection doit deja exister
// (importee via Settings > Import collections avec pocketbase_import_metadonnee.json).
migrate((app) => {
  const rows = [
    ["Plans", "nom", "Nom du plan de mobilier, qui permet de l'identifier.", ""],
    ["Plans", "famille", "Famille typologique à laquelle appartient le plan.", "Familles.typologies"],
    ["Plans", "fonctionnalites", "Usages que remplit l'objet (se reposer, informer, jouer, etc.).", ""],
    ["Plans", "service", "Indique si l'objet a un rôle passif ou actif.", ""],
    ["Plans", "description", "Présentation libre du plan et de son intention.", ""],
    ["Plans", "statut_maturite", "Niveau d'avancement du plan, du concept au produit fini.", ""],
    ["Plans", "version", "Numéro de version pour suivre les évolutions du plan.", ""],
    ["Plans", "auteur", "Personne ou structure qui a conçu le plan.", ""],
    ["Plans", "contributions", "Apports de contributeurs sur le plan.", "Contributions.contributeurs"],
    ["Plans", "licence", "Licence encadrant la réutilisation du plan.", "Licences"],
    ["Plans", "essences_compatibles", "Essences de bois adaptées à la fabrication de l'objet.", "Essences"],
    ["Modules", "nom", "Nom du module, élément constitutif issu d'un plan.", ""],
    ["Modules", "plan", "Plan dont le module est dérivé.", "Plans"],
    ["Modules", "metiers", "Métiers nécessaires à la fabrication du module.", "Metiers"],
    ["Modules", "statut", "État d'avancement du module, de l'esquisse au produit.", ""],
    ["Modules", "est_kit", "Indique si le module est fourni en kit à assembler.", ""],
    ["Licences", "type", "Nom ou catégorie de la licence.", ""],
    ["Licences", "condition", "Conditions et obligations liées à la licence.", ""],
    ["Licences", "perimetre", "Étendue des droits accordés (ouverte, non commerciale, etc.).", ""],
    ["Contributions", "categories", "Indique si la contribution porte sur un plan ou un module.", ""],
    ["Contributions", "contributeurs", "Personne(s) ayant réalisé la contribution.", ""],
    ["Contributions", "types", "Nature de la contribution (conception, amélioration, validation, retour d'expérience).", ""],
    ["Contributions", "date", "Date de la contribution.", ""],
    ["Essences", "categories", "Grande famille de bois : résineux ou feuillus.", ""],
    ["Essences", "nom", "Nom courant de l'essence (chêne, hêtre, épicéa, etc.).", ""],
    ["Essences", "traitements", "Indique si le bois est traité ou non.", ""],
    ["Familles", "typologies", "Type d'usage ou de contexte du mobilier (rustique forestier, urbain, pédagogique, etc.).", ""],
    ["Metiers", "nom", "Nom du métier de la filière (scieur, menuisier, charpentier, etc.).", ""],
    ["Acteurs", "nom", "Nom de l'acteur de la filière (entreprise, atelier, indépendant).", ""],
    ["Acteurs", "types", "Type(s) d'activité dans la chaîne (transformation, conception, etc.).", ""],
    ["Acteurs", "metiers", "Métiers exercés par l'acteur.", ""],
    ["Acteurs", "Adresse", "Adresse de localisation de l'acteur.", ""],
    ["Acteurs", "site_web", "Adresse du site internet de l'acteur.", ""],
    ["Acteurs", "label_bois_suisse", "Statut de l'acteur vis-à-vis du label Bois Suisse.", ""],
    ["Acteurs", "statuts", "État de la relation avec l'acteur dans le réseau (pressenti, référencé, etc.).", ""],
    ["Acteurs", "capacite", "Capacité de production (pièce unique, petite/moyenne/grande série).", ""],
    ["Acteurs", "sur_mesure", "Indique si l'acteur réalise des pièces sur mesure.", ""],
    ["Equipements", "acteur", "Acteur qui possède ou met à disposition l'équipement.", "Acteurs.nom"],
    ["Equipements", "sechage", "Moyens de séchage du bois (four, aire de séchage).", ""],
    ["Equipements", "stockage", "Moyens de stockage (hangar, abris, place de stockage).", ""],
    ["Equipements", "sciage", "Moyens de sciage (scie fixe, à façon, mobile).", ""],
    ["Equipements", "transformation", "Équipements de transformation (CNC, raboteuse, presse, etc.).", ""],
    ["Equipements", "serrurie", "Équipements de serrurerie/métal (soudure, plieuse).", ""],
    ["Equipements", "finition", "Équipements de finition (cabine de traitement).", ""],
    ["Equipements", "levage_transport", "Moyens de levage et de transport (grue, camion, remorque).", ""],
    ["Equipements", "disponibilite", "Disponibilité de l'équipement (immédiate ou sur réservation).", ""],
    ["Equipements", "ouverture", "Conditions d'ouverture de l'équipement aux autres acteurs.", ""],
    ["Equipements", "model", "Modèle économique d'accès (gratuit, facturé, réciprocité, location).", ""],
    ["Equipements", "acces", "Modalités pratiques d'accès (équipement déplacé, travail/prestation sur site).", ""],
    ["Collectivites", "nom", "Nom de la collectivité publique.", ""],
    ["Collectivites", "type", "Type de collectivité selon sa taille ou son statut.", ""],
    ["Collectivites", "mode_decision", "Manière dont la collectivité prend ses décisions d'achat.", ""],
    ["Projets", "collectivite", "Collectivité à l'origine ou destinataire du projet.", "Collectivites.nom"],
    ["Projets", "besoins", "Description des besoins exprimés pour le projet.", ""],
    ["Projets", "plans_envisages", "Plans de mobilier envisagés pour répondre au projet.", "Plans"],
    ["Projets", "statut", "État d'avancement du projet (émergent, cadrage, production, etc.).", ""],
    ["Projets", "consortium", "Coalition d'acteurs chargée du projet.", "Coalitions"],
    ["Affectations", "projet", "Projet concerné par l'affectation.", "Projets"],
    ["Affectations", "modules", "Modules à produire dans le cadre de l'affectation.", "Modules"],
    ["Affectations", "prestataires", "Acteurs chargés de réaliser le travail.", "Acteurs"],
    ["Affectations", "statuts", "État de l'affectation (à pourvoir, assignée, réalisée, etc.).", ""],
    ["Coalitions", "type", "Forme de la coalition (consortium ou sous-traitance).", ""],
    ["Coalitions", "acteurs", "Acteurs membres de la coalition.", "Acteurs"],
    ["Coalitions", "porteurs", "Acteurs qui portent et coordonnent la coalition.", "Acteurs"],
    ["Coalitions", "projet", "Projet auquel la coalition est rattachée.", "Projets"],
    ["Realisation", "plan", "Plan de mobilier effectivement réalisé.", "Plans"],
    ["Realisation", "collectivite", "Collectivité pour laquelle la réalisation a été faite.", "Collectivites"],
    ["Realisation", "acteurs_implique", "Acteur(s) ayant réalisé l'objet (cas d'une réalisation individuelle).", "Acteurs"],
    ["Realisation", "coalitions_impliquees", "Coalition ayant réalisé l'objet (cas d'une réalisation collective).", "Coalitions"],
    ["Realisation", "localisation", "Coordonnées GPS du lieu d'implantation de la réalisation.", ""],
    ["Realisation", "photos", "Photographies de l'objet réalisé.", ""],
    ["Realisation", "commentaires", "Remarques et observations libres sur la réalisation.", ""],
    ["Realisation", "bilan_carbone", "Bilan carbone estimé de la réalisation.", ""],
    ["Realisation", "date", "Date de la réalisation.", ""]
  ];
  const collection = app.findCollectionByNameOrId("metadonnee");
  for (const [table, attribut, definition, lien] of rows) {
    const rec = new Record(collection);
    rec.set("table", table);
    rec.set("attribut", attribut);
    rec.set("definition", definition);
    rec.set("lien", lien);
    app.save(rec);
  }
}, (app) => {
  // revert : supprime toutes les lignes de la collection
  const recs = app.findAllRecords("metadonnee");
  for (const r of recs) app.delete(r);
});
