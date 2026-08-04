const axios = require('axios');
const Plot = require('../models/Plot');

/**
 * Forward request to Google Apps Script Web App if URL configured
 */
const syncWithGoogleAppsScript = async (action, payload) => {
  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!appsScriptUrl || !appsScriptUrl.startsWith('http')) {
    console.log(`[Google Apps Script] No Web App URL set in server/.env. Skipping external Apps Script sync for action '${action}'.`);
    return { success: true, skipped: true };
  }

  try {
    const fullPayload = {
      action,
      ID: (payload.ID || payload.id || payload.plotId || '').toString(),
      PLOTNO: (payload.PLOTNO || payload.plotNo || '').toString(),
      STATUS: (payload.STATUS || payload.status || 'Available').toString(),
      WIDTH: (payload.WIDTH || payload.width || '').toString(),
      LENGTH: (payload.LENGTH || payload.length || '').toString(),
      FACING: (payload.FACING || payload.facing || '').toString(),
      SVGPATH: (payload.SVGPATH || payload.svgPath || '').toString(),
      id: (payload.ID || payload.id || payload.plotId || '').toString(),
      plotNo: (payload.PLOTNO || payload.plotNo || '').toString(),
      status: (payload.STATUS || payload.status || 'Available').toString(),
      width: (payload.WIDTH || payload.width || '').toString(),
      length: (payload.LENGTH || payload.length || '').toString(),
      facing: (payload.FACING || payload.facing || '').toString(),
      svgPath: (payload.SVGPATH || payload.svgPath || '').toString()
    };

    const response = await axios.post(
      appsScriptUrl,
      JSON.stringify(fullPayload),
      {
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        maxRedirects: 5,
        timeout: 12000
      }
    );

    console.log(`[Google Apps Script] Web App response for '${action}':`, response.data);
    return { success: true, data: response.data };
  } catch (err) {
    console.error(`[Google Apps Script Error] Failed to execute '${action}' for plot ${payload.id || payload.plotId}:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Retry syncing any MongoDB plot records that have syncPending set to true
 */
const retryPendingSyncs = async () => {
  try {
    const pendingPlots = await Plot.find({ syncPending: true });
    if (pendingPlots.length === 0) {
      return { retried: 0, succeeded: 0 };
    }

    console.log(`[Sync Retry] Found ${pendingPlots.length} plot(s) with pending Google Sheets sync.`);
    let succeeded = 0;

    for (const plot of pendingPlots) {
      const action = plot.isDeleted ? 'delete' : 'update';
      const syncResult = await syncWithGoogleAppsScript(action, {
        plotId: plot.plotId,
        plotNo: plot.plotNo,
        status: plot.status,
        length: plot.length,
        width: plot.width,
        facing: plot.facing,
        svgPath: plot.svgPath
      });

      if (syncResult.success) {
        plot.syncPending = false;
        plot.lastSyncError = null;
        await plot.save();
        succeeded++;
        console.log(`[Sync Retry] Successfully synced plot ${plot.plotId} to Google Sheets.`);
      }
    }

    return { retried: pendingPlots.length, succeeded };
  } catch (error) {
    console.error('[Sync Retry Error] Exception during pending sync retry:', error);
    return { retried: 0, succeeded: 0, error: error.message };
  }
};

module.exports = {
  syncWithGoogleAppsScript,
  retryPendingSyncs
};
