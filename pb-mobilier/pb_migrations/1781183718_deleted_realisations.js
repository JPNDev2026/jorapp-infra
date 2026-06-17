/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("realisations123");

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
        "id": "text_pk_realis",
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
        "id": "f86cbba4c93d",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "faabdebddb43",
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
        "id": "f48aade43bb4",
        "max": 0,
        "min": 0,
        "name": "titre",
        "pattern": "",
        "presentable": true,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "objetstypes1234",
        "help": "",
        "hidden": false,
        "id": "f11841cc7961",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "objet_type",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "fc4a0de58b38",
        "max": 0,
        "min": 0,
        "name": "commune_lieu",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "acteurs12345678",
        "help": "",
        "hidden": false,
        "id": "f9e481d78784",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "proprietaire",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "contextes123456",
        "help": "",
        "hidden": false,
        "id": "f018489c78ac",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "contexte",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "help": "",
        "hidden": false,
        "id": "f7f0bbe71781",
        "maxSelect": 1,
        "name": "parc",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "Jorat",
          "Jura vaudois",
          "Gruyère P-E",
          "hors parc"
        ]
      },
      {
        "help": "",
        "hidden": false,
        "id": "fe7aadba28b3",
        "max": "",
        "min": "",
        "name": "date_installation",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "cascadeDelete": false,
        "collectionId": "essences1234567",
        "help": "",
        "hidden": false,
        "id": "f29f4a15c3aa",
        "maxSelect": 999,
        "minSelect": 0,
        "name": "essence_utilisee",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "acteurs12345678",
        "help": "",
        "hidden": false,
        "id": "f00ff43b0c2b",
        "maxSelect": 999,
        "minSelect": 0,
        "name": "producteur",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "help": "",
        "hidden": false,
        "id": "fd832389234c",
        "max": null,
        "min": null,
        "name": "cout_indicatif",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "help": "",
        "hidden": false,
        "id": "fe58bf3ff746",
        "maxSelect": 1,
        "name": "cout_unite",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "pièce",
          "mètre linéaire",
          "ensemble"
        ]
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "f7abf9fa7cde",
        "max": 0,
        "min": 0,
        "name": "duree_vie_observee",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "f30e56e84be1",
        "maxSelect": 1,
        "name": "etat",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "en service",
          "stocké",
          "démonté"
        ]
      },
      {
        "help": "",
        "hidden": false,
        "id": "f233094f96f8",
        "name": "coordonnees",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "geoPoint"
      },
      {
        "help": "",
        "hidden": false,
        "id": "fc8a1d4261ad",
        "maxSelect": 10,
        "maxSize": 5242880,
        "mimeTypes": [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif"
        ],
        "name": "photos",
        "presentable": false,
        "protected": false,
        "required": false,
        "system": false,
        "thumbs": [
          "100x100",
          "600x0"
        ],
        "type": "file"
      }
    ],
    "id": "realisations123",
    "indexes": [],
    "listRule": "",
    "name": "realisations",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": ""
  });

  return app.save(collection);
})
