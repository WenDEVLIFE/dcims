import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export default function MaterialsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Materials"
        description="Material master list with stock levels, unit costs, and reorder thresholds."
      />
      <ModulePlaceholder
        module="Materials module"
        phase="Phase 09"
        summary="The material catalogue, per-warehouse balances, and weighted-average costing will be implemented here."
      />
    </PageContainer>
  );
}