import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  Settings as SettingsIcon,
  Sliders,
  Key,
  Zap,
  Grid,
  Share2,
  Building,
  ArrowRight,
  User,
  Shield,
} from "lucide-react";
import withAuth from "../../components/withAuth";
import usePermission from "../../hook/usePermission";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("global_settings");
  const { isCadmin } = usePermission();

  const settingsTabs = [
    {
      id: "global_settings",
      icon: <SettingsIcon size={18} />,
      label: "Global Settings",
    },
    {
      id: "general_settings",
      icon: <Sliders size={18} />,
      label: "General Settings",
    },
    { id: "access", icon: <Key size={18} />, label: "Access" },
    { id: "automation", icon: <Zap size={18} />, label: "Automation" },
    { id: "extension", icon: <Grid size={18} />, label: "Extensions" },
    { id: "integrations", icon: <Share2 size={18} />, label: "Integrations" },
  ];

  const settingsCards = {
    global_settings: [
      {
        title: "Company Details",
        description: "Company name, address, and contact information",
        icon: <Building size={24} />,
        link: "/settings/company-details",
      },
    ],
    general_settings: [],
    access: [
      ...(isCadmin()
        ? [
            {
              title: "User",
              description: "Create and manage users",
              icon: <User size={24} />,
              link: "/settings/user",
            },
            {
              title: "Roles",
              description: "Create and manage roles and permissions",
              icon: <Shield size={24} />,
              link: "/settings/roles",
            },
          ]
        : []),
    ],
    integrations: [],
    automation: [],
    extension: [],
  };

  const renderTabContent = (tabId: string) => {
    const cards = settingsCards[tabId as keyof typeof settingsCards] || [];

    if (cards.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No settings available for this category yet.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {cards.map((card, index) => (
          <Link
            key={index}
            href={card.link}
            className="group no-underline p-6 bg-white rounded-2xl border border-cream-200 hover:border-cream-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gradient-to-br from-cream-100 to-cream-50 rounded-xl border border-cream-200 group-hover:scale-110 transition-transform duration-300">
                {card.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-800 mb-2 group-hover:text-gray-900 no-underline">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 no-underline">
                  {card.description}
                </p>
                <div className="flex items-center text-sm font-medium text-gray-700 group-hover:text-gray-900 no-underline">
                  Configure
                  <ArrowRight
                    size={16}
                    className="ml-1 group-hover:translate-x-1 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Settings | A Unique Tell</title>
        <meta name="description" content="Shipquick Settings" />
      </Head>

      <main className="flex-1 p-4 md:p-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-cream-200 p-4 sticky top-24">
              <div className="space-y-1">
                {settingsTabs.map((tab, index) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 animate-slide-in ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-cream-200 to-cream-100 shadow-sm text-gray-900"
                        : "hover:bg-cream-50 text-gray-700 hover:text-gray-900"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div
                      className={`transition-all duration-300 ${activeTab === tab.id ? "scale-110" : ""}`}
                    >
                      {tab.icon}
                    </div>
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-cream-200 p-6 md:p-8 animate-scale-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {settingsTabs.find((tab) => tab.id === activeTab)?.label ||
                    "Settings"}
                </h2>
                {/* {activeTab === 'integrations' && (
                    <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-all duration-300 hover:scale-105">
                      <Plus size={18} />
                      <span>Add Integration</span>
                    </button>
                  )} */}
              </div>
              {renderTabContent(activeTab)}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default withAuth(SettingsPage);
