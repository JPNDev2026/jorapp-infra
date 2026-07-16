/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("modules00000001")

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "plans0000000001",
    "help": "",
    "hidden": false,
    "id": "fld0000000043",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "objets",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("modules00000001")

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "plans0000000001",
    "help": "",
    "hidden": false,
    "id": "fld0000000043",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "plan",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
