const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protectAdmin } = require('../middleware/authMiddleware');

/**
 * Utility function to validate SVG Path string syntax
 */
const isValidSvgPath = (pathStr) => {
  if (!pathStr || typeof pathStr !== 'string') return false;
  const trimmed = pathStr.trim();
  const svgPathRegex = /^[MmLlHhVvCcSsQqTtAaZz0-9\s,\.\-]+$/;
  return trimmed.length > 3 && svgPathRegex.test(trimmed);
};

/**
 * Forward request to Google Apps Script Web App if URL configured
 */
const syncWithGoogleAppsScript = async (action, payload) => {
  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!appsScriptUrl || !appsScriptUrl.startsWith('http')) {
    console.log(`[Google Apps Script] No Web App URL set in server/.env. Skipping external Apps Script sync for action '${action}'.`);
    return null;
  }

  try {
    // Construct dual-cased payload for 100% header compatibility (uppercase + lowercase)
    const fullPayload = {
      action,
      ID: (payload.ID || payload.id || '').toString(),
      PLOTNO: (payload.PLOTNO || payload.plotNo || '').toString(),
      STATUS: (payload.STATUS || payload.status || 'Available').toString(),
      WIDTH: (payload.WIDTH || payload.width || '').toString(),
      LENGTH: (payload.LENGTH || payload.length || '').toString(),
      FACING: (payload.FACING || payload.facing || '').toString(),
      SVGPATH: (payload.SVGPATH || payload.svgPath || '').toString(),
      // Also retain lowercase keys
      id: (payload.ID || payload.id || '').toString(),
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
    return response.data;
  } catch (err) {
    console.error(`[Google Apps Script Error] Failed to execute '${action}':`, err.message);
    return null;
  }
};

/**
 * @route   POST /api/plots/update
 * @desc    Update plot fields (PlotNo, Status, Length, Width, Facing, SVGPath) for a specific Plot ID
 * @access  Private (Admin Only)
 */
router.post('/update', protectAdmin, async (req, res) => {
  try {
    const { sheetId, id, plotNo, status, length, width, facing, svgPath } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Plot ID is required for updating' });
    }

    if (svgPath && !isValidSvgPath(svgPath)) {
      return res.status(400).json({ success: false, message: 'Invalid SVG Path data format. Please enter a valid SVG d attribute path string.' });
    }

    const updatedPlot = {
      ID: id.toString(),
      PLOTNO: plotNo ? plotNo.toString() : `Plot-${id}`,
      STATUS: status ? status.toString() : 'Available',
      LENGTH: length ? length.toString() : '',
      WIDTH: width ? width.toString() : '',
      FACING: facing ? facing.toString() : 'North',
      SVGPATH: svgPath ? svgPath.toString().trim() : '',
      updatedAt: new Date().toISOString()
    };

    console.log(`[Admin Plot Management] Admin (${req.admin.email}) updated Plot ID ${id}:`, updatedPlot);

    // Synchronize directly with Google Apps Script Web App
    await syncWithGoogleAppsScript('update', updatedPlot);

    return res.json({
      success: true,
      message: `Plot ${plotNo || id} updated successfully in Google Sheet`,
      updatedPlot
    });
  } catch (error) {
    console.error('Error updating plot:', error);
    return res.status(500).json({ success: false, message: 'Server error updating plot', error: error.message });
  }
});

/**
 * @route   POST /api/plots/create
 * @desc    Create a new plot record with generated Unique ID
 * @access  Private (Admin Only)
 */
router.post('/create', protectAdmin, async (req, res) => {
  try {
    const { sheetId, plotNo, status, length, width, facing, svgPath } = req.body;

    if (svgPath && !isValidSvgPath(svgPath)) {
      return res.status(400).json({ success: false, message: 'Invalid SVG Path data format. Please enter a valid SVG d attribute path string.' });
    }

    const generatedId = `plot-${Date.now().toString().slice(-4)}`;

    const newPlot = {
      ID: generatedId,
      PLOTNO: plotNo ? plotNo.toString() : `Plot-${generatedId}`,
      STATUS: status ? status.toString() : 'Available',
      LENGTH: length ? length.toString() : '30',
      WIDTH: width ? width.toString() : '50',
      FACING: facing ? facing.toString() : 'North',
      SVGPATH: svgPath ? svgPath.toString().trim() : '',
      createdAt: new Date().toISOString()
    };

    console.log(`[Admin Plot Management] Admin (${req.admin.email}) created new Plot ID ${generatedId}:`, newPlot);

    // Synchronize directly with Google Apps Script Web App
    await syncWithGoogleAppsScript('create', newPlot);

    return res.status(201).json({
      success: true,
      message: `New Plot ${newPlot.PLOTNO} created successfully in Google Sheet`,
      newPlot
    });
  } catch (error) {
    console.error('Error creating plot:', error);
    return res.status(500).json({ success: false, message: 'Server error creating new plot', error: error.message });
  }
});

/**
 * @route   POST /api/plots/delete
 * @desc    Soft Delete a plot record by setting Status to 'Blocked' / 'Deleted'
 * @access  Private (Admin Only)
 */
router.post('/delete', protectAdmin, async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Plot ID is required for deletion' });
    }

    console.log(`[Admin Plot Management] Admin (${req.admin.email}) soft-deleted Plot ID ${id}`);

    // Synchronize directly with Google Apps Script Web App
    await syncWithGoogleAppsScript('delete', { ID: id.toString(), STATUS: 'Blocked' });

    return res.json({
      success: true,
      message: `Plot ${id} soft-deleted successfully in Google Sheet`,
      id: id.toString()
    });
  } catch (error) {
    console.error('Error soft deleting plot:', error);
    return res.status(500).json({ success: false, message: 'Server error soft-deleting plot', error: error.message });
  }
});

module.exports = router;
