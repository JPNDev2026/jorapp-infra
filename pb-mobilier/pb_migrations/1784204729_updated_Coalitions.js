/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("coalitions00001")

  // update collection data
  unmarshal({
    "name": "Consortium"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("coalitions00001")

  // update collection data
  unmarshal({
    "name": "Coalitions"
  }, collection)

  return app.save(collection)
})
