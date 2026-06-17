/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("essences1234567");

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
        "id": "text_pk_essenc",
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
        "id": "f7aecf2800c8",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "fdb40da87531",
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
        "id": "f995f3d3cf22",
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
        "id": "f41acccce703",
        "maxSelect": 1,
        "name": "type",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "résineux",
          "feuillu"
        ]
      },
      {
        "help": "",
        "hidden": false,
        "id": "f71dc5be5f6c",
        "maxSelect": 1,
        "name": "disponibilite_locale",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "large",
          "disponible",
          "limitée",
          "limitée/rare",
          "via Valais",
          "indisponible localement"
        ]
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "fa0036b1201b",
        "max": 0,
        "min": 0,
        "name": "note_usage",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      }
    ],
    "id": "essences1234567",
    "indexes": [
      "CREATE UNIQUE INDEX `idx_essences_nom` ON `essences` (`nom`)"
    ],
    "listRule": "",
    "name": "essences",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": ""
  });

  return app.save(collection);
})
