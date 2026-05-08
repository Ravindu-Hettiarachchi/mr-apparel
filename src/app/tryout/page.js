'use client';

import { useRef, useState, useCallback, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Decal, useTexture, useGLTF } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaUndo, FaRedo, FaSearchPlus, FaSearchMinus, FaDownload, FaTshirt, FaPalette, FaImage, FaTrash, FaArrowsAlt, FaExpand } from 'react-icons/fa';
import * as THREE from 'three';
import styles from './tryout.module.css';

/* ============================
   T-SHIRT COLORS
   ============================ */
const TSHIRT_COLORS = [
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'White', hex: '#f5f5f5' },
  { name: 'Navy', hex: '#1B2A4A' },
  { name: 'Red', hex: '#8B1A1A' },
  { name: 'Forest', hex: '#1B4332' },
  { name: 'Orange', hex: '#CC6600' },
  { name: 'Charcoal', hex: '#36454F' },
  { name: 'Royal Blue', hex: '#1A3C8A' },
  { name: 'Burgundy', hex: '#5C1A2A' },
  { name: 'Olive', hex: '#4A5C2A' },
];

/* ============================
   3D T-SHIRT MODEL (Real)
   ============================ */
function TShirtModel({ color, frontTexture, frontScale, frontPosition, backTexture, backScale, backPosition }) {
  const meshRef = useRef();

  // Load the real 3D t-shirt model from a public CDN/GitHub raw
  const { nodes, materials } = useGLTF('https://raw.githubusercontent.com/adrianhajdin/project_threejs_ai/main/client/public/shirt_baked.glb');

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group ref={meshRef} position={[0, -0.2, 0]}>
      <mesh
        castShadow
        geometry={nodes.T_Shirt_male.geometry}
        material={materials.lambert1}
        material-color={color}
        material-roughness={0.85}
        scale={[4, 4, 4]} // Scale up the model
        dispose={null}
      >
        {/* Front Decal */}
        {frontTexture && (
          <Decal
            position={[frontPosition.x, 0.04 + frontPosition.y, 0.15]} 
            rotation={[0, 0, 0]}
            scale={[frontScale * 0.15, frontScale * 0.15, 0.15]} 
            map={frontTexture}
            depthTest={true}
            depthWrite={true}
          />
        )}

        {/* Back Decal */}
        {backTexture && (
          <Decal
            position={[backPosition.x, 0.04 + backPosition.y, -0.15]} 
            rotation={[0, Math.PI, 0]}
            scale={[backScale * 0.15, backScale * 0.15, 0.15]} 
            map={backTexture}
            depthTest={true}
            depthWrite={true}
          />
        )}
      </mesh>
    </group>
  );
}

/* ============================
   3D CANVAS SCENE
   ============================ */
function Scene({ color, frontUrl, frontScale, frontPosition, backUrl, backScale, backPosition, activeSide }) {
  const frontTex = frontUrl ? useTexture(frontUrl) : null;
  const backTex = backUrl ? useTexture(backUrl) : null;
  
  if (frontTex) frontTex.flipY = false;
  if (backTex) backTex.flipY = false;

  const orbitRef = useRef();

  // Automatically rotate camera when switching sides
  useEffect(() => {
    if (orbitRef.current) {
      const targetAzimuth = activeSide === 'front' ? 0 : Math.PI;
      // We animate the angle change manually for smoothness if we wanted, 
      // but for simplicity setting it works perfectly with damping.
      orbitRef.current.setAzimuthalAngle(targetAzimuth);
    }
  }, [activeSide]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 3, -3]} intensity={0.4} />
      <spotLight position={[0, 8, 0]} intensity={0.5} angle={0.5} penumbra={1} />

      <Suspense fallback={null}>
        <TShirtModel 
          color={color} 
          frontTexture={frontTex} frontScale={frontScale} frontPosition={frontPosition}
          backTexture={backTex} backScale={backScale} backPosition={backPosition}
        />
        <ContactShadows
          position={[0, -1.7, 0]}
          opacity={0.5}
          scale={8}
          blur={2.5}
          far={3}
          color="#000000"
        />
        <Environment preset="studio" />
      </Suspense>

      <OrbitControls
        ref={orbitRef}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.6}
        minDistance={3}
        maxDistance={8}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

/* ============================
   MAIN PAGE COMPONENT
   ============================ */
