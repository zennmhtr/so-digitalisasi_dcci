import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Shield,
  Building2,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ChevronRight,
  Database,
  User,
  Key,
  FileText,
  GitPullRequest,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../services/api";

const Layout = ({ children, sidebarVisible = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [masterDataOpen, setMasterDataOpen] = useState(false);
  const [changeRequestsOpen, setChangeRequestsOpen] = useState(false);
  const [organizationStructureOpen, setOrganizationStructureOpen] =
    useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePasswordFormChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert("New password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);
    try {
      await authAPI.changePassword(passwordForm);
      alert("Password changed successfully");
      setShowChangePassword(false);
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      alert(
        error.response?.data?.message ||
        "Error changing password. Please try again."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const userRole = user?.role;
  const userPermissions =
    typeof userRole === "object" ? userRole?.permissions : [];
  const hasDashboardEditorAccess = userPermissions?.includes("SO DCI Editor");
  const hasSoBagianEditorAccess = userPermissions?.includes("SO Bagian Editor");
  const hasJobdescAccess =
    userPermissions?.includes("Jobdesc Management") ||
    userPermissions?.includes("Manage Users") ||
    userPermissions?.some((permission) =>
      [
        "Finance Department",
        "HRGA & IT Department",
        "Management Development",
        "Management Representative",
        "Manufacturing Battery",
        "Manufacturing Cable",
        "Marketing Battery Department",
        "Marketing Engineering",
        "MI & SHE",
        "PPIC",
        "Purchasing",
        "QA Department",
      ].includes(permission)
    );

  const hasSOChangeRequestsAccess =
    userPermissions?.includes("SO Changes Director Approval") ||
    userPermissions?.includes("SO Changes President Director Approval") ||
    userPermissions?.includes("View Own SO Change Requests");

  console.log("🔐 Layout SO Change Requests Check:", {
    userName: user?.name,
    hasSOChangeRequestsAccess: hasSOChangeRequestsAccess,
    userPermissions: userPermissions,
  });

  const hasSOBagianChangeRequestsAccess =
    userPermissions?.includes("SO Changes Director Approval") ||
    userPermissions?.includes("SO Bagian Request") ||
    userPermissions?.some(
      (perm) => perm.startsWith("Manager") && perm.endsWith("Approval")
    );

  console.log("🔐 Layout SO Bagian Change Requests Check:", {
    userName: user?.name,
    hasSOBagianChangeRequestsAccess: hasSOBagianChangeRequestsAccess,
    userPermissions: userPermissions,
  });

  const hasJobDescChangeRequestsAccess =
    userPermissions?.includes("Job Desc Request") ||
    userPermissions?.includes("Manage Users") ||
    userPermissions?.includes("SO Changes Director Approval") ||
    userPermissions?.some(
      (perm) => perm.startsWith("Manager") && perm.endsWith("Approval")
    );

  console.log("🔍 Layout Job Desc Request Permission Check:", {
    userName: user?.name,
    hasJobDescChangeRequestsAccess: hasJobDescChangeRequestsAccess,
    hasJobDescManagementAccess: hasJobdescAccess,
    hasDirectorPermission: userPermissions?.includes("SO Changes Director Approval"),
    userPermissions: userPermissions,
  });

  const hasMatriksSkillAccess =
    userPermissions?.includes("Manage Users") ||
    userPermissions?.includes("Matriks Skill Editor") ||
    userPermissions?.some(
      (perm) => perm.startsWith("Manager") && perm.endsWith("Approval")
    )

  console.log("🔍 Layout Matriks Skill Permission Check:", {
    userName: user?.name,
    hasMatriksSkillAccess: hasMatriksSkillAccess,
    userPermissions: userPermissions,
  });

  const hasMatriksSkillChangeRequestsAccess =
    userPermissions?.includes("SO Changes Director Approval") ||
    userPermissions?.includes("Matriks Skill Editor") ||
    userPermissions?.includes("Matriks Skill Request") ||
    userPermissions?.some(
      (perm) => perm.startsWith("Manager") && perm.endsWith("Approval")
    );

  console.log("🔐 Layout Matriks Skill Change Requests Check:", {
    userName: user?.name,
    hasMatriksSkillChangeRequestsAccess: hasMatriksSkillChangeRequestsAccess,
    userPermissions: userPermissions,
  });

  const hasMasterDataAccess =
    userPermissions?.includes("Manage Users") ||
    userPermissions?.includes("Manage Roles") ||
    userPermissions?.includes("Manage Departments");

  console.log("🔍 Layout Debug - Permission Check:", {
    userName: user?.name,
    userRole: userRole?.name,
    userRoleObject: userRole,
    userPermissions: userPermissions,
    permissionsIsArray: Array.isArray(userPermissions),
    permissionsLength: userPermissions?.length,
    hasDashboardEditorAccess: hasDashboardEditorAccess,
    hasJobDescChangeRequestsAccess: hasJobDescChangeRequestsAccess,
    hasSOChangeRequestsAccess: hasSOChangeRequestsAccess,
    hasSOBagianChangeRequestsAccess: hasSOBagianChangeRequestsAccess,
    hasSubmitPermission: userPermissions?.includes("Submit SO Changes"),
    hasApprovePermission:
      userPermissions?.includes("SO Changes Director Approval") ||
      userPermissions?.includes("SO Changes President Director Approval") ||
      userPermissions?.some(
        (perm) => perm.startsWith("Manager") && perm.endsWith("Approval")
      ),
    rawUserObject: user,
  });

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    ...(hasDashboardEditorAccess || hasSoBagianEditorAccess
      ? [
        {
          name: "Organization Structure DCI",
          icon: Building2,
          hasChildren: true,
          children: [
            ...(hasDashboardEditorAccess
              ? [
                {
                  name: "Organization Structure",
                  href: "/dashboard-editor",
                  icon: LayoutDashboard,
                },
              ]
              : []),
            ...(hasSoBagianEditorAccess
              ? [
                {
                  name: "SO Bagian",
                  href: "/so-bagian-editor",
                  icon: Building2,
                },
              ]
              : []),
          ],
        },
      ]
      : []),
    ...(hasJobdescAccess
      ? [
        {
          name: "Job Description",
          href: "/jobdesc-management",
          icon: FileText,
        },
      ]
      : []),
    ...(hasMatriksSkillAccess
      ? [
        {
          name: "Matriks Skill",
          href: "/matriks-skill",
          icon: ClipboardList,
        },
      ]
      : []),
    ...(hasSOBagianChangeRequestsAccess || hasSOChangeRequestsAccess || hasJobDescChangeRequestsAccess || hasMatriksSkillChangeRequestsAccess
      ? [
        {
          name: "Change Requests",
          icon: GitPullRequest,
          hasChildren: true,
          children: [
            ...(hasSOBagianChangeRequestsAccess
              ? [
                {
                  name: "SO Bagian Change Requests",
                  href: "/so-bagian-change-requests",
                  icon: GitPullRequest,
                },
              ]
              : []),
            ...(hasSOChangeRequestsAccess
              ? [
                {
                  name: "SO Change Requests",
                  href: "/so-change-requests",
                  icon: GitPullRequest,
                },
              ]
              : []),
            ...(hasJobDescChangeRequestsAccess
              ? [
                {
                  name: "JobDesc Change Requests",
                  href: "/jobdesc-change-requests",
                  icon: GitPullRequest,
                },
              ]
              : []),
            ...(hasMatriksSkillChangeRequestsAccess
              ? [
                {
                  name: "Matriks Skill Change Requests",
                  href: "/matriks-skill-change-requests",
                  icon: GitPullRequest,
                },
              ]
              : []),
          ],
        },
      ]
      : []),
    ...(hasMasterDataAccess
      ? [
        {
          name: "Master Data",
          icon: Database,
          hasChildren: true,
          children: [
            { name: "User Management", href: "/users", icon: Users },
            { name: "Role & Permission", href: "/roles", icon: Shield },
            { name: "Department", href: "/departments", icon: Building2 },
          ],
        },
      ]
      : []),
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      {sidebarVisible && (
        <div
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform lg:translate-x-0 lg:static lg:inset-0 transition duration-200 ease-in-out flex flex-col h-full`}
        >
          {/* Logo */}
          <div className="flex items-center h-16 px-4 bg-white border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <img
                src="/images/dharmabaru.png"
                alt="Dharma Logo"
                className="h-10 w-auto"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex-1 overflow-y-auto pb-6">
            <div className="px-4 space-y-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.hasChildren ? (
                    <div>
                      <button
                        onClick={() => {
                          if (item.name === "Master Data") {
                            setMasterDataOpen(!masterDataOpen);
                          } else if (
                            item.name === "Organization Structure DCI"
                          ) {
                            setOrganizationStructureOpen(
                              !organizationStructureOpen
                            );
                          } else if (item.name === "Change Requests") {
                            setChangeRequestsOpen(!changeRequestsOpen);
                          }
                        }}
                        className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-left"
                      >
                        <div className="flex items-start flex-1 min-w-0">
                          <item.icon className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="leading-tight text-left">
                            {item.name === "Organization Structure DCI" ? (
                              <>
                                Organization Structure
                                <br />
                                DCI
                              </>
                            ) : (
                              item.name
                            )}
                          </span>
                        </div>
                        {(item.name === "Master Data" && masterDataOpen) ||
                          (item.name === "Organization Structure DCI" &&
                            organizationStructureOpen) ||
                          (item.name === "Change Requests" && changeRequestsOpen) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      {((item.name === "Master Data" && masterDataOpen) ||
                        (item.name === "Organization Structure DCI" &&
                          organizationStructureOpen) ||
                        (item.name === "Change Requests" && changeRequestsOpen)) && (
                          <div className="ml-4 mt-2 space-y-1">
                            {item.children.map((child) => (
                              <NavLink
                                key={child.name}
                                to={child.href}
                                className={({ isActive }) =>
                                  `flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${isActive
                                    ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                                    : "text-gray-600 hover:bg-gray-50"
                                  }`
                                }
                              >
                                <child.icon className="w-4 h-4 mr-3" />
                                {child.name}
                              </NavLink>
                            ))}
                          </div>
                        )}
                    </div>
                  ) : (
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                          ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                          : "text-gray-700 hover:bg-gray-100"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </NavLink>
                  )}
                </div>
              ))}
            </div>
          </nav>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarVisible && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div
        className={`flex flex-col flex-1 overflow-hidden ${!sidebarVisible ? "w-full" : ""
          }`}
      >
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-6 bg-white shadow-sm border-b relative min-h-[80px] z-[100]">
          {sidebarVisible && (
            <button
              className="text-gray-500 hover:text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          )}

          <div className="flex-1"></div>

          {/* Profile Dropdown - Positioned at far right */}
          <div
            className="absolute right-4 top-1/2 transform -translate-y-1/2"
            ref={dropdownRef}
          >
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <img
                src="/logo/dci.png"
                alt="Profile"
                className="w-8 h-8 rounded-full object-contain border border-gray-200"
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || user?.username || "User"}
                </p>
                <p className="text-xs text-gray-500">
                  {typeof user?.role === "string"
                    ? user?.role
                    : user?.role?.name || "Role"}
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${profileDropdownOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="fixed top-20 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[999]">
                {/* Profile Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <img
                      src="/logo/dci.png"
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-contain border border-gray-200"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {user?.name || user?.username || "User"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {typeof user?.role === "string"
                          ? user?.role
                          : user?.role?.name || "Role"}{" "}
                        |{" "}
                        {typeof user?.department === "string"
                          ? user?.department
                          : user?.department?.name || "Department"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowChangePassword(true);
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <User className="w-4 h-4 mr-3" />
                    My Profile
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main
          className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6"
          style={{
            minHeight: "calc(100vh - 80px)",
            backgroundColor: "#f3f4f6",
          }}
        >
          {children || (
            <div style={{ padding: "20px", color: "#111827" }}>
              Loading content...
            </div>
          )}
        </main>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-8 border w-full max-w-md shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Change Password
              </h3>
              <button
                onClick={() => setShowChangePassword(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleChangePassword}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="oldPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Old Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="oldPassword"
                    name="oldPassword"
                    value={passwordForm.oldPassword}
                    onChange={handlePasswordFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="Enter Old Password*"
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordFormChange}
                    required
                    minLength="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="Enter New Password*"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirmed Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="Confirm Password*"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordForm({
                      oldPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={passwordLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {passwordLoading ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;