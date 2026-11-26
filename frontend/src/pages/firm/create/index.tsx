import Head from "next/head";
import { useRouter } from "next/router";
import withAuth from "../../../components/withAuth";
import AccessDenied from "../../../components/AccessDenied";
import usePermission from "../../../hook/usePermission";
import FirmForm from "../(component)/FirmForm";

const CreateFirmPage = () => {
  const router = useRouter();
  const { isCadmin } = usePermission();

  if (!isCadmin()) return <AccessDenied />;

  return (
    <>
      <Head>
        <title>Create Firm | Pratik Transport</title>
        <meta name="description" content="Create a firm" />
      </Head>
      <main className="min-h-screen bg-[#F2F5F9] px-6 pb-8 pt-6 text-[#17222E] md:px-8">
        <div className="mx-auto flex flex-col gap-4">
          <FirmForm
            mode="create"
            firm={null}
            onCancel={() => void router.push("/firm")}
            onSaved={() => void router.push("/firm")}
          />
        </div>
      </main>
    </>
  );
};

export default withAuth(CreateFirmPage);
