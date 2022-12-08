## Autocomplete Search

```js
db.products.aggregate([
  {
    $search: {
      autocomplete: {
        path: "name",
        query: "<your-query-text-here>",
        score: { boost: { value: 5 } },
        fuzzy: { maxEdits: 1, prefixLength: 1 },
      },
    },
  },
  {
    $project: {
      name: 1,
      score: { $meta: "searchScore" },
    },
  },
  { $sort: { score: -1 } },
  { $limit: 5 },
]);
```

## Full-text product search

```js
db.products.aggregate([
  {
    $search: {
      text: {
        query: "<your-query-here>",
        path: ["name", "description", "shortDescriptions", "brand"],
        score: { boost: { value: 5 } },
        fuzzy: { maxEdits: 2, prefixLength: 1 },
      },
    },
  },
  {
    $project: {
      name: 1,
      score: { $meta: "searchScore" },
    },
  },
  { $sort: { score: -1 } },
  {
    /* Do pagination here */
  },
]);
```

## Related products

For related product matching we need to use the `"categoryId"` and
`"specifications"` fields.

@TODO: study the `moreLikeThis` operator and how index the `specifications`
field.

```js
db.products.aggregate([
  {
    $search: {
      moreLikeThis: {
        like: {
          specifications: {
            /* specifications object here*/
          },
          categoryId: "<categoryId here>",
        },
      },
    },
  },
  {
    $match: {
      _id: {
        $ne: "<The id of the current object>",
      },
    },
  },
  {
    $project: {
      name: 1,
      score: {
        $meta: "searchScore",
      },
    },
  },
  {
    $sort: {
      score: -1,
    },
  },
  {
    $limit: 5,
  },
]);
```

## Filtering
