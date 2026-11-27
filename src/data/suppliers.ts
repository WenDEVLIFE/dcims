import type { Supplier } from "@/types/domain";
import { generateSupplierCode } from "@/lib/ids";
import { audit, isoAt } from "@/data/support";

/**
 * Twelve fictional Davao suppliers. Names, contacts, and addresses are invented;
 * no real business or personal data appears here.
 */

interface SupplierSeed {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  paymentTerms: string;
  status: Supplier["status"];
}

const SEEDS: SupplierSeed[] = [
  {
    name: "Lanang Builders Supply",
    contactPerson: "Rowena Salazar",
    phone: "+63 82 285 1104",
    email: "sales@lanangbuilders.example",
    address: "Km. 5 Lanang, Davao City",
    paymentTerms: "30 days",
    status: "active",
  },
  {
    name: "Matina Hardware Trading",
    contactPerson: "Eduardo Lim",
    phone: "+63 82 297 3312",
    email: "orders@matinahardware.example",
    address: "Matina Crossing, Davao City",
    paymentTerms: "15 days",
    status: "active",
  },
  {
    name: "Davao Steel Corporation",
    contactPerson: "Aileen Cabrera",
    phone: "+63 82 241 7788",
    email: "corporate@davaosteel.example",
    address: "Bunawan Industrial Park, Davao City",
    paymentTerms: "45 days",
    status: "active",
  },
  {
    name: "Buhangin Cement Depot",
    contactPerson: "Nestor Batucan",
    phone: "+63 82 233 9021",
    email: "depot@buhangincement.example",
    address: "Buhangin Proper, Davao City",
    paymentTerms: "30 days",
    status: "active",
  },
  {
    name: "Toril Aggregate Works",
    contactPerson: "Marilou Dizon",
    phone: "+63 82 291 4470",
    email: "dispatch@torilaggregate.example",
    address: "Toril, Davao City",
    paymentTerms: "Cash on delivery",
    status: "active",
  },
  {
    name: "Pacific Roofing Systems",
    contactPerson: "Jasper Uy",
    phone: "+63 82 274 6620",
    email: "projects@pacificroofing.example",
    address: "Sasa, Davao City",
    paymentTerms: "30 days",
    status: "active",
  },
  {
    name: "Mindanao Plumbing Supply",
    contactPerson: "Cristina Ong",
    phone: "+63 82 222 5913",
    email: "counter@mindanaoplumbing.example",
    address: "Agdao, Davao City",
    paymentTerms: "15 days",
    status: "active",
  },
  {
    name: "Davao Electrical Warehouse",
    contactPerson: "Rafael Montaño",
    phone: "+63 82 244 8834",
    email: "sales@davaoelectrical.example",
    address: "Magsaysay Avenue, Davao City",
    paymentTerms: "30 days",
    status: "active",
  },
  {
    name: "Mintal Paint Center",
    contactPerson: "Grace Villamor",
    phone: "+63 82 268 1190",
    email: "mintal@mintalpaint.example",
    address: "Mintal, Davao City",
    paymentTerms: "Cash on delivery",
    status: "active",
  },
  {
    name: "Calinan Lumber Yard",
    contactPerson: "Bernardo Tiu",
    phone: "+63 82 295 2276",
    email: "yard@calinanlumber.example",
    address: "Calinan, Davao City",
    paymentTerms: "15 days",
    status: "active",
  },
  {
    name: "Davao Safety Products",
    contactPerson: "Lorna Aquino",
    phone: "+63 82 226 7741",
    email: "support@davaosafety.example",
    address: "Ponciano Reyes Street, Davao City",
    paymentTerms: "30 days",
    status: "inactive",
  },
  {
    name: "Southpoint General Merchandise",
    contactPerson: "Ferdinand Mercado",
    phone: "+63 82 238 5562",
    email: "admin@southpointgm.example",
    address: "Toril Proper, Davao City",
    paymentTerms: "30 days",
    status: "active",
  },
];

export const suppliers: Supplier[] = SEEDS.map((seed, index) => ({
  id: `sup-${String(index + 1).padStart(3, "0")}`,
  code: generateSupplierCode(index + 1),
  name: seed.name,
  contactPerson: seed.contactPerson,
  phone: seed.phone,
  email: seed.email,
  address: seed.address,
  status: seed.status,
  paymentTerms: seed.paymentTerms,
  ...audit(isoAt(2 + (index % 5), 9, (index * 7) % 60)),
}));
