import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Download, FileText, Calendar, Plus, Loader2, CheckCircle2, Search, X } from 'lucide-react';
import { api } from '../services/api';
import type { ReportItem } from '../types';

export default function Reports() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // New report modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReportName, setNewReportName] = useState('');
  const [newReportType, setNewReportType] = useState('PDF');
  const [newReportSummary, setNewReportSummary] = useState('');
  const [creatingReport, setCreatingReport] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    api.getReports().then((data) => {
      if (mounted) {
        setReports(data);
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleDownload = async (id: string, name: string) => {
    setDownloadingId(id);
    try {
      await api.downloadReport(id, name);
      setSuccessToast(`Report downloaded: ${name}`);
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportName.trim()) return;

    setCreatingReport(true);
    try {
      const rep = await api.createReport({
        name: newReportName.trim(),
        type: newReportType,
        summary: newReportSummary.trim() || `Performance benchmark report for ${newReportName.trim()}`,
      });
      setReports((prev) => [rep, ...prev]);
      setIsModalOpen(false);
      setNewReportName('');
      setNewReportSummary('');
      setSuccessToast('New report generated successfully.');
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      console.error('Failed to create report:', err);
    } finally {
      setCreatingReport(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesFilter = filterType === 'ALL' || r.type === filterType;
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-8 max-w-scaffold mx-auto w-full">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-surface-warm border border-status-success/30 shadow-xl text-status-success text-sm flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-medium">{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Reports Archive</h1>
          <p className="text-text-secondary">Export, audit, and generate cryptographic performance benchmark reports.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-interaction text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" /> New Report
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter reports by title or workload..."
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:border-primary-interaction transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'PDF', 'CSV'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filterType === type
                  ? 'bg-primary/10 border-primary-interaction text-primary-interaction font-semibold'
                  : 'bg-surface-secondary border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table/Card */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center bg-surface-secondary">
          <h3 className="text-sm font-semibold">Available Verified Reports</h3>
          <span className="text-xs font-mono text-text-muted">{filteredReports.length} records</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-text-muted flex justify-center items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary-interaction" />
            <span className="text-sm">Loading reports archive...</span>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">
            <FileText className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-50" />
            <h4 className="text-sm font-semibold text-text-primary mb-1">No reports match your query</h4>
            <p className="text-xs text-text-muted">Generate a new report or adjust your search filter above.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-surface-secondary/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-warm flex items-center justify-center text-primary-interaction shrink-0 border border-border">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary text-sm sm:text-base">{report.name}</h4>
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{report.summary}</p>
                    <div className="flex items-center gap-3 text-xs text-text-muted mt-2 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {report.date}
                      </span>
                      <span>•</span>
                      <span className={report.status === 'Generated' ? 'text-status-success font-semibold' : ''}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className="text-xs font-mono bg-surface-secondary border border-border px-2.5 py-1 rounded text-text-secondary">
                    {report.type}
                  </span>
                  <button
                    onClick={() => handleDownload(report.id, report.name)}
                    disabled={downloadingId === report.id}
                    className="p-2 text-text-secondary hover:text-primary-interaction transition-colors rounded-lg hover:bg-surface-secondary border border-border flex items-center gap-1 text-xs"
                    title="Export / Download Report"
                  >
                    {downloadingId === report.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary-interaction" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Export</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* New Report Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-surface-warm border border-border rounded-xl shadow-2xl p-6 relative animate-in fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-text-muted hover:text-text-primary rounded"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-interaction" /> Generate Performance Report
            </h3>
            <p className="text-xs text-text-secondary mb-6">Create an official audit document for an experiment run.</p>

            <form onSubmit={handleCreateReport} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-text-secondary">Report Name / Benchmark Run</label>
                <input
                  type="text"
                  value={newReportName}
                  onChange={(e) => setNewReportName(e.target.value)}
                  placeholder="e.g. PoS Heavy Load Verification Run"
                  className="w-full border border-border rounded-lg px-3.5 py-2 bg-background text-sm focus:outline-none focus:border-primary-interaction"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 text-text-secondary">Export Format</label>
                <select
                  value={newReportType}
                  onChange={(e) => setNewReportType(e.target.value)}
                  className="w-full border border-border rounded-lg px-3.5 py-2 bg-background text-sm focus:outline-none focus:border-primary-interaction"
                >
                  <option value="PDF">PDF (Formal Presentation)</option>
                  <option value="CSV">CSV (Raw Timeseries Data)</option>
                  <option value="TXT">TXT (Technical Summary)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 text-text-secondary">Summary Notes</label>
                <textarea
                  value={newReportSummary}
                  onChange={(e) => setNewReportSummary(e.target.value)}
                  placeholder="Optional executive findings or workload notes..."
                  rows={3}
                  className="w-full border border-border rounded-lg px-3.5 py-2 bg-background text-sm focus:outline-none focus:border-primary-interaction"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-medium hover:bg-surface-secondary text-text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingReport}
                  className="bg-primary-interaction text-white px-5 py-2 rounded-lg text-xs font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {creatingReport && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Generate Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
