import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import { AdminLayout } from './components/admin/AdminLayout';

// Pages
import LoginPage from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import { UsersManagement } from './pages/UsersManagement/UsersManagement';
import { BatchesManagement } from './pages/Batches/BatchesManagement';
import PennyDropVerification from './pages/PennyDrop/PennyDropVerification';
import BatchDetail from './pages/Batches/BatchDetail';
import PennyDropBatchList from './pages/PennyDrop/PennyDropBatchList';
import PennyDropBatchDetail from './pages/PennyDrop/PennyDropBatchDetail';
import PennyDropBeneficiaryList from './pages/PennyDrop/PennyDropBeneficiaryList';
import PennyDropModule from './pages/PennyDrop/PennyDropModule';
import BatchDetailScreen from './pages/Batches/BatchDetail';
import BeneficiaryListScreen from './pages/Batches/BeneficiaryListScreen';
import BeneficiaryList from './pages/Beneficiary/BeneficiaryList';
import ReconciliationList from './pages/Reconciliation/ReconciliationList';
import ReconciliationRecords from './pages/Reconciliation/ReconciliationRecords';
import ReconciliationDetail from './pages/Reconciliation/ReconciliationDetail';
import { DailyReport } from './pages/Reports/DailyReport';
import { RejectionReport } from './pages/Reports/RejectionReport';
import { FinancialReport } from './pages/Reports/FinancialReport';
import BeneficiaryUpload from './pages/BeneficiaryUpload/BeneficiaryUpload';
import BeneficiaryFilters from './pages/Beneficiary/BeneficiaryFilters';
import ReconBeneficiaryList from './pages/adhocbene/BeneficiaryList';
import RecoBeneficiaryTimeline from './pages/adhocbene/BeneficiaryTimeline';
import IntegratedBeneficiaryList from './pages/IntegratedBeneficiary/IntegratedBeneficiaryList';
import IntegratedBeneficiaryTimeline from './pages/IntegratedBeneficiary/IntegratedBeneficiaryTimeline';
import IntegratedKPIDashboard from './pages/IntegratedBeneficiary/IntegratedKPIDashboard';
import AadhaarFailuresReport from './pages/IntegratedBeneficiary/AadhaarFailuresReport';
import CustomReportBuilder from './pages/allreports/CustomReportBuilder';
import WeeklyDisbursement from './pages/allreports/WeeklyDisbursement';
import PayRecordsDashboard from './pages/allreports/PayRecordsDashboard';
import DailyStageReportDashboard from './pages/allreports/DailyStageReportDashboard';
import ConsolidatedReportDashboard from './pages/allreports/ConsolidatedReportDashboard';
import BeneficiaryTimeline from './pages/allreports/BeneficiaryTimeline';
import FailureReportDashboard from './pages/allreports/FailureReportDashboard';
import BankReportDashboard from './pages/allreports/BankReportDashboard';
import { ApbsFailureReport } from './pages/Reports/ApbsFailureReport';
import { ApbsFailureDrillDown } from './pages/Reports/ApbsFailureDrillDown';
import { ApbsCumulativeFailureDrillDown } from './pages/Reports/ApbsCumulativeFailureDrillDown';
import { ApbsFailureBeneficiaryDetails } from './pages/Reports/ApbsFailureBeneficiaryDetails';
import BatchDetails from './pages/CGGbatch/BatchDetails';
import BatchList from './pages/CGGbatch/BatchList';
import AllFailuresScreen from './pages/CGGbatch/AllFailuresScreen';
import SuccessAnalysisDashboard from './pages/CGGbatch/SuccessAnalysisDashboard';
import ExecutiveDashboard from './pages/dashboard/ExecutiveDashboard';
import ApprovedNotPaid from './pages/mdapaproval/approvednotpaid';
import BeneficiarySearch from './pages/mdapaproval/beneficiarysearch';
import PaymentDashboard from './pages/mdapaproval/paymentdashboard';
import StageWiseReport from './pages/mdapaproval/Stagewisereport';
import DrillDownTable from './pages/mdapaproval/DrillDownTable';
import MdApprovalDashboard from './pages/mdapaproval/mdapprovaldashboard';

