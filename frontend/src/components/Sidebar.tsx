import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import usePermission from "../hook/usePermission";
import Link from "next/link";
import {
  LayoutDashboard,
  Settings,
  ChevronDown,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
}

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  submenu?: { name: string; path: string }[];
}

const Sidebar = ({ isOpen, isCollapsed }: SidebarProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const { isCadmin } = usePermission();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleSubmenu = (itemName: string, e: React.MouseEvent) => {
    if (!isCollapsed) {
      e.preventDefault(); // Prevent navigation when toggling submenu

      setExpandedItems((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(itemName)) {
          newSet.delete(itemName); // Close this submenu
        } else {
          // Clear all other expanded items and only open this one
          newSet.clear();
          newSet.add(itemName); // Open this submenu
        }
        return newSet;
      });
    }
  };

  const handleMainOptionClick = (item: any, e: React.MouseEvent) => {
    // If this item has no submenu, close all expanded submenus
    if (!item.submenu) {
      setExpandedItems(new Set());
    }
  };

  const menuItems = useMemo<MenuItem[]>(
    () => [
      {
        name: "Dashboard",
        icon: <LayoutDashboard size={20} />,
        path: "/dashboard",
      },
    ],
    [],
  );

  useEffect(() => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      let changed = false;
      menuItems.forEach((item) => {
        if (item.submenu) {
          const hasActiveSub = item.submenu.some(
            (sub) => router.pathname === sub.path,
          );
          const isParentActive = router.pathname === item.path;
          if (hasActiveSub || isParentActive) {
            if (!newSet.has(item.name)) {
              newSet.add(item.name);
              changed = true;
            }
          }
        }
      });
      return changed ? newSet : prev;
    });
  }, [router.pathname, menuItems]);

  const visibleMenuItems = menuItems;

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden print:hidden"
          onClick={() => {
            // This will be handled by parent component
            const event = new CustomEvent("closeSidebar");
            window.dispatchEvent(event);
          }}
        />
      )}

      <div
        className={`fixed top-0 left-0 z-50 h-screen bg-white border-r border-cream-300 flex flex-col transition-all duration-300 print:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 ${isCollapsed ? "w-20" : "w-64"}`}
      >
        <div
          className={`p-3 border-b border-cream-200 bg-gradient-to-br from-cream-50 to-white transition-all duration-300 ${isCollapsed ? "px-4" : "px-6"}`}
        >
          <div
            className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}
          >
            <img
              src={
                isCollapsed
                  ? "/images/pratik-transport-logo-mini.png"
                  : "/images/pratik-transport-logo.png"
              }
              alt="Pratik Transport Logo"
              className={`animate-fade-in transition-all duration-300 ${isCollapsed ? "h-8 w-8 object-contain" : "h-10 w-auto"}`}
            />
          </div>
          {/* {!isCollapsed && user?.company_name && (
            <p className="mt-2 text-xs font-semibold text-gray-700 truncate">
              {user.company_name}
            </p>
          )} */}
        </div>

        <nav
          className="flex-1 flex flex-col py-2 overflow-y-auto overflow-x-hidden sidebar-scroll"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="px-3 space-y-0.5">
            {visibleMenuItems.map((item, index) => {
              const isActive = item.submenu
                ? item.submenu.some((sub) => router.pathname === sub.path)
                : router.pathname === item.path;

              const isExpanded = expandedItems.has(item.name);

              return (
                <div key={item.name}>
                  <Link
                    href={item.path}
                    className={`group flex items-center no-underline ${isCollapsed ? "justify-center px-2" : "gap-3 px-4"} py-[10px] rounded-xl transition-all duration-300 animate-slide-in relative ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105"
                        : "hover:bg-cream-50 hover:translate-x-1"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    title={isCollapsed ? item.name : ""}
                    onClick={(e) => {
                      if (item.submenu) {
                        toggleSubmenu(item.name, e);
                      } else {
                        handleMainOptionClick(item, e);
                      }
                    }}
                  >
                    <div
                      className={`transition-all duration-300 ${
                        isActive
                          ? "text-white scale-110"
                          : "text-gray-500 group-hover:text-gray-700 group-hover:scale-105"
                      }`}
                    >
                      {item.icon}
                    </div>
                    {!isCollapsed && (
                      <>
                        <span
                          className={`text-sm font-sm transition-colors ${
                            isActive
                              ? "text-white"
                              : "text-gray-600 group-hover:text-gray-800"
                          }`}
                        >
                          {item.name}
                        </span>
                        {item.submenu && (
                          <ChevronDown
                            size={16}
                            className={`ml-auto transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            } ${
                              isActive
                                ? "text-white"
                                : "text-gray-400 group-hover:text-gray-600"
                            }`}
                          />
                        )}
                        {isActive && !item.submenu && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                        )}
                      </>
                    )}
                  </Link>

                  {/* Render submenu if not collapsed and has submenu (show on expanded or when active) */}
                  {!isCollapsed && item.submenu && isExpanded && (
                    <div className="ml-4 mt-1 space-y-0.5 animate-fade-in">
                      {item.submenu.map((subItem, subIndex) => {
                        const isSubActive = router.pathname === subItem.path;
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.path}
                            className={`group flex items-center no-underline gap-3 px-4 py-[6px] rounded-lg transition-all duration-200 ${
                              isSubActive
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-gray-600 hover:bg-cream-500 hover:text-gray-800"
                            }`}
                            style={{
                              animationDelay: `${index * 50 + subIndex * 25}ms`,
                            }}
                          >
                            <span className="text-sm">{subItem.name}</span>
                            {isSubActive && (
                              <div className="ml-auto w-1 h-1 rounded-full bg-blue-600"></div>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {isCadmin() && (
            <div className="mt-auto px-3 border-t border-cream-200">
              <Link
                href="/settings"
                className={`group flex items-center no-underline ${isCollapsed ? "justify-center px-2" : "gap-3 px-4"} py-3 rounded-xl transition-all duration-300 hover:translate-x-1 relative ${
                  router.pathname.startsWith("/settings")
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105"
                    : "hover:bg-cream-50"
                }`}
                title={isCollapsed ? "Settings" : ""}
              >
                <Settings
                  size={20}
                  className={`transition-colors ${
                    router.pathname.startsWith("/settings")
                      ? "text-white scale-110"
                      : "text-gray-500 group-hover:text-gray-700 group-hover:scale-105"
                  }`}
                />
                {!isCollapsed && (
                  <>
                    <span
                      className={`text-sm font-medium transition-colors ${
                        router.pathname.startsWith("/settings")
                          ? "text-white"
                          : "text-gray-600 group-hover:text-gray-800"
                      }`}
                    >
                      Settings
                    </span>
                    {router.pathname.startsWith("/settings") && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                    )}
                  </>
                )}
              </Link>
            </div>
          )}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
