/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1915603849")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number3920385165",
    "max": null,
    "min": null,
    "name": "lat_centre",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1915603849")

  // remove field
  collection.fields.removeById("number3920385165")

  return app.save(collection)
})
