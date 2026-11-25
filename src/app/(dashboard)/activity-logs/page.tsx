import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export default function ActivityLogsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Activity logs"
        description="Chronological record of every domain operation."
      />
      <ModulePlaceholder
        module="Activity logs module"
        phase="Phase 19"
        summary="The activity feed, filtering, and retention rules will be implemented here."
      />
    </PageContainer>
  );
}