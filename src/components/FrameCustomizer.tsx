"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, Download, RefreshCw, ZoomIn, ZoomOut, Move, RotateCw, Sparkles, Terminal, Calendar, MapPin } from "lucide-react";
import CaptionModal from "./CaptionModal";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_PREVIEW_EDGE = 1024;
const MAX_EXPORT_EDGE = 2048;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const OVERLAY_IMAGE_PATH = "/assets/Frostbyte dp blast 1.webp";

export default function FrameCustomizer() {
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [visitorName, setVisitorName] = useState("");
  const [isCaptionOpen, setIsCaptionOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Upload a photo to start customizing!");
  const [isErrorStatus, setIsErrorStatus] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Customizer state
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [tiltDeg, setTiltDeg] = useState(0);

  // References
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoImageRef = useRef<HTMLImageElement | null>(null);
  const frameImageRef = useRef<HTMLImageElement | null>(null);

  // Setup initial status message
  const setStatus = (msg: string, isErr = false) => {
    setStatusMessage(msg);
    setIsErrorStatus(isErr);
  };

  // Reset adjustments
  const handleReset = () => {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setTiltDeg(0);
    setStatus("Adjustments reset.");
  };

  // Quick adjustments
  const handleZoomDelta = (delta: number) => {
    setZoom((z) => Math.min(2.8, Math.max(0.5, parseFloat((z + delta).toFixed(2)))));
    setStatus("Zoom updated.");
  };

  const handleTiltDelta = (delta: number) => {
    setTiltDeg((t) => {
      let next = t + delta;
      if (next > 180) next -= 360;
      if (next < -180) next += 360;
      return Math.round(next);
    });
    setStatus("Tilt updated.");
  };

  const handleOffsetDelta = (axis: "x" | "y", delta: number) => {
    if (axis === "x") {
      setOffsetX((x) => Math.min(500, Math.max(-500, x + delta)));
    } else {
      setOffsetY((y) => Math.min(500, Math.max(-500, y + delta)));
    }
    setStatus("Position updated.");
  };

  // Helper to load an image safely
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = src;
    });
  };

  // Draw composition onto preview canvas
  const drawComposite = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      photo: HTMLImageElement | null,
      frame: HTMLImageElement | null,
      zoomVal: number,
      offX: number,
      offY: number,
      tilt: number
    ) => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw photo (scaled, panned, rotated)
      if (photo) {
        const baseScale = Math.max(width / photo.naturalWidth, height / photo.naturalHeight);
        const finalScale = baseScale * zoomVal;
        const drawWidth = photo.naturalWidth * finalScale;
        const drawHeight = photo.naturalHeight * finalScale;

        ctx.save();
        ctx.translate(width / 2 + offX, height / 2 + offY);
        ctx.rotate((tilt * Math.PI) / 180);
        ctx.drawImage(photo, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        ctx.restore();
      } else {
        // Draw placeholder background
        ctx.fillStyle = "#0c142c";
        ctx.fillRect(0, 0, width, height);

        // Grid pattern
        ctx.strokeStyle = "rgba(0, 240, 255, 0.05)";
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Draw help text
        ctx.fillStyle = "rgba(0, 240, 255, 0.5)";
        ctx.font = "bold 20px Outfit, ui-sans-serif, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Upload your photo to start", width / 2, height / 2);
      }

      // 2. Draw Frame Overlay
      if (frame) {
        ctx.drawImage(frame, 0, 0, width, height);
      }
    },
    []
  );

  // Trigger preview rendering
  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const frameImg = frameImageRef.current;
    const photoImg = photoImageRef.current;
    if (!ctx || !frameImg) return;

    const width = frameImg.naturalWidth || 1080;
    const height = frameImg.naturalHeight || 1080;

    // Scale to display bounds (max display edge size is e.g. 1024 or based on viewport)
    const scaleFactor = Math.min(1, MAX_PREVIEW_EDGE / Math.max(width, height));
    const previewWidth = Math.max(1, Math.round(width * scaleFactor));
    const previewHeight = Math.max(1, Math.round(height * scaleFactor));

    if (canvas.width !== previewWidth || canvas.height !== previewHeight) {
      canvas.width = previewWidth;
      canvas.height = previewHeight;
    }

    drawComposite(
      ctx,
      previewWidth,
      previewHeight,
      photoImg,
      frameImg,
      zoom,
      offsetX,
      offsetY,
      tiltDeg
    );
  }, [zoom, offsetX, offsetY, tiltDeg, drawComposite]);

  // Load resources
  useEffect(() => {
    const setupFrame = async () => {
      try {
        const frame = await loadImage(OVERLAY_IMAGE_PATH);
        frameImageRef.current = frame;
        renderPreview();
      } catch (err) {
        console.error("Frame failed to load: ", err);
        setStatus("Failed to load official frame overlay.", true);
      }
    };
    setupFrame();
  }, [renderPreview]);

  // Re-run render on state changes
  useEffect(() => {
    renderPreview();
  }, [zoom, offsetX, offsetY, tiltDeg, renderPreview]);

  // Handle Photo selection
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.has(file.type)) {
      setStatus("Unsupported file type. Please upload a PNG, JPG, or WEBP.", true);
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setStatus("That image is too large (max 10MB).", true);
      return;
    }

    setStatus("Loading photo...");

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === "string") {
          const img = await loadImage(reader.result);
          photoImageRef.current = img;
          setPhotoSrc(reader.result);
          setStatus("Photo loaded successfully! Fine-tune using controls or drag canvas.");
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setStatus("Could not load the selected photo.", true);
    }
  };

  // High-Resolution download handler
  const handleDownload = async () => {
    const frameImg = frameImageRef.current;
    const photoImg = photoImageRef.current;

    if (!frameImg) {
      setStatus("Official frame is not loaded yet.", true);
      return;
    }

    if (!photoImg) {
      setStatus("Please upload a photo first.", true);
      return;
    }

    setIsDownloading(true);
    setStatus("Compositing high-res DP...");

    // Wait slightly to show spinner
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const targetWidth = frameImg.naturalWidth || 2048;
      const targetHeight = frameImg.naturalHeight || 2048;

      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = targetWidth;
      exportCanvas.height = targetHeight;

      const exportCtx = exportCanvas.getContext("2d");
      if (!exportCtx) throw new Error("Canvas context error");

      // Scale offsets from preview coordinates to export coordinates
      const previewCanvas = canvasRef.current;
      const previewWidth = previewCanvas?.width || targetWidth;
      const previewHeight = previewCanvas?.height || targetHeight;
      const scaleX = targetWidth / previewWidth;
      const scaleY = targetHeight / previewHeight;

      drawComposite(
        exportCtx,
        targetWidth,
        targetHeight,
        photoImg,
        frameImg,
        zoom,
        offsetX * scaleX,
        offsetY * scaleY,
        tiltDeg
      );

      // Create download
      exportCanvas.toBlob((blob) => {
        if (!blob) {
          setStatus("Blob export failed.", true);
          setIsDownloading(false);
          return;
        }

        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `FROSTBYTE-DP.png`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);

        setStatus("Download started! Share your DP using the spiel below.");
        setIsDownloading(false);
        setIsCaptionOpen(true);
      }, "image/png");
    } catch (err) {
      console.error(err);
      setStatus("High-res export failed.", true);
      setIsDownloading(false);
    }
  };

  // Touch and Mouse Gesture Handling
  const activeTouchesRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const initialOffsetRef = useRef({ x: 0, y: 0 });
  const pinchStartDistRef = useRef(0);
  const pinchStartZoomRef = useRef(1);
  const pinchStartMidpointRef = useRef({ x: 0, y: 0 });
  const pinchStartOffsetRef = useRef({ x: 0, y: 0 });
  const pinchStartAngleRef = useRef(0);
  const pinchStartTiltRef = useRef(0);

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!photoSrc) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    const coords = getCanvasCoords(e);
    activeTouchesRef.current.set(e.pointerId, coords);

    const touches = Array.from(activeTouchesRef.current.values());

    if (touches.length >= 2) {
      // Setup Pinch/Zoom
      const [t1, t2] = touches;
      const dx = t2.x - t1.x;
      const dy = t2.y - t1.y;
      pinchStartDistRef.current = Math.hypot(dx, dy) || 1;
      pinchStartZoomRef.current = zoom;
      pinchStartMidpointRef.current = { x: (t1.x + t2.x) / 2, y: (t1.y + t2.y) / 2 };
      pinchStartOffsetRef.current = { x: offsetX, y: offsetY };
      pinchStartAngleRef.current = Math.atan2(dy, dx) * (180 / Math.PI);
      pinchStartTiltRef.current = tiltDeg;
      panStartRef.current = null;
    } else if (touches.length === 1) {
      // Setup Pan
      panStartRef.current = coords;
      initialOffsetRef.current = { x: offsetX, y: offsetY };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!photoSrc) return;
    if (!activeTouchesRef.current.has(e.pointerId)) return;

    const coords = getCanvasCoords(e);
    activeTouchesRef.current.set(e.pointerId, coords);

    const touches = Array.from(activeTouchesRef.current.values());

    if (touches.length >= 2) {
      // Handle Pinch & Rotate
      const [t1, t2] = touches;
      const dx = t2.x - t1.x;
      const dy = t2.y - t1.y;
      const currentDist = Math.hypot(dx, dy) || 1;
      const currentMid = { x: (t1.x + t2.x) / 2, y: (t1.y + t2.y) / 2 };
      const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);

      // Zoom
      const newZoom = pinchStartZoomRef.current * (currentDist / pinchStartDistRef.current);
      setZoom(Math.min(2.8, Math.max(0.5, parseFloat(newZoom.toFixed(2)))));

      // Rotate
      let angleDiff = currentAngle - pinchStartAngleRef.current;
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;
      const newTilt = pinchStartTiltRef.current + angleDiff;
      setTiltDeg(Math.min(180, Math.max(-180, Math.round(newTilt))));

      // Pan offset
      const dMidX = currentMid.x - pinchStartMidpointRef.current.x;
      const dMidY = currentMid.y - pinchStartMidpointRef.current.y;
      setOffsetX(Math.min(500, Math.max(-500, pinchStartOffsetRef.current.x + dMidX)));
      setOffsetY(Math.min(500, Math.max(-500, pinchStartOffsetRef.current.y + dMidY)));

      setStatus("Pinching and rotating...");
    } else if (touches.length === 1 && panStartRef.current) {
      // Handle Pan
      const dx = coords.x - panStartRef.current.x;
      const dy = coords.y - panStartRef.current.y;
      setOffsetX(Math.min(500, Math.max(-500, initialOffsetRef.current.x + dx)));
      setOffsetY(Math.min(500, Math.max(-500, initialOffsetRef.current.y + dy)));
      setStatus("Dragging...");
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    activeTouchesRef.current.delete(e.pointerId);
    if (activeTouchesRef.current.size === 0) {
      panStartRef.current = null;
    } else if (activeTouchesRef.current.size === 1) {
      // Re-initialize pan on remaining pointer
      const remainingId = Array.from(activeTouchesRef.current.keys())[0];
      const remainingCoords = activeTouchesRef.current.get(remainingId);
      if (remainingCoords) {
        panStartRef.current = remainingCoords;
        initialOffsetRef.current = { x: offsetX, y: offsetY };
      }
    }
  };

  const handleCanvasClick = () => {
    if (!photoSrc) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="grid gap-6 sm:gap-8 lg:grid-cols-[480px_1fr] lg:gap-16 w-full">
      {/* 1. Header (Title, description) spanning full width on desktop */}
      <div className="lg:col-span-2 space-y-3 sm:space-y-4">
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-3 sm:space-y-4"
        >
          {/* Pulsing Tag */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-950/20 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <Terminal className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
            <span>Break the Ice. Build the Future.</span>
          </div>

          {/* Catchy Main Title */}
          <h1 className="text-3xl font-black italic tracking-tight text-white uppercase sm:text-5xl lg:text-6xl leading-[0.95]">
            FREEZE YOUR <br />
            <span className="bg-gradient-to-b from-[#d5f3ff] to-[#9adbf0] bg-clip-text text-transparent pr-4">
              FROSTBYTE DP
            </span>
          </h1>

          {/* Event Spiel Description */}
          <p className="max-w-3xl text-xs sm:text-sm md:text-base leading-relaxed text-slate-400">
            Show your pride as an innovator in Santa Rosa&apos;s flagship youth innovation competition. Overlay the official FROSTBYTE DP frame, customize your photo&apos;s layout, and share it on socials!
          </p>
        </motion.div>
      </div>

      {/* 2. Left Column: Canvas Preview */}
      <div className="flex flex-col items-center w-full">
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full aspect-square rounded-[2rem] border border-cyan-500/20 bg-[#070b16] p-2.5 sm:p-4 shadow-[0_0_50px_rgba(0,240,255,0.08)] glass-panel"
        >
          <div className="relative w-full h-full overflow-hidden rounded-2xl bg-[#03060c] select-none">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`w-full h-full block ${photoSrc ? "cursor-grab active:cursor-grabbing touch-none" : "cursor-pointer"}`}
              aria-label="Customized DP preview"
            />

            {/* Gesture Tip Overlay */}
            {photoSrc && (
              <div className="absolute bottom-3 inset-x-3 pointer-events-none text-center bg-cyan-950/80 border border-cyan-500/30 text-[10px] sm:text-[11px] font-medium tracking-wide text-cyan-200 py-1.5 px-3 rounded-xl backdrop-blur-sm shadow-md flex items-center justify-center gap-1.5 animate-pulse">
                <Move className="h-3 w-3" />
                <span>Drag to pan · Pinch to zoom/rotate directly</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Status Line */}
        <p
          className={`mt-3 text-xs sm:text-sm text-center px-4 font-medium transition-all duration-200 ${
            isErrorStatus ? "text-red-400 font-semibold" : "text-cyan-400/80"
          }`}
        >
          {statusMessage}
        </p>
      </div>

      {/* 3. Right Column: Controls Panel & Details */}
      <div className="flex flex-col justify-between w-full h-full space-y-5 sm:space-y-6">
        <div className="space-y-5 sm:space-y-6">
          {/* Quick Details Cards (Mobile Side-by-Side) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex gap-2 sm:gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-3 sm:p-4 backdrop-blur-md min-w-0">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-cyan-950/50 border border-cyan-500/20 text-cyan-400">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-cyan-400 truncate">Date</h4>
                <p className="mt-0.5 text-xs sm:text-sm font-bold text-white truncate">August 10, 2026</p>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-3 sm:p-4 backdrop-blur-md min-w-0">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-cyan-950/50 border border-cyan-500/20 text-cyan-400">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-cyan-400 truncate">Venue</h4>
                <p className="mt-0.5 text-xs sm:text-sm font-bold text-white truncate">Santa Rosa Auditorium</p>
              </div>
            </div>
          </div>

          {/* Photo Import / Reset */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-5 py-2.5 text-xs sm:text-sm font-bold text-cyan-300 hover:bg-cyan-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              <span>{photoSrc ? "Change Photo" : "Choose Photo"}</span>
            </button>

            {photoSrc && (
              <button
                onClick={handleReset}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-transparent px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-300 hover:bg-slate-800 active:scale-95 transition-all duration-200"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Customizer Slider Panel or Upload Box */}
          {photoSrc ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 sm:p-5 space-y-4 sm:space-y-5"
            >
              <h3 className="m-0 text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>FROSTBYTE Customizer Sliders</span>
              </h3>

              {/* Zoom Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <label htmlFor="zoom-range" className="flex items-center gap-1.5">
                    <ZoomIn className="h-3 w-3 text-cyan-400" />
                    <span>Zoom Scale</span>
                  </label>
                  <span>{zoom.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  id="zoom-range"
                  min="0.5"
                  max="2.8"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                />
              </div>

              {/* Horizontal Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <label htmlFor="x-range">Horizontal Position</label>
                  <span>{Math.round(offsetX)}px</span>
                </div>
                <input
                  type="range"
                  id="x-range"
                  min="-300"
                  max="300"
                  step="1"
                  value={offsetX}
                  onChange={(e) => setOffsetX(parseInt(e.target.value))}
                />
              </div>

              {/* Vertical Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <label htmlFor="y-range">Vertical Position</label>
                  <span>{Math.round(offsetY)}px</span>
                </div>
                <input
                  type="range"
                  id="y-range"
                  min="-300"
                  max="300"
                  step="1"
                  value={offsetY}
                  onChange={(e) => setOffsetY(parseInt(e.target.value))}
                />
              </div>

              {/* Tilt / Rotation Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <label htmlFor="tilt-range" className="flex items-center gap-1.5">
                    <RotateCw className="h-3 w-3 text-cyan-400" />
                    <span>Rotation / Tilt</span>
                  </label>
                  <span>{tiltDeg}°</span>
                </div>
                <input
                  type="range"
                  id="tilt-range"
                  min="-180"
                  max="180"
                  step="1"
                  value={tiltDeg}
                  onChange={(e) => setTiltDeg(parseInt(e.target.value))}
                />
              </div>

              {/* Step Quick Adjust buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-2">
                <button
                  onClick={() => handleZoomDelta(0.1)}
                  className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
                >
                  Zoom +
                </button>
                <button
                  onClick={() => handleZoomDelta(-0.1)}
                  className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
                >
                  Zoom -
                </button>
                <button
                  onClick={() => handleTiltDelta(15)}
                  className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
                >
                  Rotate 15°
                </button>
                <button
                  onClick={() => handleTiltDelta(-15)}
                  className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
                >
                  Rotate -15°
                </button>
                <button
                  onClick={() => handleOffsetDelta("x", -20)}
                  className="rounded-lg bg-slate-900 border border-slate-800 px-2 py-1.5 text-xs text-slate-300 hover:text-white"
                >
                  Left
                </button>
                <button
                  onClick={() => handleOffsetDelta("x", 20)}
                  className="rounded-lg bg-slate-900 border border-slate-800 px-2 py-1.5 text-xs text-slate-300 hover:text-white"
                >
                  Right
                </button>
              </div>
            </motion.div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl border border-dashed border-cyan-500/35 bg-cyan-950/10 p-6 sm:p-8 text-center flex flex-col items-center hover:bg-cyan-950/20 transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.03)]"
            >
              <div className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-cyan-950/60 border border-cyan-500/25 text-cyan-400 mb-3 sm:mb-4 animate-pulse">
                <Upload className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">Upload your photo to start</h4>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-1 sm:mt-1.5 max-w-[280px]">
                Drag and drop your file here, or click to browse. Supports PNG, JPG, or WEBP up to 10MB.
              </p>
            </div>
          )}

          {/* ATTENDANT NAME INLAND INPUT */}
          <div className="space-y-2">
            <label htmlFor="name-input" className="block text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Attendant Name (For social caption)
            </label>
            <input
              type="text"
              id="name-input"
              maxLength={50}
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              placeholder="e.g. Frostmate / Vince / Otep"
              className="block w-full rounded-2xl border border-slate-700/60 bg-slate-950/50 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Generate / Download Action */}
        <div className="pt-4 sm:pt-5 border-t border-slate-800/60">
          <button
            onClick={handleDownload}
            disabled={!photoSrc || isDownloading}
            className={`w-full flex items-center justify-center gap-2 rounded-full py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white shadow-xl transition-all duration-200 select-none ${
              photoSrc && !isDownloading
                ? "bg-gradient-to-r from-cyan-400 to-blue-600 shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                : "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
            }`}
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Compositing...</span>
              </>
            ) : (
              <>
                <Download className="h-4 sm:h-5 w-4 sm:w-5" />
                <span>Download Customized DP</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Share / Caption Spiel Modal */}
      <CaptionModal
        isOpen={isCaptionOpen}
        onClose={() => setIsCaptionOpen(false)}
        defaultName={visitorName}
      />
    </div>
  );
}
