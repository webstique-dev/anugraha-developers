import axios from 'axios';
import { getApiBaseUrl } from './apiConfig';

const RAW_API_URL = getApiBaseUrl();
const PLOTS_API_URL = `${RAW_API_URL.replace(/\/$/, '')}/plots`;

const plotApi = axios.create({
  baseURL: PLOTS_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30s timeout for Render cold starts
});

const APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || '';

/**
 * Normalizes plot object with both UPPERCASE and lowercase keys for complete UI compatibility
 */
const normalizePlot = (p = {}) => ({
  ID: (p.ID || p.id || p.plotId || '').toString(),
  PLOTNO: (p.PLOTNO || p.plotNo || p.PlotNo || '').toString(),
  STATUS: (p.STATUS || p.status || p.Status || 'Available').toString(),
  LENGTH: (p.LENGTH || p.length || p.Length || '').toString(),
  WIDTH: (p.WIDTH || p.width || p.Width || '').toString(),
  FACING: (p.FACING || p.facing || p.Facing || 'North').toString(),
  SVGPATH: (p.SVGPATH || p.svgPath || p.SvgPath || '').toString(),
  id: (p.id || p.ID || p.plotId || '').toString(),
  plotNo: (p.plotNo || p.PLOTNO || p.PlotNo || '').toString(),
  status: (p.status || p.STATUS || p.Status || 'Available').toString(),
  length: (p.length || p.LENGTH || p.Length || '').toString(),
  width: (p.width || p.WIDTH || p.Width || '').toString(),
  facing: (p.facing || p.FACING || p.Facing || 'North').toString(),
  svgPath: (p.svgPath || p.SVGPATH || p.SvgPath || '').toString(),
  syncPending: Boolean(p.syncPending)
});

/**
 * Merges Google Sheets plot data with MongoDB database plot records.
 * - Primary preference given to Google Sheets data.
 * - If any plot or specific field is missing/empty in Google Sheets, it is automatically loaded from MongoDB.
 */
const mergeSheetsAndMongoData = (sheetsPlots = [], mongoPlots = []) => {
  if (!Array.isArray(sheetsPlots) || sheetsPlots.length === 0) {
    return Array.isArray(mongoPlots) ? mongoPlots.map(normalizePlot) : [];
  }
  if (!Array.isArray(mongoPlots) || mongoPlots.length === 0) {
    return sheetsPlots.map(normalizePlot);
  }

  const mongoMapById = new Map();
  const mongoMapByNo = new Map();

  mongoPlots.forEach((mPlot) => {
    const mId = (mPlot.ID || mPlot.id || mPlot.plotId || '').toString().toLowerCase().trim();
    const mNo = (mPlot.PLOTNO || mPlot.plotNo || '').toString().toLowerCase().trim();
    if (mId) mongoMapById.set(mId, mPlot);
    if (mNo) mongoMapByNo.set(mNo, mPlot);
  });

  const mergedPlots = [];
  const processedMongoIds = new Set();

  sheetsPlots.forEach((sPlot) => {
    const sId = (sPlot.ID || sPlot.id || sPlot.plotId || '').toString().toLowerCase().trim();
    const sNo = (sPlot.PLOTNO || sPlot.plotNo || sPlot.PlotNo || '').toString().toLowerCase().trim();

    const matchingMongo = (sId && mongoMapById.get(sId)) || (sNo && mongoMapByNo.get(sNo));

    if (matchingMongo) {
      const mId = (matchingMongo.ID || matchingMongo.id || matchingMongo.plotId || '').toString().toLowerCase().trim();
      if (mId) processedMongoIds.add(mId);

      // Merge each field: prefer Google Sheets if non-empty, fallback to MongoDB
      const mergedPlot = normalizePlot({
        ID: sPlot.ID || sPlot.id || matchingMongo.ID || matchingMongo.id || matchingMongo.plotId || '',
        PLOTNO: sPlot.PLOTNO || sPlot.plotNo || sPlot.PlotNo || matchingMongo.PLOTNO || matchingMongo.plotNo || '',
        STATUS: sPlot.STATUS || sPlot.status || sPlot.Status || matchingMongo.STATUS || matchingMongo.status || 'Available',
        LENGTH: sPlot.LENGTH || sPlot.length || sPlot.Length || matchingMongo.LENGTH || matchingMongo.length || '',
        WIDTH: sPlot.WIDTH || sPlot.width || sPlot.Width || matchingMongo.WIDTH || matchingMongo.width || '',
        FACING: sPlot.FACING || sPlot.facing || sPlot.Facing || matchingMongo.FACING || matchingMongo.facing || 'North',
        SVGPATH: sPlot.SVGPATH || sPlot.svgPath || sPlot.SvgPath || matchingMongo.SVGPATH || matchingMongo.svgPath || '',
        syncPending: matchingMongo.syncPending
      });

      mergedPlots.push(mergedPlot);
    } else {
      mergedPlots.push(normalizePlot(sPlot));
    }
  });

  // Append any plots that exist in MongoDB but were missing in Google Sheets
  mongoPlots.forEach((mPlot) => {
    const mId = (mPlot.ID || mPlot.id || mPlot.plotId || '').toString().toLowerCase().trim();
    if (mId && !processedMongoIds.has(mId)) {
      mergedPlots.push(normalizePlot(mPlot));
    }
  });

  return mergedPlots;
};

