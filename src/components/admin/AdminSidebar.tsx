// ============================================
// components/Sidebar.tsx (Updated)
// ============================================
import {
  Home, Building2, Calendar, Users, Settings, FileText,
  DollarSign, BarChart3, Database, ChevronRight, HelpCircle, X, Package,
  IndianRupeeIcon
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  submenu?: SubMenuItem[];
}

interface SubMenuItem {
  id: string;
  label: string;
  path: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      path: '/dashboard'
    },


     {
      id: 'mdapproval',
      label: 'MD Approvals',
      icon: <Package className="w-5 h-5" />,
      path: '/MdApprovalDashboard',
      submenu: [
        { id: 'all-batches', label: 'All Batches', path: '/MdApprovalDashboard' },
                { id: 'all-geo=drilldown', label: 'District DrillDown', path: '/DrillDownTable' },

     //   { id: 'upload-batch', label: 'Upload Batch', path: '/batches/upload' },
      //  { id: 'batch-status', label: 'Batch Status', path: '/batches/status' }
      ]
    },
  
    {
      id: 'sent-to-bank',
      label: 'GM(Fin) Sent to Bank',
      icon: <Package className="w-5 h-5" />,
      path: '/cggbatches',
      submenu: [
        { id: 'all-batches', label: 'All Batches', path: '/cggbatches' },
     //   { id: 'upload-batch', label: 'Upload Batch', path: '/batches/upload' },
      //  { id: 'batch-status', label: 'Batch Status', path: '/batches/status' }
      ]
    },
   /* {
      id: 'preprocess',
      label: 'Pre-Processing',
      icon: <FileText className="w-5 h-5" />,
      path: '/preprocess',
      badge: 890,
      submenu: [
        { id: 'validation', label: 'Data Validation', path: '/preprocess/validation' },
        { id: 'penny-drop', label: 'Penny Drop', path: '/preprocess/penny-drop' },
        { id: 'corrections', label: 'Corrections', path: '/preprocess/corrections' }
      ]
    },*/
    {
      id: 'reconciliation',
      label: 'Bank Responses',
      icon: <IndianRupeeIcon className="w-5 h-5" />,
      path: '/reconciliation',
      submenu: [
        { id: 'variance-analysis', label: 'Reconciliation', path: '/reconciliation' },
        { id: 'rejections', label: 'Rejections', path: '/ConsolidatedReportDashboard' }
      ]
    },
      {
      id: 'beneficiaries',
      label: 'Beneficiaries',
      icon: <Users className="w-5 h-5" />,
      path: '/beneficiaries',
      submenu: [
        { id: 'beneficiaries', label: 'Beneficiaries', path: '/PayRecordsDashboard' },
      ]
    },
 {
  id: 'reports',
  label: 'Reports',
  icon: <FileText className="w-5 h-5" />,
  path: '/reports',
  submenu: [
    { id: 'daily-report', label: 'Daily Status', path: '/reports/daily' },
    { id: 'daily-stage-report', label: 'Daily Stage Report', path: '/DailyStageReportDashboard' },
    { id: 'rejection-report', label: 'Rejection Analysis', path: '/reports/rejections' },
    { id: 'bank-report', label: 'Bank Report', path: '/BankReportDashboard' },
    { id: 'apbs-failure-report', label: 'APBS Failure Report', path: '/ApbsFailureReport' },
    { id: 'apbs-failure-drilldown', label: 'APBS Failure Drilldown', path: '/reports/apbs-failures/drilldown' },
    { id: 'failure-tracking', label: 'Cumulative Failures', path: '/reports/apbs-failures' },
    { id: 'all-failures', label: 'All Failures', path: '/allfailures' },
    { id: 'failure-report-dashboard', label: 'Failure Dashboard', path: '/FailureReportDashboard' },
    { id: 'integrated-kpi', label: 'Integrated KPI Dashboard', path: '/IntegratedKPIDashboard' },
  ]
},
 
    {
      id: 'users',
      label: 'User Management',
      icon: <Users className="w-5 h-5" />,
      path: '/users',
      submenu: [
        { id: 'all-users', label: 'All Users', path: '/users/all' },
        { id: 'add-user', label: 'Add User', path: '/users/add' }
      ]
    },
    {
      id: 'system',
      label: 'System',
      icon: <Database className="w-5 h-5" />,
      path: '/system',
      submenu: [
        { id: 'config', label: 'Configuration', path: '/system/config' },
        { id: 'audit-logs', label: 'Audit Logs', path: '/system/audit' },
        { id: 'backups', label: 'Backups', path: '/system/backups' }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      path: '/settings',
      submenu: [
        { id: 'general', label: 'General', path: '/settings/general' },
        { id: 'users-settings', label: 'Users', path: '/settings/users' },
        { id: 'security', label: 'Security', path: '/settings/security' }
      ]
    }
  ];

  const handleMenuClick = (item: MenuItem) => {
    if (item.submenu) {
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
    return location.pathname === item.path || 
           (item.submenu && item.submenu.some(sub => location.pathname === sub.path));
  };

  const isActiveSubmenu = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4">
          {/* Logo Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex items-center justify-center">
    <img 
      src="/logo.png" 
      alt="Indiramma Logo" 
      className="w-full h-full object-contain"
    />
  </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Indiramma</h2>
                <p className="text-xs text-gray-600">Payment System</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActiveMenu(item)
                      ? 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-600 border-2 border-indigo-500'
                      : 'text-gray-700 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActiveMenu(item) ? 'text-indigo-600' : 'text-gray-600'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {item.submenu && (
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          expandedMenu === item.id ? 'rotate-90' : ''
                        }`}
                      />
                    )}
                  </div>
                </button>

                {/* Submenu */}
                {item.submenu && expandedMenu === item.id && (
                  <div className="ml-11 mt-1 space-y-1">
                    {item.submenu.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => handleSubmenuClick(subItem.path)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors border-l-3 ${
                          isActiveSubmenu(subItem.path)
                            ? 'bg-indigo-50 text-indigo-600 font-medium border-indigo-500'
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

        

          {/* Help Section */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-900">Need Help?</h3>
            </div>
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              Contact support for assistance with the system
            </p>
            <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;