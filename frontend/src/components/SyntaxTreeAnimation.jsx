import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function SyntaxTreeAnimation({ active = true }) {
  const containerRef = useRef(null);
  const animationRef = useRef({ time: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    let width = container.clientWidth;
    let height = container.clientHeight;
    
    if (width === 0) width = 400;
    if (height === 0) height = 160;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    camera.position.z = 5;

    const colors = {
      primary: 0x4a7c59,
      accent1: 0x64748b, 
      accent2: 0x14b8a6, 
      accent3: 0x6366f1, 
      line: 0xe5e7eb
    };

    const nodes = [];

    function createNode(x, y, label, color) {
      const geometry = new THREE.CircleGeometry(0.3, 32);
      const material = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.9 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, 0);
      scene.add(mesh);
      
      const ringGeom = new THREE.RingGeometry(0.32, 0.35, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.5 });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.set(x, y, 0);
      scene.add(ring);
      
      return { mesh, ring, initialY: y };
    }

    function createConnection(startNode, endNode) {
      const material = new THREE.LineDashedMaterial({ 
        color: colors.line,
        dashSize: 0.1,
        gapSize: 0.1
      });
      const points = [startNode.position, endNode.position];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      line.computeLineDistances();
      scene.add(line);
      return line;
    }

    const root = createNode(0, 2, 'S', colors.primary);
    const n1 = createNode(-1.5, 0.5, 'Header', colors.accent1);
    const n2 = createNode(0, 0.5, 'Exp', colors.accent2);
    const n3 = createNode(1.5, 0.5, 'Edu', colors.accent3);

    createConnection(root.mesh, n1.mesh);
    createConnection(root.mesh, n2.mesh);
    createConnection(root.mesh, n3.mesh);

    nodes.push(root, n1, n2, n3);

    let animationFrameId;
    let lastTime = Date.now();
    
    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      
      if (active) {
          const now = Date.now();
          const delta = (now - lastTime) * 0.001;
          animationRef.current.time += delta;
      }
      lastTime = Date.now();
      
      const time = animationRef.current.time;
      
      nodes.forEach((node, i) => {
        node.mesh.position.y = node.initialY + Math.sin(time + i) * 0.05;
        node.ring.position.y = node.mesh.position.y;
        node.ring.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.1);
      });

      renderer.render(scene, camera);
    }

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if(containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [active]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
}
