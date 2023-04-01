## CPU

```js
let document = {
  specFilters: {
      cores: 4,
      threads: 8
      socket: "m.2"
    },
};
```

1. Brand: `brand`
1. Cores: `specification["Basic Information"].Cores`
1. Threads: `specification["Basic Information"].Threads`
1. Socket: `specification["Basic Information"].Socket`

## GPU

1. Memory Type: `specification["Video Memory Specifications"].Type`
1. Memory Size: `specification["Video Memory Specifications"].Size`
1. Max Resolution: `specification["Video Memory Specifications"].Resolution`

## MOBO

1. M.2: See if `"M.2 Socket"` property exists in the
   `specification["Expansion Slots"]`
1. Form Factor: Search for the form factor name in the
   `specification["Basic Information"]["Form Factor"]` property
1. Memory Type: `specification.Memory.Type`
1. Processor Type: Search for `intel` or `amd` in the
   `specification["Basic Information"].Chipset` property

## RAM

1. Capacity: `specifications["Key Features"].Capacity`
1. Type: `specifications["Key Features"].Type`
1. Frequency: `specifications["Key Features"].Frequency`

## SSD

1. Capacity: `specifications["Key Features"].Capacity`
1. Interface: Search for `PCIe` and `SATA` in
   `specifications["Key Features"].Interface`
1. Form Factor: Search for `m.2` and `2.5` in the
   `specifications["Key Features"]["Form Factor"]`

## HDD

1. Capacity: `specifications["Key Features"].Capacity`
1. RPM: `specifications["Key Features"]["RPM Class"]`

## Power Supply

1. Modular: `specification.Output["Modular Type"]`
1. Wattage: `specification.Output["Total Power"]`
1. Efficiency: `specification["Key Features"].Certification`

## Casing

1. Color: `specification["External Features"]["Color(s)"]`
1. Type: `specification["Case Type"].Type`
1. Motherboard Type: Search in
   `specification["Case Type"]["Motherboard Support"]`
