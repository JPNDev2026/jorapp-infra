/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("acteurs12345678");

  return app.delete(collection);
}, (app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "help": "",
        "hidden": false,
        "id": "text_pk_acteur",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "f446771fded0",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "fd7ae6f6c57f",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "f2db188c1959",
        "max": 0,
        "min": 0,
        "name": "nom",
        "pattern": "",
        "presentable": true,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "f9b1d757a604",
        "maxSelect": 9,
        "name": "type",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "forestier/groupement",
          "scierie",
          "menuiserie",
          "charpenterie",
          "designer/architecte",
          "serrurier",
          "commune/collectivité",
          "entreprise spécialisée",
          "institution (insertion/école)"
        ]
      },
      {
        "help": "",
        "hidden": false,
        "id": "fcc66ba1527d",
        "maxSelect": 1,
        "name": "parc_territoire",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "Jorat",
          "Jura vaudois",
          "Gruyère P-E",
          "autre"
        ]
      },
      {
        "help": "",
        "hidden": false,
        "id": "f75e56c3e11a",
        "name": "label_bois_suisse",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "help": "",
        "hidden": false,
        "id": "f9734cb75b12",
        "maxSelect": 8,
        "name": "prestations",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "conception/design",
          "aide à l'exécution",
          "rédaction de cahier des charges",
          "fabrication",
          "pose/installation",
          "maintenance",
          "serrurerie/pièces métalliques",
          "logistique/livraison"
        ]
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "f727c1e331dc",
        "max": 0,
        "min": 0,
        "name": "capacites",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "fd8f1cbba850",
        "max": 0,
        "min": 0,
        "name": "contact",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "exceptDomains": null,
        "help": "",
        "hidden": false,
        "id": "f3714d2b33ba",
        "name": "site_web",
        "onlyDomains": null,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "url"
      }
    ],
    "id": "acteurs12345678",
    "indexes": [],
    "listRule": "",
    "name": "acteurs",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": ""
  });

  return app.save(collection);
})
