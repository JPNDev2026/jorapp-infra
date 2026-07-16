/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1071647038")

  // add field
  collection.fields.addAt(6, new Field({
    "cascadeDelete": false,
    "collectionId": "plans0000000001",
    "help": "",
    "hidden": false,
    "id": "relation1187859512",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "objet",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1071647038")

  // remove field
  collection.fields.removeById("relation1187859512")

  return app.save(collection)
})
