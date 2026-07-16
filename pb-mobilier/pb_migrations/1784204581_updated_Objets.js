/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("plans0000000001")

  // add field
  collection.fields.addAt(8, new Field({
    "help": "",
    "hidden": false,
    "id": "number3375639784",
    "max": null,
    "min": null,
    "name": "cout_indicatif",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "help": "",
    "hidden": false,
    "id": "number759554874",
    "max": null,
    "min": null,
    "name": "dimensions_standards",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "help": "",
    "hidden": false,
    "id": "file142008537",
    "maxSelect": 10,
    "maxSize": 0,
    "mimeTypes": null,
    "name": "photos",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": null,
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("plans0000000001")

  // remove field
  collection.fields.removeById("number3375639784")

  // remove field
  collection.fields.removeById("number759554874")

  // remove field
  collection.fields.removeById("file142008537")

  return app.save(collection)
})
