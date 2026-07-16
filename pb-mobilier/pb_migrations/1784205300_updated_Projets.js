/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("projets00000001")

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text613196019",
    "max": 0,
    "min": 0,
    "name": "intitules",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "help": "",
    "hidden": false,
    "id": "number1945302907",
    "max": null,
    "min": null,
    "name": "budget",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "help": "",
    "hidden": false,
    "id": "file2729472648",
    "maxSelect": 0,
    "maxSize": 0,
    "mimeTypes": null,
    "name": "documents",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": null,
    "type": "file"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "autodate916655382",
    "name": "delais",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "collectivites01",
    "help": "",
    "hidden": false,
    "id": "fld0000000034",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "collectivites",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("projets00000001")

  // remove field
  collection.fields.removeById("text613196019")

  // remove field
  collection.fields.removeById("number1945302907")

  // remove field
  collection.fields.removeById("file2729472648")

  // remove field
  collection.fields.removeById("autodate916655382")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "collectivites01",
    "help": "",
    "hidden": false,
    "id": "fld0000000034",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "collectivite",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
