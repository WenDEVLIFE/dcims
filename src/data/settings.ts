import type { ApplicationSettings } from "@/types/domain";
import { isoAt } from "@/data/support";

/** Fictional company and demo user profile. No real business data. */

export const settings: ApplicationSettings = {
  company: {
    name: "DCIMS Construction Supply",
    address: "Km. 7, Davao-Cotabato Road, Matina, Davao City",
    phone: "+63 82 285 0117",
    email: "operations@dcims.example",
    logoPath: "/dcims.png",
  },
  locale: "en-PH",
  currency: "PHP",
  defaultReorderPoint: 50,
  demoUser: {
    id: "usr-demo-0001",
    name: "Demo user",
    role: "Warehouse supervisor",
    email: "demo.user@dcims.example",
    initials: "DU",
  },
  notifications: {
    lowStock: true,
    pendingRequests: true,
    overduePurchaseOrders: false,
  },
  updatedAt: isoAt(110, 16, 20),
};
