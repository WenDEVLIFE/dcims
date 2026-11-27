import type { ConstructionProject } from "@/types/domain";
import { generateProjectCode } from "@/lib/ids";
import { audit, dateAt, isoAt } from "@/data/support";

/** Six fictional construction projects across Davao City. */

interface ProjectSeed {
  name: string;
  location: string;
  client: string;
  status: ConstructionProject["status"];
  progress: number;
  startDay: number;
  endDay: number;
  budgetPesos: number;
  managerName: string;
  description: string;
}

const SEEDS: ProjectSeed[] = [
  {
    name: "Lanang Business Center",
    location: "Lanang",
    client: "Riverside Land Holdings",
    status: "active",
    progress: 62,
    startDay: 10,
    endDay: 320,
    budgetPesos: 48_000_000,
    managerName: "Engr. Paolo Reyes",
    description: "Four-storey commercial building with 24 office suites and a basement cistern.",
  },
  {
    name: "Mintal Community Complex",
    location: "Mintal",
    client: "Davao Health Foundation",
    status: "active",
    progress: 41,
    startDay: 24,
    endDay: 250,
    budgetPesos: 18_500_000,
    managerName: "Engr. Marisol Tan",
    description: "Two-storey community complex with clinic, pharmacy, and covered parking.",
  },
  {
    name: "Downtown Office Renovation",
    location: "Downtown Davao",
    client: "Mercado Business Center",
    status: "active",
    progress: 78,
    startDay: 40,
    endDay: 190,
    budgetPesos: 9_200_000,
    managerName: "Engr. Karlo Bautista",
    description: "Interior renovation of three office floors including MEP upgrades.",
  },
  {
    name: "Buhangin Warehouse Expansion",
    location: "Buhangin",
    client: "DCIMS Internal",
    status: "completed",
    progress: 100,
    startDay: -120,
    endDay: 60,
    budgetPesos: 6_800_000,
    managerName: "Engr. Paolo Reyes",
    description: "Additional 900 square metre covered storage bay at North Warehouse.",
  },
  {
    name: "Toril Residential Development",
    location: "Toril",
    client: "City Roads Office",
    status: "on-hold",
    progress: 23,
    startDay: 150,
    endDay: 420,
    budgetPesos: 32_000_000,
    managerName: "Engr. Danica Flores",
    description: "Forty-eight row-house units, pending right-of-way clearance.",
  },
  {
    name: "Matina Commercial Building",
    location: "Matina",
    client: "Northgate Retail Ventures",
    status: "planned",
    progress: 0,
    startDay: 210,
    endDay: 480,
    budgetPesos: 25_400_000,
    managerName: "Engr. Marisol Tan",
    description: "Two-storey commercial building with 12 leasable bays and parking.",
  },
];

export const projects: ConstructionProject[] = SEEDS.map((seed, index) => ({
  id: `prj-${String(index + 1).padStart(3, "0")}`,
  code: generateProjectCode(index + 1, 2026),
  name: seed.name,
  location: seed.location,
  client: seed.client,
  status: seed.status,
  progress: seed.progress,
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
