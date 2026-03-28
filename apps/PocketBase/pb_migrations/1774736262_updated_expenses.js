/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1691921218")

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "number2392944706",
    "max": null,
    "min": null,
    "name": "amount",
    "onlyInt": false,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "select105650625",
    "maxSelect": 1,
    "name": "category",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "Food",
      "Transport",
      "Accomodation",
      "Entertainment",
      "Utilities",
      "Shopping",
      "Other"
    ]
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3572739349",
    "hidden": false,
    "id": "relation1307155422",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "payerID",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3346940990",
    "hidden": false,
    "id": "relation3606030456",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "groupID",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "date2862495610",
    "max": "",
    "min": "",
    "name": "date",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "json1902735506",
    "maxSize": 0,
    "name": "participants",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text18589324",
    "max": 0,
    "min": 0,
    "name": "notes",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1691921218")

  // remove field
  collection.fields.removeById("number2392944706")

  // remove field
  collection.fields.removeById("select105650625")

  // remove field
  collection.fields.removeById("relation1307155422")

  // remove field
  collection.fields.removeById("relation3606030456")

  // remove field
  collection.fields.removeById("date2862495610")

  // remove field
  collection.fields.removeById("json1902735506")

  // remove field
  collection.fields.removeById("text18589324")

  return app.save(collection)
})
