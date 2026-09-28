import Head from "next/head";
import withAuth from "../../components/withAuth";

const SettingsPage = () => {
  return (
    <>
      <Head>
        <title>Settings | Pratik Transport</title>
        <meta name="description" content="Shipquick Settings" />
      </Head>

      <main className="flex-1 p-4 md:p-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>
      </main>
    </>
  );
};

export default withAuth(SettingsPage);
