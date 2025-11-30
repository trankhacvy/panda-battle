import { Suspense } from "react";
import { RefreshView } from "./_components/refresh-view";

export default function RefreshPage() {
  return (
    <Suspense>
      <RefreshView />
    </Suspense>
  );
}
