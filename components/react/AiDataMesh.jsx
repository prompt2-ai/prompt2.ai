import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

function AiDataMesh() {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const width = mountRef.current.clientWidth; // Full width of the container
    const height = mountRef.current.clientHeight; // Height of the container
  
    const camera = new THREE.PerspectiveCamera(15, width/height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    scene.background = new THREE.Color('#111827');//tailwind bg-zinc-900 


    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    mountRef.current.appendChild(renderer.domElement); // Append to the ref



// Node Geometry (Data Mesh)
const numNodes = 50; // Adjust for density
const nodes = [];
let glowMeshes = [];

for (let i = 0; i < numNodes; i++) {
    const geometry = new THREE.SphereGeometry(0.05, 8, 8);
    const material = new THREE.MeshPhongMaterial({ color: 0xfdba74,transparent:true,opacity:0.4 }); // Lighter orange nodes
    const node = new THREE.Mesh(geometry, material);
  
    node.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
    nodes.push(node);
    scene.add(node);

    // Glow effect
    const glowGeometry = new THREE.SphereGeometry(0.1, 4, 4); // Slightly larger sphere for the glow 
    const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xfdba74, transparent: true, opacity: 0.4 });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.position.copy(node.position); // Position the glow at the same place as the node
    glowMeshes.push(glowMesh); // Store reference to glow mesh
    scene.add(glowMesh);

  }

// Camera Positioning
camera.position.z =30;

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  nodes.forEach((node, index) => {
    const glowMesh = glowMeshes[index]; // Retrieve the corresponding glowMesh

    // Calculate the movement
    const deltaX = Math.sin(node.position.y + Date.now() * 0.001) * 0.005;
    const deltaY = Math.cos(node.position.x + Date.now() * 0.001) * 0.005;
    const deltaZ = Math.sin(node.position.z + Date.now() * 0.001) * 0.005;

    // Apply the movement to both the node and its glowMesh
    node.position.x += deltaX;
    node.position.y += deltaY;
    node.position.z += deltaZ;

    glowMesh.position.x += deltaX;
    glowMesh.position.y += deltaY;
    glowMesh.position.z += deltaZ;
});

  renderer.render(scene, camera);
}

animate();
    return () => {
      mountRef.current.removeChild(renderer.domElement); // Cleanup on unmount
    };
  }, []); // Empty dependency array ensures the effect runs only once

  return (
    <div ref={mountRef} style={{ width: '100%', height: '80vh' }}/>
  );
}

export default AiDataMesh;
