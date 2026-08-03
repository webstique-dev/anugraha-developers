import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Compass, Ruler, Maximize2, ArrowUpDown, ShieldCheck, Eye, Plus, Edit3 } from 'lucide-react';
import PlotZoomControls from './PlotZoomControls';
import PlotInfoCard from './PlotInfoCard';
import PlotFilterPanel from './PlotFilterPanel';
import PlotBreadcrumb from './PlotBreadcrumb';
import PlotEditorDrawer from './PlotEditorDrawer';
import StatusBadge from '../Common/StatusBadge/StatusBadge';
import SocialActions from '../Common/SocialActions/SocialActions';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../Common/Notification/NotificationProvider';
import {
  fetchPlotsFromAppsScript,
  fetchPlotFromSheet,
  updatePlotRecord,
  createPlotRecord,
  softDeletePlotRecord
} from '../../services/plotService';
import './PlotViewer.css';

const DEFAULT_SHEET_ID = '1n1puqY0m1MtqG8652yhWAChj6pYxP8b5ASDXQjpCp70';

const PlotViewer = ({
  sheetId = DEFAULT_SHEET_ID,
  bgSvgUrl = '/layout-background.svg',
  layoutTitle = 'Appanaikenpatty Phase 1',
  contentW = 725,
  contentH = 840,
  viewBox = '82 193 725 840',
  phoneNumber = '+919715334421',
  whatsappNumber = '919715334421'
}) => {
  const API_URL = `https://opensheet.elk.sh/${sheetId}/Sheet1`;
  const { isAuthenticated, user, token, openAuthModal } = useAuth();

  const viewportRef = useRef(null);
  const mapWrapperRef = useRef(null);
  const overlayRef = useRef(null);

  const [scale, setScale] = useState(1);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [hoveredPlot, setHoveredPlot] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [plotsData, setPlotsData] = useState([]);
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    available: 0,
    booked: 0,
    registered: 0,
    blocked: 0
  });

  // Admin Plot Management Drawer State
  const [editorDrawerOpen, setEditorDrawerOpen] = useState(false);
  const [editorMode, setEditorMode] = useState('edit'); // 'edit' | 'create'
  const [editingPlotData, setEditingPlotData] = useState(null);

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 5;
  const SCALE_STEP = 0.2;

  const dragRef = useRef({
    isDragging: false,
    dragMoved: false,
    dragStartX: 0,
    dragStartY: 0,
    scrollStartX: 0,
    scrollStartY: 0
  });

  const pinchRef = useRef({
    startDist: null,
    startScale: 1
  });

  const clampScale = (s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

  // Center map view
  const centerSmallContent = useCallback(
    (currentScale) => {
      const viewport = viewportRef.current;
      const mapWrapper = mapWrapperRef.current;
      if (!viewport || !mapWrapper) return;

      const vw = viewport.clientWidth;
      const vh = viewport.clientHeight;
      const scaledW = contentW * currentScale;
      const scaledH = contentH * currentScale;

      mapWrapper.style.left = scaledW <= vw ? (vw - scaledW) / 2 + 'px' : '0px';
      mapWrapper.style.top = scaledH <= vh ? (vh - scaledH) / 2 + 'px' : '0px';
    },
    [contentW, contentH]
  );

  const centerMapView = useCallback(
    (currentScale = scale) => {
      centerSmallContent(currentScale);
      const viewport = viewportRef.current;
      if (!viewport) return;

      const vw = viewport.clientWidth;
      const vh = viewport.clientHeight;
      const scaledW = contentW * currentScale;
      const scaledH = contentH * currentScale;

      if (scaledW > vw) viewport.scrollLeft = (scaledW - vw) / 2;
      if (scaledH > vh) viewport.scrollTop = (scaledH - vh) / 2;
    },
    [scale, centerSmallContent, contentW, contentH]
  );

  // Zoom function preserving stationary point under mouse/pinch center
  const zoomTo = useCallback(
    (newScale, clientX, clientY) => {
      const clamped = clampScale(newScale);
      const viewport = viewportRef.current;
      const mapWrapper = mapWrapperRef.current;
      if (!viewport || !mapWrapper) return;

      setScale((prevScale) => {
        if (clamped === prevScale) return prevScale;

        const rect = viewport.getBoundingClientRect();
        const px = clientX !== undefined ? clientX - rect.left : rect.width / 2;
        const py = clientY !== undefined ? clientY - rect.top : rect.height / 2;

        const contentX = viewport.scrollLeft + px;
        const contentY = viewport.scrollTop + py;
        const ratio = clamped / prevScale;

        mapWrapper.style.transform = `scale(${clamped})`;
        centerSmallContent(clamped);

        viewport.scrollLeft = contentX * ratio - px;
        viewport.scrollTop = contentY * ratio - py;

        return clamped;
      });
    },
    [centerSmallContent]
  );

  // Zoom handlers
  const handleZoomIn = () => zoomTo(scale + SCALE_STEP);
  const handleZoomOut = () => zoomTo(scale - SCALE_STEP);
  const handleZoomReset = () => {
    setScale(1);
    if (mapWrapperRef.current) {
      mapWrapperRef.current.style.transform = 'scale(1)';
    }
    centerMapView(1);
  };

  // Wheel listener
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
      zoomTo(scale + delta, e.clientX, e.clientY);
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, [scale, zoomTo]);

  // Touch pinch listeners
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const touchDist = (t1, t2) => Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        pinchRef.current.startDist = touchDist(e.touches[0], e.touches[1]);
        pinchRef.current.startScale = scale;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2 && pinchRef.current.startDist) {
        e.preventDefault();
        const newDist = touchDist(e.touches[0], e.touches[1]);
        const ratio = newDist / pinchRef.current.startDist;
        const midX = (e.touches[0].clientX + e.touches[0].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[0].clientY) / 2;
        zoomTo(pinchRef.current.startScale * ratio, midX, midY);
      }
    };

    const handleTouchEnd = (e) => {
      if (e.touches.length < 2) {
        pinchRef.current.startDist = null;
      }
    };

    viewport.addEventListener('touchstart', handleTouchStart, { passive: true });
    viewport.addEventListener('touchmove', handleTouchMove, { passive: false });
    viewport.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      viewport.removeEventListener('touchstart', handleTouchStart);
      viewport.removeEventListener('touchmove', handleTouchMove);
      viewport.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scale, zoomTo]);

  // Drag pan listeners
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleMouseDown = (e) => {
      dragRef.current.isDragging = true;
      dragRef.current.dragMoved = false;
      dragRef.current.dragStartX = e.clientX;
      dragRef.current.dragStartY = e.clientY;
      dragRef.current.scrollStartX = viewport.scrollLeft;
      dragRef.current.scrollStartY = viewport.scrollTop;
    };

    const handleMouseMove = (e) => {
      if (!dragRef.current.isDragging) return;
      const dx = e.clientX - dragRef.current.dragStartX;
      const dy = e.clientY - dragRef.current.dragStartY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.dragMoved = true;
        viewport.classList.add('dragging');
      }
      if (dragRef.current.dragMoved) {
        viewport.scrollLeft = dragRef.current.scrollStartX - dx;
        viewport.scrollTop = dragRef.current.scrollStartY - dy;
      }
    };

    const handleMouseUp = () => {
      dragRef.current.isDragging = false;
      viewport.classList.remove('dragging');
    };

    viewport.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      viewport.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Fetch Plot Data from Google Apps Script Web App / Google Sheets
  useEffect(() => {
    async function loadPlots() {
      try {
        const data = await fetchPlotsFromAppsScript(sheetId);
        setPlotsData(data);
      } catch (err) {
        console.error('Error loading plot data via Apps Script integration:', err);
      }
    }

    loadPlots();
  }, [sheetId]);

  // Recalculate status counts whenever plotsData changes
  useEffect(() => {
    const counts = { all: 0, available: 0, booked: 0, registered: 0, blocked: 0 };
    plotsData.forEach((plot) => {
      counts.all++;
      const statusKey = (plot.STATUS || plot.status || 'available').toString().toLowerCase();
      if (counts[statusKey] !== undefined) {
        counts[statusKey]++;
      }
    });
    setStatusCounts(counts);
  }, [plotsData]);

  // Initial center on mount & window resize
  useEffect(() => {
    centerMapView();
    const handleResize = () => centerMapView();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [centerMapView]);

  // Handlers for Plot Editor Drawer
  const handleOpenEditDrawer = async (plotDataToEdit) => {
    if (!isAuthenticated) return;
    const targetId = plotDataToEdit.plotId || plotDataToEdit.ID || plotDataToEdit.id;
    // Fetch latest data directly from Google Sheets using Unique ID
    const latestData = await fetchPlotFromSheet(sheetId, targetId);
    setEditingPlotData(latestData || plotDataToEdit);
    setEditorMode('edit');
    setEditorDrawerOpen(true);
  };

  const handleOpenCreateDrawer = () => {
    if (!isAuthenticated) return;
    setEditingPlotData(null);
    setEditorMode('create');
    setEditorDrawerOpen(true);
  };

  const handleSavePlot = async (formData, mode) => {
    if (mode === 'edit') {
      const res = await updatePlotRecord(token, {
        sheetId,
        id: formData.id,
        plotNo: formData.plotNo,
        status: formData.status,
        length: formData.length,
        width: formData.width,
        facing: formData.facing,
        svgPath: formData.svgPath
      });

      if (res.success && res.updatedPlot) {
        toast.success(`Plot ${formData.plotNo} updated successfully!`);

        // Live state update: Refresh modified plot without reloading page
        setPlotsData((prevPlots) =>
          prevPlots.map((p) => {
            const pId = (p.ID || p.id || p.Id || '').toString();
            if (pId === formData.id.toString()) {
              const l = parseFloat(formData.length || 0);
              const w = parseFloat(formData.width || 0);
              return {
                ...p,
                PLOTNO: formData.plotNo,
                STATUS: formData.status,
                LENGTH: formData.length,
                WIDTH: formData.width,
                FACING: formData.facing,
                SVGPATH: formData.svgPath,
                AREA: l && w ? `${(l * w).toFixed(2)} sq ft` : p.AREA
              };
            }
            return p;
          })
        );

        if (selectedPlot && (selectedPlot.plotId === formData.id || selectedPlot.id === formData.id)) {
          const l = parseFloat(formData.length || 0);
          const w = parseFloat(formData.width || 0);
          setSelectedPlot((prev) => ({
            ...prev,
            plotNo: formData.plotNo,
            status: formData.status,
            length: formData.length,
            width: formData.width,
            facing: formData.facing,
            svgPath: formData.svgPath,
            area: l && w ? `${(l * w).toFixed(2)} sq ft` : prev.area
          }));
        }
      }
    } else {
      // Create new plot
      const res = await createPlotRecord(token, {
        sheetId,
        plotNo: formData.plotNo,
        status: formData.status,
        length: formData.length,
        width: formData.width,
        facing: formData.facing,
        svgPath: formData.svgPath
      });

      if (res.success && res.newPlot) {
        toast.success(`New Plot ${res.newPlot.PLOTNO} created successfully!`);

        const l = parseFloat(res.newPlot.LENGTH || 0);
        const w = parseFloat(res.newPlot.WIDTH || 0);
        setPlotsData((prev) => [
          ...prev,
          {
            ID: res.newPlot.ID,
            PLOTNO: res.newPlot.PLOTNO,
            STATUS: res.newPlot.STATUS,
            LENGTH: res.newPlot.LENGTH,
            WIDTH: res.newPlot.WIDTH,
            FACING: res.newPlot.FACING,
            SVGPATH: res.newPlot.SVGPATH,
            AREA: l && w ? `${(l * w).toFixed(2)} sq ft` : '1500.00 sq ft'
          }
        ]);
      }
    }
  };

  const handleSoftDeletePlot = async (plotId) => {
    const res = await softDeletePlotRecord(token, plotId);
    if (res.success) {
      toast.success(`Plot ${plotId} soft-deleted (status set to Blocked)`);

      setPlotsData((prevPlots) =>
        prevPlots.map((p) => {
          const pId = (p.ID || p.id || p.Id || '').toString();
          if (pId === plotId.toString()) {
            return { ...p, STATUS: 'Blocked' };
          }
          return p;
        })
      );

      if (selectedPlot && (selectedPlot.plotId === plotId || selectedPlot.id === plotId)) {
        setSelectedPlot((prev) => (prev ? { ...prev, status: 'Blocked' } : null));
      }
    }
  };

  // Render SVG plot paths and dynamic labels into overlay
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || !plotsData.length) return;

    overlay.innerHTML = '';

    plotsData.forEach((plot) => {
      const pathData = plot.SVGPATH || plot.svgpath || plot.SvgPath;
      if (!pathData) return;

      const rawStatus = (plot.STATUS || plot.status || 'Available').toString();
      const statusLower = rawStatus.toLowerCase();
      const plotNo = plot.PLOTNO || plot.plotno || plot.PlotNo || '—';
      const plotId = plot.ID || plot.id || plot.Id || '—';
      const facing = plot.FACING || plot.facing || plot.Facing || '—';

      // Dimensions mapping from Google Sheets:
      // Column D -> Width, Column E -> Length, Column F -> Area
      const width = (plot.WIDTH || plot.width || plot.Width || '').toString().trim();
      const length = (plot.LENGTH || plot.length || plot.Length || '').toString().trim();
      let area = (plot.AREA || plot.area || plot.Area || '').toString().trim();

      if (!area && width && length) {
        const lNum = parseFloat(length);
        const wNum = parseFloat(width);
        if (!isNaN(lNum) && !isNaN(wNum)) {
          area = `${(lNum * wNum).toFixed(2)} sq ft`;
        }
      }

      // Check status filter
      if (activeFilter !== 'all' && statusLower !== activeFilter) {
        return;
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('class', `plot-zone ${statusLower}`);
      path.dataset.plotno = plotNo;
      path.dataset.plotid = plotId;
      path.dataset.status = rawStatus;
      path.dataset.facing = facing;
      path.dataset.area = area;
      path.dataset.width = width;
      path.dataset.length = length;

      path.addEventListener('mouseenter', (e) => {
        setHoveredPlot({
          plotNo,
          plotId,
          status: rawStatus,
          facing,
          area,
          width,
          length,
          svgPath: pathData,
          x: e.clientX,
          y: e.clientY
        });
      });

      path.addEventListener('mousemove', (e) => {
        setHoveredPlot((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
      });

      path.addEventListener('mouseleave', () => {
        setHoveredPlot(null);
      });

      path.addEventListener('click', () => {
        if (dragRef.current.dragMoved) return;
        setSelectedPlot({
          plotNo,
          plotId,
          status: rawStatus,
          facing,
          area,
          width,
          length,
          svgPath: pathData
        });
      });

      overlay.appendChild(path);

      // Render Dynamic Labels inside plot boundary
      const bbox = path.getBBox();
      const bw = bbox.width;
      const bh = bbox.height;
      const bx = bbox.x;
      const by = bbox.y;

      // Auto-adjust font size for smaller plots based on bounding box
      const minDim = Math.min(bw, bh);
      const baseFontSize = Math.max(2.4, Math.min(4.5, minDim * 0.15));
      const centerFontSize = Math.max(2.8, Math.min(5.5, minDim * 0.18));

      // 1. Width Label (Column D - Top horizontal edge)
      if (width) {
        const widthLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        widthLabel.setAttribute('x', bx + bw / 2);
        widthLabel.setAttribute('y', by + baseFontSize + 1);
        widthLabel.setAttribute('text-anchor', 'middle');
        widthLabel.setAttribute('class', 'plot-label plot-label-width');
        widthLabel.setAttribute('font-size', `${baseFontSize}px`);
        widthLabel.textContent = width;
        overlay.appendChild(widthLabel);
      }

      // 2. Length Label (Column E - Left vertical edge, rotated -90deg)
      if (length) {
        const lx = bx + baseFontSize + 1;
        const ly = by + bh / 2;
        const lengthLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        lengthLabel.setAttribute('x', lx);
        lengthLabel.setAttribute('y', ly);
        lengthLabel.setAttribute('text-anchor', 'middle');
        lengthLabel.setAttribute('transform', `rotate(-90 ${lx} ${ly})`);
        lengthLabel.setAttribute('class', 'plot-label plot-label-length');
        lengthLabel.setAttribute('font-size', `${baseFontSize}px`);
        lengthLabel.textContent = length;
        overlay.appendChild(lengthLabel);
      }

      // 3. Center Label: Plot No (Centered inside plot boundary)
      const plotNoLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      plotNoLabel.setAttribute('x', bx + bw / 2);
      plotNoLabel.setAttribute('y', by + bh / 2);
      plotNoLabel.setAttribute('text-anchor', 'middle');
      plotNoLabel.setAttribute('class', 'plot-label plot-label-no plot-label-id');
      plotNoLabel.setAttribute('font-size', `${centerFontSize * 1.1}px`);
      plotNoLabel.textContent = plotNo;
      overlay.appendChild(plotNoLabel);
    });
  }, [plotsData, activeFilter]);

  return (
    <div className="plot-viewer-root">
      {/* Top Header & Filter Controls Container */}
      <div className="plot-top-bar-wrapper">
        <PlotBreadcrumb layoutTitle={layoutTitle} />
        <PlotFilterPanel
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          statusCounts={statusCounts}
        />
        {isAuthenticated ? (
          <div className="map-admin-controls-strip">
            <button
              className="admin-add-plot-btn"
              onClick={handleOpenCreateDrawer}
              title="Create New Plot in Layout"
            >
              <Plus size={14} />
              <span>Add Plot</span>
            </button>
            <div className="map-mode-indicator admin-mode" title={`Admin Session Active (${user?.email})`}>
              <ShieldCheck size={14} />
              <span>Admin Mode</span>
            </div>
          </div>
        ) : (
          <button
            className="map-mode-indicator view-only-mode"
            onClick={() => openAuthModal('login')}
            title="Click to log in as Admin"
          >
            <Eye size={14} />
            <span>View-Only Mode</span>
          </button>
        )}
      </div>

      {/* Scrollable Viewport */}
      <div id="viewport" ref={viewportRef}>
        <div id="mapWrapper" ref={mapWrapperRef}>
          {/* SVG Vector Background */}
          <object
            type="image/svg+xml"
            data={bgSvgUrl}
            width={contentW}
            height={contentH}
            aria-hidden="true"
          />

          {/* Interactive Plot SVG Overlay */}
          <svg
            id="plotOverlay"
            ref={overlayRef}
            width={contentW}
            height={contentH}
            viewBox={viewBox}
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
        </div>
      </div>

      {/* On-Hover Floating Plot Card Tooltip */}
      {hoveredPlot && (
        <div
          className="map-hover-card"
          style={{
            left: `${Math.min(window.innerWidth - 240, hoveredPlot.x + 15)}px`,
            top: `${Math.min(window.innerHeight - 150, hoveredPlot.y + 15)}px`
          }}
        >
          <div className="hover-card-header">
            <span className="hover-card-title">{hoveredPlot.plotNo}</span>
            <StatusBadge status={hoveredPlot.status} variant="availability" />
          </div>
          <div className="hover-card-specs">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Compass size={13} /> {hoveredPlot.facing}
            </span>
            {hoveredPlot.width && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Maximize2 size={12} /> W: {hoveredPlot.width}
              </span>
            )}
            {hoveredPlot.length && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ArrowUpDown size={12} /> L: {hoveredPlot.length}
              </span>
            )}
            {hoveredPlot.area && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Ruler size={12} /> {hoveredPlot.area}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Zoom Controls */}
      <PlotZoomControls
        onZoomIn={handleZoomIn}
        onZoomReset={handleZoomReset}
        onZoomOut={handleZoomOut}
      />

      {/* Selected Plot Upgraded Info Card */}
      {selectedPlot && (
        <PlotInfoCard
          plotData={selectedPlot}
          onClose={() => setSelectedPlot(null)}
          onOpenEdit={handleOpenEditDrawer}
          phoneNumber={phoneNumber}
          whatsappNumber={whatsappNumber}
        />
      )}

      {/* Reusable Admin Plot Editor Drawer */}
      <PlotEditorDrawer
        isOpen={editorDrawerOpen}
        mode={editorMode}
        initialPlotData={editingPlotData}
        sheetId={sheetId}
        onClose={() => setEditorDrawerOpen(false)}
        onSavePlot={handleSavePlot}
        onDeletePlot={handleSoftDeletePlot}
      />
    </div>
  );
};

export default PlotViewer;
