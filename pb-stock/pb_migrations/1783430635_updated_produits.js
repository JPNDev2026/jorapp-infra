/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4267935637")

  // add field
  collection.fields.addAt(3, new Field({
    "help": "",
    "hidden": false,
    "id": "number4159695454",
    "max": null,
    "min": 0,
    "name": "prix",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "help": "",
    "hidden": false,
    "id": "file3309110367",
    "maxSelect": 0,
    "maxSize": 0,
    "mimeTypes": null,
    "name": "image",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": null,
    "type": "file"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "help": "",
    "hidden": false,
    "id": "date1185133065",
    "max": "",
    "min": "",
    "name": "date_limite",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text916376114",
    "max": 0,
    "min": 0,
    "name": "fournisseur",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3292755704",
    "help": "",
    "hidden": false,
    "id": "relation989021800",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "categories",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "help": "",
    "hidden": false,
    "id": "bool150283522",
    "name": "actif",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4267935637")

  // remove field
  collection.fields.removeById("number4159695454")

  // remove field
  collection.fields.removeById("file3309110367")

  // remove field
  collection.fields.removeById("date1185133065")

  // remove field
  collection.fields.removeById("text916376114")

  // remove field
  collection.fields.removeById("relation989021800")

  // remove field
  collection.fields.removeById("bool150283522")

  return app.save(collection)
})
