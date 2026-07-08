/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("commande_items")

  // add field
  collection.fields.addAt(5, new Field({
    "help": "Quantité déjà retournée en stock sur cette ligne (retours partiels ou totaux après événement)",
    "hidden": false,
    "id": "number2094587123",
    "max": null,
    "min": 0,
    "name": "quantite_retournee",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("commande_items")

  // remove field
  collection.fields.removeById("number2094587123")

  return app.save(collection)
})
