"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Wifi,
  Volume2,
  VolumeX,
  Compass,
  Layers,
  Zap,
  Maximize,
  Minimize,
  Activity,
  Award,
  Video,
  VideoOff,
  Mic,
  MicOff,
  UserCheck,
  ArrowRight,
  MonitorPlay,
  RotateCcw,
} from "lucide-react";
import { GLASSMORPHISM_STYLES, INTERACTION_CLASSES } from "@interviewmirror/ui";
import { useInterviewStore } from "../../../store/interviewStore";

type AcousticMode = "BOARDROOM" | "STARTUP_WORKSPACE" | "ZEN_CAVE";
type EnvTheme = "CYBERPUNK_GLOW" | "MATRIX_GREEN" | "COSMIC_BLUE";

export default function Immersive3DChamberPage() {
  const { connected } = useInterviewStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interactive Immersive States
  const [acoustic, setAcoustic] = useState<AcousticMode>("BOARDROOM");
  const [theme, setTheme] = useState<EnvTheme>("CYBERPUNK_GLOW");
  const [webxrActive, setWebxrActive] = useState(false);
  const [spatialAudio, setSpatialAudio] = useState(true);
  const [streamActive, setStreamActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [sessionRunning, setSessionRunning] = useState(false);

  // Real-time Spatial Telemetry stats
  const [spatialGaze, setSpatialGaze] = useState({ x: 0, y: 0, depth: 0.95 });
  const [emotionalState, setEmotionalState] = useState<
    "Neutral" | "Happy" | "Surprised" | "Thinking"
  >("Neutral");
  const [confidenceRadius, setConfidenceRadius] = useState<number>(75);

  // WebGL 3D Holographic Rendering simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particleOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Theme colors
      let glowColor = "rgba(99, 102, 241, 0.4)"; // indigo
      let lineColor = "rgba(99, 102, 241, 0.8)";
      if (theme === "MATRIX_GREEN") {
        glowColor = "rgba(16, 185, 129, 0.4)"; // emerald
        lineColor = "rgba(16, 185, 129, 0.8)";
      } else if (theme === "COSMIC_BLUE") {
        glowColor = "rgba(59, 130, 246, 0.4)"; // blue
        lineColor = "rgba(59, 130, 246, 0.8)";
      }

      // Draw Grid Floor Matrix
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let j = 0; j < height; j += 30) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
        ctx.stroke();
      }

      // Draw Holographic Avatar Mesh Head
      ctx.strokeStyle = lineColor;
      ctx.fillStyle = glowColor;
      ctx.lineWidth = 2;

      ctx.shadowBlur = 20;
      ctx.shadowColor = lineColor;

      // Draw pulsating holographic core sphere
      const pulseRadius = 50 + Math.sin(particleOffset) * 6;
      ctx.beginPath();
      ctx.arc(centerX, centerY - 20, pulseRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Outer spatial geometry ring
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.beginPath();
      ctx.ellipse(
        centerX,
        centerY - 20,
        pulseRadius + 30,
        (pulseRadius + 30) * 0.4,
        particleOffset * 0.2,
        0,
        Math.PI * 2,
      );
      ctx.stroke();

      // Horizontal audio reactive waveforms
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < width; x += 10) {
        const amplitude = sessionRunning
          ? 15 + Math.sin(x * 0.05 + particleOffset) * 10
          : 2;
        const y =
          centerY + 100 + Math.sin(x * 0.02 + particleOffset) * amplitude;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Reset shadows
      ctx.shadowBlur = 0;
      particleOffset += 0.05;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, sessionRunning]);

  // Handle telemetry updates simulating active mock interactions
  useEffect(() => {
    if (!sessionRunning) return;

    const interval = setInterval(() => {
      // Simulate 3D gaze offsets
      setSpatialGaze({
        x: parseFloat((Math.random() * 2 - 1).toFixed(2)),
        y: parseFloat((Math.random() * 2 - 1).toFixed(2)),
        depth: parseFloat((0.85 + Math.random() * 0.15).toFixed(2)),
      });

      // Simulate micro emotion switches
      const emotions: Array<typeof emotionalState> = [
        "Neutral",
        "Happy",
        "Thinking",
        "Surprised",
      ];
      setEmotionalState(emotions[Math.floor(Math.random() * emotions.length)]);

      // Simulate spoken confidence expansion
      setConfidenceRadius(Math.floor(70 + Math.random() * 25));
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionRunning]);

  return (
    <div className="space-y-6 bg-zinc-950 p-2 md:p-6 rounded-2xl relative text-zinc-100 min-h-screen pb-12">
      {/* Background glowing layer */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-indigo-950/20 via-transparent to-transparent pointer-events-none z-0" />

      {/* Title block & Apple Vision Pro simulator toggle */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl md:text-3xl text-white tracking-tight flex items-center space-x-2">
            <span>3D Immersive Interview Chamber</span>
            <span className="bg-indigo-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Apple Vision Pro Ready
            </span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Futuristic WebGL particle interface simulating spatial dynamic
            coordinate projections.
          </p>
        </div>

        {/* Sync panel */}
        <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full text-[10px] text-zinc-400 self-start">
          <Wifi className="w-3.5 h-3.5 text-indigo-400" />
          <span>SPATIAL SYNC ON</span>
        </div>
      </div>

      {/* Chamber configuration states */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hologram Viewer */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div
            className={`${GLASSMORPHISM_STYLES.card} p-3 border-zinc-900/60 flex flex-col relative overflow-hidden`}
          >
            {/* Hologram View Frame */}
            <div className="relative bg-zinc-950 rounded-xl overflow-hidden aspect-video min-h-[380px] border border-zinc-900 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={700}
                height={400}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />

              {/* Spatial UI Overlays when Session is active */}
              {sessionRunning && (
                <>
                  {/* Apple Vision Pro Spatial passthrough grid corners */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-indigo-500/50 rounded-tl-sm" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-indigo-500/50 rounded-tr-sm" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-indigo-500/50 rounded-bl-sm" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-indigo-500/50 rounded-br-sm" />

                  {/* Passthrough spatial indicator */}
                  <div className="absolute top-4 left-4 bg-zinc-900/90 border border-zinc-800 rounded-lg p-2 flex items-center space-x-2 text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-zinc-400">
                      PASSTHROUGH DEPTH: {spatialGaze.depth}m
                    </span>
                  </div>

                  {/* Dynamic Spatial Gaze mapping tracking overlay */}
                  <div
                    className="absolute w-6 h-6 rounded-full border border-indigo-400 bg-indigo-500/10 flex items-center justify-center pointer-events-none transition-all duration-300"
                    style={{
                      left: `${50 + spatialGaze.x * 20}%`,
                      top: `${50 + spatialGaze.y * 20}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  </div>
                </>
              )}

              {/* Startup Onboarding overlay in idle state */}
              {!sessionRunning && (
                <div className="relative z-10 text-center max-w-sm p-6 space-y-4">
                  <MonitorPlay className="w-12 h-12 text-indigo-500 mx-auto animate-pulse" />
                  <div>
                    <h3 className="font-heading font-black text-white text-base">
                      Egress Spatial Sandbox
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Initiate holographic prompter loops and check directional
                      audio parameters before starting.
                    </p>
                  </div>
                  <button
                    onClick={() => setSessionRunning(true)}
                    className={`${INTERACTION_CLASSES.primaryButton} w-full`}
                  >
                    <span>Activate Hologram Matrix</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </button>
                </div>
              )}

              {/* Top active state HUD */}
              {sessionRunning && (
                <div className="absolute top-4 right-4 bg-zinc-950/80 border border-zinc-800 rounded-lg px-3 py-1 flex items-center space-x-2 text-[10px]">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-bold text-zinc-300">
                    ACOUSTIC ROOM: {acoustic}
                  </span>
                </div>
              )}
            </div>

            {/* Immersive parameters control bar */}
            <div className="mt-4 flex items-center justify-between flex-wrap gap-2 border-t border-zinc-900 pt-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setMicActive(!micActive)}
                  className={`p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                    micActive
                      ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      : "bg-red-950/20 border-red-900/30 text-red-400"
                  }`}
                >
                  {micActive ? (
                    <Mic className="w-4 h-4" />
                  ) : (
                    <MicOff className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setStreamActive(!streamActive)}
                  className={`p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                    streamActive
                      ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      : "bg-red-950/20 border-red-900/30 text-red-400"
                  }`}
                >
                  {streamActive ? (
                    <Video className="w-4 h-4" />
                  ) : (
                    <VideoOff className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setSpatialAudio(!spatialAudio)}
                  className={`p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                    spatialAudio
                      ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      : "bg-zinc-950/40 border-zinc-900 text-zinc-600"
                  }`}
                >
                  {spatialAudio ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Stop simulation trigger */}
              {sessionRunning && (
                <button
                  onClick={() => setSessionRunning(false)}
                  className="flex items-center space-x-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Disable Matrix</span>
                </button>
              )}
            </div>
          </div>

          {/* Theme Environment selector and Spatial Audio Gating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Spatial Acoustics selectors */}
            <div
              className={`${GLASSMORPHISM_STYLES.card} p-4 border-zinc-900/60`}
            >
              <div className="flex items-center space-x-2 text-indigo-400 mb-2">
                <Compass className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-300">
                  Spatial Acoustic Spaces
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["BOARDROOM", "STARTUP_WORKSPACE", "ZEN_CAVE"] as const).map(
                  (room) => (
                    <button
                      key={room}
                      onClick={() => setAcoustic(room)}
                      className={`text-[9px] py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                        acoustic === room
                          ? "bg-zinc-800 text-white border-zinc-700"
                          : "bg-zinc-900/50 border-zinc-900 text-zinc-500"
                      }`}
                    >
                      {room.replace("_", " ")}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Environmental Glow themes */}
            <div
              className={`${GLASSMORPHISM_STYLES.card} p-4 border-zinc-900/60`}
            >
              <div className="flex items-center space-x-2 text-purple-400 mb-2">
                <Layers className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-300">
                  WebGL Glow Themes
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(
                  ["CYBERPUNK_GLOW", "MATRIX_GREEN", "COSMIC_BLUE"] as const
                ).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`text-[9px] py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                      theme === t
                        ? "bg-zinc-800 text-white border-zinc-700"
                        : "bg-zinc-900/50 border-zinc-900 text-zinc-500"
                    }`}
                  >
                    {t.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right side Holographic Telemetry and spatial tracking dashboard */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Spatial tracking metadata */}
          <div
            className={`${GLASSMORPHISM_STYLES.card} p-5 border-zinc-900/60`}
          >
            <div className="flex items-center space-x-2 text-indigo-400 mb-4">
              <Compass className="w-4 h-4 animate-spin-slow" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-300">
                Spatial Analytics HUD
              </span>
            </div>

            <div className="space-y-4">
              {/* Dynamic emotional state tracker */}
              <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-3 flex justify-between items-center">
                <span className="text-[10px] text-zinc-400 font-bold">
                  Emotional state
                </span>
                <span className="text-indigo-400 text-[10px] font-mono tracking-widest uppercase">
                  {sessionRunning ? emotionalState : "STANDING BY"}
                </span>
              </div>

              {/* Spatial audio calibration metrics */}
              <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-3 space-y-2">
                <span className="text-[9px] uppercase font-bold text-zinc-500 block">
                  Directional audio offset
                </span>
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-400">Azimuth Angle</span>
                  <span className="text-zinc-200 font-mono">14.2°</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-400">Elevation Tilt</span>
                  <span className="text-zinc-200 font-mono">-6.8°</span>
                </div>
              </div>

              {/* 3D Spoken confidence bounds */}
              <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-zinc-400">3D Confidence Sphere</span>
                  <span className="text-emerald-400">
                    {sessionRunning ? `${confidenceRadius}%` : "0%"}
                  </span>
                </div>
                <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${sessionRunning ? confidenceRadius : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* WebXR Simulator controllers */}
          <div
            className={`${GLASSMORPHISM_STYLES.card} p-5 border-zinc-900/60 flex-1 flex flex-col justify-between min-h-[200px]`}
          >
            <div>
              <div className="flex items-center space-x-2 text-indigo-400 mb-3 pb-2 border-b border-zinc-900">
                <Award className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-300">
                  WebXR Passthrough Gates
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Unlock immersive stereoscopic display modes. Simulates deep
                spatial tracking arrays tailored for the Apple Vision Pro
                environment.
              </p>
            </div>

            <button
              onClick={() => setWebxrActive(!webxrActive)}
              disabled={!sessionRunning}
              className={`w-full mt-4 flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                webxrActive
                  ? "bg-zinc-800 text-white border-zinc-700"
                  : "bg-indigo-600 border-indigo-500 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>
                {webxrActive
                  ? "Stereoscopic Enabled"
                  : "Simulate WebXR Passthrough"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
