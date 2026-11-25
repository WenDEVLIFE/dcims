import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export default function WarehousesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Warehouses"
        description="Storage locations in Matina, Buhangin, and Toril with on-hand quantities."
      />
      <ModulePlaceholder
        module="Warehouses module"
        phase="Phase 11"
        summary="Warehouse records and their inventory breakdowns will be implemented here."
      />
    </PageContainer>
  );
}