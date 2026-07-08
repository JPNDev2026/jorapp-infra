/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Il n'y a pas de compte utilisateur PocketBase dans pb-stock (auth par mot de
  // passe partagé géré côté hook). Les collections créées sans règles explicites
  // sont donc verrouillées aux superusers par défaut, ce qui bloque toute lecture/
  // écriture depuis le frontend ("only superusers can perform this action").
  // On ouvre ici les règles nécessaires à l'usage réel de l'app.
  const rules = [
    { name: "categories", list: "", view: "" },
    { name: "collaborateurs", list: "", view: "" },
    { name: "produits", list: "", view: "", create: "", update: "" },
    { name: "commandes", list: "", view: "" },
    { name: "commande_items", list: "", view: "" }
  ];

  for (const r of rules) {
    const collection = app.findCollectionByNameOrId(r.name);
    collection.listRule = r.list;
    collection.viewRule = r.view;
    if (r.create !== undefined) collection.createRule = r.create;
    if (r.update !== undefined) collection.updateRule = r.update;
    app.save(collection);
  }
  // parametres/cle reste verrouillée : seul le hook (via $app, qui contourne les
  // règles d'API) doit pouvoir lire le mot de passe partagé.
}, (app) => {
  const names = ["categories", "collaborateurs", "produits", "commandes", "commande_items"];
  for (const name of names) {
    const collection = app.findCollectionByNameOrId(name);
    collection.listRule = null;
    collection.viewRule = null;
    collection.createRule = null;
    collection.updateRule = null;
    app.save(collection);
  }
})
