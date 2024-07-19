import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';

function AiDataMesh() {
  const mountRef = useRef(null);

  useEffect(() => {

    const init = async () => {

      if (WebGL.isWebGLAvailable()) {

        // Initiate the scene
        const scene = new THREE.Scene();
        const width = mountRef.current.clientWidth; // Full width of the container
        const height = mountRef.current.clientHeight; // Height of the container

        const camera = new THREE.PerspectiveCamera(15, width / height, 0.1, 1000);
        // Camera Positioning
        camera.position.z = 30;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        // 
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);

        // Assuming renderer and mountRef are already defined
        const existingCanvas = mountRef.current.getElementsByTagName('canvas')[0];
        if (existingCanvas) {
          mountRef.current.replaceChild(renderer.domElement, existingCanvas);
        } else {
          mountRef.current.appendChild(renderer.domElement);
        }

        //lighting
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 0, 1);
        scene.add(light);
        scene.background = new THREE.Color('#111827');//tailwind bg-zinc-900 

        // Node Geometry (Data Mesh)
        const numNodes = 10; // Adjust for density
        const nodes = [];
        const svgMeshes = [];

        // Array of SVG paths
        const svgPaths = [
          '/bpmn/symbols/gateway_complex.svg',
          '/bpmn/symbols/event_intermediate_catch_start_boundary_timer.svg',
          '/bpmn/symbols/gateway_event_based.svg',
          '/bpmn/symbols/gateway_exclusive.svg',
          '/bpmn/symbols/gateway_inclusive.svg',
          '/bpmn/symbols/marker_multi_instance_sequential.svg',
          '/bpmn/symbols/task_business_rule.svg',
          '/bpmn/symbols/task_script.svg',
          '/bpmn/symbols/task_service.svg',
          // Add more paths as needed
        ];
        const textures = []; // To store loaded textures

        const loader = new THREE.TextureLoader();

        // Scene size calculate from canva size
        const sceneSize = {
          width: width,
          height: height,
          depth: 100,
        };

        const initNodes = () => {
          for (let i = 0; i < numNodes; i++) {
            const geometry = new THREE.SphereGeometry(0.7, 8, 8);
            const material = new THREE.MeshPhongMaterial({ color: 0xfdba74, transparent: true, opacity: 0.04 }); // Lighter orange nodes
            const node = new THREE.Mesh(geometry, material);

            node.position.set((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 7, (Math.random() - 1) * 10);
            node.radius = 0.1; // Adjust radius as needed
            nodes.push(node);
            scene.add(node);

            const randomIndex = Math.floor(Math.random() * textures.length);
            const randomTexture = textures[randomIndex];
            const bpmnSymbolMaterial = new THREE.MeshBasicMaterial({ map: randomTexture, transparent: true, opacity: 0.6 });

            const bpmnSymbolGeometry = new THREE.PlaneGeometry(0.5, 0.5); // Adjust size as needed
            const svgMesh = new THREE.Mesh(bpmnSymbolGeometry, bpmnSymbolMaterial);
            
            svgMesh.position.copy(node.position);
            svgMesh.position.z += 1.2;
            //set width and height of svg by copy the node width and height
            svgMesh.scale.set(1.2, 1.2, 1.2);
            

            //svgMesh.renderOrder = 0;
            svgMeshes[i] = svgMesh;
            scene.add(svgMesh);
          }
        };


        // Animation Loop
        function updateNodes() {

          nodes.forEach((node, index) => {
            const svgMesh = svgMeshes[index];

            // Calculate the movement
            const deltaX = Math.sin(node.position.y + Date.now() * 0.001) * 0.005;
            const deltaY = Math.cos(node.position.x + Date.now() * 0.001) * 0.005;
            const deltaZ = Math.sin(node.position.z + Date.now() * -0.510) * -0.005;

            // Apply the movement to both the node and its glowMesh
            node.position.x += deltaX;
            node.position.y += deltaY;
            node.position.z += deltaZ;


            // Border collision detection and response
            if (node.position.x - node.radius < -sceneSize.width / 2 || node.position.x + node.radius > sceneSize.width / 2) {
              node.velocity.x *= -1;
            }
            if (node.position.y - node.radius < -sceneSize.height / 2 || node.position.y + node.radius > sceneSize.height / 2) {
              node.velocity.y *= -1;
            }

            if (node.position.z - node.radius < -sceneSize.depth / 2 || node.position.z + node.radius > sceneSize.depth / 2) {
              node.velocity.z *= -1;
            }




   svgMesh.position.copy(node.position);
  svgMesh.position.z += 1.2;
   
            
          });

          renderer.render(scene, camera);
        }

        // Wrap loader.load in a promise
        const loadTexture = (path) => {
          return new Promise((resolve, reject) => {
            loader.load(path, texture => {
              resolve(texture);
            }, undefined, error => {
              reject(error);
            });
          });
        };

        function animate() {
          updateNodes();
          requestAnimationFrame(animate);
        }


        // Use Promise.all to wait for all textures to be loaded
        Promise.all(svgPaths.map(path => loadTexture(path)))
          .then(loadedTextures => {
            console.log('All textures loaded:', loadedTextures);
            // All textures are loaded
            textures.push(...loadedTextures);
            // Proceed with using the textures
            initNodes();

            animate();
          })
          .catch(error => {
            console.error('Error loading textures:', error);
          });

      }
    };
    init();
  }, []); // Empty dependency array ensures the effect runs only once


  return (
    <div ref={mountRef} id="ai-data-mesh" style={{ width: '100%', height: '100vh' }} />
  );
}

export default AiDataMesh;
