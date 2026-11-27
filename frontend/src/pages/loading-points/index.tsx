import Head from "next/head";
import PointManagementPage from "@/components/points/PointManagementPage";

const LoadingPointsPage = () => (
  <>
    <Head>
      <title>Loading Points | Pratik Transport</title>
      <meta name="description" content="Manage loading points" />
    </Head>
    <PointManagementPage resource="loading-points" title="Loading Points" />
  </>
);

export default LoadingPointsPage;
