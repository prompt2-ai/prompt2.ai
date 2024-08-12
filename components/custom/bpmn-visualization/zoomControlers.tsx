"use client";
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"

import { ZoomType } from 'bpmn-visualization'; // Adjust the import path as needed

const ZoomControls = ({ bpmnVisualization,fitOptions }: { bpmnVisualization: any,fitOptions: any }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    "use client";
    //ensure that we are on browser and window exists
    if (typeof window !== 'undefined') {
    if (bpmnVisualization && bpmnVisualization.navigation) {
      setIsInitialized(true);
    }
  }
  }, [bpmnVisualization]);

  const handleZoomIn = () => {
    "use client";
    //ensure that we are on browser and window exists
    if (typeof window !== 'undefined') {
    if (bpmnVisualization && bpmnVisualization.navigation) {
      console.log("ZoomControls", bpmnVisualization);
      bpmnVisualization.navigation.zoom(ZoomType.In);
    } else {
      console.error("bpmnVisualization or bpmnVisualization.navigation is undefined");
    }
  }
  };
  const handleZoomOut = () => {
    "use client";
    //ensure that we are on browser and window exists
    if (typeof window !== 'undefined') {
    if (bpmnVisualization && bpmnVisualization.navigation) {
      bpmnVisualization.navigation.zoom(ZoomType.Out);
    } else {
      console.error("bpmnVisualization or bpmnVisualization.navigation is undefined");
    }
  }
  }

  const handleFit = () => {
    "use client";
    //ensure that we are on browser and window exists
    if (typeof window === 'undefined') {
          return;
    }    
    if (bpmnVisualization && bpmnVisualization.navigation) {
      bpmnVisualization.navigation.fit(fitOptions);
    } else {
      console.error("bpmnVisualization or bpmnVisualization.navigation is undefined");
    }
  }

  return <>
  <div className='absolute top-0 right-0 m-5'>
    <Button
      className="sideButton float-left"
      variant="secondary"
      onClick={handleZoomIn}
      disabled={!isInitialized}
    >
      +
    </Button>
    <Button
      className="sideButton float-left"
      variant="secondary"
      onClick={handleFit}
      disabled={!isInitialized}
    >
        Fit
    </Button>
    <Button
      className="sideButton float-left"
      variant="secondary"
      onClick={handleZoomOut}
      disabled={!isInitialized}
    >
        -
    </Button>
  </div>
  </>;

};

export default ZoomControls;