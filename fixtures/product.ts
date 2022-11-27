import { pick } from "lodash";
import deepFreeze from "deep-freeze-strict";
import type { ProductPrivateInterface } from "../src/entities/product/interface";
import type { MakeProduct_Argument } from "../src/entities/product/make-product-entity";

export const sampleProduct: Readonly<ProductPrivateInterface> = deepFreeze({
  price: 171,
  inStock: 320,
  priceUnit: "USD",
  isHidden: false,
  createdAt: 1668935809106,
  lastModifiedAt: 1668935809106,
  _id: "clafgf2ns00lli0pj46od5r9t",
  categoryId: "clafasdklfj23423136od5r9t",
  brand: { id: "2342", name: "Kingston" },
  addedBy: "clafgf2ns00lli0pj46oakj23",
  name: "Kingston KC3000 1024GB PCIe 4.0 NVMe M.2 SSD",
  description: "<h2>Kingston KC3000 1024GB&nbsp;PCIe 4.0 NVMe M.2 SSD</h2>",

  images: [
    { id: "claes3jad0234s4pjcqrq3cqo.jpg", isMain: true },
    { id: "claes3jbf0235s4pj989nc5vv.jpg", isMain: false },
  ],
  shortDescriptions: [
    "Model: KC3000",
    "MPN: SKC3000S/1024G",
    "Form Factor: M.2 2280",
    "Interface: PCIe 4.0 NVMe",
    "Up to 7000 MB/s Read Speed",
    "Up to 6,000MB/s Write Speed",
  ],
  specifications: {
    "Key Features": {
      Capacity: "1TB",
      MTBF: "1,800,000 hours",
      "Form Factor": "M.2 2280",
      Interface: "PCIe 4.0 NVMe",
      "Sequential R/W": "7,000/6,000MB/s",
    },
    "Physical Specification": {
      Weight: "512GB-1024GB – 7g",
      Dimension: "80mm x 22mm x 2.21mm (512GB-1024GB)",
    },
    Temperature: {
      "Operating Temperature": "0°C~70°C",
      "Storage Temperature": "-40°C~85°C",
      "Vibration Resistance": "Vibration operating: 2.17G peak (7-800Hz)",
    },
    Warranty: { "Manufacturing Warranty": "05-Year Warranty" },
  },
});

export const sampleMakeProductArgument: MakeProduct_Argument = pick(
  sampleProduct,
  [
    "name",
    "brand",
    "price",
    "images",
    "addedBy",
    "inStock",
    "priceUnit",
    "categoryId",
    "categoryId",
    "description",
    "specifications",
    "shortDescriptions",
  ]
);
