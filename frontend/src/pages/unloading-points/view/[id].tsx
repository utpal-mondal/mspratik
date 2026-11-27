import Head from "next/head";
import PointViewPage from "@/components/points/PointViewPage";

const UnloadingPointViewPage = () => (
  <>
    <Head>
      <title>View Unloading Point | Pratik Transport</title>
      <meta name="description" content="View unloading point details" />
    </Head>
    <PointViewPage resource="unloading-points" title="Unloading Points" />
  </>
);

export default UnloadingPointViewPage;
