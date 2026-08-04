import React from 'react';
import PlotEditorModal from './PlotEditorModal';

/**
 * PlotEditorDrawer wrapper exporting PlotEditorModal for backward compatibility
 */
const PlotEditorDrawer = (props) => {
  return <PlotEditorModal {...props} />;
};

export default PlotEditorDrawer;
export { PlotEditorModal };