// ============================================================================
// FILE TRACKING COMPONENTS - NEW
// ============================================================================
import FileTrackingDashboard from './pages/Reconciliation/FileTrackingDashboard';
import FileTrackingList from './pages/Reconciliation/FileTrackingList';

// Placeholder pages
const PreProcessingPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Pre-Processing</h1></div>;
const ReconciliationPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Reconciliation</h1></div>;
const ReportsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Reports</h1></div>;
const BeneficiariesPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Beneficiaries</h1></div>;
const CheckpointsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Checkpoints</h1></div>;
const MonitoringPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Monitoring</h1></div>;
const SystemPage = () => <div className="p-6"><h1 className="text-2xl font-bold">System Configuration</h1></div>;
const SettingsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1></div>;

// 404 Page Component
const NotFoundPage: React.FC = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <a
          href="/ExecutiveDashboard"
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-blue-700 transition-all"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
};

function App() {
  return (
    <NotificationProvider defaultPosition="top-right" maxNotifications={5}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Admin Routes - Protected by Layout */}
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<Navigate to="/ExecutiveDashboard" replace />} />

              {/* Main Dashboard */}
              <Route path="dashboard" element={<ExecutiveDashboard />} />

              {/* Batch Management Routes */}
              <Route path="batches" element={<BatchesManagement />} />
              <Route path="batches/:batchId" element={<BatchDetailScreen />} />
              
              {/* Batch-specific beneficiary routes (accessed from batch detail) */}
              <Route path="batches/:batchId/beneficiaries" element={<BeneficiaryList />} />

              {/* Penny Drop Module Routes */}
              <Route path="penny-drop">
                <Route index element={<PennyDropModule />} />
                <Route path="batches" element={<PennyDropBatchList />} />
                <Route path="batch/:batchId" element={<PennyDropBatchDetail />} />
                <Route path="batch/:batchId/beneficiaries" element={<PennyDropBeneficiaryList />} />
                <Route path="verification" element={<PennyDropVerification />} />
              </Route>

              {/* ========================================
                  RECONCILIATION ROUTES - ENHANCED WITH FILE TRACKING
                  ======================================== */}
              <Route path="reconciliation">
                <Route index element={<ReconciliationList />} />
                <Route path=":batchId" element={<ReconciliationDetail />} />
                <Route path=":batchId/records" element={<ReconciliationRecords />} />
                
                {/* FILE TRACKING ROUTES - NEW */}
                <Route path="file-tracking">
                  <Route index element={<FileTrackingDashboard />} />
                  <Route path="dashboard" element={<FileTrackingDashboard />} />
                  <Route path="list" element={<FileTrackingList />} />
                </Route>
              </Route>

              {/* Payment Processing */}
              <Route path="preprocess" element={<PreProcessingPage />} />

              {/* Reports */}
              <Route path="reports" element={<ReportsPage />} />
              <Route path="reports/daily" element={<DailyReport />} />
              <Route path="reports/rejections" element={<RejectionReport />} />
              <Route path="reports/financial" element={<FinancialReport />} />
              <Route path="reports/district" element={<DailyReport />} />

              {/* Global Beneficiaries Management (standalone access) */}
              <Route path="beneficiaries" element={<BeneficiaryList />} />
              <Route path="beneficiaries/search" element={<div className="p-6"><h2 className="text-xl font-bold">Search Beneficiary</h2></div>} />
              <Route path="beneficiaries/upload" element={<div className="p-6"><h2 className="text-xl font-bold">Bulk Upload</h2></div>} />
              <Route path="beneficiaries/corrections" element={<div className="p-6"><h2 className="text-xl font-bold">Corrections Queue</h2></div>} />

              {/* Checkpoints */}
              <Route path="checkpoints" element={<CheckpointsPage />} />

              {/* Monitoring */}
              <Route path="monitoring" element={<MonitoringPage />} />

              {/* System */}
              <Route path="system" element={<SystemPage />} />
              <Route path="system/config" element={<div className="p-6"><h2 className="text-xl font-bold">System Configuration</h2></div>} />
              <Route path="system/audit" element={<div className="p-6"><h2 className="text-xl font-bold">Audit Logs</h2></div>} />
              <Route path="system/backups" element={<div className="p-6"><h2 className="text-xl font-bold">Backups</h2></div>} />

              {/* User Management */}
              <Route path="users" element={<UsersManagement />} />
              <Route path="users/all" element={<UsersManagement />} />
              <Route path="users/add" element={<div className="p-6"><h2 className="text-xl font-bold">Add User</h2></div>} />

              {/* Settings */}
              <Route path="settings" element={<SettingsPage />} />
              <Route path="settings/general" element={<div className="p-6"><h2 className="text-xl font-bold">General Settings</h2></div>} />
              <Route path="settings/users" element={<div className="p-6"><h2 className="text-xl font-bold">User Settings</h2></div>} />
              <Route path="settings/security" element={<div className="p-6"><h2 className="text-xl font-bold">Security Settings</h2></div>} />

              <Route path="/BeneficiaryUpload" element={<BeneficiaryUpload />} />
              <Route path="/ReconBeneficiaryList" element={<ReconBeneficiaryList />} />
              <Route path="/ReconBeneficiaryTimeline" element={<RecoBeneficiaryTimeline />} />
              <Route path="/IntegratedBeneficiaryList" element={<IntegratedBeneficiaryList />} />
              <Route path="/IntegratedBeneficiaryTimeline" element={<IntegratedBeneficiaryTimeline />} />
              <Route path="/IntegratedKPIDashboard" element={<IntegratedKPIDashboard />} />
              <Route path="/AadhaarFailuresReport" element={<AadhaarFailuresReport />} />
              <Route path="/CustomReportBuilder" element={<CustomReportBuilder />} />
              <Route path="/WeeklyDisbursement" element={<WeeklyDisbursement />} />
              <Route path="/PayRecordsDashboard" element={<PayRecordsDashboard />} />
              <Route path="/DailyStageReportDashboard" element={<DailyStageReportDashboard />} />
              <Route path="/ConsolidatedReportDashboard" element={<ConsolidatedReportDashboard />} />
              <Route path="/beneficiary-timeline" element={<BeneficiaryTimeline />} />
              <Route path="/FailureReportDashboard" element={<FailureReportDashboard />} />
              <Route path="/BankReportDashboard" element={<BankReportDashboard />} />
              <Route path="/ApbsFailureReport" element={<ApbsFailureReport />} />
              <Route path="/reports/apbs-failures/drilldown" element={<ApbsFailureDrillDown />} />
              <Route path="/reports/apbs-failures" element={<ApbsCumulativeFailureDrillDown />} />
              <Route path="/allfailures" element={<AllFailuresScreen />} />
              <Route path="/SuccessAnalysisDashboard" element={<SuccessAnalysisDashboard />} />
              <Route path="/cggbatches" element={<BatchList />} />
              <Route path="/cggbatches/:batchId" element={<BatchDetails />} />
              <Route path="/ExecutiveDashboard" element={<ExecutiveDashboard />} />
              <Route path="/DrillDownTable" element={<DrillDownTable />} />
              <Route path="/MdApprovalDashboard" element={<MdApprovalDashboard />} />
              <Route path="/reports/apbs-failures/beneficiaries" element={<ApbsFailureBeneficiaryDetails />} />

              {/* ========================================
                  PAYMENT VERIFICATION ROUTES
                  MD Approval & Payment Status Tracking
                  ======================================== */}
              <Route path="payment-verification">
                <Route index element={<PaymentDashboard />} />
                <Route path="dashboard" element={<PaymentDashboard />} />
                <Route path="stage-wise" element={<StageWiseReport />} />
                <Route path="approved-not-paid" element={<ApprovedNotPaid />} />
                <Route path="search" element={<BeneficiarySearch />} />
              </Route>
            </Route>

            {/* 404 - Must be last */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;