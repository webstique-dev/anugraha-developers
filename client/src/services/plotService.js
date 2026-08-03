import axios from 'axios';

const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const PLOTS_API_URL = `${RAW_API_URL.replace(/\/$/, '')}/plots`;

const plotApi = axios.create({
  baseURL: PLOTS_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 8000
});

const APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || '';

/**
 * Fetch all plot records from Google Apps Script Web App (or OpenSheet fallback)
 */
export const fetchPlotsFromAppsScript = async (sheetId) => {
  if (APPS_SCRIPT_URL && APPS_SCRIPT_URL.startsWith('http')) {
    try {
      const res = await axios.get(`${APPS_SCRIPT_URL}?action=getPlots`);
      if (res.data && Array.isArray(res.data.data)) {
        return res.data.data;
      } else if (Array.isArray(res.data)) {
        return res.data;
      }
    } catch (err) {
      console.warn('[Google Apps Script] Web App GET failed. Falling back to OpenSheet:', err.message);
    }
  }

  // Fallback to OpenSheet API
  try {
    const res = await axios.get(`https://opensheet.elk.sh/${sheetId}/Sheet1`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error('Error loading plots:', err);
    return [];
  }
};

/**
 * Fetch latest Google Sheet data for a single plot by Unique ID
 */
export const fetchPlotFromSheet = async (sheetId, plotId) => {
  const plots = await fetchPlotsFromAppsScript(sheetId);
  if (Array.isArray(plots) && plots.length > 0) {
    const match = plots.find(
      (p) => (p.ID || p.id || p.Id || '').toString() === plotId.toString()
    );
    return match || null;
  }
  return null;
};

/**
 * Direct browser-to-Apps Script POST helper (using text/plain mode to avoid CORS preflight issues)
 */
const postDirectToAppsScript = async (action, payload) => {
  if (!APPS_SCRIPT_URL || !APPS_SCRIPT_URL.startsWith('http')) return;

  try {
    const fullPayload = {
      action,
      ID: (payload.id || payload.ID || '').toString(),
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
    console.log(`[Google Apps Script Client Direct] Posted '${action}' payload to Web App`);
  } catch (err) {
    console.warn('[Google Apps Script Client Direct Error]:', err.message);
  }
};

/**
 * Update an existing plot matching Unique ID
 */
export const updatePlotRecord = async (token, plotData) => {
  // Post directly from browser to Apps Script as secondary route
  postDirectToAppsScript('update', plotData);

  try {
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
    // Fallback sync mode if backend server is unreachable
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED' || !err.response) {
      console.warn('Backend plot server unreachable. Updating plot state in live memory session.');
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
 * Create a new plot row with generated Unique ID
 */
export const createPlotRecord = async (token, plotData) => {
  // Post directly from browser to Apps Script as secondary route
  postDirectToAppsScript('create', plotData);

  try {
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
    // Fallback sync mode if backend server is unreachable
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED' || !err.response) {
      const generatedId = `plot-${Date.now().toString().slice(-4)}`;
      console.warn('Backend plot server unreachable. Creating new plot in live memory session.');
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
 * Soft delete a plot record (sets Status to 'Blocked' / 'Deleted')
 */
export const softDeletePlotRecord = async (token, plotId) => {
  // Post directly from browser to Apps Script as secondary route
  postDirectToAppsScript('delete', { id: plotId, status: 'Blocked' });

  try {
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
    // Fallback sync mode
    return {
      success: true,
      message: 'Plot soft-deleted in live session',
      id: plotId.toString()
    };
  }
};
