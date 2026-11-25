import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export default function EquipmentPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Equipment"
        description="Asset register with availability, assignment, and maintenance state."
      />
      <ModulePlaceholder
        module="Equipment module"
        phase="Phase 15"
        summary="Equipment assignment rules and maintenance history will be implemented here."
      />
    </PageContainer>
  );
}