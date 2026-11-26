import type { Material, MaterialUnit } from "@/types/domain";
import { generateMaterialSku } from "@/lib/ids";
import { audit, isoAt } from "@/data/support";

/**
 * 52 fictional construction materials. Unit costs are in centavos and reflect
 * plausible 2026 Davao trade prices, not live market data.
 */

type MaterialSeed = [
  name: string,
  categoryCode: string,
  unit: MaterialUnit,
  unitCostPesos: number,
  reorderPoint: number,
  description: string,
];

const SEEDS: MaterialSeed[] = [
  ["Portland Cement 40kg", "CAT-01", "bag", 285, 400, "Type 1 ordinary Portland cement."],
  ["Washed Sand", "CAT-01", "cubic-meter", 1450, 40, "Screened fine aggregate for concrete and mortar."],
  ["Crushed Gravel 3/4\"", "CAT-01", "cubic-meter", 1650, 40, "Coarse aggregate for structural concrete."],
  ["Ready-Mix Concrete 3000 psi", "CAT-01", "cubic-meter", 6200, 10, "Delivered ready-mix, 3000 psi design mix."],
  ["Hydrated Lime 25kg", "CAT-01", "bag", 420, 60, "Masonry lime for mortar blending."],
  ["Deformed Bar 10mm", "CAT-02", "length", 185, 300, "Grade 40 deformed reinforcing bar, 6 m."],
  ["Deformed Bar 12mm", "CAT-02", "length", 265, 300, "Grade 40 deformed reinforcing bar, 6 m."],
  ["Deformed Bar 16mm", "CAT-02", "length", 470, 200, "Grade 60 deformed reinforcing bar, 6 m."],
  ["Deformed Bar 20mm", "CAT-02", "length", 735, 150, "Grade 60 deformed reinforcing bar, 6 m."],
  ["GI Tie Wire #16", "CAT-02", "roll", 380, 80, "Galvanized iron tie wire for rebar fixing."],
  ["Welded Wire Mesh 4x8", "CAT-02", "sheet", 980, 40, "Slab reinforcement mesh, 4 ft by 8 ft."],
  ["CHB 4\" (100mm)", "CAT-03", "piece", 28, 2000, "Concrete hollow block for interior partitions."],
  ["CHB 6\" (150mm)", "CAT-03", "piece", 42, 1500, "Concrete hollow block for exterior walls."],
  ["Mortar Mix 40kg", "CAT-03", "bag", 340, 200, "Pre-blended masonry mortar."],
  ["Masonry Cement 40kg", "CAT-03", "bag", 310, 200, "Plasticizer cement for block laying."],
  ["Marine Plywood 3/4\"", "CAT-04", "sheet", 1450, 120, "Formwork-grade marine plywood, 4 ft by 8 ft."],
  ["Ordinary Plywood 1/2\"", "CAT-04", "sheet", 720, 150, "General-purpose plywood for temporary works."],
  ["Coco Lumber 2x3", "CAT-04", "piece", 165, 400, "Rough coco lumber for scaffolding and bracing."],
  ["Good Lumber 2x2", "CAT-04", "piece", 210, 300, "Kiln-dried lumber for formwork studs."],
  ["Form Oil 4L", "CAT-04", "liter", 95, 60, "Release agent for steel and plywood forms."],
  ["Pre-Painted Roof Sheet 0.5mm", "CAT-05", "length", 780, 200, "Rib-type pre-painted galvanized sheet."],
  ["C-Purlin 2x3", "CAT-05", "length", 620, 150, "Galvanized C-purlin for roof framing."],
  ["Ridge Cap", "CAT-05", "piece", 240, 80, "Matching ridge cap for rib-type roofing."],
  ["Rockwool Insulation 50mm", "CAT-05", "square-meter", 420, 40, "Roof and ceiling thermal insulation."],
  ["PVC Pipe 4\" S1000", "CAT-06", "length", 520, 100, "Sanitary sewer line, 3 m length."],
  ["PVC Pipe 2\" S1000", "CAT-06", "length", 265, 120, "Vent and drain line, 3 m length."],
  ["PPR Pipe 1/2\"", "CAT-06", "length", 185, 100, "Potable water line, 4 m length."],
  ["PVC Elbow 4\"", "CAT-06", "piece", 65, 200, "90-degree sanitary fitting."],
  ["Water Tank 1000L", "CAT-06", "piece", 8200, 5, "Polyethylene site water storage tank."],
  ["Faucet Chrome", "CAT-06", "piece", 950, 30, "Single-lever lavatory faucet."],
  ["THHN Wire #12", "CAT-07", "roll", 3100, 40, "Stranded copper conductor, 150 m roll."],
  ["THHN Wire #14", "CAT-07", "roll", 2050, 50, "Stranded copper conductor, 150 m roll."],
  ["PVC Conduit 1/2\"", "CAT-07", "length", 78, 200, "Electrical conduit, 3 m length."],
  ["Junction Box PVC", "CAT-07", "piece", 32, 300, "4-inch octagonal utility box."],
  ["Panelboard 8-Branch", "CAT-07", "piece", 4500, 8, "Residential load center with main breaker."],
  ["LED Downlight 7W", "CAT-07", "piece", 320, 60, "Recessed warm-white downlight."],
  ["Latex Paint White 4L", "CAT-08", "liter", 480, 80, "Water-based interior wall finish."],
  ["Semi-Gloss Enamel 4L", "CAT-08", "liter", 620, 60, "Solvent-based trim and door finish."],
  ["Ceramic Tile 60x60", "CAT-08", "square-meter", 480, 120, "Glazed floor tile, 60 cm by 60 cm."],
  ["Gypsum Board 4x8", "CAT-08", "sheet", 420, 100, "Moisture-resistant ceiling board."],
  ["Joint Compound 25kg", "CAT-08", "bag", 690, 40, "Ready-mixed taping compound."],
  ["Common Nails 2\"", "CAT-09", "kilogram", 72, 150, "C-1017 common wire nails."],
  ["Common Nails 4\"", "CAT-09", "kilogram", 70, 150, "C-1017 common wire nails."],
  ["Concrete Nails 3\"", "CAT-09", "kilogram", 95, 80, "Hardened masonry nails."],
  ["Self-Drilling Screw 2\"", "CAT-09", "piece", 4, 2000, "Hex-head roofing fastener with washer."],
  ["Anchor Bolt 5/8", "CAT-09", "piece", 85, 200, "Cast-in anchor bolt for column base plates."],
  ["Hard Hat", "CAT-10", "piece", 320, 40, "ANSI-rated site hard hat."],
  ["Safety Vest", "CAT-10", "piece", 180, 40, "High-visibility reflective vest."],
  ["Curing Compound 20L", "CAT-10", "liter", 210, 60, "Membrane-forming concrete curing compound."],
  ["Tarpaulin Roll 8x12", "CAT-10", "piece", 950, 20, "Heavy-duty site cover and signage tarp."],
  ["Safety Gloves", "CAT-10", "piece", 85, 60, "Coated work gloves for handling materials."],
  ["First Aid Kit", "CAT-10", "piece", 1450, 5, "Site first aid kit with refill pack."],
];

export const materials: Material[] = SEEDS.map(
  ([name, categoryCode, unit, unitCostPesos, reorderPoint, description], index) => {
    const createdDay = index % 7;
    return {
      id: `mat-${String(index + 1).padStart(4, "0")}`,
      sku: generateMaterialSku(index + 1),
      name,
      categoryId: `cat-${categoryCode.toLowerCase()}`,
      unit,
      description,
      unitCostCentavos: unitCostPesos * 100,
      reorderPoint,
      status: "active",
      ...audit(isoAt(createdDay, 8, (index * 3) % 60)),
    };
  },
);
