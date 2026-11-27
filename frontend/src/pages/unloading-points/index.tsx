import Head from "next/head";
import PointManagementPage from "@/components/points/PointManagementPage";

const UnloadingPointsPage = () => (
  <>
    <Head>
      <title>Unloading Points | Pratik Transport</title>
      <meta name="description" content="Manage unloading points" />
    </Head>
    <PointManagementPage resource="unloading-points" title="Unloading Points" />
  </>
);

export default UnloadingPointsPage;