/**
 * Fetch plot records:
 * 1. Executes Google Sheets (Apps Script / OpenSheet) and MongoDB database requests in parallel.
 * 2. If one source is slow or fails, seamlessly uses data from the available source.
 * 3. Merges data so any missing plots or fields in Google Sheets are seamlessly loaded from MongoDB.
 */
export const fetchPlotsFromAppsScript = async (sheetId) => {
  let sheetsPlots = [];
  let mongoPlots = [];

  // Function A: Fetch Google Sheets data
  const fetchSheetsData = async () => {
    if (APPS_SCRIPT_URL && APPS_SCRIPT_URL.startsWith('http')) {
      try {
        const res = await axios.get(`${APPS_SCRIPT_URL}?action=getPlots`, { timeout: 4000 });
        if (res.data && Array.isArray(res.data.data)) return res.data.data;
        if (Array.isArray(res.data)) return res.data;
      } catch (err) {
        console.warn('[Google Apps Script] Web App GET failed:', err.message);
      }
    }
    if (sheetId) {
      try {
        const res = await axios.get(`https://opensheet.elk.sh/${sheetId}/Sheet1`, { timeout: 4000 });
        if (Array.isArray(res.data)) return res.data;
      } catch (err) {
        console.warn('[OpenSheet] API GET failed:', err.message);
      }
    }
    return [];
  };

  // Function B: Fetch MongoDB database data
  const fetchMongoData = async () => {
    try {
      const res = await plotApi.get('/', { timeout: 4000 });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
    } catch (err) {
      console.warn('[MongoDB Backend] Plot fetch failed:', err.message);
    }
    return [];
  };

  // Run both data retrieval streams in parallel
  try {
    const [sheetsResult, mongoResult] = await Promise.allSettled([
      fetchSheetsData(),
      fetchMongoData()
    ]);

    if (sheetsResult.status === 'fulfilled' && Array.isArray(sheetsResult.value)) {
      sheetsPlots = sheetsResult.value;
    }
    if (mongoResult.status === 'fulfilled' && Array.isArray(mongoResult.value)) {
      mongoPlots = mongoResult.value;
    }
  } catch (err) {
    console.warn('[Plot Service] Data fetch error:', err.message);
  }

  // Merged Google Sheets & MongoDB dataset
  const finalPlots = mergeSheetsAndMongoData(sheetsPlots, mongoPlots);
  console.log(`[Plot Service] Loaded ${finalPlots.length} plot records (Sheets: ${sheetsPlots.length}, MongoDB: ${mongoPlots.length}).`);

  // Throw error only if BOTH data sources returned 0 records and threw error
  if (finalPlots.length === 0 && sheetsPlots.length === 0 && mongoPlots.length === 0) {
    throw new Error('Unable to load layout plot data from Google Sheets or MongoDB database.');
  }

  return finalPlots;
};

/**
 * Fetch latest plot record by Unique ID
 */
export const fetchPlotFromSheet = async (sheetId, plotId) => {
  const plots = await fetchPlotsFromAppsScript(sheetId);
  if (Array.isArray(plots) && plots.length > 0) {
    const match = plots.find(
      (p) => (p.ID || p.id || p.plotId || '').toString() === plotId.toString()
    );
    return match || null;
  }
  return null;
};

/**
 * Direct browser-to-Apps Script POST fallback helper (used ONLY when backend server is offline)
 */
