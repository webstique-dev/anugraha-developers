import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Compass, Ruler } from 'lucide-react';
import PlotZoomControls from './PlotZoomControls';
import PlotInfoCard from './PlotInfoCard';
import PlotFilterPanel from './PlotFilterPanel';
import PlotBreadcrumb from './PlotBreadcrumb';
import StatusBadge from '../Common/StatusBadge/StatusBadge';
import SocialActions from '../Common/SocialActions/SocialActions';
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

  // Fetch Plot Data
  useEffect(() => {
    async function loadPlots() {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        setPlotsData(data);

        // Count statuses
        const counts = { all: 0, available: 0, booked: 0, registered: 0, blocked: 0 };
        data.forEach((plot) => {
          counts.all++;
          const statusKey = (plot.STATUS || plot.status || 'available').toLowerCase();
          if (counts[statusKey] !== undefined) {
            counts[statusKey]++;
          }
        });
        setStatusCounts(counts);
      } catch (err) {
        console.error('Error loading Google Sheet plot data:', err);
      }
    }

    loadPlots();
  }, [API_URL]);

  // Initial center on mount & window resize
  useEffect(() => {
    centerMapView();
    const handleResize = () => centerMapView();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [centerMapView]);

  // Render SVG plot paths into overlay
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
      const area = plot.AREA || plot.area || plot.Area || '1500 Sq.ft';

      let statusKey = 'available';
      if (statusLower.includes('registered')) statusKey = 'registered';
      else if (statusLower.includes('booked')) statusKey = 'booked';
      else if (statusLower.includes('sold')) statusKey = 'registered';
      else if (statusLower.includes('blocked') || statusLower.includes('reserved')) statusKey = 'blocked';

      // Check status filter
      if (activeFilter !== 'all' && statusKey !== activeFilter) {
        return;
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('class', `plot-zone ${statusKey}`);
      path.dataset.plotno = plotNo;
      path.dataset.plotid = plotId;
      path.dataset.status = rawStatus;
      path.dataset.facing = facing;
      path.dataset.area = area;

      path.addEventListener('mouseenter', (e) => {
        setHoveredPlot({
          plotNo,
          plotId,
          status: rawStatus,
          facing,
          area,
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
        overlay.querySelectorAll('.plot-zone').forEach((p) => p.classList.remove('selected'));
        path.classList.add('selected');
        setSelectedPlot({
          plotNo,
          plotId,
          status: rawStatus,
          facing,
          area
        });
      });

      overlay.appendChild(path);

      // Plot label
      const bbox = path.getBBox();
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', bbox.x + bbox.width / 2);
      label.setAttribute('y', bbox.y + 16);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('class', 'plot-label');
      label.textContent = plotId;
      overlay.appendChild(label);
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
            left: `${Math.min(window.innerWidth - 220, hoveredPlot.x + 15)}px`,
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
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Ruler size={13} /> {hoveredPlot.area}
            </span>
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
          phoneNumber={phoneNumber}
          whatsappNumber={whatsappNumber}
        />
      )}
    </div>
  );
};

export default PlotViewer;
