// ============================================
// components/AdminSidebar.tsx — Role-Adaptive Navigation
// ============================================
import {
  Home, Truck, Package, Warehouse, FileText, Building2,
  DollarSign, BarChart3, Database, ChevronRight, HelpCircle, X,
  Settings, Users, Shield, TrendingUp, Calendar, Scale,
  ClipboardCheck, Receipt, MapPin, Activity, Wheat, CreditCard,
  BookOpen, Landmark, UserCog, MapPinned
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/markfed';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  submenu?: SubMenuItem[];
  roles?: UserRole[]; // if undefined, visible to all
}

interface SubMenuItem {
  id: string;
  label: string;
  path: string;
  roles?: UserRole[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasRole } = useAuth();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const allRoles = [UserRole.SUPER_ADMIN, UserRole.MD, UserRole.GM, UserRole.AO_CAO, UserRole.MANAGER_PROCUREMENT, UserRole.MANAGER_HR, UserRole.DM];

  const menuItems: MenuItem[] = useMemo(() => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      path: '/dashboard',
      roles: allRoles,
    },
    // ─── Maize MSP Data Entry ───────────────────
    {
      id: 'data-entry',
      label: 'Data Entry',
      icon: <Wheat className="w-5 h-5" />,
      path: '/data-entry',
      roles: [UserRole.SUPER_ADMIN, UserRole.AO_CAO, UserRole.DM],
      submenu: [
        { id: 'loan-sanction', label: 'Loan Sanction', path: '/data-entry/loan', roles: [UserRole.SUPER_ADMIN, UserRole.AO_CAO] },
        { id: 'drawdowns', label: 'District Transfers', path: '/data-entry/drawdowns', roles: [UserRole.SUPER_ADMIN, UserRole.AO_CAO] },
        { id: 'utilization', label: 'Utilization', path: '/data-entry/utilization', roles: [UserRole.SUPER_ADMIN, UserRole.DM] },
        { id: 'farmers', label: 'Farmers Data', path: '/data-entry/farmers', roles: [UserRole.SUPER_ADMIN, UserRole.DM] },
      ],
    },
    // ─── Procurement ───────────────────────────
    {
      id: 'procurement',
      label: 'Procurement',
      icon: <ClipboardCheck className="w-5 h-5" />,
      path: '/procurement',
      roles: [UserRole.SUPER_ADMIN, UserRole.MD, UserRole.AO_CAO, UserRole.DM],
      submenu: [
        { id: 'proc-centres', label: 'Centres', path: '/procurement/centres' },
        { id: 'proc-production', label: 'District Production', path: '/procurement/production' },
        { id: 'proc-tracking', label: 'Daily Tracking', path: '/procurement/tracking' },
      ],
    },
    // ─── Unloading ─────────────────────────────
    {
      id: 'unloading',
      label: 'Unloading Bills',
      icon: <Receipt className="w-5 h-5" />,
      path: '/unloading',
      roles: [UserRole.SUPER_ADMIN, UserRole.MD, UserRole.AO_CAO, UserRole.DM],
    },
    // ─── Reports ────────────────────────────────
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 className="w-5 h-5" />,
      path: '/reports',
      roles: allRoles,
      submenu: [
        { id: 'md-sheet', label: 'MD Sheet View', path: '/reports/md-sheet' },
        { id: 'farmers-sheet', label: 'Farmers Sheet View', path: '/reports/farmers-sheet' },
        { id: 'dpr-report', label: 'DPR Report', path: '/reports/dpr' },
        { id: 'reconciliation', label: 'Reconciliation', path: '/reports/reconciliation' },
        { id: 'historical', label: 'Historical Data', path: '/reports/historical' },
        { id: 'import-export', label: 'Import / Export', path: '/reports/import-export' },
      ],
    },
    // ─── Transportation ─────────────────────────
    {
      id: 'transportation',
      label: 'Transportation',
      icon: <Truck className="w-5 h-5" />,
      path: '/transportation',
      roles: allRoles,
      submenu: [
        { id: 'transport-dashboard', label: 'Dashboard', path: '/transportation' },
        { id: 'transport-vehicles', label: 'Vehicles', path: '/transportation/vehicles' },
        { id: 'transport-transporters', label: 'Transporters', path: '/transportation/transporters' },
        { id: 'transport-slabs', label: 'Slabs', path: '/transportation/slabs' },
        { id: 'transport-trips', label: 'Trips', path: '/transportation/trips' },
        { id: 'transport-billing', label: 'Billing', path: '/transportation/billing' },
        { id: 'transport-payments', label: 'Payments', path: '/transportation/payments' },
      ],
    },
    // ─── Gunny Bags ─────────────────────────────
    {
      id: 'gunny-bags',
      label: 'Gunny Bags',
      icon: <Package className="w-5 h-5" />,
      path: '/gunny-bags',
      roles: allRoles,
      submenu: [
        { id: 'gunny-dashboard', label: 'Dashboard', path: '/gunny-bags' },
        { id: 'gunny-vendors', label: 'Vendors', path: '/gunny-bags/vendors' },
        { id: 'gunny-types', label: 'Types', path: '/gunny-bags/types' },
        { id: 'gunny-procurement', label: 'Procurement', path: '/gunny-bags/procurement' },
        { id: 'gunny-grn', label: 'GRN', path: '/gunny-bags/grn' },
        { id: 'gunny-inventory', label: 'Inventory', path: '/gunny-bags/inventory' },
        { id: 'gunny-issuance', label: 'Issuance', path: '/gunny-bags/issuance' },
        { id: 'gunny-performance', label: 'Performance', path: '/gunny-bags/performance' },
      ],
    },
    // ─── Storage ────────────────────────────────
    {
      id: 'storage',
      label: 'Storage',
      icon: <Warehouse className="w-5 h-5" />,
      path: '/storage',
      roles: allRoles,
      submenu: [
        { id: 'storage-dashboard', label: 'Dashboard', path: '/storage' },
        { id: 'storage-billing', label: 'Billing', path: '/storage/billing' },
        { id: 'storage-insurance', label: 'Insurance', path: '/storage/insurance' },
        { id: 'storage-movements', label: 'Movements', path: '/storage/movements' },
        { id: 'storage-utilization', label: 'Utilization', path: '/storage/utilization' },
        { id: 'storage-quality', label: 'Quality', path: '/storage/quality' },
        { id: 'storage-reconciliation', label: 'Reconciliation', path: '/storage/reconciliation' },
        { id: 'storage-cost-analysis', label: 'Cost Analysis', path: '/storage/cost-analysis' },
        { id: 'storage-compliance', label: 'Compliance', path: '/storage/compliance' },
      ],
    },
    // ─── Release Orders ─────────────────────────
    {
      id: 'release-orders',
      label: 'Release Orders',
      icon: <FileText className="w-5 h-5" />,
      path: '/release-orders',
      roles: allRoles,
      submenu: [
        { id: 'ro-dashboard', label: 'Dashboard', path: '/release-orders' },
        { id: 'ro-generate', label: 'Generate', path: '/release-orders/generate' },
        { id: 'ro-payments', label: 'Payments', path: '/release-orders/payments' },
        { id: 'ro-amendments', label: 'Amendments', path: '/release-orders/amendments' },
        { id: 'ro-lifting', label: 'Lifting', path: '/release-orders/lifting' },
        { id: 'ro-delivery', label: 'Delivery', path: '/release-orders/delivery' },
        { id: 'ro-weighment', label: 'Weighment', path: '/release-orders/weighment' },
        { id: 'ro-gate-pass', label: 'Gate Pass', path: '/release-orders/gate-pass' },
        { id: 'ro-closure', label: 'Closure', path: '/release-orders/closure' },
        { id: 'ro-analytics', label: 'Analytics', path: '/release-orders/analytics' },
      ],
    },
    // ─── Admin (SUPER_ADMIN only) ───────────────
    {
      id: 'admin',
      label: 'Admin',
      icon: <Settings className="w-5 h-5" />,
      path: '/admin',
      roles: [UserRole.SUPER_ADMIN],
      submenu: [
        { id: 'admin-users', label: 'User Management', path: '/admin/users' },
        { id: 'admin-districts', label: 'Districts', path: '/admin/districts' },
        { id: 'admin-pacs', label: 'PACS / DCMS / FPO', path: '/admin/pacs' },
        { id: 'admin-seasons', label: 'Seasons', path: '/admin/seasons' },
        { id: 'admin-banks', label: 'Banks', path: '/admin/banks' },
        { id: 'admin-util-heads', label: 'Utilization Heads', path: '/admin/utilization-heads' },
        { id: 'admin-approvals', label: 'Approvals', path: '/admin/approvals' },
        { id: 'admin-commodities', label: 'Commodities', path: '/admin/commodities' },
        { id: 'admin-season-comm', label: 'Season Commodities', path: '/admin/season-commodities' },
        { id: 'admin-godowns', label: 'Godowns', path: '/admin/godowns' },
        { id: 'admin-contractors', label: 'H&T Contractors', path: '/admin/contractors' },
        { id: 'admin-godown-contr', label: 'Godown Contractors', path: '/admin/godown-contractors' },
        { id: 'admin-gunny-supp', label: 'Gunny Suppliers', path: '/admin/gunny-suppliers' },
      ],
    },
  ], []);

  // Filter menu items by current user's role
  const visibleMenuItems = useMemo(() => {
    return menuItems
      .filter((item) => !item.roles || item.roles.some((r) => hasRole(r)))
      .map((item) => ({
        ...item,
        submenu: item.submenu?.filter(
          (sub) => !sub.roles || sub.roles.some((r) => hasRole(r))
        ),
      }));
  }, [menuItems, hasRole]);

  const handleMenuClick = (item: MenuItem) => {
    if (item.submenu && item.submenu.length > 0) {
      setExpandedMenu(expandedMenu === item.id ? null : item.id);
    } else {
      navigate(item.path);
      onClose();
    }
  };

  const handleSubmenuClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActiveMenu = (item: MenuItem) => {
    return (
      location.pathname === item.path ||
      location.pathname.startsWith(item.path + '/') ||
      (item.submenu && item.submenu.some((sub) => location.pathname === sub.path))
    );
  };

  const isActiveSubmenu = (path: string) => location.pathname === path;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4">
          {/* Close button (mobile) */}
          <div className="flex items-center justify-end mb-2 lg:hidden">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Current user role badge */}
          {user && (
            <div className="mb-4 px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <p className="text-xs text-gray-500">Logged in as</p>
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-blue-600 font-medium capitalize">
                {user.role.replace('_', ' ')}
                {user.district_name ? ` - ${user.district_name}` : ''}
              </p>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-1">
            {visibleMenuItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActiveMenu(item)
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border-2 border-blue-500 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActiveMenu(item) ? 'text-blue-600' : 'text-gray-600'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          isActiveMenu(item) ? 'bg-blue-100 text-blue-700' : 'bg-red-500 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.submenu && item.submenu.length > 0 && (
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${expandedMenu === item.id ? 'rotate-90' : ''}`}
                      />
                    )}
                  </div>
                </button>

                {item.submenu && expandedMenu === item.id && (
                  <div className="ml-11 mt-1 space-y-1">
                    {item.submenu.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => handleSubmenuClick(subItem.path)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors border-l-2 ${
                          isActiveSubmenu(subItem.path)
                            ? 'bg-blue-50 text-blue-600 font-medium border-blue-500'
                            : 'text-gray-600 hover:bg-gray-50 border-gray-200'
                        }`}
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Help */}
          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900">Need Help?</h3>
            </div>
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              Contact MARKFED support for assistance
            </p>
            <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/30">
              Contact Support
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
