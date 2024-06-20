/**
 * Use loader component in order to add a grey background color with opacity.
 * and show a loader in the center of the screen.
 */

import React from 'react';
import './Loader.css';

export const Loader = () => {
  return (
    navigator.userAgent.indexOf("Chrome") !== -1 ? (
      <iframe src="/loader.html" className="loader" title="loader" />
    ) : (
      <div className="simpleLoaderWrapper" >
         <div className="simpleLoader spin" />
      </div>
    )
  );
};

export default Loader;