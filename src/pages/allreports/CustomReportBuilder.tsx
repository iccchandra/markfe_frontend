// src/components/reports/CustomReportBuilder.tsx
import React, { useState } from 'react';
import { useCustomReport } from '../../hooks/useReports';
import { ReportFormat, ReportType, CustomReportRequest } from '../../services/reportsApi';
import { Plus, Minus, Play, Save, CheckCircle2, Loader2 } from 'lucide-react';

const AGGREGATION_FUNCTIONS = ['SUM', 'AVG', 'COUNT', 'MIN', 'MAX'];
const SORT_ORDERS = ['ASC', 'DESC'];

export const CustomReportBuilder: React.FC = () => {
  const { data, loading, error, availableFields, generate, saveTemplate } = useCustomReport();
  const [activeStep, setActiveStep] = useState(0);
  
  // Form state
  const [reportName, setReportName] = useState('');
  const [format, setFormat] = useState<ReportFormat>(ReportFormat.EXCEL);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<{ field: string; order: 'ASC' | 'DESC' }[]>([]);
  const [aggregations, setAggregations] = useState<
    { field: string; function: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX' }[]
  >([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const steps = ['Select Fields', 'Configure Options', 'Generate Report'];

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const handleAddSort = () => {
    if (selectedFields.length > 0) {
      setSortBy([...sortBy, { field: selectedFields[0], order: 'ASC' }]);
    }
  };

  const handleRemoveSort = (index: number) => {
    setSortBy(sortBy.filter((_, i) => i !== index));
  };

  const handleAddAggregation = () => {
    if (selectedFields.length > 0) {
      setAggregations([...aggregations, { field: selectedFields[0], function: 'COUNT' }]);
    }
  };

  const handleRemoveAggregation = (index: number) => {
    setAggregations(aggregations.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    const request: CustomReportRequest = {
      reportName,
      reportType: ReportType.CUSTOM,
      format,
      fields: selectedFields,
      groupBy: groupBy.length > 0 ? groupBy : undefined,
      sortBy: sortBy.length > 0 ? sortBy : undefined,
      aggregations: aggregations.length > 0 ? aggregations : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    };

    await generate(request);
  };

  const handleSaveTemplate = async () => {
    const request: CustomReportRequest = {
      reportName,
      reportType: ReportType.CUSTOM,
      format,
      fields: selectedFields,
      groupBy: groupBy.length > 0 ? groupBy : undefined,
      sortBy: sortBy.length > 0 ? sortBy : undefined,
      aggregations: aggregations.length > 0 ? aggregations : undefined
    };

    await saveTemplate(request);
  };

  const canProceedToNext = () => {
    if (activeStep === 0) return selectedFields.length > 0;
    if (activeStep === 1) return reportName.trim() !== '';
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Custom Report Builder</h2>
          <p className="text-sm text-gray-600 mt-1">Create custom reports with your own field selection and aggregations</p>
        </div>

        <div className="p-6">
          {/* Stepper */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    index <= activeStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index < activeStep ? <CheckCircle2 className="h-6 w-6" /> : index + 1}
                  </div>
                  <span className={`ml-3 text-sm font-medium ${
                    index <= activeStep ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    index < activeStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Step 1: Select Fields */}
          {activeStep === 0 && availableFields && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Fields to Include</h3>
              {Object.entries(availableFields).map(([category, fields]: [string, any]) => (
                <div key={category} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 capitalize">{category}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {fields.map((field: string) => (
                      <label key={field} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFields.includes(field)}
                          onChange={() => handleFieldToggle(field)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{field}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">{selectedFields.length} field(s) selected</p>
                <div className="flex flex-wrap gap-2">
                  {selectedFields.map(field => (
                    <span
                      key={field}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {field}
                      <button
                        onClick={() => handleFieldToggle(field)}
                        className="ml-1.5 inline-flex items-center justify-center hover:bg-blue-200 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Configure Options */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="Enter report name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Output Format
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={format}
                    onChange={(e) => setFormat(e.target.value as ReportFormat)}
                  >
                    <option value={ReportFormat.EXCEL}>Excel</option>
                    <option value={ReportFormat.CSV}>CSV</option>
                    <option value={ReportFormat.PDF}>PDF</option>
                    <option value={ReportFormat.JSON}>JSON</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Sort By */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900">Sort By (Optional)</h4>
                  <button
                    onClick={handleAddSort}
                    disabled={selectedFields.length === 0}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Sort
                  </button>
                </div>
                <div className="space-y-2">
                  {sortBy.map((sort, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        value={sort.field}
                        onChange={(e) => {
                          const newSorts = [...sortBy];
                          newSorts[index].field = e.target.value;
                          setSortBy(newSorts);
                        }}
                      >
                        {selectedFields.map((field) => (
                          <option key={field} value={field}>{field}</option>
                        ))}
                      </select>
                      <select
                        className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        value={sort.order}
                        onChange={(e) => {
                          const newSorts = [...sortBy];
                          newSorts[index].order = e.target.value as 'ASC' | 'DESC';
                          setSortBy(newSorts);
                        }}
                      >
                        {SORT_ORDERS.map((order) => (
                          <option key={order} value={order}>{order}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleRemoveSort(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aggregations */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900">Aggregations (Optional)</h4>
                  <button
                    onClick={handleAddAggregation}
                    disabled={selectedFields.length === 0}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Aggregation
                  </button>
                </div>
                <div className="space-y-2">
                  {aggregations.map((agg, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        value={agg.field}
                        onChange={(e) => {
                          const newAggs = [...aggregations];
                          newAggs[index].field = e.target.value;
                          setAggregations(newAggs);
                        }}
                      >
                        {selectedFields.map((field) => (
                          <option key={field} value={field}>{field}</option>
                        ))}
                      </select>
                      <select
                        className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        value={agg.function}
                        onChange={(e) => {
                          const newAggs = [...aggregations];
                          newAggs[index].function = e.target.value as any;
                          setAggregations(newAggs);
                        }}
                      >
                        {AGGREGATION_FUNCTIONS.map((func) => (
                          <option key={func} value={func}>{func}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleRemoveAggregation(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Generate */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Summary</h3>
                <dl className="grid grid-cols-1 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Report Name:</dt>
                    <dd className="text-sm text-gray-900 mt-1">{reportName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Format:</dt>
                    <dd className="text-sm text-gray-900 mt-1">{format}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Fields:</dt>
                    <dd className="text-sm text-gray-900 mt-1">{selectedFields.join(', ')}</dd>
                  </div>
                  {groupBy.length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Group By:</dt>
                      <dd className="text-sm text-gray-900 mt-1">{groupBy.join(', ')}</dd>
                    </div>
                  )}
                  {sortBy.length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Sort By:</dt>
                      <dd className="text-sm text-gray-900 mt-1">
                        {sortBy.map(s => `${s.field} (${s.order})`).join(', ')}
                      </dd>
                    </div>
                  )}
                  {aggregations.length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Aggregations:</dt>
                      <dd className="text-sm text-gray-900 mt-1">
                        {aggregations.map(a => `${a.function}(${a.field})`).join(', ')}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-5 w-5 mr-2" />
                  )}
                  Generate Report
                </button>
                <button
                  onClick={handleSaveTemplate}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Save as Template
                </button>
              </div>

              {data && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-700">Report generated successfully! Check your downloads folder.</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setActiveStep(prev => prev - 1)}
              disabled={activeStep === 0}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              Back
            </button>
            <button
              onClick={() => setActiveStep(prev => prev + 1)}
              disabled={activeStep === steps.length - 1 || !canProceedToNext()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomReportBuilder;