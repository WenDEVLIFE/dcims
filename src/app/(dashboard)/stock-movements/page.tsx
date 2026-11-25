import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export default function StockMovementsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Stock movements"
        description="Stock-in, stock-out, transfers, adjustments, and material returns."
      />
      <ModulePlaceholder
        module="Stock movements module"
        phase="Phase 12"
        summary="Every inventory transaction, its audit trail, and constraint checks will be implemented here."
      />
    </PageContainer>
  );
}