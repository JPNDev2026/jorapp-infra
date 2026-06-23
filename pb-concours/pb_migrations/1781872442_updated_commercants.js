/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_464197712")

  // add field
  collection.fields.addAt(7, new Field({
    "help": "",
    "hidden": false,
    "id": "geoPoint2816611703",
    "name": "Localisation",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "geoPoint"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "help": "",
    "hidden": false,
    "id": "file1153185069",
    "maxSelect": 0,
    "maxSize": 0,
    "mimeTypes": null,
    "name": "Logo",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": null,
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_464197712")

  // remove field
  collection.fields.removeById("geoPoint2816611703")

  // remove field
  collection.fields.removeById("file1153185069")

  return app.save(collection)
})
