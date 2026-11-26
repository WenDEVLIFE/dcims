import { Suspense } from "react";

import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { WarehouseDetail } from "@/features/warehouses/warehouse-detail";

export default function WarehouseDetailPage({ params }: { params: Promise<{ warehouseId: string }> }) {
  return (
    <Suspense fallback={<PageContainer><LoadingState rows={6} /></PageContainer>}>
      <WarehouseRoute params={params} />
    </Suspense>
  );
}

async function WarehouseRoute({ params }: { params: Promise<{ warehouseId: string }> }) {
  const { warehouseId } = await params;
  return <WarehouseDetail warehouseId={warehouseId} />;
}
