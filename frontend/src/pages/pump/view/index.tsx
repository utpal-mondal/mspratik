import { useEffect } from "react";
import { useRouter } from "next/router";
import withAuth from "../../../components/withAuth";

const PumpViewIndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/pump");
  }, [router]);

  return null;
};

export default withAuth(PumpViewIndexPage);
