/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("plans0000000001")

  // add field
  collection.fields.addAt(11, new Field({
    "cascadeDelete": false,
    "collectionId": "realisation0001",
    "help": "",
    "hidden": false,
    "id": "relation4233906029",
    "maxSelect": 10,
    "minSelect": 0,
    "name": "realisations",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("plans0000000001")

  // remove field
  collection.fields.removeById("relation4233906029")

  return app.save(collection)
})
