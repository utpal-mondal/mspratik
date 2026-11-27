import Head from "next/head";
import PointViewPage from "@/components/points/PointViewPage";

const LoadingPointViewPage = () => (
  <>
    <Head>
      <title>View Loading Point | Pratik Transport</title>
      <meta name="description" content="View loading point details" />
    </Head>
    <PointViewPage resource="loading-points" title="Loading Points" />
  </>
);

export default LoadingPointViewPage;
