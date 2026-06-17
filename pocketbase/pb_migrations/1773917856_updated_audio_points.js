/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1915603849")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "file511688533",
    "maxSelect": 1,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "fichier_mp3",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1915603849")

  // remove field
  collection.fields.removeById("file511688533")

  return app.save(collection)
})
