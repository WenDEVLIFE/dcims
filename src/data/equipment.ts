import type {
  Equipment,
  EquipmentAssignment,
  MaintenanceRecord,
} from "@/types/domain";
import { generateEquipmentAssetCode } from "@/lib/ids";
import { audit, dateAt, isoAt } from "@/data/support";
import { projects } from "@/data/projects";

/** Twenty fictional equipment assets with assignment and maintenance history. */

interface EquipmentSeed {
  name: string;
  category: string;
  status: Equipment["status"];
  condition: Equipment["condition"];
  purchaseDay: number;
  purchaseCostPesos: number;
  location: string;
  assignedProjectIndex?: number;
  notes?: string;
}

const SEEDS: EquipmentSeed[] = [
  { name: "One-Bagger Concrete Mixer", category: "Concrete", status: "assigned", condition: "good", purchaseDay: -400, purchaseCostPesos: 68_000, location: "Lanang site", assignedProjectIndex: 0 },
  { name: "Plate Compactor 5.5 HP", category: "Compaction", status: "assigned", condition: "good", purchaseDay: -365, purchaseCostPesos: 42_500, location: "Mintal site", assignedProjectIndex: 1 },
  { name: "Bar Cutter 16mm", category: "Steel works", status: "available", condition: "good", purchaseDay: -320, purchaseCostPesos: 55_000, location: "Central Warehouse" },
  { name: "Bar Bender 16mm", category: "Steel works", status: "available", condition: "fair", purchaseDay: -320, purchaseCostPesos: 48_000, location: "Central Warehouse" },
  { name: "Concrete Vibrator 38mm", category: "Concrete", status: "under-maintenance", condition: "needs-repair", purchaseDay: -280, purchaseCostPesos: 39_000, location: "Central Warehouse", notes: "Flexible shaft replacement in progress." },
  { name: "Scaffolding Set (20 frames)", category: "Access", status: "available", condition: "good", purchaseDay: -250, purchaseCostPesos: 120_000, location: "North Warehouse" },
  { name: "Diesel Generator 15 kVA", category: "Power", status: "assigned", condition: "good", purchaseDay: -210, purchaseCostPesos: 285_000, location: "Downtown fit-out", assignedProjectIndex: 2 },
  { name: "Water Pump 2\" Trash", category: "Dewatering", status: "available", condition: "good", purchaseDay: -200, purchaseCostPesos: 32_000, location: "South Yard" },
  { name: "Circular Saw 7-1/4\"", category: "Carpentry", status: "available", condition: "fair", purchaseDay: -180, purchaseCostPesos: 12_500, location: "North Warehouse" },
  { name: "Demolition Hammer 1500W", category: "Demolition", status: "damaged", condition: "needs-repair", purchaseDay: -170, purchaseCostPesos: 46_000, location: "South Yard", notes: "Armature burned out during slab removal." },
  { name: "Total Station", category: "Survey", status: "available", condition: "good", purchaseDay: -150, purchaseCostPesos: 420_000, location: "Central Warehouse" },
  { name: "Auto Level with Tripod", category: "Survey", status: "available", condition: "good", purchaseDay: -150, purchaseCostPesos: 38_000, location: "Central Warehouse" },
  { name: "Welding Machine 300A", category: "Steel works", status: "available", condition: "good", purchaseDay: -140, purchaseCostPesos: 64_000, location: "Central Warehouse" },
  { name: "Air Compressor 3 HP", category: "Power", status: "available", condition: "fair", purchaseDay: -120, purchaseCostPesos: 52_000, location: "North Warehouse" },
  { name: "Skid-Steer Loader", category: "Earthworks", status: "assigned", condition: "good", purchaseDay: -100, purchaseCostPesos: 1_650_000, location: "Toril road package", assignedProjectIndex: 4 },
  { name: "Dump Truck 6 cu.m.", category: "Hauling", status: "available", condition: "fair", purchaseDay: -95, purchaseCostPesos: 1_950_000, location: "South Yard" },
  { name: "Tile Cutter 900mm", category: "Finishes", status: "available", condition: "good", purchaseDay: -60, purchaseCostPesos: 26_000, location: "North Warehouse" },
  { name: "Paint Sprayer Airless", category: "Finishes", status: "under-maintenance", condition: "fair", purchaseDay: -45, purchaseCostPesos: 34_000, location: "North Warehouse", notes: "Annual service and filter replacement." },
  { name: "Genset 5 kVA Portable", category: "Power", status: "retired", condition: "needs-repair", purchaseDay: -900, purchaseCostPesos: 28_000, location: "Central Warehouse", notes: "Beyond economical repair, retained for disposal." },
  { name: "Cement Silo 20T", category: "Storage", status: "available", condition: "good", purchaseDay: -30, purchaseCostPesos: 310_000, location: "Central Warehouse" },
];

export const equipment: Equipment[] = SEEDS.map((seed, index) => {
  const assignedProject =
    seed.assignedProjectIndex !== undefined
      ? projects[seed.assignedProjectIndex]
      : undefined;

  return {
    id: `eqp-${String(index + 1).padStart(4, "0")}`,
    assetCode: generateEquipmentAssetCode(index + 1),
    name: seed.name,
    category: seed.category,
    status: seed.status,
    condition: seed.condition,
    purchaseDate: dateAt(seed.purchaseDay),
    purchaseCostCentavos: seed.purchaseCostPesos * 100,
    nextMaintenanceDate: index % 4 === 0 ? dateAt(118 + index * 3) : undefined,
    assignedProjectId: assignedProject?.id,
    location: seed.location,
    notes: seed.notes,
    ...audit(isoAt(Math.max(0, seed.purchaseDay + 60), 10, index * 4)),
  };
});

export const equipmentAssignments: EquipmentAssignment[] = equipment
  .filter((asset) => asset.status === "assigned" && asset.assignedProjectId)
  .map((asset, index) => ({
    id: `asg-${String(index + 1).padStart(4, "0")}`,
    equipmentId: asset.id,
    projectId: asset.assignedProjectId as string,
    assignedTo: ["Site foreman", "Project engineer", "Operations lead"][index % 3],
    assignedAt: isoAt(70 + index * 9, 7, 30),
  }));

export const maintenanceRecords: MaintenanceRecord[] = [
  {
    id: "mnt-0001",
    equipmentId: "eqp-0005",
    description: "Replace flexible shaft and vibrator head bearing.",
    costCentavos: 680_000,
    performedBy: "Davao Equipment Services",
    startedAt: isoAt(96, 9, 0),
    equipmentStatusAfter: "under-maintenance",
  },
  {
    id: "mnt-0002",
    equipmentId: "eqp-0018",
    description: "Annual service, replace filters, and reseal pump housing.",
    costCentavos: 320_000,
    performedBy: "Northside Air Systems",
    startedAt: isoAt(101, 13, 30),
    equipmentStatusAfter: "under-maintenance",
  },
  {
    id: "mnt-0003",
    equipmentId: "eqp-0010",
    description: "Armature rewinding after burnout on slab demolition.",
    costCentavos: 1_150_000,
    performedBy: "Davao Equipment Services",
    startedAt: isoAt(58, 8, 45),
    completedAt: isoAt(66, 16, 0),
    equipmentStatusAfter: "damaged",
  },
];
