import type { MaterialCategory } from "@/types/domain";
import { audit, isoAt } from "@/data/support";

/**
 * Ten material categories covering the trade mix of a Davao general
 * contractor: structural, finishes, MEP, and site consumables.
 */

interface CategorySeed {
  code: string;
  name: string;
  description: string;
  createdDay: number;
}

const SEEDS: CategorySeed[] = [
  {
    code: "CAT-01",
    name: "Cement and aggregates",
    description: "Portland cement, sand, gravel, and ready-mix components.",
    createdDay: 0,
  },
  {
    code: "CAT-02",
    name: "Reinforcing steel",
    description: "Deformed bars, tie wire, and mesh reinforcement.",
    createdDay: 0,
  },
  {
    code: "CAT-03",
    name: "Masonry",
    description: "Hollow blocks, mortar additives, and masonry accessories.",
    createdDay: 0,
  },
  {
    code: "CAT-04",
    name: "Formwork and lumber",
    description: "Plywood, coco lumber, scaffolding boards, and form oil.",
    createdDay: 0,
  },
  {
    code: "CAT-05",
    name: "Roofing and insulation",
    description: "Pre-painted sheets, purlins, ridge caps, and insulation.",
    createdDay: 0,
  },
  {
    code: "CAT-06",
    name: "Plumbing",
    description: "PVC and PPR pipes, fittings, valves, and water tanks.",
    createdDay: 0,
  },
  {
    code: "CAT-07",
    name: "Electrical",
    description: "THHN wire, conduit, panelboards, switches, and fixtures.",
    createdDay: 0,
  },
  {
    code: "CAT-08",
    name: "Finishes",
    description: "Paint, tiles, gypsum board, and joint compounds.",
    createdDay: 0,
  },
  {
    code: "CAT-09",
    name: "Hardware and fasteners",
    description: "Nails, screws, bolts, anchors, and hand tools consumables.",
    createdDay: 0,
  },
  {
    code: "CAT-10",
    name: "Safety and site supplies",
    description: "PPE, tarpaulin, curing compound, and site housekeeping items.",
    createdDay: 0,
  },
];

export const categories: MaterialCategory[] = SEEDS.map((seed) => ({
  id: `cat-${seed.code.toLowerCase()}`,
  code: seed.code,
  name: seed.name,
  description: seed.description,
  ...audit(isoAt(seed.createdDay, 8, 0)),
}));
