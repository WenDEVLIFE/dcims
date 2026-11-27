import type { DemoData } from "@/schemas/import";

/** The persisted domain collections, without backup metadata. */
export type DomainData = Omit<DemoData, "version" | "exportedAt">;
