const express = require('express');
const router = express.Router();
const Plot = require('../models/Plot');
const AuditLog = require('../models/AuditLog');
const { protectAdmin } = require('../middleware/authMiddleware');
const { recordPlotAudit } = require('../services/auditService');
const { syncWithGoogleAppsScript, retryPendingSyncs } = require('../services/syncService');

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
 * Helper to construct standardized plot response object
 */
const formatPlotResponse = (plot) => {
  if (!plot) return null;
  const obj = plot.toObject ? plot.toObject({ virtuals: true }) : plot;
  return {
    ID: obj.plotId || obj.id || '',
    PLOTNO: obj.plotNo || '',
    STATUS: obj.status || 'Available',
    LENGTH: obj.length || '',
    WIDTH: obj.width || '',
    FACING: obj.facing || 'North',
    SVGPATH: obj.svgPath || '',
    id: obj.plotId || obj.id || '',
    plotNo: obj.plotNo || '',
    status: obj.status || 'Available',
    length: obj.length || '',
    width: obj.width || '',
    facing: obj.facing || 'North',
    svgPath: obj.svgPath || '',
    syncPending: Boolean(obj.syncPending),
    createdBy: obj.createdBy,
    updatedBy: obj.updatedBy,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
};

/**
 * @route   GET /api/plots
 * @desc    Fetch all plots from MongoDB database
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const plots = await Plot.find({ isDeleted: false }).sort({ createdAt: -1 });
    const formattedPlots = plots.map(formatPlotResponse);

    return res.json({
      success: true,
      count: formattedPlots.length,
      data: formattedPlots,
      plots: formattedPlots
    });
  } catch (error) {
    console.error('Error fetching plots from MongoDB:', error);
    return res.status(500).json({ success: false, message: 'Error fetching plot data', error: error.message });
  }
});

/**
 * @route   GET /api/plots/audit-logs
 * @desc    Fetch audit log history of plot actions
 * @access  Private (Admin Only)
 */
router.get('/audit-logs', protectAdmin, async (req, res) => {
  try {
    const { plotId, limit = 100 } = req.query;
    const filter = plotId ? { plotId: plotId.toString() } : {};
    const auditLogs = await AuditLog.find(filter).sort({ timestamp: -1 }).limit(Number(limit));

    return res.json({
      success: true,
      count: auditLogs.length,
      auditLogs
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return res.status(500).json({ success: false, message: 'Error fetching audit logs', error: error.message });
  }
});

/**
 * @route   POST /api/plots/create
 * @desc    Create a new plot in MongoDB and sync with Google Sheets
 * @access  Private (Admin Only)
 */
router.post('/create', protectAdmin, async (req, res) => {
  try {
    const { id, plotNo, status, length, width, facing, svgPath } = req.body;

    if (svgPath && !isValidSvgPath(svgPath)) {
      return res.status(400).json({ success: false, message: 'Invalid SVG Path data format. Please enter a valid SVG d attribute path string.' });
    }

    const generatedId = (id && id.toString().trim()) || `plot-${Date.now().toString().slice(-4)}`;
    const finalPlotNo = plotNo ? plotNo.toString() : `Plot-${generatedId}`;

    // Admin identifying details from JWT token
    const adminDetails = {
      adminId: req.admin._id,
      adminName: req.admin.name || req.admin.email || 'Admin'
    };

    // 1. Create Plot document in MongoDB (Primary Database)
    const newPlot = await Plot.create({
      plotId: generatedId,
      plotNo: finalPlotNo,
      status: status ? status.toString() : 'Available',
      length: length ? length.toString() : '30',
      width: width ? width.toString() : '50',
      facing: facing ? facing.toString() : 'North',
      svgPath: svgPath ? svgPath.toString().trim() : '',
      syncPending: false,
      createdBy: adminDetails,
      updatedBy: adminDetails
    });

    console.log(`[MongoDB Plot Management] Admin (${adminDetails.adminName}) created Plot ID ${generatedId} in MongoDB.`);

    // 2. Record CREATE action in AuditLog collection
    await recordPlotAudit({
      action: 'CREATE',
      admin: req.admin,
      plotId: generatedId,
      plotNo: finalPlotNo,
      oldData: null,
      newData: newPlot.toObject()
    });

    // 3. Sync with Google Sheets
    const formattedResponse = formatPlotResponse(newPlot);
    const syncResult = await syncWithGoogleAppsScript('create', formattedResponse);

    if (!syncResult.success) {
      console.warn(`[Sync Warning] Google Sheets sync failed for Plot ${generatedId}. Keeping MongoDB record with syncPending: true.`);
      newPlot.syncPending = true;
      newPlot.lastSyncError = syncResult.error;
      await newPlot.save();
    }

    return res.status(201).json({
      success: true,
      message: syncResult.success
        ? `New Plot ${finalPlotNo} created successfully in MongoDB and synced with Google Sheet`
        : `New Plot ${finalPlotNo} created in MongoDB (Google Sheet sync pending)`,
      newPlot: formatPlotResponse(newPlot),
      syncPending: newPlot.syncPending
    });
  } catch (error) {
    console.error('Error creating plot:', error);
    return res.status(500).json({ success: false, message: 'Server error creating new plot', error: error.message });
  }
});

/**
 * @route   POST /api/plots/update
 * @desc    Update an existing plot in MongoDB and sync with Google Sheets
 * @access  Private (Admin Only)
 */
router.post('/update', protectAdmin, async (req, res) => {
  try {
    const { id, plotNo, status, length, width, facing, svgPath } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Plot ID is required for updating' });
    }

    if (svgPath && !isValidSvgPath(svgPath)) {
      return res.status(400).json({ success: false, message: 'Invalid SVG Path data format. Please enter a valid SVG d attribute path string.' });
    }

    const plotIdStr = id.toString();
    const adminDetails = {
      adminId: req.admin._id,
      adminName: req.admin.name || req.admin.email || 'Admin'
    };

    // 1. Fetch existing plot data from MongoDB before updating
    let existingPlot = await Plot.findOne({ plotId: plotIdStr });

    // If plot does not exist in MongoDB yet, initialize it
    if (!existingPlot) {
      console.log(`[MongoDB Plot Management] Plot ID ${plotIdStr} not found in MongoDB. Initializing new record.`);
      existingPlot = new Plot({
        plotId: plotIdStr,
        plotNo: plotNo ? plotNo.toString() : `Plot-${plotIdStr}`,
        status: 'Available',
        length: '',
        width: '',
        facing: 'North',
        svgPath: '',
        createdBy: adminDetails,
        updatedBy: adminDetails
      });
    }

    const oldData = existingPlot.toObject();

    // Prepare updated fields
    if (plotNo !== undefined) existingPlot.plotNo = plotNo.toString();
    if (status !== undefined) existingPlot.status = status.toString();
    if (length !== undefined) existingPlot.length = length.toString();
    if (width !== undefined) existingPlot.width = width.toString();
    if (facing !== undefined) existingPlot.facing = facing.toString();
    if (svgPath !== undefined) existingPlot.svgPath = svgPath.toString().trim();

    existingPlot.updatedBy = adminDetails;
    existingPlot.syncPending = false; // reset pending status for sync attempt

    // 2. Save updated plot in MongoDB
    const updatedPlotDoc = await existingPlot.save();
    const newData = updatedPlotDoc.toObject();

    console.log(`[MongoDB Plot Management] Admin (${adminDetails.adminName}) updated Plot ID ${plotIdStr} in MongoDB.`);

    // 3. Record UPDATE action in AuditLog collection with changed fields only
    await recordPlotAudit({
      action: 'UPDATE',
      admin: req.admin,
      plotId: plotIdStr,
      plotNo: updatedPlotDoc.plotNo,
      oldData,
      newData
    });

    // 4. Sync updated plot with Google Sheets
    const formattedResponse = formatPlotResponse(updatedPlotDoc);
    const syncResult = await syncWithGoogleAppsScript('update', formattedResponse);

    if (!syncResult.success) {
      console.warn(`[Sync Warning] Google Sheets sync failed for Plot ${plotIdStr}. Keeping MongoDB data with syncPending: true.`);
      updatedPlotDoc.syncPending = true;
      updatedPlotDoc.lastSyncError = syncResult.error;
      await updatedPlotDoc.save();
    }

    return res.json({
      success: true,
      message: syncResult.success
        ? `Plot ${updatedPlotDoc.plotNo} updated successfully in MongoDB and synced with Google Sheet`
        : `Plot ${updatedPlotDoc.plotNo} updated in MongoDB (Google Sheet sync pending)`,
      updatedPlot: formatPlotResponse(updatedPlotDoc),
      syncPending: updatedPlotDoc.syncPending
    });
  } catch (error) {
    console.error('Error updating plot:', error);
    return res.status(500).json({ success: false, message: 'Server error updating plot', error: error.message });
  }
});

/**
 * @route   POST /api/plots/delete
 * @desc    Soft Delete a plot record in MongoDB and sync with Google Sheets
 * @access  Private (Admin Only)
 */
router.post('/delete', protectAdmin, async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Plot ID is required for soft deletion' });
    }

    const plotIdStr = id.toString();
    const adminDetails = {
      adminId: req.admin._id,
      adminName: req.admin.name || req.admin.email || 'Admin'
    };

    let existingPlot = await Plot.findOne({ plotId: plotIdStr });
    const oldData = existingPlot ? existingPlot.toObject() : null;

    if (!existingPlot) {
      existingPlot = new Plot({
        plotId: plotIdStr,
        plotNo: `Plot-${plotIdStr}`,
        createdBy: adminDetails,
        updatedBy: adminDetails
      });
    }

    // Soft delete plot: set isDeleted: true and status: 'Blocked'
    existingPlot.isDeleted = true;
    existingPlot.status = 'Blocked';
    existingPlot.updatedBy = adminDetails;
    existingPlot.syncPending = false;

    const savedPlot = await existingPlot.save();
    console.log(`[MongoDB Plot Management] Admin (${adminDetails.adminName}) soft-deleted Plot ID ${plotIdStr} in MongoDB.`);

    // Record DELETE action in AuditLog collection
    await recordPlotAudit({
      action: 'DELETE',
      admin: req.admin,
      plotId: plotIdStr,
      plotNo: savedPlot.plotNo,
      oldData,
      newData: savedPlot.toObject()
    });

    // Sync soft deletion with Google Sheets
    const syncResult = await syncWithGoogleAppsScript('delete', { ID: plotIdStr, STATUS: 'Blocked' });

    if (!syncResult.success) {
      console.warn(`[Sync Warning] Google Sheets soft delete sync failed for Plot ${plotIdStr}. Keeping MongoDB soft delete with syncPending: true.`);
      savedPlot.syncPending = true;
      savedPlot.lastSyncError = syncResult.error;
      await savedPlot.save();
    }

    return res.json({
      success: true,
      message: syncResult.success
        ? `Plot ${plotIdStr} soft-deleted in MongoDB and synced with Google Sheet`
        : `Plot ${plotIdStr} soft-deleted in MongoDB (Google Sheet sync pending)`,
      id: plotIdStr,
      syncPending: savedPlot.syncPending
    });
  } catch (error) {
    console.error('Error soft deleting plot:', error);
    return res.status(500).json({ success: false, message: 'Server error soft-deleting plot', error: error.message });
  }
});

/**
 * @route   POST /api/plots/sync-retry
 * @desc    Retry syncing pending plot changes to Google Sheets
 * @access  Private (Admin Only)
 */
router.post('/sync-retry', protectAdmin, async (req, res) => {
  try {
    const result = await retryPendingSyncs();
    return res.json({
      success: true,
      message: `Retried sync for ${result.retried} plot(s). Succeeded: ${result.succeeded}`,
      ...result
    });
  } catch (error) {
    console.error('Error retrying pending syncs:', error);
    return res.status(500).json({ success: false, message: 'Error retrying pending syncs', error: error.message });
  }
});

module.exports = router;
