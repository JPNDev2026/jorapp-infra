/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1915603849")

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "number3290541460",
    "max": null,
    "min": null,
    "name": "lng_centre",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "number1016236836",
    "max": null,
    "min": null,
    "name": "rayon_metres",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "number1937347273",
    "max": null,
    "min": 0,
    "name": "ordre",
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
  collection.fields.removeById("number3290541460")

  // remove field
  collection.fields.removeById("number1016236836")

  // remove field
  collection.fields.removeById("number1937347273")

  return app.save(collection)
})
