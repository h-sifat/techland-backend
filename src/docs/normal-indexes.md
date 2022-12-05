## Products Collection

Fields:

1. `categoryId`
1. `brand.id`
1. `price`

**Mongosh snippet:**

```js
["categoryId", "brand.id", "price"].forEach((field) =>
  db.products.createIndex({ [field]: 1 })
);
```

## Product Categories Collection

Fields:

1. `hash` (**unique**)
1. `parentId`

**Mongosh snippet:**

```js
db.product_categories.createIndex({ parentId: 1 });
db.product_categories.createIndex({ hash: 1 }, { unique: true });
```

## Product Brands Collection

**Fields:**

1. `name` (**unique and case-insensitive**)

**Mongosh snippet:**

```js
db.product_brands.createIndex(
  { name: 1 },
  { collation: { locale: "en_US", strength: 2 }, unique: true }
);
```

## Employees Collection

**Fields:**

1. `email` (**unique**)

**Mongosh snippet:**

```js
db.employees.createIndex({ email: 1 }, { unique: true });
```
