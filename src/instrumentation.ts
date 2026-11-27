/**
 * Development-time integrity guard for the seeded dataset.
 *
 * The seed is deterministic, so if balances stop reconciling with the movement
 * ledger the bug is in the generator, not in user data. Surfacing it at server
 * start keeps later phases from building on a corrupt baseline.
 */
export async function register(): Promise<void> {
  if (process.env.NODE_ENV !== "development") return;

  const { initialDemoData, findSeedIntegrityProblems } = await import(
    "@/data/seed"
  );

  const problems = findSeedIntegrityProblems(initialDemoData);

  if (problems.length > 0) {
    console.error("[dcims] seed integrity problems:");
    for (const problem of problems) console.error(`  - ${problem}`);
    return;
  }

  const summary = {
    categories: initialDemoData.categories.length,
    materials: initialDemoData.materials.length,
    warehouses: initialDemoData.warehouses.length,
    projects: initialDemoData.projects.length,
    suppliers: initialDemoData.suppliers.length,
    equipment: initialDemoData.equipment.length,
    movements: initialDemoData.stockMovements.length,
    balances: initialDemoData.balances.length,
    requests: initialDemoData.materialRequests.length,
    purchaseOrders: initialDemoData.purchaseOrders.length,
    activityLogs: initialDemoData.activityLogs.length,
    notifications: initialDemoData.notifications.length,
  };

  console.log("[dcims] seed integrity OK", summary);
}
