import { PageLoader } from "@/components/ui/PageLoader";

/** Instant loading UI while the root segment resolves (initial load + navigations). */
export default function RootLoading() {
  return <PageLoader fullViewport />;
}
