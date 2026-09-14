import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Award, 
  BookOpen, 
  BarChart3, 
  Save, 
  Plus, 
  Trash2, 
  Pencil,
  X,
  Download, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Sliders, 
  RotateCcw,
  ShieldCheck,
  Eye,
  AlertCircle
} from 'lucide-react';
import { GrowthMetric, DEFAULT_GROWTH_METRICS } from '../../types';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { exportTableToPDF } from '../../utils/pdfExport';

interface AdminGrowthManagementProps {
  onRefresh?: () => void;
}

export const AdminGrowthManagement: React.FC<AdminGrowthManagementProps> = ({ onRefresh }) => {
  const storageKey = 'mocosart_growth_metrics';

  // State initialized with localStorage fallback or default growth metrics
  const [metrics, setMetrics] = useState<GrowthMetric[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : DEFAULT_GROWTH_METRICS;
    } catch {
      return DEFAULT_GROWTH_METRICS;
    }
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Edit Metric Modal State
  const [editingMetric, setEditingMetric] = useState<GrowthMetric | null>(null);

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // New Custom Metric Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState<'learning' | 'certificate' | 'percentage' | 'custom'>('custom');

  // Load from Firestore on mount
  useEffect(() => {
    const fetchRemote = async () => {
      try {
        const docRef = doc(db, 'app_settings', 'growth_metrics');
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data()?.metrics) {
          const remoteMetrics: GrowthMetric[] = snap.data().metrics;
          setMetrics(remoteMetrics);
          localStorage.setItem(storageKey, JSON.stringify(remoteMetrics));
        }
      } catch (err) {
        console.warn("Firestore growth metrics load fallback to local:", err);
      }
    };
    fetchRemote();
  }, []);

  // Centralized save function to sync state, localStorage, and Firestore
  const saveMetrics = async (newMetrics: GrowthMetric[], successMessage?: string) => {
    setSaving(true);
    const stamped = newMetrics.map(m => ({
      ...m,
      updatedAt: new Date().toISOString()
    }));

    try {
      // 1. Update localStorage immediately for fast client cache
      localStorage.setItem(storageKey, JSON.stringify(stamped));
      localStorage.setItem('mocosart_growth_metrics_cache', JSON.stringify(stamped));
      window.dispatchEvent(new CustomEvent('growth_metrics_updated', { detail: stamped }));
      
      // 2. Persist to Firestore
      const docRef = doc(db, 'app_settings', 'growth_metrics');
      await setDoc(docRef, {
        metrics: stamped,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setMetrics(stamped);
      if (successMessage) {
        setSaveSuccess(successMessage);
        setTimeout(() => setSaveSuccess(null), 4000);
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      console.warn("Save metrics error:", err);
      setMetrics(stamped);
      if (successMessage) {
        setSaveSuccess(successMessage + " (Saved to local storage)");
        setTimeout(() => setSaveSuccess(null), 4000);
      }
    } finally {
      setSaving(false);
    }
  };

  // Update a single metric field in local state
  const handleUpdateMetric = (id: string, field: keyof GrowthMetric, val: any) => {
    setMetrics(prev => prev.map(m => m.id === id ? { ...m, [field]: val } : m));
  };

  // Update nested course level stats
  const handleUpdateCourseLevel = (id: string, level: 'beginner' | 'intermediate' | 'advanced' | 'master', val: number) => {
    setMetrics(prev => prev.map(m => {
      if (m.id !== id) return m;
      return {
        ...m,
        courseLevelStats: {
          beginner: 95,
          intermediate: 90,
          advanced: 85,
          master: 80,
          ...(m.courseLevelStats || {}),
          [level]: Math.min(100, Math.max(0, val))
        }
      };
    }));
  };

  // Save changes to Firestore and localStorage manually
  const handleSaveAll = async () => {
    await saveMetrics(metrics, "Growth Management metrics successfully saved and published live!");
  };

  // Save changes from Edit Modal
  const handleSaveEditModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMetric) return;

    if (!editingMetric.title.trim() || !editingMetric.value.trim()) {
      alert("Please enter both Title and Value.");
      return;
    }

    const updated = metrics.map(m => m.id === editingMetric.id ? {
      ...editingMetric,
      title: editingMetric.title.trim(),
      value: editingMetric.value.trim(),
      subtitle: editingMetric.subtitle.trim(),
      updatedAt: new Date().toISOString()
    } : m);

    await saveMetrics(updated, `Growth Metric "${editingMetric.title}" updated successfully!`);
    setEditingMetric(null);
  };

  // Delete metric with instant persistence
  const handleDeleteMetric = async (id: string) => {
    const target = metrics.find(m => m.id === id);
    const title = target ? target.title : 'Metric';
    const updated = metrics.filter(m => m.id !== id);

    await saveMetrics(updated, `"${title}" has been removed from Growth Management.`);
    setDeleteConfirmId(null);
    if (editingMetric?.id === id) {
      setEditingMetric(null);
    }
  };

  // Add custom metric
  const handleAddNewMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newValue.trim()) {
      alert("Please enter title and metric value.");
      return;
    }

    const newMetric: GrowthMetric = {
      id: `growth-custom-${Date.now()}`,
      title: newTitle.trim(),
      value: newValue.trim(),
      subtitle: newSubtitle.trim() || 'Institutional milestone metric',
      category: newCategory,
      highlight: true,
      order: metrics.length + 1,
      updatedAt: new Date().toISOString()
    };

    const updated = [...metrics, newMetric];
    await saveMetrics(updated, `Added "${newMetric.title}" to Growth Management.`);

    // Reset form
    setNewTitle('');
    setNewValue('');
    setNewSubtitle('');
    setNewCategory('custom');
    setShowAddModal(false);
  };

  // Reset to default templates
  const handleResetDefaults = async () => {
    if (confirm("Reset growth metrics to official default templates?")) {
      await saveMetrics(DEFAULT_GROWTH_METRICS, "Reset to official default Growth Management metrics.");
    }
  };

  // Download Aligned PDF Report
  const handleDownloadPDF = () => {
    const headers = ['Growth Metric KPI', 'Value / Stat', 'Category', 'Description / Details', 'Last Updated'];
    const rows = metrics.map(m => [
      m.title,
      m.value,
      m.category.toUpperCase(),
      m.courseLevelStats 
        ? `${m.subtitle} [Beg: ${m.courseLevelStats.beginner}%, Int: ${m.courseLevelStats.intermediate}%, Adv: ${m.courseLevelStats.advanced}%, Mst: ${m.courseLevelStats.master}%]`
        : m.subtitle,
      m.updatedAt ? new Date(m.updatedAt).toLocaleDateString() : 'Active'
    ]);

    exportTableToPDF('Mocosart - Growth Management & User Home Page KPIs Ledger', headers, rows, 'growth_management_report');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
              Homepage Showcase
            </span>
            <span className="text-xs text-slate-400">Manual Admin Control</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif mt-1">
            Growth Management & User Home Page Metrics
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Configure the official growth indicators displayed on the learner homepage: <strong>Student learning+</strong>, <strong>Verified certificates</strong>, and <strong>Percentage course levels</strong>, or manually add custom growth milestones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="admin-growth-download-pdf-btn"
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Download Aligned Growth KPIs Report PDF"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download Report</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Growth Metric</span>
          </button>

          <button
            id="admin-save-growth-metrics-btn"
            disabled={saving}
            onClick={handleSaveAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-700/20 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing...' : 'Save & Publish Changes'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Live Preview on Home Page Cards */}
      <div className="rounded-2xl glass-water p-5 border border-white/90 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-emerald-600" />
            <span>Live Learner Home Page Preview</span>
          </h3>
          <span className="text-[11px] text-emerald-700 font-medium">Updates immediately in real-time</span>
        </div>

        {metrics.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-white/50 border border-dashed border-slate-200 space-y-2">
            <p className="text-xs text-slate-500">No growth metrics currently active.</p>
            <button
              onClick={handleResetDefaults}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Reset Official Defaults
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.map((m) => (
              <div 
                key={m.id} 
                className="p-4 rounded-2xl glass-water-card border border-white/95 shadow-sm space-y-2 relative overflow-hidden flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {m.title}
                    </span>
                    <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                      {m.category === 'learning' ? <BookOpen className="w-4 h-4" /> : m.category === 'certificate' ? <Award className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
                    {m.value}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {m.subtitle}
                  </p>

                  {/* If percentage course level stats exist */}
                  {m.courseLevelStats && (
                    <div className="pt-2 grid grid-cols-4 gap-1 text-center border-t border-slate-100 text-[10px]">
                      <div className="p-1 rounded bg-slate-50">
                        <span className="text-slate-400 block text-[9px]">Beg</span>
                        <span className="font-bold text-emerald-700">{m.courseLevelStats.beginner}%</span>
                      </div>
                      <div className="p-1 rounded bg-slate-50">
                        <span className="text-slate-400 block text-[9px]">Int</span>
                        <span className="font-bold text-teal-700">{m.courseLevelStats.intermediate}%</span>
                      </div>
                      <div className="p-1 rounded bg-slate-50">
                        <span className="text-slate-400 block text-[9px]">Adv</span>
                        <span className="font-bold text-cyan-700">{m.courseLevelStats.advanced}%</span>
                      </div>
                      <div className="p-1 rounded bg-slate-50">
                        <span className="text-slate-400 block text-[9px]">Mst</span>
                        <span className="font-bold text-indigo-700">{m.courseLevelStats.master}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Edit & Delete Actions on preview card */}
                <div className="pt-3 mt-2 border-t border-slate-100/90 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setEditingMetric(m)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold cursor-pointer transition-all active:scale-95"
                    title="Edit this growth metric"
                  >
                    <Pencil className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(m.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold cursor-pointer transition-all active:scale-95"
                    title="Delete / Remove this growth metric"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Edit Configurations for Each Metric */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 font-serif">
            Growth Management Indicators & Metric Controls
          </h3>
          <button
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="p-5 rounded-2xl glass-panel border border-white/90 shadow-sm space-y-4 hover:border-emerald-200 transition-all"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                    {metric.category === 'learning' ? (
                      <BookOpen className="w-4 h-4" />
                    ) : metric.category === 'certificate' ? (
                      <Award className="w-4 h-4" />
                    ) : (
                      <BarChart3 className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-serif">{metric.title}</h4>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      Category: {metric.category} • Value: {metric.value}
                    </span>
                  </div>
                </div>

                {/* Primary Edit and Delete Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    id={`btn-edit-growth-${metric.id}`}
                    onClick={() => setEditingMetric(metric)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Open full editor for this metric"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit Metric</span>
                  </button>

                  <button
                    id={`btn-delete-growth-${metric.id}`}
                    onClick={() => setDeleteConfirmId(metric.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Remove this metric from Growth Management"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Display Title (Manual Entry)
                  </label>
                  <input
                    type="text"
                    value={metric.title}
                    onChange={(e) => handleUpdateMetric(metric.id, 'title', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
                    placeholder="e.g. Student Learning+"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Value / Metric Score (Manual Entry)
                  </label>
                  <input
                    type="text"
                    value={metric.value}
                    onChange={(e) => handleUpdateMetric(metric.id, 'value', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-slate-800 font-bold"
                    placeholder="e.g. 1,500+ or 96.4%"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subtitle Description (Manual Entry)
                  </label>
                  <input
                    type="text"
                    value={metric.subtitle}
                    onChange={(e) => handleUpdateMetric(metric.id, 'subtitle', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
                    placeholder="Brief explanatory note for students"
                  />
                </div>
              </div>

              {/* Special Course Level Percentage Configuration */}
              {(metric.category === 'percentage' || metric.courseLevelStats) && (
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-teal-600" />
                      <span>Manually Configure Course Level Percentages (%)</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Values range 0 - 100%</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Beginner Level %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={metric.courseLevelStats?.beginner ?? 98}
                        onChange={(e) => handleUpdateCourseLevel(metric.id, 'beginner', Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-bold text-emerald-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Intermediate Level %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={metric.courseLevelStats?.intermediate ?? 95}
                        onChange={(e) => handleUpdateCourseLevel(metric.id, 'intermediate', Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-bold text-teal-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Advanced Level %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={metric.courseLevelStats?.advanced ?? 92}
                        onChange={(e) => handleUpdateCourseLevel(metric.id, 'advanced', Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-bold text-cyan-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Master Level %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={metric.courseLevelStats?.master ?? 89}
                        onChange={(e) => handleUpdateCourseLevel(metric.id, 'master', Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-bold text-indigo-700"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Growth Metric Dedicated Modal */}
      {editingMetric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl glass-panel p-6 border border-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-serif">
                    Edit Growth Management Metric
                  </h3>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Configuring: {editingMetric.title}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingMetric(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Metric Title (e.g. Student Learning+, Verified Certificates)
                </label>
                <input
                  type="text"
                  value={editingMetric.title}
                  onChange={(e) => setEditingMetric({ ...editingMetric, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800 font-semibold"
                  placeholder="e.g. Student Learning+"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Value / Metric Score
                  </label>
                  <input
                    type="text"
                    value={editingMetric.value}
                    onChange={(e) => setEditingMetric({ ...editingMetric, value: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800 font-bold"
                    placeholder="e.g. 18,400+ or 96.8%"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Metric Category
                  </label>
                  <select
                    value={editingMetric.category}
                    onChange={(e) => setEditingMetric({ ...editingMetric, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
                  >
                    <option value="learning">Student Learning</option>
                    <option value="certificate">Verified Certificate</option>
                    <option value="percentage">Course Percentage</option>
                    <option value="custom">Custom Milestone</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subtitle Description
                </label>
                <textarea
                  rows={2}
                  value={editingMetric.subtitle}
                  onChange={(e) => setEditingMetric({ ...editingMetric, subtitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
                  placeholder="Brief explanatory note displayed on Homepage..."
                />
              </div>

              {/* Course Level Percentages if category is percentage or has stats */}
              {(editingMetric.category === 'percentage' || editingMetric.courseLevelStats) && (
                <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">
                    Course Level Percentages (%)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Beginner %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingMetric.courseLevelStats?.beginner ?? 98}
                        onChange={(e) => {
                          const currentStats = editingMetric.courseLevelStats || { beginner: 98, intermediate: 95, advanced: 92, master: 89 };
                          setEditingMetric({
                            ...editingMetric,
                            courseLevelStats: {
                              ...currentStats,
                              beginner: Number(e.target.value)
                            }
                          });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs font-bold text-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Intermediate %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingMetric.courseLevelStats?.intermediate ?? 95}
                        onChange={(e) => {
                          const currentStats = editingMetric.courseLevelStats || { beginner: 98, intermediate: 95, advanced: 92, master: 89 };
                          setEditingMetric({
                            ...editingMetric,
                            courseLevelStats: {
                              ...currentStats,
                              intermediate: Number(e.target.value)
                            }
                          });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs font-bold text-teal-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Advanced %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingMetric.courseLevelStats?.advanced ?? 92}
                        onChange={(e) => {
                          const currentStats = editingMetric.courseLevelStats || { beginner: 98, intermediate: 95, advanced: 92, master: 89 };
                          setEditingMetric({
                            ...editingMetric,
                            courseLevelStats: {
                              ...currentStats,
                              advanced: Number(e.target.value)
                            }
                          });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs font-bold text-cyan-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Master %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingMetric.courseLevelStats?.master ?? 89}
                        onChange={(e) => {
                          const currentStats = editingMetric.courseLevelStats || { beginner: 98, intermediate: 95, advanced: 92, master: 89 };
                          setEditingMetric({
                            ...editingMetric,
                            courseLevelStats: {
                              ...currentStats,
                              master: Number(e.target.value)
                            }
                          });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs font-bold text-indigo-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const id = editingMetric.id;
                    setDeleteConfirmId(id);
                  }}
                  className="px-3.5 py-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Metric</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingMetric(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl glass-panel p-6 border border-white shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                Remove Growth Metric?
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Are you sure you want to remove <strong>"{metrics.find(m => m.id === deleteConfirmId)?.title || 'this metric'}"</strong>? It will be deleted from Growth Management and removed from the User Home Page.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleDeleteMetric(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{saving ? 'Deleting...' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Metric Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-panel p-6 border border-white shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-serif">
              Add New Growth Milestone Metric
            </h3>
            <p className="text-xs text-slate-600">
              Create a custom growth KPI to showcase on the student homepage portal.
            </p>

            <form onSubmit={handleAddNewMetric} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Metric Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Industry Hiring Partners"
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Metric Score / Value
                </label>
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="e.g. 150+ Companies or 99.1%"
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs sm:text-sm text-slate-800 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
                >
                  <option value="learning">Student Learning</option>
                  <option value="certificate">Verified Certificate</option>
                  <option value="percentage">Course Percentage</option>
                  <option value="custom">Custom Milestone</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Subtitle Description
                </label>
                <textarea
                  rows={2}
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="Official institutional metric description..."
                  className="w-full p-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Add Metric
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
