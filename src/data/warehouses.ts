import type { Warehouse } from "@/types/domain";
import { generateWarehouseCode } from "@/lib/ids";
import { audit, isoAt } from "@/data/support";

/** Three fictional DCIMS warehouses in Davao City. */

interface WarehouseSeed {
  name: string;
  location: string;
  address: string;
  createdDay: number;
}

const SEEDS: WarehouseSeed[] = [
  {
    name: "Central Warehouse",
    location: "Matina",
    address: "Km. 7, Davao-Cotabato Road, Matina, Davao City",
    createdDay: 0,
  },
  {
    name: "North Warehouse",
    location: "Buhangin",
    address: "Buhangin Diversion Road, Buhangin, Davao City",
    createdDay: 0,
  },
  {
    name: "South Yard",
    location: "Toril",
    address: "McArthur Highway, Toril, Davao City",
    createdDay: 1,
  },
];

export const warehouses: Warehouse[] = SEEDS.map((seed, index) => ({
  id: `wh-${seed.location.toLowerCase()}`,
  code: generateWarehouseCode(seed.location, index + 1),
  name: seed.name,
  location: seed.location,
  address: seed.address,
  status: "active",
  ...audit(isoAt(seed.createdDay, 8, 0)),
}));

export const CENTRAL_WAREHOUSE_ID = warehouses[0].id;
export const NORTH_WAREHOUSE_ID = warehouses[1].id;
export const SOUTH_WAREHOUSE_ID = warehouses[2].id;
