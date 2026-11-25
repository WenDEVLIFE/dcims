import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export default function ReportsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Reports"
        description="Inventory valuation, consumption, and procurement summaries."
      />
      <ModulePlaceholder
        module="Reports module"
        phase="Phase 18"
        summary="Report generation and CSV export will be implemented here."
      />
    </PageContainer>
  );
}