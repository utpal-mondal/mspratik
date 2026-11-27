import { useRouter } from "next/router";
import Link from "next/link";
import withAuth from "../../components/withAuth";
import LoadingEntryPage from "./LoadingEntryPage";

const LoadingEntryRoute = () => {
  const router = useRouter();
  const rawId = router.query.folioId;
  const folioId = typeof rawId === "string" ? Number(rawId) : 0;
  if (!router.isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F2F5F9] text-sm text-[#5B6A7A]">
        Loading entry...
      </main>
    );
  }
  if (!Number.isInteger(folioId) || folioId <= 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#F2F5F9] text-sm text-[#5B6A7A]">
        <p>Invalid folio for loading entry.</p>
        <Link href="/cash-adv-folio" className="text-blue-700 underline">
          Return to Folio List
        </Link>
      </main>
    );
  }
  return <LoadingEntryPage folioId={folioId} />;
};

export default withAuth(LoadingEntryRoute);
