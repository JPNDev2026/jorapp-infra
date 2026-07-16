/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("realisation0001")

  // update collection data
  unmarshal({
    "name": "Realisations"
  }, collection)

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "plans0000000001",
    "help": "",
    "hidden": false,
    "id": "fld0000000056",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "objets",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "coalitions00001",
    "help": "",
    "hidden": false,
    "id": "fld0000000059",
    "maxSelect": 50,
    "minSelect": 0,
    "name": "consortium_impliques",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("realisation0001")

  // update collection data
  unmarshal({
    "name": "Realisation"
  }, collection)

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "plans0000000001",
    "help": "",
    "hidden": false,
    "id": "fld0000000056",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "plan",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "coalitions00001",
    "help": "",
    "hidden": false,
    "id": "fld0000000059",
    "maxSelect": 50,
    "minSelect": 0,
    "name": "coalitions_impliquees",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