const postDirectToAppsScript = async (action, payload) => {
  if (!APPS_SCRIPT_URL || !APPS_SCRIPT_URL.startsWith('http')) return;

  try {
    const fullPayload = {
      action,
      ID: (payload.id || payload.ID || payload.plotId || '').toString(),
      PLOTNO: (payload.plotNo || payload.PLOTNO || '').toString(),
      STATUS: (payload.status || payload.STATUS || 'Available').toString(),
      WIDTH: (payload.width || payload.WIDTH || '').toString(),
      LENGTH: (payload.length || payload.LENGTH || '').toString(),
      FACING: (payload.facing || payload.FACING || '').toString(),
      SVGPATH: (payload.svgPath || payload.SVGPATH || '').toString()
    };

    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(fullPayload)
    });
    console.log(`[Google Apps Script Offline Fallback] Posted '${action}' payload directly to Web App`);
  } catch (err) {
    console.warn('[Google Apps Script Direct Fallback Error]:', err.message);
  }
};

/**
 * Update an existing plot matching Unique ID in MongoDB (Backend syncs to Google Sheets once)
 */
export const updatePlotRecord = async (token, plotData) => {
  try {
    // Send update request to backend server (server handles MongoDB update AND single Google Sheets sync)
    const res = await plotApi.post('/update', plotData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (err) {
    console.error('Error updating plot via backend service:', err);
    if (err.response && err.response.data) {
      throw new Error(err.response.data.message || 'Plot update failed');
    }
    // Live session fallback mode if backend server is unreachable
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED' || !err.response) {
      console.warn('Backend plot server unreachable. Falling back to direct Apps Script sync & live session memory update.');
      postDirectToAppsScript('update', plotData);
      return {
        success: true,
        message: 'Plot updated in live session',
        updatedPlot: {
          ID: plotData.id.toString(),
          PLOTNO: plotData.plotNo,
          STATUS: plotData.status,
          LENGTH: plotData.length,
          WIDTH: plotData.width,
          FACING: plotData.facing,
          SVGPATH: plotData.svgPath
        }
      };
    }
    throw new Error(err.message || 'Error updating plot');
  }
};

/**
 * Create a new plot row with generated Unique ID in MongoDB (Backend syncs to Google Sheets once)
 */
export const createPlotRecord = async (token, plotData) => {
  try {
    // Send create request to backend server (server handles MongoDB insert AND single Google Sheets sync)
    const res = await plotApi.post('/create', plotData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (err) {
    console.error('Error creating plot via backend service:', err);
    if (err.response && err.response.data) {
      throw new Error(err.response.data.message || 'Plot creation failed');
    }
    // Live session fallback mode if backend server is unreachable
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED' || !err.response) {
      const generatedId = `plot-${Date.now().toString().slice(-4)}`;
      console.warn('Backend plot server unreachable. Falling back to direct Apps Script sync & live session memory update.');
      postDirectToAppsScript('create', { ...plotData, id: generatedId });
      return {
        success: true,
        message: 'New plot created in live session',
        newPlot: {
          ID: generatedId,
          PLOTNO: plotData.plotNo || `Plot-${generatedId}`,
          STATUS: plotData.status || 'Available',
          LENGTH: plotData.length || '30',
          WIDTH: plotData.width || '50',
          FACING: plotData.facing || 'North',
          SVGPATH: plotData.svgPath || ''
        }
      };
    }
    throw new Error(err.message || 'Error creating new plot');
  }
};

/**
 * Soft delete a plot record in MongoDB (Backend syncs to Google Sheets once)
 */
export const softDeletePlotRecord = async (token, plotId) => {
  try {
    // Send delete request to backend server (server handles MongoDB soft-delete AND single Google Sheets sync)
    const res = await plotApi.post(
      '/delete',
      { id: plotId },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.data;
  } catch (err) {
    console.error('Error soft deleting plot via backend service:', err);
    if (err.response && err.response.data) {
      throw new Error(err.response.data.message || 'Soft delete failed');
    }
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED' || !err.response) {
      console.warn('Backend plot server unreachable. Falling back to direct Apps Script sync.');
      postDirectToAppsScript('delete', { id: plotId, status: 'Blocked' });
    }
    return {
      success: true,
      message: 'Plot soft-deleted in live session',
      id: plotId.toString()
    };
  }
};
