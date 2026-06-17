/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("contextes123456");

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
        "id": "text_pk_contex",
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
        "id": "f5ae45a75078",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "f3894c199155",
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
        "id": "f74f8787a082",
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
        "id": "f242bd37bf35",
        "maxSelect": 1,
        "name": "densite",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "très élevée",
          "moyenne",
          "variable",
          "faible",
          "saisonnière",
          "très faible"
        ]
      },
      {
        "help": "",
        "hidden": false,
        "id": "f89a97e6aebc",
        "maxSelect": 1,
        "name": "frequentation",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "continue",
          "régulière",
          "diffuse",
          "locale",
          "par pics"
        ]
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "fa248b84efeb",
        "max": 0,
        "min": 0,
        "name": "expression_mobilier",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      }
    ],
    "id": "contextes123456",
    "indexes": [
      "CREATE UNIQUE INDEX `idx_contextes_nom` ON `contextes` (`nom`)"
    ],
    "listRule": "",
    "name": "contextes",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": ""
  });

  return app.save(collection);
})
