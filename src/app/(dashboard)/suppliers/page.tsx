import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export default function SuppliersPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Suppliers"
        description="Fictional Davao suppliers and their order history."
      />
      <ModulePlaceholder
        module="Suppliers module"
        phase="Phase 16"
        summary="Supplier records and their procurement relationships will be implemented here."
      />
    </PageContainer>
  );
}