export default function TryoutPage() {
  const [selectedColor, setSelectedColor] = useState(TSHIRT_COLORS[0].hex);
  const [selectedColorName, setSelectedColorName] = useState(TSHIRT_COLORS[0].name);
  const [activePanel, setActivePanel] = useState('color');
  const [activeSide, setActiveSide] = useState('front');

  // Front Design State
  const [frontUrl, setFrontUrl] = useState(null);
  const [frontFileName, setFrontFileName] = useState('');
  const [frontScale, setFrontScale] = useState(1.2);
  const [frontPosition, setFrontPosition] = useState({ x: 0, y: 0 });

  // Back Design State
  const [backUrl, setBackUrl] = useState(null);
  const [backFileName, setBackFileName] = useState('');
  const [backScale, setBackScale] = useState(1.2);
  const [backPosition, setBackPosition] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef(null);

  const isFront = activeSide === 'front';

  const currentUrl = isFront ? frontUrl : backUrl;
  const currentFileName = isFront ? frontFileName : backFileName;
  const currentScale = isFront ? frontScale : backScale;
  const currentPosition = isFront ? frontPosition : backPosition;

  const handleColorSelect = (color) => {
    setSelectedColor(color.hex);
    setSelectedColorName(color.name);
  };

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG)');
      return;
    }
    const url = URL.createObjectURL(file);
    if (isFront) {
      setFrontUrl(url);
      setFrontFileName(file.name);
    } else {
      setBackUrl(url);
      setBackFileName(file.name);
    }
  }, [isFront]);

  const handleRemoveDesign = () => {
    if (currentUrl) URL.revokeObjectURL(currentUrl);
    if (isFront) {
      setFrontUrl(null);
      setFrontFileName('');
      setFrontPosition({ x: 0, y: 0 });
    } else {
      setBackUrl(null);
      setBackFileName('');
      setBackPosition({ x: 0, y: 0 });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetAll = () => {
    if (frontUrl) URL.revokeObjectURL(frontUrl);
    if (backUrl) URL.revokeObjectURL(backUrl);
    setFrontUrl(null); setFrontFileName(''); setFrontPosition({ x: 0, y: 0 }); setFrontScale(1.2);
    setBackUrl(null); setBackFileName(''); setBackPosition({ x: 0, y: 0 }); setBackScale(1.2);
  };

  const setScale = (val) => {
    isFront ? setFrontScale(val) : setBackScale(val);
  };

  const setPosition = (axis, val) => {
    if (isFront) {
      setFrontPosition(prev => ({ ...prev, [axis]: val }));
    } else {
      setBackPosition(prev => ({ ...prev, [axis]: val }));
    }
  };

  const panels = [
    { id: 'color', icon: <FaPalette />, label: 'Color' },
    { id: 'design', icon: <FaImage />, label: 'Design' },
    { id: 'adjust', icon: <FaArrowsAlt />, label: 'Adjust' },
  ];

  return (
    <div className={styles.tryoutPage}>
      {/* Header */}
      <div className={styles.tryoutHeader}>
        <div className={styles.tryoutHeaderInner}>
          <div>
            <h1 className={styles.tryoutTitle}>
              <FaTshirt className={styles.tryoutTitleIcon} />
              3D T-Shirt Designer
            </h1>
            <p className={styles.tryoutSubtitle}>
              Customize front and back designs in real-time
            </p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.headerBtn} title="Reset All" onClick={handleResetAll}>
              <FaUndo /> Reset All
            </button>
          </div>
        </div>
      </div>

      <div className={styles.tryoutLayout}>
        {/* 3D Canvas */}
        <div className={styles.canvasWrapper}>
          <div className={styles.canvasContainer}>
            <Canvas
              camera={{ position: [0, 0.5, 5], fov: 45 }}
              shadows
              gl={{ preserveDrawingBuffer: true, antialias: true }}
              dpr={[1, 2]}
            >
              <Scene
                color={selectedColor}
                frontUrl={frontUrl} frontScale={frontScale} frontPosition={frontPosition}
                backUrl={backUrl} backScale={backScale} backPosition={backPosition}
                activeSide={activeSide}
              />
            </Canvas>

            {/* Side Toggle Controls */}
            <div className={styles.sideToggle}>
              <button 
                className={`${styles.sideToggleBtn} ${activeSide === 'front' ? styles.sideToggleActive : ''}`}
                onClick={() => setActiveSide('front')}
              >
                Front Side
              </button>
              <button 
                className={`${styles.sideToggleBtn} ${activeSide === 'back' ? styles.sideToggleActive : ''}`}
                onClick={() => setActiveSide('back')}
              >
                Back Side
              </button>
            </div>

            {/* Canvas Overlay Info */}
            <div className={styles.canvasInfo}>
              <span className={styles.canvasInfoDot} style={{ background: selectedColor }}></span>
              {selectedColorName}
              {frontFileName && <> · Front: {frontFileName}</>}
              {backFileName && <> · Back: {backFileName}</>}
            </div>

            <div className={styles.canvasControls}>
              <span className={styles.canvasHint}>
                <FaExpand /> Drag to rotate · Scroll to zoom
              </span>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className={styles.controlPanel}>
          {/* Panel Tabs */}
          <div className={styles.panelTabs}>
            {panels.map((panel) => (
              <button
                key={panel.id}
                className={`${styles.panelTab} ${activePanel === panel.id ? styles.panelTabActive : ''}`}
                onClick={() => setActivePanel(panel.id)}
              >
                {panel.icon}
                <span>{panel.label}</span>
              </button>
            ))}
          </div>

          {/* Panel Content */}
          <div className={styles.panelContent}>
            <AnimatePresence mode="wait">
              {activePanel === 'color' && (
                <motion.div
                  key="color"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className={styles.panelTitle}>T-Shirt Color</h3>
                  <p className={styles.panelDesc}>
                    Select the base color for your t-shirt
                  </p>
                  <div className={styles.colorGrid}>
                    {TSHIRT_COLORS.map((color) => (
                      <button
                        key={color.hex}
                        className={`${styles.colorOption} ${selectedColor === color.hex ? styles.colorSelected : ''}`}
                        onClick={() => handleColorSelect(color)}
                        title={color.name}
                      >
                        <span
                          className={styles.colorSwatch}
                          style={{ backgroundColor: color.hex }}
                        ></span>
                        <span className={styles.colorName}>{color.name}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {activePanel === 'design' && (
                <motion.div
                  key="design"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className={styles.panelTitle}>
                    Upload {activeSide === 'front' ? 'Front' : 'Back'} Design
                  </h3>
                  <p className={styles.panelDesc}>
                    Upload your logo or artwork for the {activeSide} of the shirt.
                  </p>

                  <div
                    className={styles.uploadZone}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FaUpload className={styles.uploadIcon} />
                    <span className={styles.uploadText}>
                      {currentFileName || `Click to upload ${activeSide} design`}
                    </span>
                    <span className={styles.uploadHint}>
                      Supports PNG, JPG, SVG · Max 10MB
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </div>

                  {currentUrl && (
                    <div className={styles.designPreview}>
                      <div className={styles.designPreviewImage}>
                        <img src={currentUrl} alt={`${activeSide} design preview`} />
                      </div>
                      <div className={styles.designPreviewInfo}>
                        <span>{currentFileName}</span>
                        <button
                          className={styles.removeDesignBtn}
                          onClick={handleRemoveDesign}
                        >
                          <FaTrash /> Remove
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activePanel === 'adjust' && (
                <motion.div
                  key="adjust"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className={styles.panelTitle}>Adjust {activeSide === 'front' ? 'Front' : 'Back'} Design</h3>
                  <p className={styles.panelDesc}>
                    Fine-tune the size and position of your {activeSide} design.
                  </p>

                  {!currentUrl ? (
                    <div className={styles.adjustEmpty}>
                      <FaImage style={{ fontSize: '2rem', color: 'var(--gray-300)', marginBottom: '12px' }} />
                      <p>Upload a design for the {activeSide} first to adjust its placement</p>
                    </div>
                  ) : (
                    <>
                      {/* Scale */}
                      <div className={styles.adjustGroup}>
                        <label className={styles.adjustLabel}>
                          Design Size
                          <span className={styles.adjustValue}>
                            {Math.round(currentScale * 100)}%
                          </span>
                        </label>
                        <input
                          type="range"
                          min="30"
                          max="250"
                          value={currentScale * 100}
                          onChange={(e) => setScale(Number(e.target.value) / 100)}
                          className={styles.slider}
                        />
                      </div>

                      {/* Position X */}
                      <div className={styles.adjustGroup} style={{ marginTop: '20px' }}>
                        <label className={styles.adjustLabel}>
                          Horizontal Position
                          <span className={styles.adjustValue}>
                            {Math.round(currentPosition.x * 100)}
                          </span>
                        </label>
                        <input
                          type="range"
                          min="-20"
                          max="20"
                          value={currentPosition.x * 100}
                          onChange={(e) => setPosition('x', Number(e.target.value) / 100)}
                          className={styles.slider}
                        />
                      </div>

                      {/* Position Y */}
                      <div className={styles.adjustGroup} style={{ marginTop: '20px' }}>
                        <label className={styles.adjustLabel}>
                          Vertical Position
                          <span className={styles.adjustValue}>
                            {Math.round(currentPosition.y * 100)}
                          </span>
                        </label>
                        <input
                          type="range"
                          min="-30"
                          max="30"
                          value={currentPosition.y * 100}
                          onChange={(e) => setPosition('y', Number(e.target.value) / 100)}
                          className={styles.slider}
                        />
                      </div>

                      <div className={styles.adjustGroup} style={{ marginTop: '28px' }}>
                        <label className={styles.adjustLabel}>Quick Scale Presets</label>
                        <div className={styles.presetBtns}>
                          {[
                            { label: 'Small Logo', scale: 0.5 },
                            { label: 'Medium', scale: 1.0 },
                            { label: 'Large Print', scale: 1.5 },
                            { label: 'Full', scale: 2.0 },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              className={styles.presetBtn}
                              onClick={() => setScale(preset.scale)}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Summary Bar */}
          <div className={styles.summaryBar}>
            <div className={styles.summaryInfo}>
              <div className={styles.summaryColor}>
                <span style={{ background: selectedColor }} className={styles.summaryDot}></span>
                <span>{selectedColorName}</span>
              </div>
              {(frontFileName || backFileName) && (
                <span className={styles.summaryDesign}>✓ Designs applied</span>
              )}
            </div>
            <a href="/contact" className={styles.orderBtn}>
              Get Quote →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
