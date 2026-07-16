/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("projets00000001")

  // update field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "plans0000000001",
    "help": "",
    "hidden": false,
    "id": "fld0000000036",
    "maxSelect": 50,
    "minSelect": 0,
    "name": "objet",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "coalitions00001",
    "help": "",
    "hidden": false,
    "id": "fld0000000038",
    "maxSelect": 10,
    "minSelect": 0,
    "name": "consortium",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("projets00000001")

  // update field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "plans0000000001",
    "help": "",
    "hidden": false,
    "id": "fld0000000036",
    "maxSelect": 50,
    "minSelect": 0,
    "name": "plans_envisages",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "coalitions00001",
    "help": "",
    "hidden": false,
    "id": "fld0000000038",
    "maxSelect": 10,
    "minSelect": 0,
    "name": "coalitions",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
