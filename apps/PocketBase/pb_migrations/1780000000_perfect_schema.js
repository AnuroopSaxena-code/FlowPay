/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // 1. GROUPS
  let groups = new Collection({
      name: "groups",
      type: "base",
      listRule: "",
      viewRule: "",
      createRule: "",
      updateRule: "",
      deleteRule: "",
      fields: [
          { name: "id", type: "text", primaryKey: true, required: true, system: true, autogeneratePattern: "[a-z0-9]{15}" },
          { name: "name", type: "text", required: true },
          { name: "description", type: "text", required: false },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false, system: true },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true, system: true }
      ]
  });
  app.save(groups);

  // 2. MEMBERS
  let members = new Collection({
      name: "members",
      type: "base",
      listRule: "",
      viewRule: "",
      createRule: "",
      updateRule: "",
      deleteRule: "",
      fields: [
          { name: "id", type: "text", primaryKey: true, required: true, system: true, autogeneratePattern: "[a-z0-9]{15}" },
          { name: "name", type: "text", required: true },
          { name: "email", type: "email", required: false },
          { name: "groupId", type: "relation", required: true, maxSelect: 1, collectionId: groups.id },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false, system: true },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true, system: true }
      ]
  });
  app.save(members);

  // 3. EXPENSES
  let expenses = new Collection({
      name: "expenses",
      type: "base",
      listRule: "",
      viewRule: "",
      createRule: "",
      updateRule: "",
      deleteRule: "",
      fields: [
          { name: "id", type: "text", primaryKey: true, required: true, system: true, autogeneratePattern: "[a-z0-9]{15}" },
          { name: "description", type: "text", required: true },
          { name: "amount", type: "number", required: true },
          { name: "payerId", type: "relation", required: true, maxSelect: 1, collectionId: members.id },
          { name: "groupId", type: "relation", required: true, maxSelect: 1, collectionId: groups.id },
          { name: "date", type: "date", required: false },
          { name: "category", type: "text", required: false },
          { name: "participants", type: "json", required: true },
          { name: "notes", type: "text", required: false },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false, system: true },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true, system: true }
      ]
  });
  app.save(expenses);

  // 4. SETTLEMENTS
  let settlements = new Collection({
      name: "settlements",
      type: "base",
      listRule: "",
      viewRule: "",
      createRule: "",
      updateRule: "",
      deleteRule: "",
      fields: [
          { name: "id", type: "text", primaryKey: true, required: true, system: true, autogeneratePattern: "[a-z0-9]{15}" },
          { name: "amount", type: "number", required: true },
          { name: "status", type: "text", required: true },
          { name: "fromMemberId", type: "relation", required: true, maxSelect: 1, collectionId: members.id },
          { name: "toMemberId", type: "relation", required: true, maxSelect: 1, collectionId: members.id },
          { name: "groupId", type: "relation", required: true, maxSelect: 1, collectionId: groups.id },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false, system: true },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true, system: true }
      ]
  });
  app.save(settlements);

}, (app) => {
  app.delete(app.findCollectionByNameOrId("settlements"));
  app.delete(app.findCollectionByNameOrId("expenses"));
  app.delete(app.findCollectionByNameOrId("members"));
  app.delete(app.findCollectionByNameOrId("groups"));
});
