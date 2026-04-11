// ============================================
// pages/reports/ImportExport.tsx — Import/Export Data Management
// ============================================
import React, { useState, useEffect, useRef } from 'react';
import {
  Upload, Download, FileText, Loader2, CheckCircle, XCircle, AlertCircle, Eye, File,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { seasonsAPI, importAPI, exportAPI } from '../../api/services';
import type { Season } from '../../types/markfed';

export const ImportExport: React.FC = () => {
  const { user } = useAuth();

  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'excel' | 'dpr'>('excel');
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewing, setPreviewing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export state
  const [exportingType, setExportingType] = useState<string | null>(null);

  // ─── Load seasons ─────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await seasonsAPI.list();
        const list: Season[] = Array.isArray(res.data) ? res.data : [];
        setSeasons(list);
        const active = list.find((s) => s.is_active) || list[0];
        if (active) setSelectedSeasonId(active.id);
      } catch (err: any) {
        setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to load seasons' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ─── Import handlers ─────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImportFile(file);
    setPreviewData(null);
    setImportResult(null);
  };

  const handlePreview = async () => {
    if (!importFile) return;
    setPreviewing(true);
    setMessage(null);
    try {
      const res = await importAPI.preview(importFile, 20);
      setPreviewData(res.data);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to preview file' });
    } finally {
      setPreviewing(false);
    }
  };

  const handleImport = async () => {
    if (!importFile || !selectedSeasonId) return;
    if (!window.confirm(`Import ${importType === 'dpr' ? 'DPR' : 'Excel'} data for this season?`)) return;

    setImporting(true);
    setMessage(null);
    try {
      const importFn = importType === 'dpr' ? importAPI.dpr : importAPI.excel;
      const res = await importFn(selectedSeasonId, importFile);
      setImportResult(res.data);

      const successCount = res.data?.success_count || res.data?.imported || 0;
      const warnings = res.data?.warnings || [];
      const errorCount = res.data?.error_count || res.data?.errors?.length || 0;

      if (errorCount > 0) {
        setMessage({ type: 'warning', text: `Import completed with ${successCount} successes and ${errorCount} errors` });
      } else {
        setMessage({ type: 'success', text: `Successfully imported ${successCount} records${warnings.length > 0 ? ` with ${warnings.length} warnings` : ''}` });
      }

      // Reset file
      setImportFile(null);
      setPreviewData(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Import failed' });
    } finally {
      setImporting(false);
    }
  };

  // ─── Export handlers ──────────────────────────────
  const downloadBlob = (data: any, filename: string) => {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async (type: 'excel' | 'dpr' | 'pdf') => {
    if (!selectedSeasonId) return;
    setExportingType(type);
    setMessage(null);
    try {
      let res;
      let filename;
      switch (type) {
        case 'excel':
          res = await exportAPI.excel(selectedSeasonId);
          filename = `Markfed_Data_Season_${selectedSeasonId}.xlsx`;
          break;
        case 'dpr':
          res = await exportAPI.dpr(selectedSeasonId);
          filename = `DPR_Report_Season_${selectedSeasonId}.xlsx`;
          break;
        case 'pdf':
          res = await exportAPI.pdf(selectedSeasonId);
          filename = `Markfed_Report_Season_${selectedSeasonId}.pdf`;
          break;
      }
      downloadBlob(res.data, filename);
      setMessage({ type: 'success', text: `${type.toUpperCase()} exported successfully` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || `Failed to export ${type.toUpperCase()}` });
    } finally {
      setExportingType(null);
    }
  };

  // ─── Render ───────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        <span className="ml-2 text-gray-500">Loading...</span>
      </div>
    );
  }

  // Preview table columns
  const previewHeaders = previewData?.headers || (previewData?.rows?.[0] ? Object.keys(previewData.rows[0]) : []);
  const previewRows = previewData?.rows || previewData?.data || [];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <FileText className="w-7 h-7 text-blue-600" />
          Import / Export
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Bulk import data from Excel files and export reports
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 flex items-center gap-2 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
          message.type === 'warning' ? 'bg-amber-50 border border-amber-200 text-amber-700' :
          'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
           message.type === 'warning' ? <AlertCircle className="w-4 h-4" /> :
           <XCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* ─── Import Section ──────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-600" />
          Import Data
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Season</label>
            <select value={selectedSeasonId} onChange={(e) => setSelectedSeasonId(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              {seasons.map((s) => <option key={s.id} value={s.id}>{s.season_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Import Type</label>
            <select value={importType} onChange={(e) => setImportType(e.target.value as 'excel' | 'dpr')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              <option value="excel">Excel Data Import</option>
              <option value="dpr">DPR Import</option>
            </select>
          </div>
        </div>

        {/* File upload */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1">Select File</label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
          {importFile && (
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <File className="w-3 h-3" />
              {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button onClick={handlePreview} disabled={!importFile || previewing}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors text-sm disabled:opacity-50">
            {previewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Preview
          </button>
          <button onClick={handleImport} disabled={!importFile || importing || !selectedSeasonId}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-50">
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Import
          </button>
        </div>

        {/* Preview table */}
        {previewData && previewRows.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Preview (first {previewRows.length} rows)</h3>
            <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-80 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {previewHeaders.map((h: string, i: number) => (
                      <th key={i} className="px-3 py-2 text-left font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {previewRows.map((row: any, rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-gray-50">
                      {previewHeaders.map((h: string, cIdx: number) => (
                        <td key={cIdx} className="px-3 py-2 text-gray-700 whitespace-nowrap max-w-[200px] truncate">
                          {row[h] !== null && row[h] !== undefined ? String(row[h]) : '--'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Import results */}
        {importResult && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Import Results</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{importResult.success_count || importResult.imported || 0}</p>
                <p className="text-xs text-gray-500">Successful</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{importResult.warnings?.length || importResult.warning_count || 0}</p>
                <p className="text-xs text-gray-500">Warnings</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{importResult.errors?.length || importResult.error_count || 0}</p>
                <p className="text-xs text-gray-500">Errors</p>
              </div>
            </div>

            {/* Show warnings */}
            {importResult.warnings && importResult.warnings.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-amber-700 mb-1">Warnings:</p>
                <ul className="text-xs text-amber-600 space-y-0.5 max-h-32 overflow-y-auto">
                  {importResult.warnings.slice(0, 20).map((w: string, i: number) => (
                    <li key={i} className="flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {w}
                    </li>
                  ))}
                  {importResult.warnings.length > 20 && (
                    <li className="text-gray-400">... and {importResult.warnings.length - 20} more</li>
                  )}
                </ul>
              </div>
            )}

            {/* Show errors */}
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-red-700 mb-1">Errors:</p>
                <ul className="text-xs text-red-600 space-y-0.5 max-h-32 overflow-y-auto">
                  {importResult.errors.slice(0, 20).map((e: string, i: number) => (
                    <li key={i} className="flex items-start gap-1">
                      <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {typeof e === 'string' ? e : JSON.stringify(e)}
                    </li>
                  ))}
                  {importResult.errors.length > 20 && (
                    <li className="text-gray-400">... and {importResult.errors.length - 20} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Export Section ───────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-green-600" />
          Export Data
        </h2>

        <div className="mb-4 max-w-xs">
          <label className="block text-xs font-medium text-gray-600 mb-1">Season</label>
          <select value={selectedSeasonId} onChange={(e) => setSelectedSeasonId(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
            {seasons.map((s) => <option key={s.id} value={s.id}>{s.season_name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Excel Export */}
          <button onClick={() => handleExport('excel')} disabled={exportingType !== null || !selectedSeasonId}
            className="flex flex-col items-center gap-2 p-6 bg-green-50 border-2 border-green-200 hover:border-green-400 rounded-xl transition-all disabled:opacity-50">
            {exportingType === 'excel' ? (
              <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            ) : (
              <FileText className="w-8 h-8 text-green-600" />
            )}
            <span className="text-sm font-semibold text-green-700">Excel Export</span>
            <span className="text-xs text-gray-500">Full season data (.xlsx)</span>
          </button>

          {/* DPR Export */}
          <button onClick={() => handleExport('dpr')} disabled={exportingType !== null || !selectedSeasonId}
            className="flex flex-col items-center gap-2 p-6 bg-blue-50 border-2 border-blue-200 hover:border-blue-400 rounded-xl transition-all disabled:opacity-50">
            {exportingType === 'dpr' ? (
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            ) : (
              <FileText className="w-8 h-8 text-blue-600" />
            )}
            <span className="text-sm font-semibold text-blue-700">DPR Export</span>
            <span className="text-xs text-gray-500">Daily Progress Report (.xlsx)</span>
          </button>

          {/* PDF Export */}
          <button onClick={() => handleExport('pdf')} disabled={exportingType !== null || !selectedSeasonId}
            className="flex flex-col items-center gap-2 p-6 bg-purple-50 border-2 border-purple-200 hover:border-purple-400 rounded-xl transition-all disabled:opacity-50">
            {exportingType === 'pdf' ? (
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            ) : (
              <FileText className="w-8 h-8 text-purple-600" />
            )}
            <span className="text-sm font-semibold text-purple-700">PDF Export</span>
            <span className="text-xs text-gray-500">Formatted report (.pdf)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportExport;
