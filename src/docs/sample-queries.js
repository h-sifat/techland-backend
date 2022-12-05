// @ts-ignore
function makeQueryString(queryObject) {
  const json = JSON.stringify(queryObject);
  const base64 = Buffer.from(json, "utf8").toString("base64");

  return "?q=" + encodeURIComponent(base64);
}

const amdBrandId = "bw18cj2o";
const amdRyzen7Id = "clafgf2no00hui0pjhni8am1y";
const mouseCategoryId = "clbarq9jg001hcipj67nxg29b";

const allQueries = Object.freeze({
  categories: Object.freeze([
    { lookup: "all" },
    { lookup: "sub", id: "clbarq9jg001gcipj441wbk7f" },
    { lookup: "self", id: "clbarq9jg001hcipj67nxg29b" },
  ]),
  products: Object.freeze([
    { qType: "list" },
    { qType: "list", pagination: { pageNumber: 2, itemsPerPage: 5 } },
    { qType: "list", sortBy: { price: "-1" } },
    {
      qType: "list",
      categoryId: mouseCategoryId,
      pagination: { pageNumber: 2, itemsPerPage: 5 },
    },

    {
      qType: "list",
      brandIds: [amdBrandId],
      pagination: { pageNumber: 2, itemsPerPage: 5 },
    },
    {
      qType: "search",
      query: "Keychron",
      pagination: { pageNumber: 2, itemsPerPage: 5 },
    },
    { qType: "suggestions", query: "Keych", count: 5 },
    { qType: "similar", id: amdRyzen7Id, count: 5 },
    {
      qType: "byIds",
      ids: ["clafgf2no00hvi0pj5pe79l86", "clafgf2no00i8i0pjhs7nc5ju"],
    },
  ]),
});

const prefix = "localhost:3000/api-v0-1-0/";

Object.entries(allQueries).forEach(([name, queryArray]) => {
  console.log(`------${name}---------`);
  for (const query of queryArray) {
    console.log(query);
    console.log(prefix + name + "/" + makeQueryString(query));
  }
});

/*
------categories---------
{ lookup: 'all' }
localhost:3000/api-v0-1-0/categories/?q=eyJsb29rdXAiOiJhbGwifQ%3D%3D
{ lookup: 'sub', id: 'clbarq9jg001gcipj441wbk7f' }
localhost:3000/api-v0-1-0/categories/?q=eyJsb29rdXAiOiJzdWIiLCJpZCI6ImNsYmFycTlqZzAwMWdjaXBqNDQxd2JrN2YifQ%3D%3D
{ lookup: 'self', id: 'clbarq9jg001hcipj67nxg29b' }
localhost:3000/api-v0-1-0/categories/?q=eyJsb29rdXAiOiJzZWxmIiwiaWQiOiJjbGJhcnE5amcwMDFoY2lwajY3bnhnMjliIn0%3D
------products---------
{ qType: 'list' }
localhost:3000/api-v0-1-0/products/?q=eyJxVHlwZSI6Imxpc3QifQ%3D%3D
{ qType: 'list', pagination: { pageNumber: 2, itemsPerPage: 5 } }
localhost:3000/api-v0-1-0/products/?q=eyJxVHlwZSI6Imxpc3QiLCJwYWdpbmF0aW9uIjp7InBhZ2VOdW1iZXIiOjIsIml0ZW1zUGVyUGFnZSI6NX19
{ qType: 'list', sortBy: { price: '-1' } }
localhost:3000/api-v0-1-0/products/?q=eyJxVHlwZSI6Imxpc3QiLCJzb3J0QnkiOnsicHJpY2UiOiItMSJ9fQ%3D%3D
{
  qType: 'list',
  categoryId: 'clbarq9jg001hcipj67nxg29b',
  pagination: { pageNumber: 2, itemsPerPage: 5 }
}
localhost:3000/api-v0-1-0/products/?q=eyJxVHlwZSI6Imxpc3QiLCJjYXRlZ29yeUlkIjoiY2xiYXJxOWpnMDAxaGNpcGo2N254ZzI5YiIsInBhZ2luYXRpb24iOnsicGFnZU51bWJlciI6MiwiaXRlbXNQZXJQYWdlIjo1fX0%3D
{
  qType: 'list',
  brandIds: [ 'bw18cj2o' ],
  pagination: { pageNumber: 2, itemsPerPage: 5 }
}
localhost:3000/api-v0-1-0/products/?q=eyJxVHlwZSI6Imxpc3QiLCJicmFuZElkcyI6WyJidzE4Y2oybyJdLCJwYWdpbmF0aW9uIjp7InBhZ2VOdW1iZXIiOjIsIml0ZW1zUGVyUGFnZSI6NX19
{
  qType: 'search',
  query: 'Keychron',
  pagination: { pageNumber: 2, itemsPerPage: 5 }
}
localhost:3000/api-v0-1-0/products/?q=eyJxVHlwZSI6InNlYXJjaCIsInF1ZXJ5IjoiS2V5Y2hyb24iLCJwYWdpbmF0aW9uIjp7InBhZ2VOdW1iZXIiOjIsIml0ZW1zUGVyUGFnZSI6NX19
{ qType: 'suggestions', query: 'Keych', count: 5 }
localhost:3000/api-v0-1-0/products/?q=eyJxVHlwZSI6InN1Z2dlc3Rpb25zIiwicXVlcnkiOiJLZXljaCIsImNvdW50Ijo1fQ%3D%3D
{ qType: 'similar', id: 'clafgf2no00hui0pjhni8am1y', count: 5 }
localhost:3000/api-v0-1-0/products/?q=eyJxVHlwZSI6InNpbWlsYXIiLCJpZCI6ImNsYWZnZjJubzAwaHVpMHBqaG5pOGFtMXkiLCJjb3VudCI6NX0%3D
{
  qType: 'byIds',
  ids: [ 'clafgf2no00hvi0pj5pe79l86', 'clafgf2no00i8i0pjhs7nc5ju' ]
}
localhost:3000/api-v0-1-0/products/?q=eyJxVHlwZSI6ImJ5SWRzIiwiaWRzIjpbImNsYWZnZjJubzAwaHZpMHBqNXBlNzlsODYiLCJjbGFmZ2Yybm8wMGk4aTBwamhzN25jNWp1Il19
*/
