import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export default function PurchaseOrdersPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Purchase orders"
        description="Draft, approved, and received orders with partial deliveries."
      />
      <ModulePlaceholder
        module="Purchase orders module"
        phase="Phase 17"
        summary="The purchase order lifecycle and receiving workflow will be implemented here."
      />
    </PageContainer>
  );
}