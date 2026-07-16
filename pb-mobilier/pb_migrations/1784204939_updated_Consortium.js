/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("coalitions00001")

  // add field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "projets00000001",
    "help": "",
    "hidden": false,
    "id": "relation1343593641",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "projet",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("coalitions00001")

  // remove field
  collection.fields.removeById("relation1343593641")

  return app.save(collection)
})
