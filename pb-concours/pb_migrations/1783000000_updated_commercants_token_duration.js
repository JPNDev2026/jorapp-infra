/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_464197712")

  collection.authToken.duration = 7776000 // 90 jours

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_464197712")

  collection.authToken.duration = 432000 // valeur d'origine (5 jours)

  return app.save(collection)
})
