/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3660428159")

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text1997877400",
    "max": 0,
    "min": 0,
    "name": "code",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text855614323",
    "max": 0,
    "min": 0,
    "name": "partenaire",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text794262873",
    "max": 0,
    "min": 0,
    "name": "lieu",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text3848597695",
    "max": 0,
    "min": 0,
    "name": "statut",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "help": "",
    "hidden": false,
    "id": "number3482905104",
    "max": null,
    "min": null,
    "name": "scan_ms",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "help": "",
    "hidden": false,
    "id": "number1725893525",
    "max": null,
    "min": null,
    "name": "completed_ms",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "help": "",
    "hidden": false,
    "id": "number1478602990",
    "max": null,
    "min": null,
    "name": "elapsed_s",
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
    "id": "bool2085216951",
    "name": "time_flag",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "help": "",
    "hidden": false,
    "id": "number1734905051",
    "max": null,
    "min": null,
    "name": "drawn_ms",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3660428159")

  // remove field
  collection.fields.removeById("text1997877400")

  // remove field
  collection.fields.removeById("text855614323")

  // remove field
  collection.fields.removeById("text794262873")

  // remove field
  collection.fields.removeById("text3848597695")

  // remove field
  collection.fields.removeById("number3482905104")

  // remove field
  collection.fields.removeById("number1725893525")

  // remove field
  collection.fields.removeById("number1478602990")

  // remove field
  collection.fields.removeById("bool2085216951")

  // remove field
  collection.fields.removeById("number1734905051")

  return app.save(collection)
})
