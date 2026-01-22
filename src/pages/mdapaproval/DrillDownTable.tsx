import React, { useState, useEffect } from 'react';
import { ChevronRight, Home, Download, RefreshCw } from 'lucide-react';
import { apiService } from '../../services/api.service';
import {
  DrillDownLevel,
  DrillDownAggregates,
  DistrictData,
  MandalData,
  VillageData,
  BeneficiaryData
} from '../../types/drill-down-types';
import { toast } from 'react-hot-toast';

/**
 * DRILL-DOWN TABLE COMPONENT
 * Hierarchical navigation: District → Mandal → Village → Beneficiaries
 * Shows aggregate metrics at each level with clickable drill-down
 */

const DrillDownTable: React.FC = () => {
  // State management
  const [currentLevel, setCurrentLevel] = useState<DrillDownLevel>({ type: 'DISTRICT' });
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<DrillDownLevel[]>([{ type: 'DISTRICT' }]);
  const [aggregates, setAggregates] = useState<DrillDownAggregates | null>(null);

  // Pagination state (for beneficiary level)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch data when level or page changes
  useEffect(() => {
    fetchData();
  }, [currentLevel, currentPage]);

  /**
   * Fetch data based on current drill-down level
   */
  const fetchData = async () => {
    setLoading(true);
    try {
      let response;

      switch (currentLevel.type) {
        case 'DISTRICT':
          response = await apiService.getDistrictDrillDown();
          setData(response.data || []);
          setAggregates(null);
          break;

        case 'MANDAL':
          response = await apiService.getMandalDrillDown(currentLevel.district!);
          setData(response.data || []);
          setAggregates(null);
          break;

        case 'VILLAGE':
          response = await apiService.getVillageDrillDown(
            currentLevel.district!,
            currentLevel.mandal!
          );
          setData(response.data || []);
          setAggregates(null);
          break;

        case 'BENEFICIARY':
          response = await apiService.getBeneficiaryDrillDown(
            currentLevel.district!,
            currentLevel.mandal!,
            currentLevel.village!,
            { page: currentPage, limit: 50 }
          );
          setData(response.beneficiaries || []);
          setAggregates(response.aggregates || null);
          
          if (response.pagination) {
            setTotalPages(response.pagination.totalPages);
            setTotalRecords(response.pagination.total);
          }
          break;
      }
    } catch (error: any) {
      console.error('Error fetching drill-down data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle drill-down navigation
   */
  const handleDrillDown = (item: any) => {
    let newLevel: DrillDownLevel;

    if (currentLevel.type === 'DISTRICT') {
      newLevel = { type: 'MANDAL', district: item.district };
    } else if (currentLevel.type === 'MANDAL') {
      newLevel = { type: 'VILLAGE', district: currentLevel.district, mandal: item.mandal };
    } else if (currentLevel.type === 'VILLAGE') {
      newLevel = {
        type: 'BENEFICIARY',
        district: currentLevel.district,
        mandal: currentLevel.mandal,
        village: item.village
      };
    } else {
      return; // Can't drill down further from beneficiary level
    }

    setCurrentLevel(newLevel);
    setBreadcrumbs([...breadcrumbs, newLevel]);
    setCurrentPage(1);
  };

  /**
   * Handle breadcrumb navigation
   */
  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentLevel(newBreadcrumbs[newBreadcrumbs.length - 1]);
    setCurrentPage(1);
  };

  /**
   * Get display name for breadcrumb
   */
  const getBreadcrumbName = (crumb: DrillDownLevel): string => {
    switch (crumb.type) {
      case 'DISTRICT':
        return 'All Districts';
      case 'MANDAL':
        return crumb.district || '';
      case 'VILLAGE':
        return crumb.mandal || '';
      case 'BENEFICIARY':
        return crumb.village || '';
      default:
        return '';
    }
  };

  /**
   * Render breadcrumb navigation
   */
  const renderBreadcrumbs = () => (
    <div className="flex items-center space-x-2 mb-6 text-sm">
      <Home
        className="w-4 h-4 cursor-pointer text-blue-600 hover:text-blue-800 transition-colors"
        onClick={() => handleBreadcrumbClick(0)}
      />
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span
            className={`cursor-pointer transition-colors ${
              index === breadcrumbs.length - 1
                ? 'text-gray-900 font-semibold'
                : 'text-blue-600 hover:text-blue-800'
            }`}
            onClick={() => handleBreadcrumbClick(index)}
          >
            {getBreadcrumbName(crumb)}
          </span>
        </React.Fragment>
      ))}
    </div>
  );



  /**
   * Render aggregate table (District/Mandal/Village levels)
   */
/**
 * AGGREGATE TABLE - SIMPLIFIED COLUMNS
 * Removed: Total Amount column
 * Removed: MD Approved amount, Failed amount, Not Posted amount
 * Bank Paid = Success Amount only
 */
