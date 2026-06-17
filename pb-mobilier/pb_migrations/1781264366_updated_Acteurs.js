/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("acteurs00000001")

  // add field
  collection.fields.addAt(10, new Field({
    "help": "",
    "hidden": false,
    "id": "geoPoint795247419",
    "name": "geoPoint",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "geoPoint"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("acteurs00000001")

  // remove field
  collection.fields.removeById("geoPoint795247419")

  return app.save(collection)
})
