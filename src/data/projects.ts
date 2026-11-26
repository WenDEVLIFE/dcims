import type { ConstructionProject } from "@/types/domain";
import { generateProjectCode } from "@/lib/ids";
import { audit, dateAt, isoAt } from "@/data/support";

/** Six fictional construction projects across Davao City. */

interface ProjectSeed {
  name: string;
  location: string;
  client: string;
  status: ConstructionProject["status"];
  startDay: number;
  endDay: number;
  budgetPesos: number;
  managerName: string;
  description: string;
}

const SEEDS: ProjectSeed[] = [
  {
    name: "Lanang Riverside Residences",
    location: "Lanang",
    client: "Riverside Land Holdings",
    status: "active",
    startDay: 10,
    endDay: 320,
    budgetPesos: 48_000_000,
    managerName: "Engr. Paolo Reyes",
    description: "Four-storey residential building with 24 units and a basement cistern.",
  },
  {
    name: "Mintal Community Clinic",
    location: "Mintal",
    client: "Davao Health Foundation",
    status: "active",
    startDay: 24,
    endDay: 250,
    budgetPesos: 18_500_000,
    managerName: "Engr. Marisol Tan",
    description: "Two-storey clinic with laboratory, pharmacy, and covered parking.",
  },
  {
    name: "Downtown Davao Office Fit-Out",
    location: "Downtown Davao",
    client: "Mercado Business Center",
    status: "active",
    startDay: 40,
    endDay: 190,
    budgetPesos: 9_200_000,
    managerName: "Engr. Karlo Bautista",
    description: "Interior fit-out of three office floors including MEP upgrades.",
  },
  {
    name: "Matina Warehouse Extension",
    location: "Matina",
    client: "DCIMS Internal",
    status: "completed",
    startDay: -120,
    endDay: 60,
    budgetPesos: 6_800_000,
    managerName: "Engr. Paolo Reyes",
    description: "Additional 900 square metre covered storage bay at Central Warehouse.",
  },
  {
    name: "Toril Feeder Road Package 2",
    location: "Toril",
    client: "City Roads Office",
    status: "on-hold",
    startDay: 150,
    endDay: 420,
    budgetPesos: 32_000_000,
    managerName: "Engr. Danica Flores",
    description: "1.8 km concrete feeder road, pending right-of-way clearance.",
  },
  {
    name: "Buhangin Retail Strip",
    location: "Buhangin",
    client: "Northgate Retail Ventures",
    status: "planned",
    startDay: 210,
    endDay: 480,
    budgetPesos: 25_400_000,
    managerName: "Engr. Marisol Tan",
    description: "Single-storey retail strip with 12 leasable bays and parking.",
  },
];

export const projects: ConstructionProject[] = SEEDS.map((seed, index) => ({
  id: `prj-${String(index + 1).padStart(3, "0")}`,
  code: generateProjectCode(index + 1, 2026),
  name: seed.name,
  location: seed.location,
  client: seed.client,
  status: seed.status,
  startDate: dateAt(seed.startDay),
  targetEndDate: dateAt(seed.endDay),
  budgetCentavos: seed.budgetPesos * 100,
  managerName: seed.managerName,
  description: seed.description,
  ...audit(isoAt(Math.max(0, seed.startDay - 7), 9, index * 5)),
}));

export const ACTIVE_PROJECT_IDS = projects
  .filter((project) => project.status === "active")
  .map((project) => project.id);
