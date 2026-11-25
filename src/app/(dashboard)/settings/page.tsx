import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export default function SettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Company profile, appearance, inventory preferences, and demo data controls."
      />
      <ModulePlaceholder
        module="Settings module"
        phase="Phase 22"
        summary="Settings persistence and the demo data reset flow will be implemented here."
      />
    </PageContainer>
  );
}