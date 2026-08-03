import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  Trash2,
  AlertTriangle,
  Layers,
  Compass,
  Maximize2,
  ArrowUpDown,
  Code2,
  Tag,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { toast } from '../Common/Notification/NotificationProvider';
import './PlotEditorDrawer.css';

/**
 * Validate SVG Path syntax
 */
const isValidSvgPath = (pathStr) => {
  if (!pathStr || typeof pathStr !== 'string') return false;
  const trimmed = pathStr.trim();
  const svgPathRegex = /^[MmLlHhVvCcSsQqTtAaZz0-9\s,\.\-]+$/;
  return trimmed.length > 3 && svgPathRegex.test(trimmed);
};

const PlotEditorDrawer = ({
  isOpen,
  mode = 'edit', // 'edit' | 'create'
  initialPlotData = null,
  sheetId,
  onClose,
  onSavePlot,
  onDeletePlot
}) => {
  const [formData, setFormData] = useState({
    id: '',
    plotNo: '',
    status: 'Available',
    length: '',
    width: '',
    facing: 'North',
    svgPath: ''
  });

  const [initialDataState, setInitialDataState] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pathValidationError, setPathValidationError] = useState('');
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);

  // Populate drawer form when opening
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialPlotData) {
        const loaded = {
          id: (initialPlotData.plotId || initialPlotData.ID || initialPlotData.id || '').toString(),
          plotNo: (initialPlotData.plotNo || initialPlotData.PLOTNO || initialPlotData.plotno || '').toString(),
          status: (initialPlotData.status || initialPlotData.STATUS || 'Available').toString(),
          length: (initialPlotData.length || initialPlotData.LENGTH || '').toString(),
          width: (initialPlotData.width || initialPlotData.WIDTH || '').toString(),
          facing: (initialPlotData.facing || initialPlotData.FACING || 'North').toString(),
          svgPath: (initialPlotData.svgPath || initialPlotData.SVGPATH || initialPlotData.svgpath || '').toString()
        };
        setFormData(loaded);
        setInitialDataState(JSON.stringify(loaded));
      } else {
        const newForm = {
          id: '',
          plotNo: '',
          status: 'Available',
          length: '30',
          width: '50',
          facing: 'North',
          svgPath: 'M 10 10 L 50 10 L 50 50 L 10 50 Z'
        };
        setFormData(newForm);
        setInitialDataState(JSON.stringify(newForm));
      }
      setPathValidationError('');
      setShowUnsavedConfirm(false);
    }
  }, [isOpen, mode, initialPlotData]);

  // Check if form is dirty (modified)
  const isDirty = () => {
    return JSON.stringify(formData) !== initialDataState;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'svgPath') {
      if (value && !isValidSvgPath(value)) {
        setPathValidationError('Invalid SVG path commands. Path must use valid M, L, H, V, C, S, Q, T, A, Z SVG syntax.');
      } else {
        setPathValidationError('');
      }
    }
  };

  const handleCloseAttempt = () => {
    if (isDirty()) {
      setShowUnsavedConfirm(true);
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.svgPath && !isValidSvgPath(formData.svgPath)) {
      setPathValidationError('Invalid SVG Path data format. Please fix SVG syntax errors before saving.');
      toast.error('Invalid SVG Path syntax');
      return;
    }

    setSaving(true);
    try {
      await onSavePlot(formData, mode);
      setSaving(false);
      onClose();
    } catch (err) {
      console.error('Error saving plot:', err);
      toast.error(err.message || 'Failed to save plot changes');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!formData.id) return;
    if (window.confirm(`Are you sure you want to soft-delete Plot ${formData.plotNo}?`)) {
      setSaving(true);
      try {
        await onDeletePlot(formData.id);
        setSaving(false);
        onClose();
      } catch (err) {
        console.error('Error deleting plot:', err);
        toast.error('Failed to soft-delete plot');
        setSaving(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="drawer-root-portal">
        {/* Backdrop */}
        <motion.div
          className="drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCloseAttempt}
        />

        {/* Drawer Panel */}
        <motion.div
          className="plot-editor-drawer-panel"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        >
          {/* Header */}
          <div className="drawer-header">
            <div className="drawer-title-group">
              <div className="drawer-badge">{mode === 'edit' ? `PLOT ID: ${formData.id}` : 'NEW PLOT'}</div>
              <h2 className="drawer-title">
                {mode === 'edit' ? `Manage Plot ${formData.plotNo}` : 'Add New Layout Plot'}
              </h2>
            </div>
            <button
              className="drawer-close-btn"
              onClick={handleCloseAttempt}
              aria-label="Close Plot Editor"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Body */}
          <form className="drawer-form-body" onSubmit={handleSubmit}>
            {/* Field: Plot Number */}
            <div className="editor-form-group">
              <label className="editor-label">
                <Tag size={13} /> PLOT NUMBER
              </label>
              <input
                type="text"
                className="editor-input"
                placeholder="e.g. Plot-1"
                value={formData.plotNo}
                onChange={(e) => handleInputChange('plotNo', e.target.value)}
                required
              />
            </div>

            {/* Field: Status */}
            <div className="editor-form-group">
              <label className="editor-label">
                <Layers size={13} /> AVAILABILITY STATUS
              </label>
              <select
                className="editor-select"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="Available">Available</option>
                <option value="Booked">Booked</option>
                <option value="Registered">Registered</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>

            {/* Row: Width & Length */}
            <div className="editor-form-row">
              <div className="editor-form-group">
                <label className="editor-label">
                  <Maximize2 size={13} /> WIDTH (COL D)
                </label>
                <input
                  type="text"
                  className="editor-input"
                  placeholder="e.g. 30"
                  value={formData.width}
                  onChange={(e) => handleInputChange('width', e.target.value)}
                />
              </div>

              <div className="editor-form-group">
                <label className="editor-label">
                  <ArrowUpDown size={13} /> LENGTH (COL E)
                </label>
                <input
                  type="text"
                  className="editor-input"
                  placeholder="e.g. 50"
                  value={formData.length}
                  onChange={(e) => handleInputChange('length', e.target.value)}
                />
              </div>
            </div>

            {/* Field: Facing */}
            <div className="editor-form-group">
              <label className="editor-label">
                <Compass size={13} /> FACING DIRECTION
              </label>
              <input
                type="text"
                className="editor-input"
                placeholder="e.g. North, East, South-West"
                value={formData.facing}
                onChange={(e) => handleInputChange('facing', e.target.value)}
              />
            </div>

            {/* Field: SVG Path Data */}
            <div className="editor-form-group">
              <label className="editor-label">
                <Code2 size={13} /> SVG PATH DATA (`d` string)
              </label>
              <textarea
                className={`editor-textarea ${pathValidationError ? 'has-error' : ''}`}
                rows={4}
                placeholder="e.g. M 724.96 330.28 L 748.96 330.28 L 748.96 362.68 Z"
                value={formData.svgPath}
                onChange={(e) => handleInputChange('svgPath', e.target.value)}
              />
              {pathValidationError && (
                <div className="path-error-text">
                  <AlertTriangle size={12} /> {pathValidationError}
                </div>
              )}
            </div>

            {/* Footer Action Controls */}
            <div className="drawer-footer-actions">
              <button
                type="submit"
                className="editor-submit-btn"
                disabled={saving || Boolean(pathValidationError)}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="btn-spinner" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Plot Changes</span>
                  </>
                )}
              </button>

              {mode === 'edit' && (
                <button
                  type="button"
                  className="editor-delete-btn"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  <Trash2 size={15} />
                  <span>Soft Delete</span>
                </button>
              )}
            </div>
          </form>

          {/* Unsaved Changes Confirmation Modal */}
          {showUnsavedConfirm && (
            <div className="unsaved-confirm-overlay">
              <div className="unsaved-confirm-card">
                <AlertTriangle size={24} className="confirm-icon" />
                <h4>Unsaved Changes</h4>
                <p>You have unsaved edits in this plot form. Are you sure you want to discard them?</p>
                <div className="confirm-actions">
                  <button
                    className="confirm-discard-btn"
                    onClick={() => {
                      setShowUnsavedConfirm(false);
                      onClose();
                    }}
                  >
                    Discard Changes
                  </button>
                  <button
                    className="confirm-keep-btn"
                    onClick={() => setShowUnsavedConfirm(false)}
                  >
                    Keep Editing
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PlotEditorDrawer;
