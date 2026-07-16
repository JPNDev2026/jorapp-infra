/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("plans0000000001")

  // update collection data
  unmarshal({
    "name": "Objets"
  }, collection)

  // remove field
  collection.fields.removeById("fld0000000034")

  // remove field
  collection.fields.removeById("fld0000000035")

  // remove field
  collection.fields.removeById("fld0000000036")

  // remove field
  collection.fields.removeById("fld0000000037")

  // update field
  collection.fields.addAt(3, new Field({
    "help": "",
    "hidden": false,
    "id": "fld0000000030",
    "maxSelect": 6,
    "name": "fonctionnalites",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "reposer-socialiser",
      "informer-orienter",
      "proteger-abriter",
      "jouer",
      "structurer-proteger",
      "gerer-assainir"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("plans0000000001")

  // update collection data
  unmarshal({
    "name": "Plans"
  }, collection)

  // add field
  collection.fields.addAt(7, new Field({
    "help": "",
    "hidden": false,
    "id": "fld0000000034",
    "max": null,
    "min": null,
    "name": "version",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "fld0000000035",
    "max": 0,
    "min": 0,
    "name": "auteur",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "cascadeDelete": false,
    "collectionId": "contributions01",
    "help": "",
    "hidden": false,
    "id": "fld0000000036",
    "maxSelect": 50,
    "minSelect": 0,
    "name": "contributions",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "cascadeDelete": false,
    "collectionId": "licences0000001",
    "help": "",
    "hidden": false,
    "id": "fld0000000037",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "licence",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(3, new Field({
    "help": "",
    "hidden": false,
    "id": "fld0000000030",
    "maxSelect": 7,
    "name": "fonctionnalites",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "reposer",
      "informer-orienter",
      "proteger-abriter",
      "jouer",
      "socialiser",
      "structurer-proteger",
      "gerer-assainir"
    ]
  }))

  return app.save(collection)
})
