import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export default function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Inventory position, open requests, and procurement activity across all three warehouses."
      />
      <ModulePlaceholder
        module="Dashboard metrics and analytics"
        phase="Phase 08"
        summary="Inventory value, stock health, request queue, and equipment availability will be derived from domain records in the next phase."
      />
    </PageContainer>
  );
}
