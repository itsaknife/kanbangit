import { Suspense } from "react";
import { CreateIssuePage } from "@/components/issues/CreateIssuePage";
import { Spinner } from "@/components/ui";
export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <CreateIssuePage />
    </Suspense>
  );
}
