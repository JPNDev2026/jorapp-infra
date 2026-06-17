/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("objetstypes1234");

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
        "id": "text_pk_objets",
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
        "id": "f438b8409a09",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "f096e65073a3",
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
        "id": "f62711eb82af",
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
        "id": "f67f233793ea",
        "maxSelect": 1,
        "name": "famille",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "rustique/forestier",
          "urbain standardisé",
          "urbain design/sur-mesure",
          "pédagogique/scolaire",
          "places de jeux",
          "signalétique",
          "infrastructures/abris"
        ]
      },
      {
        "help": "",
        "hidden": false,
        "id": "faa4ba7a926a",
        "maxSelect": 7,
        "name": "typologie_fonctionnelle",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "s'asseoir",
          "informer/orienter",
          "protéger/abriter",
          "jouer",
          "pratiques sociales",
          "structurer/sécuriser",
          "gérer/assainir"
        ]
      },
      {
        "help": "",
        "hidden": false,
        "id": "fb3330134de5",
        "maxSelect": 1,
        "name": "niveau_service",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "passif",
          "actif",
          "augmenté"
        ]
      },
      {
        "help": "",
        "hidden": false,
        "id": "f6fdcfc9b19c",
        "maxSelect": 1,
        "name": "rusticite",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "brut",
          "intermédiaire",
          "épuré/design"
        ]
      },
      {
        "help": "",
        "hidden": false,
        "id": "fd30e98ff63f",
        "maxSelect": 1,
        "name": "statut",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "concept",
          "prototype",
          "produit"
        ]
      },
      {
        "help": "",
        "hidden": false,
        "id": "fdc2635c556b",
        "name": "plans_disponibles",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "help": "",
        "hidden": false,
        "id": "f53a2df97cb0",
        "name": "open_source",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "faccfcb79a5f",
        "max": 0,
        "min": 0,
        "name": "dimensions",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "essences1234567",
        "help": "",
        "hidden": false,
        "id": "f3064d330795",
        "maxSelect": 999,
        "minSelect": 0,
        "name": "essences_possibles",
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
        "id": "f443d3878067",
        "maxSelect": 999,
        "minSelect": 0,
        "name": "contextes_adaptes",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "help": "",
        "hidden": false,
        "id": "f29a7f170702",
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
    "id": "objetstypes1234",
    "indexes": [],
    "listRule": "",
    "name": "objets_types",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": ""
  });

  return app.save(collection);
})
