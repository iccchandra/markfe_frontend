// ============================================
// App.tsx - MARKFED Maize MSP Portal — Complete Routing
// ============================================
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth & Layout
import MarkfedAuthProvider from './contexts/AuthContext';
import AdminLayout from './components/admin/AdminLayout';
import MarkfedLogin from './pages/Login';
import MarkfedDashboard from './pages/dashboard/MarkfedDashboard';

// Maize MSP — Data Entry
import LoanSanctionForm from './pages/data-entry/LoanSanctionForm';
import DrawdownsForm from './pages/data-entry/DrawdownsForm';
import UtilizationList from './pages/data-entry/UtilizationList';
import UtilizationForm from './pages/data-entry/UtilizationForm';
import FarmersList from './pages/data-entry/FarmersList';
import FarmersForm from './pages/data-entry/FarmersForm';

// Maize MSP — Reports
import MDSheetView from './pages/reports/MDSheetView';
import FarmersSheetView from './pages/reports/FarmersSheetView';

// Admin Pages
import UserManagement from './pages/admin/UserManagement';
import DistrictManagement from './pages/admin/DistrictManagement';
import PACSManagement from './pages/admin/PACSManagement';
import SeasonManagement from './pages/admin/SeasonManagement';
import BanksManagement from './pages/admin/BanksManagement';
import UtilizationHeadsManagement from './pages/admin/UtilizationHeadsManagement';
import ApprovalQueue from './pages/admin/ApprovalQueue';

// Transportation Module
import { TransportationDashboard } from './pages/transportation/TransportationDashboard';
import { VehiclesMaster } from './pages/transportation/VehiclesMaster';
import { TransportersMaster } from './pages/transportation/TransportersMaster';
import { AddVehicleForm } from './pages/transportation/AddVehicleForm';

// Gunny Bags Module
import { GunnyBagsDashboard } from './pages/gunny-bags/GunnyBagsDashboard';
import { CreatePOForm } from './pages/gunny-bags/CreatePOForm';
import { AddVendorForm } from './pages/gunny-bags/AddVendorForm';

// Storage Module
import { StorageDashboard } from './pages/storage/StorageDashboard';
import { GenerateStorageBillForm } from './pages/storage/GenerateStorageBillForm';

// Release Orders Module
import { ReleaseOrdersDashboard } from './pages/release-orders/ReleaseOrdersDashboard';
import { GenerateROForm } from './pages/release-orders/GenerateROForm';

function App() {
  return (
    <BrowserRouter>
      <MarkfedAuthProvider>
        <Routes>
          {/* Login */}
          <Route path="/login" element={<MarkfedLogin />} />

          {/* Protected Routes */}
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard */}
            <Route path="dashboard" element={<MarkfedDashboard />} />

            {/* ==================== MAIZE MSP DATA ENTRY ==================== */}
            <Route path="data-entry">
              <Route path="loan" element={<LoanSanctionForm />} />
              <Route path="drawdowns" element={<DrawdownsForm />} />
              <Route path="utilization" element={<UtilizationList />} />
              <Route path="utilization/:districtId" element={<UtilizationForm />} />
              <Route path="farmers" element={<FarmersList />} />
              <Route path="farmers/:districtId" element={<FarmersForm />} />
            </Route>

            {/* ==================== REPORTS ==================== */}
            <Route path="reports">
              <Route path="md-sheet" element={<MDSheetView />} />
              <Route path="farmers-sheet" element={<FarmersSheetView />} />
            </Route>

            {/* ==================== ADMIN (SUPER_ADMIN) ==================== */}
            <Route path="admin">
              <Route path="users" element={<UserManagement />} />
              <Route path="districts" element={<DistrictManagement />} />
              <Route path="pacs" element={<PACSManagement />} />
              <Route path="seasons" element={<SeasonManagement />} />
              <Route path="banks" element={<BanksManagement />} />
              <Route path="utilization-heads" element={<UtilizationHeadsManagement />} />
              <Route path="approvals" element={<ApprovalQueue />} />
            </Route>

            {/* ==================== TRANSPORTATION MODULE ==================== */}
            <Route path="transportation">
              <Route index element={<TransportationDashboard />} />
              <Route path="vehicles">
                <Route index element={<VehiclesMaster />} />
                <Route path="add" element={<AddVehicleForm />} />
                <Route path="edit/:id" element={<AddVehicleForm />} />
              </Route>
              <Route path="transporters">
                <Route index element={<TransportersMaster />} />
                <Route path="add" element={<TransportersMaster />} />
                <Route path="edit/:id" element={<TransportersMaster />} />
              </Route>
              <Route path="slabs" element={<TransportationDashboard />} />
              <Route path="trips" element={<TransportationDashboard />} />
              <Route path="billing" element={<TransportationDashboard />} />
              <Route path="payments" element={<TransportationDashboard />} />
            </Route>

            {/* ==================== GUNNY BAGS MODULE ==================== */}
            <Route path="gunny-bags">
              <Route index element={<GunnyBagsDashboard />} />
              <Route path="vendors">
                <Route index element={<GunnyBagsDashboard />} />
                <Route path="add" element={<AddVendorForm />} />
                <Route path="edit/:id" element={<AddVendorForm />} />
              </Route>
              <Route path="types" element={<GunnyBagsDashboard />} />
              <Route path="procurement">
                <Route index element={<GunnyBagsDashboard />} />
                <Route path="create" element={<CreatePOForm />} />
                <Route path="edit/:id" element={<CreatePOForm />} />
              </Route>
              <Route path="grn" element={<GunnyBagsDashboard />} />
              <Route path="inventory" element={<GunnyBagsDashboard />} />
              <Route path="issuance" element={<GunnyBagsDashboard />} />
              <Route path="performance" element={<GunnyBagsDashboard />} />
            </Route>

            {/* ==================== STORAGE MODULE ==================== */}
            <Route path="storage">
              <Route index element={<StorageDashboard />} />
              <Route path="billing">
                <Route index element={<StorageDashboard />} />
                <Route path="create" element={<GenerateStorageBillForm />} />
                <Route path="edit/:id" element={<GenerateStorageBillForm />} />
              </Route>
              <Route path="insurance" element={<StorageDashboard />} />
              <Route path="movements" element={<StorageDashboard />} />
              <Route path="utilization" element={<StorageDashboard />} />
              <Route path="quality" element={<StorageDashboard />} />
              <Route path="reconciliation" element={<StorageDashboard />} />
              <Route path="cost-analysis" element={<StorageDashboard />} />
              <Route path="compliance" element={<StorageDashboard />} />
            </Route>

            {/* ==================== RELEASE ORDERS MODULE ==================== */}
            <Route path="release-orders">
              <Route index element={<ReleaseOrdersDashboard />} />
              <Route path="generate" element={<GenerateROForm />} />
              <Route path="edit/:id" element={<GenerateROForm />} />
              <Route path="payments" element={<ReleaseOrdersDashboard />} />
              <Route path="amendments" element={<ReleaseOrdersDashboard />} />
              <Route path="lifting" element={<ReleaseOrdersDashboard />} />
              <Route path="delivery" element={<ReleaseOrdersDashboard />} />
              <Route path="weighment" element={<ReleaseOrdersDashboard />} />
              <Route path="gate-pass" element={<ReleaseOrdersDashboard />} />
              <Route path="closure" element={<ReleaseOrdersDashboard />} />
              <Route path="analytics" element={<ReleaseOrdersDashboard />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </MarkfedAuthProvider>
    </BrowserRouter>
  );
}

export default App;
