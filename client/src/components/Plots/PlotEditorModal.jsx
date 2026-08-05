import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { toast } from '../Common/Notification/NotificationProvider';
import './PlotEditorModal.css';

/**
 * Validate SVG Path syntax
 */
const isValidSvgPath = (pathStr) => {
  if (!pathStr || typeof pathStr !== 'string') return false;
  const trimmed = pathStr.trim();
  const svgPathRegex = /^[MmLlHhVvCcSsQqTtAaZz0-9\s,\.\-]+$/;
  return trimmed.length > 3 && svgPathRegex.test(trimmed);
};

const PlotEditorModal = ({
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
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 728);

  const isLoadingPlotData = mode === 'edit' && !initialPlotData;

  // Responsive breakpoint listener for <728px mobile bottom sheet vs >=728px desktop modal
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 728);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock background body scrolling while modal/bottom-sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Populate form fields when opening or when initialPlotData updates
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialPlotData) {
        const rawFacing = (initialPlotData.facing || initialPlotData.FACING || 'North').toString().trim();
        const facingOptions = ['East', 'West', 'North', 'South'];
        const matchedFacing = facingOptions.find((dir) => dir.toLowerCase() === rawFacing.toLowerCase());
        const loadedFacing = matchedFacing || rawFacing || 'North';

        const loaded = {
          id: (initialPlotData.plotId || initialPlotData.ID || initialPlotData.id || '').toString(),
          plotNo: (initialPlotData.plotNo || initialPlotData.PLOTNO || initialPlotData.plotno || '').toString(),
          status: (initialPlotData.status || initialPlotData.STATUS || 'Available').toString(),
          length: (initialPlotData.length || initialPlotData.LENGTH || '').toString(),
          width: (initialPlotData.width || initialPlotData.WIDTH || '').toString(),
          facing: loadedFacing,
          svgPath: (initialPlotData.svgPath || initialPlotData.SVGPATH || initialPlotData.svgpath || '').toString()
        };
        setFormData(loaded);
        setInitialDataState(JSON.stringify(loaded));
      } else if (mode === 'create') {
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

  // Check if form has modified changes
  const isDirty = () => {
    return JSON.stringify(formData) !== initialDataState;
  };

  const handleCloseAttempt = () => {
    if (saving) return;
    if (isDirty()) {
      setShowUnsavedConfirm(true);
    } else {
      onClose();
    }
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleCloseAttempt();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, formData, initialDataState, saving]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'svgPath') {
      if (value && !isValidSvgPath(value)) {
        setPathValidationError('Invalid SVG path syntax. Must be a valid SVG d attribute.');
      } else {
        setPathValidationError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving || isLoadingPlotData) return;

    if (formData.svgPath && !isValidSvgPath(formData.svgPath)) {
      setPathValidationError('Invalid SVG Path syntax format.');
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
    if (!formData.id || saving || isLoadingPlotData) return;
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

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.18 } },
    exit: { opacity: 0, transition: { duration: 0.15 } }
  };

  const desktopModalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 12 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, scale: 0.95, y: 12, transition: { duration: 0.15, ease: 'easeIn' } }
  };

  const mobileSheetVariants = {
    hidden: { y: '100%' },
    visible: { y: 0, transition: { duration: 0.28, ease: [0.32, 0.72, 0, 1] } },
    exit: { y: '100%', transition: { duration: 0.2, ease: 'easeIn' } }
  };

  return (
    <AnimatePresence>
      <div className="plot-modal-portal">
        {/* Semi-transparent blurred backdrop */}
        <motion.div
          className="plot-modal-backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleCloseAttempt}
        />

        {/* Modal Container: Centered Modal (Desktop >=728px) vs Bottom Sheet (Mobile <728px) */}
        <div className={`plot-modal-wrapper ${isMobile ? 'mobile-sheet-wrapper' : 'desktop-modal-wrapper'}`}>
          <motion.div
            className={`plot-modal-card ${isMobile ? 'mobile-bottom-sheet' : 'desktop-centered-card'}`}
            variants={isMobile ? mobileSheetVariants : desktopModalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Handle Bar */}
            {isMobile && (
              <div className="mobile-drag-handle-container">
                <div className="mobile-drag-handle-pill" />
              </div>
            )}

            {/* Modal Header */}
            <div className="plot-modal-header">
              <div className="header-title-group">
                <span className="header-badge">
                  {isLoadingPlotData ? 'LOADING...' : mode === 'edit' ? `PLOT ID: ${formData.id}` : 'NEW PLOT'}
                </span>
                <h2 className="header-title">
                  {isLoadingPlotData
                    ? 'Loading Plot Details...'
                    : mode === 'edit'
                    ? `Edit Plot ${formData.plotNo}`
                    : 'Add New Layout Plot'}
                </h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseAttempt}
                aria-label="Close Modal"
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form Body or Skeleton Loader */}
            {isLoadingPlotData ? (
              <div className="modal-skeleton-body">
                <div className="skeleton-field">
                  <div className="skeleton-label" />
                  <div className="skeleton-input" />
                </div>
                <div className="skeleton-field">
                  <div className="skeleton-label" />
                  <div className="skeleton-input" />
                </div>
                <div className="skeleton-row">
                  <div className="skeleton-field">
                    <div className="skeleton-label" />
                    <div className="skeleton-input" />
                  </div>
                  <div className="skeleton-field">
                    <div className="skeleton-label" />
                    <div className="skeleton-input" />
                  </div>
                </div>
                <div className="skeleton-field">
                  <div className="skeleton-label" />
                  <div className="skeleton-textarea" />
                </div>
              </div>
            ) : (
              <form className="plot-modal-form-body" onSubmit={handleSubmit}>
                {/* Field: Plot Number */}
                <div className="modal-form-group">
                  <label className="modal-label">
                    <Tag size={13} /> PLOT NUMBER
                  </label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="e.g. Plot-101"
                    value={formData.plotNo}
                    onChange={(e) => handleInputChange('plotNo', e.target.value)}
                    required
                    disabled={saving}
                  />
                </div>

                {/* Field: Availability Status */}
                <div className="modal-form-group">
                  <label className="modal-label">
                    <Layers size={13} /> AVAILABILITY STATUS
                  </label>
                  <select
                    className="modal-select"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    disabled={saving}
                  >
                    <option value="Available">Available</option>
                    <option value="Booked">Booked</option>
                    <option value="Registered">Registered</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>

                {/* Form Grid Row: Width & Length */}
                <div className="modal-form-row">
                  <div className="modal-form-group">
                    <label className="modal-label">
                      <Maximize2 size={13} /> WIDTH (FT)
                    </label>
                    <input
                      type="text"
                      className="modal-input"
                      placeholder="e.g. 30"
                      value={formData.width}
                      onChange={(e) => handleInputChange('width', e.target.value)}
                      disabled={saving}
                    />
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-label">
                      <ArrowUpDown size={13} /> LENGTH (FT)
                    </label>
                    <input
                      type="text"
                      className="modal-input"
                      placeholder="e.g. 50"
                      value={formData.length}
                      onChange={(e) => handleInputChange('length', e.target.value)}
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* Field: Facing Direction */}
                <div className="modal-form-group">
                  <label className="modal-label">
                    <Compass size={13} /> FACING DIRECTION
                  </label>
                  <select
                    className="modal-select"
                    value={formData.facing}
                    onChange={(e) => handleInputChange('facing', e.target.value)}
                    disabled={saving}
                  >
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                    {!['East', 'West', 'North', 'South'].includes(formData.facing) && formData.facing && (
                      <option value={formData.facing}>{formData.facing}</option>
                    )}
                  </select>
                </div>

                {/* Field: SVG Path Data */}
                <div className="modal-form-group">
                  <label className="modal-label">
                    <Code2 size={13} /> SVG PATH DATA (`d` string)
                  </label>
                  <textarea
                    className={`modal-textarea ${pathValidationError ? 'has-error' : ''}`}
                    rows={3}
                    placeholder="e.g. M 724.96 330.28 L 748.96 330.28 L 748.96 362.68 Z"
                    value={formData.svgPath}
                    onChange={(e) => handleInputChange('svgPath', e.target.value)}
                    disabled={saving}
                  />
                  {pathValidationError && (
                    <div className="modal-path-error">
                      <AlertTriangle size={12} /> {pathValidationError}
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="plot-modal-footer">
                  <div className="primary-actions-group">
                    <button
                      type="submit"
                      className="modal-save-btn"
                      disabled={saving || Boolean(pathValidationError)}
                    >
                      {saving ? (
                        <>
                          <Loader2 size={16} className="modal-btn-spinner" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="modal-cancel-btn"
                      onClick={handleCloseAttempt}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>

                  {mode === 'edit' && (
                    <button
                      type="button"
                      className="modal-delete-btn"
                      onClick={handleDelete}
                      disabled={saving}
                    >
                      <Trash2 size={14} />
                      <span>Soft Delete</span>
                    </button>
                  )}
                </div>
              </form>
            )}
          </motion.div>
        </div>

        {/* Unsaved Changes Confirmation Modal Overlay */}
        {showUnsavedConfirm && (
          <div className="unsaved-modal-overlay">
            <div className="unsaved-modal-card">
              <AlertTriangle size={26} className="unsaved-icon" />
              <h3>Unsaved Changes</h3>
              <p>You have unsaved edits in this plot form. Do you want to discard them?</p>
              <div className="unsaved-actions">
                <button
                  type="button"
                  className="unsaved-discard-btn"
                  onClick={() => {
                    setShowUnsavedConfirm(false);
                    onClose();
                  }}
                >
                  Discard Changes
                </button>
                <button
                  type="button"
                  className="unsaved-keep-btn"
                  onClick={() => setShowUnsavedConfirm(false)}
                >
                  Keep Editing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};

export default PlotEditorModal;
