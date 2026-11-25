import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export default function MaterialRequestsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Material requests"
        description="Site requests routed through approval and warehouse fulfillment."
      />
      <ModulePlaceholder
        module="Material requests module"
        phase="Phase 14"
        summary="The request, approval, and partial fulfillment workflow will be implemented here."
      />
    </PageContainer>
  );
}