const renderAggregateTable = () => {
  // Calculate totals
  const totals = data.reduce((acc, item) => ({
    totalBeneficiaries: acc.totalBeneficiaries + (item.totalBeneficiaries || 0),
    mdApprovedCount: acc.mdApprovedCount + (item.mdApproved?.count || 0),
    notPostedCount: acc.notPostedCount + (item.notPostedToBank?.count || 0),
    bankPaidAmount: acc.bankPaidAmount + (item.bankPaid?.totalAmount || 0),
    successCount: acc.successCount + (item.success?.count || 0),
    successAmount: acc.successAmount + (item.success?.amount || 0),
    failedCount: acc.failedCount + (item.failed?.count || 0),
  }), {
    totalBeneficiaries: 0,
    mdApprovedCount: 0,
    notPostedCount: 0,
    bankPaidAmount: 0,
    successCount: 0,
    successAmount: 0,
    failedCount: 0,
  });

  const formatAmountInCrores = (amount: number) => {
    if (!amount || amount === 0) return '₹0.00 Cr';
    const crores = amount / 10000000;
    return `₹${crores.toFixed(2)} Cr`;
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {currentLevel.type}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Beneficiaries
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              MD Approved
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Not Posted
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bank Paid
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Success
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Failed
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => {
            const rowKey = item.district || item.mandal || item.village;
            return (
              <tr
                key={`${rowKey}-${index}`}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleDrillDown(item)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.district || item.mandal || item.village}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                  {item.totalBeneficiaries?.toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <div className="text-green-600 font-semibold">
                    {item.mdApproved?.count?.toLocaleString('en-IN')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <div className="text-orange-600 font-semibold">
                    {item.notPostedToBank?.count?.toLocaleString('en-IN')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-blue-600">
                  {item.bankPaid?.totalAmountFormatted}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <div className="text-green-600 font-semibold">
                    {item.success?.count?.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.success?.amountFormatted}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <div className="text-red-600 font-semibold">
                    {item.failed?.count?.toLocaleString('en-IN')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <ChevronRight className="w-5 h-5 text-blue-600 mx-auto" />
                </td>
              </tr>
            );
          })}

          {/* TOTALS ROW */}
          {data.length > 0 && (
            <tr className="bg-blue-50 font-bold border-t-2 border-blue-300">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                TOTAL
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                {totals.totalBeneficiaries.toLocaleString('en-IN')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                <div className="text-green-700">
                  {totals.mdApprovedCount.toLocaleString('en-IN')}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                <div className="text-orange-700">
                  {totals.notPostedCount.toLocaleString('en-IN')}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-700">
                {formatAmountInCrores(totals.bankPaidAmount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                <div className="text-green-700">
                  {totals.successCount.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-gray-700 mt-1">
                  {formatAmountInCrores(totals.successAmount)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                <div className="text-red-700">
                  {totals.failedCount.toLocaleString('en-IN')}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                -
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {data.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          No data available
        </div>
      )}
    </div>
  );
};

/**
 * AGGREGATE SUMMARY CARD - SIMPLIFIED
 * Only shows counts and success amount
 */
const renderAggregateSummary = () => {
  if (!aggregates) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 shadow-sm border border-blue-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Village Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-gray-600">Total Beneficiaries</p>
          <p className="text-2xl font-bold text-gray-900">
            {aggregates.totalBeneficiaries?.toLocaleString('en-IN') || 0}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">MD Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {aggregates.mdApprovedCount?.toLocaleString('en-IN') || 0}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Not Posted</p>
          <p className="text-2xl font-bold text-orange-600">
            {aggregates.notPostedToBankCount?.toLocaleString('en-IN') || 0}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Success Amount</p>
          <p className="text-2xl font-bold text-blue-600">
            {aggregates.successAmountFormatted || '₹0.00 Cr'}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * BENEFICIARY TABLE - AMOUNTS IN RUPEES
 * ✅ Individual beneficiary amounts displayed in rupees (₹2,50,000.00)
 * ✅ Aggregate summary still in crores
 */
const renderBeneficiaryTable = () => (
  <div className="overflow-x-auto bg-white rounded-lg shadow">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Beneficiary ID
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Stage
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Amount
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            MD Approved
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Posted to Bank
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Bank Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Date
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((beneficiary: BeneficiaryData, index) => (
          <tr key={beneficiary.id || index} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {beneficiary.beneficiaryId}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {beneficiary.applicantName}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                {beneficiary.stage}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
              {/* ✅ Display amount in RUPEES from backend formatted field */}
              {beneficiary.amountFormatted || 
                new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(beneficiary.amountInRupees)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
              {beneficiary.mdApproved ? (
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Yes
                </span>
              ) : (
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                  No
                </span>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
              {beneficiary.postedToBank ? (
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Yes
                </span>
              ) : (
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                  No
                </span>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
              {beneficiary.bankStatus === 'Success' && (
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Success
                </span>
              )}
              {beneficiary.bankStatus === 'Failed' && (
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                  Failed
                </span>
              )}
              {beneficiary.bankStatus === 'Pending' && (
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              )}
              {beneficiary.bankStatus === 'Not Posted' && (
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                  Not Posted
                </span>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {beneficiary.dateOfApproval
                ? new Date(beneficiary.dateOfApproval).toLocaleDateString('en-IN')
                : '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Pagination */}
    {totalPages > 1 && (
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {(currentPage - 1) * 50 + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(currentPage * 50, totalRecords)}
              </span>{' '}
              of <span className="font-medium">{totalRecords}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    )}

    {data.length === 0 && !loading && (
      <div className="text-center py-12 text-gray-500">
        No beneficiaries found
      </div>
    )}
  </div>
);
  /**
   * Main render
   */
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Drill-Down Report</h1>
            <p className="mt-1 text-sm text-gray-600">
              Navigate through District → Mandal → Village → Beneficiaries
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Breadcrumbs */}
        {renderBreadcrumbs()}

        {/* Aggregate Summary (for beneficiary level) */}
        {currentLevel.type === 'BENEFICIARY' && renderAggregateSummary()}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : currentLevel.type === 'BENEFICIARY' ? (
          renderBeneficiaryTable()
        ) : (
          renderAggregateTable()
        )}
      </div>
    </div>
  );
};

export default DrillDownTable;