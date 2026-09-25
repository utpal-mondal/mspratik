import "../App.css";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap
import "react-datepicker/dist/react-datepicker.css"; // For date picker styles
import "../styles/animations.css"; // For custom animations
import type { AppProps } from "next/app";
import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { AuthProvider } from "../contexts/AuthContext";
import { getPageTitle } from "../config/pageTitles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "../components/Layout";
import ErrorBoundary from "../components/ErrorBoundary";
import { Poppins } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});
type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter();
  // Use the layout defined at the page level, or fallback to default layout
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);
  const pageTitle = getPageTitle(router.pathname);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Head>
            <title>{`${pageTitle} | A Unique Tell`}</title>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
          </Head>
          <div className={poppins.className}>
            {getLayout(<Component {...pageProps} />)}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
            />
          </div>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default MyApp;
