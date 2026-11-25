import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export default function CategoriesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Categories"
        description="Material groupings used across inventory reporting and procurement."
      />
      <ModulePlaceholder
        module="Categories module"
        phase="Phase 10"
        summary="Category management and its effect on inventory filters will be implemented here."
      />
    </PageContainer>
  );
}