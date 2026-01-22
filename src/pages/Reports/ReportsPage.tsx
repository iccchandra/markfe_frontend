import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  AlertCircle, 
  DollarSign, 
  MapPin,
  FileText,
  TrendingUp,
  Download,
  Filter
} from 'lucide-react';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  bgColor: string;
}

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();

  const reports: ReportCard[] = [
    {
      id: 'daily',
      title: 'Daily Report',
      description: 'Daily batch processing, validations, and penny drop activities',
      icon: <Calendar className="w-8 h-8" />,
      path: '/reports/daily',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'rejections',
      title: 'Rejection Report',
      description: 'Analyze rejection patterns, reasons, and trends',
      icon: <AlertCircle className="w-8 h-8" />,
      path: '/reports/rejections',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 'financial',
      title: 'Financial Report',
      description: 'Payment reconciliation, amounts disbursed, and variances',
      icon: <DollarSign className="w-8 h-8" />,
      path: '/reports/financial',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'district',
      title: 'District-wise Report',
      description: 'Regional performance analysis and distribution metrics',
      icon: <MapPin className="w-8 h-8" />,
      path: '/reports/district',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const recentReports = [
    { name: 'Daily Report - Oct 17, 2025', date: '2 hours ago', type: 'Daily' },
    { name: 'Rejection Analysis - Week 42', date: '1 day ago', type: 'Rejections' },
    { name: 'Financial Reconciliation - Q3', date: '2 days ago', type: 'Financial' },
    { name: 'District Performance - September', date: '5 days ago', type: 'District' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">Comprehensive reporting dashboard for Indiramma Housing Scheme</p>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {reports.map((report) => (
          <button
            key={report.id}
            onClick={() => navigate(report.path)}
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-left border border-gray-200 hover:border-gray-300"
          >
            <div className={`${report.bgColor} ${report.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
              {report.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
            <p className="text-sm text-gray-600">{report.description}</p>
          </button>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reports Generated Today</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Downloads</p>
              <p className="text-2xl font-bold text-gray-900">248</p>
            </div>
            <Download className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled Reports</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Filters</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <Filter className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Reports</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentReports.map((report, index) => (
            <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{report.name}</p>
                    <p className="text-sm text-gray-600">{report.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">{report.date}</span>
                  <button className="text-blue-600 hover:text-blue-800">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};