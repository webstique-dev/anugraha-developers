const AuditLog = require('../models/AuditLog');

/**
 * Compare old and new plot objects and return changed fields, old values, and new values.
 * Relevant plot comparison fields: plotNo, status, length, width, facing, svgPath
 */
const comparePlotFields = (oldData = {}, newData = {}) => {
  const fieldsToCompare = ['plotNo', 'status', 'length', 'width', 'facing', 'svgPath'];
  const changedFields = [];
  const oldValues = {};
  const newValues = {};

  fieldsToCompare.forEach((field) => {
    const oldVal = oldData[field] !== undefined && oldData[field] !== null ? String(oldData[field]).trim() : '';
    const newVal = newData[field] !== undefined && newData[field] !== null ? String(newData[field]).trim() : '';

    if (oldVal !== newVal) {
      changedFields.push(field);
      oldValues[field] = oldData[field] !== undefined ? oldData[field] : '';
      newValues[field] = newData[field] !== undefined ? newData[field] : '';
    }
  });

  return { changedFields, oldValues, newValues };
};

/**
 * Record an audit log entry for plot actions (CREATE, UPDATE, DELETE)
 */
const recordPlotAudit = async ({ action, admin, plotId, plotNo, oldData, newData }) => {
  try {
    const adminId = admin._id || admin.id;
    const adminName = admin.name || admin.email || 'Admin';

    let changedFields = [];
    let oldValues = {};
    let newValues = {};

    if (action === 'CREATE') {
      oldValues = {};
      newValues = {
        plotId,
        plotNo: newData.plotNo || plotNo,
        status: newData.status || 'Available',
        length: newData.length || '',
        width: newData.width || '',
        facing: newData.facing || 'North',
        svgPath: newData.svgPath || ''
      };
      changedFields = Object.keys(newValues);
    } else if (action === 'UPDATE') {
      const comparison = comparePlotFields(oldData, newData);
      changedFields = comparison.changedFields;
      oldValues = comparison.oldValues;
      newValues = comparison.newValues;
    } else if (action === 'DELETE') {
      oldValues = {
        status: oldData ? oldData.status : 'Available',
        isDeleted: false
      };
      newValues = {
        status: 'Blocked',
        isDeleted: true
      };
      changedFields = ['status', 'isDeleted'];
    }

    const auditEntry = await AuditLog.create({
      plotId,
      plotNo: plotNo || (newData && newData.plotNo) || (oldData && oldData.plotNo) || `Plot-${plotId}`,
      adminId,
      adminName,
      action,
      changedFields,
      oldValues,
      newValues,
      timestamp: new Date()
    });

    console.log(`[AuditLog] Recorded ${action} action for Plot ${plotId} by Admin ${adminName}`);
    return auditEntry;
  } catch (error) {
    console.error('[AuditLog Error] Failed to create audit log entry:', error);
    // Don't re-throw to avoid breaking main transaction flow, but log error
    return null;
  }
};

module.exports = {
  comparePlotFields,
  recordPlotAudit
};
