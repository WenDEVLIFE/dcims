import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export default function ProjectsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Projects"
        description="Davao construction sites consuming materials and equipment."
      />
      <ModulePlaceholder
        module="Projects module"
        phase="Phase 13"
        summary="Project records, allocated inventory, and consumption history will be implemented here."
      />
    </PageContainer>
  );
}