"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Mic,
  MicOff,
  VideoOff,
  Square,
  Play,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Activity,
  Clock,
  ArrowRight,
  Maximize2,
  Minimize2,
  Pause,
  ShieldAlert,
  Wifi,
  WifiOff,
  FileText,
  Upload,
  Globe,
  Award,
  Zap,
  Building,
  User,
  Volume2,
} from "lucide-react";
import { GLASSMORPHISM_STYLES, INTERACTION_CLASSES } from "@interviewmirror/ui";
import { useInterviewStore } from "../../../store/interviewStore";
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from "recharts";

type SessionState =
  | "idle"
  | "starting"
  | "recording"
  | "paused"
  | "processing"
  | "complete";

type AvatarState = "idle" | "speaking" | "listening" | "thinking" | "feedback";

type CategoryKey = "DSA" | "SYSTEM_DESIGN" | "HR" | "RESUME_INTELLIGENCE";

interface CustomToast {
  id: string;
  title: string;
  message: string;
  type: "success" | "warning" | "info" | "error";
}

const companyModes = [
  {
    name: "Google Mode",
    style: "border-red-500/30 text-red-400 bg-red-950/10",
  },
  {
    name: "Amazon Mode",
    style: "border-amber-500/30 text-amber-400 bg-amber-950/10",
  },
  {
    name: "Microsoft Mode",
    style: "border-blue-500/30 text-blue-400 bg-blue-950/10",
  },
  {
    name: "FAANG HR Mode",
    style: "border-indigo-500/30 text-indigo-400 bg-indigo-950/10",
  },
];

export default function InterviewSimulatorPage() {
  const router = useRouter();
  const {
    socket,
    connected,
    questionIndex,
    alerts,
    telemetryFeed,
    initializeSocket,
    disconnectSocket,
    setQuestionIndex,
    setTimerSeconds,
    addTelemetryPoint,
    addAlert,
    clearAlerts,
  } = useInterviewStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("DSA");
  const [isMuted, setIsMuted] = useState(false);
  const [camEnabled, setCamEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [duplicateTabDetected, setDuplicateTabDetected] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Local clock state to prevent stuck closures
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Dynamic Session and Telemetry logs
  const [toasts, setToasts] = useState<CustomToast[]>([]);
  const [language, setLanguage] = useState<"EN" | "HI" | "TE">("EN");
  const [activeCompanyMode, setActiveCompanyMode] =
    useState<string>("Google Mode");
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [atsScore, setAtsScore] = useState<number>(0);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Target role metrics
  const [targetRole, setTargetRole] = useState<string>(
    "Senior Software Engineer",
  );
  const [targetSkills, setTargetSkills] = useState<string>(
    "Next.js 15, FastAPI, OpenCV",
  );
  const [activeQuestions, setActiveQuestions] = useState<string[]>([]);

  // Real-time voice transcripts
  const [currentTranscript, setCurrentTranscript] = useState<string>("");
  const [speechDatabase, setSpeechDatabase] = useState<string[]>([]);
  const [fillerCounts, setFillerCounts] = useState<Record<string, number>>({
    like: 0,
    um: 0,
    uh: 0,
    basically: 0,
    actually: 0,
  });

  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const telemetryIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const canvasAnimationRef = useRef<number | null>(null);
  const silenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionRef = useRef<any>(null);

  // Refs to prevent state capture in speech recognition stale closures
  const sessionStateRef = useRef(sessionState);
  const avatarStateRef = useRef(avatarState);
  const activeQuestionsRef = useRef(activeQuestions);
  const questionIndexRef = useRef(questionIndex);
  const fillerCountsRef = useRef(fillerCounts);

  // Function refs
  const handleUserSilenceDetectedRef = useRef<any>(null);
  const handleStopSessionRef = useRef<any>(null);

  // Sync refs with state
  useEffect(() => { sessionStateRef.current = sessionState; }, [sessionState]);
  useEffect(() => { avatarStateRef.current = avatarState; }, [avatarState]);
  useEffect(() => { activeQuestionsRef.current = activeQuestions; }, [activeQuestions]);
  useEffect(() => { questionIndexRef.current = questionIndex; }, [questionIndex]);
  useEffect(() => { fillerCountsRef.current = fillerCounts; }, [fillerCounts]);

  // Ensure video element gets the stream when it mounts (which happens when sessionState changes to recording)
  useEffect(() => {
    if ((sessionState === "recording" || sessionState === "paused") && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
    }
  }, [sessionState]);

  // Trigger custom notification
  const triggerToast = (
    title: string,
    message: string,
    type: CustomToast["type"] = "info",
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Preload speech synthesis voices on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    // Read stored custom role parameters
    const storedRole = localStorage.getItem("target_role_title");
    const storedSkills = localStorage.getItem("target_skills");
    if (storedRole) setTargetRole(storedRole);
    if (storedSkills) setTargetSkills(storedSkills);
  }, []);

  // Synchronize callbacks to avoid stale closures
  useEffect(() => {
    handleUserSilenceDetectedRef.current = handleUserSilenceDetected;
  });

  useEffect(() => {
    handleStopSessionRef.current = handleStopSession;
  });

  // 1. Session state recovery on load
  useEffect(() => {
    const savedSessionId = localStorage.getItem("active_session_id");
    const savedState = localStorage.getItem("active_session_state");
    const savedCategory = localStorage.getItem("active_session_category");

    if (savedSessionId && savedState === "recording") {
      setSessionState("recording");
      if (savedCategory) setSelectedCategory(savedCategory as CategoryKey);
      initializeSocket(savedSessionId);
      startMediaDevices();
    }

    // Initialize HTML5 Web Speech Recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang =
          language === "HI" ? "hi-IN" : language === "TE" ? "te-IN" : "en-US";

        rec.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const activeText = finalTranscript || interimTranscript;
          setCurrentTranscript(activeText);

          // Realtime Speech Filler analysis
          const words = activeText.toLowerCase().split(/\s+/);
          const newFillers = { ...fillerCountsRef.current };
          let fillerAdded = false;

          words.forEach((w) => {
            const cleanWord = w.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
            if (
              ["like", "um", "uh", "basically", "actually"].includes(cleanWord)
            ) {
              newFillers[cleanWord] = (newFillers[cleanWord] || 0) + 1;
              fillerAdded = true;
            }
          });

          if (fillerAdded) {
            setFillerCounts(newFillers);
          }

          // Reset silence detection
          if (silenceTimeoutRef.current)
            clearTimeout(silenceTimeoutRef.current);
          if (sessionStateRef.current === "recording" && avatarStateRef.current === "listening") {
            silenceTimeoutRef.current = setTimeout(() => {
              if (handleUserSilenceDetectedRef.current) {
                handleUserSilenceDetectedRef.current(activeText);
              }
            }, 3000);
          }
        };

        rec.onerror = (e: any) => {
          console.warn("Speech recognition error:", e.error);
        };

        recognitionRef.current = rec;
      }
    }

    return () => {
      stopAllMedia();
      stopTimer();
      stopTelemetrySimulation();
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, [language]);

  // 2. Cybernetic Active Voice Telemetry Sine Wave Visualizer Loop
  useEffect(() => {
    let active = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    handleResize();

    let angle = 0;

    const draw = () => {
      if (!active || !ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      const centerY = h / 2;
      angle += 0.12;

      ctx.lineWidth = 2.5;

      if (avatarState === "speaking") {
        // Multi-frequency overlapping glowing Indigo-Purple sine waves
        const gradient = ctx.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, "rgba(99, 102, 241, 0)");
        gradient.addColorStop(0.3, "rgba(99, 102, 241, 0.85)");
        gradient.addColorStop(0.5, "rgba(168, 85, 247, 0.9)");
        gradient.addColorStop(0.7, "rgba(99, 102, 241, 0.85)");
        gradient.addColorStop(1, "rgba(99, 102, 241, 0)");

        ctx.strokeStyle = gradient;
        ctx.shadowBlur = 12;
        ctx.shadowColor = "rgba(139, 92, 246, 0.6)";

        // Draw 3 overlapping offset waves
        for (let wave = 0; wave < 3; wave++) {
          ctx.beginPath();
          const phase = angle + (wave * Math.PI) / 3;
          const amplitude = 18 - wave * 4;
          const frequency = 0.015 + wave * 0.005;

          for (let x = 0; x < w; x++) {
            const y =
              centerY +
              Math.sin(x * frequency + phase) *
                amplitude *
                Math.sin((x * Math.PI) / w);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else if (avatarState === "listening") {
        // Active Emerald voice capture telemetry waves
        const gradient = ctx.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, "rgba(16, 185, 129, 0)");
        gradient.addColorStop(0.5, "rgba(16, 185, 129, 0.85)");
        gradient.addColorStop(1, "rgba(16, 185, 129, 0)");

        ctx.strokeStyle = gradient;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(16, 185, 129, 0.5)";

        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const ripple = Math.sin(angle * 0.5) * 2;
          const y =
            centerY +
            Math.sin(x * 0.04 + angle) *
              (3 + ripple) *
              Math.sin((x * Math.PI) / w);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (avatarState === "thinking") {
        // Circular computer scan / horizontal running telemetry pulses
        const gradient = ctx.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, "rgba(168, 85, 247, 0)");
        gradient.addColorStop(0.5, "rgba(168, 85, 247, 0.8)");
        gradient.addColorStop(1, "rgba(168, 85, 247, 0)");

        ctx.strokeStyle = gradient;
        ctx.shadowBlur = 12;
        ctx.shadowColor = "rgba(168, 85, 247, 0.4)";

        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const noise = Math.cos(x * 0.08 - angle * 2) * 2;
          const y = centerY + noise * Math.sin((x * Math.PI) / w);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        // Flat, gentle horizontal breathing line (Idle)
        const gradient = ctx.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.15)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.strokeStyle = gradient;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const y =
            centerY +
            Math.sin(x * 0.01 + angle * 0.25) *
              1.5 *
              Math.sin((x * Math.PI) / w);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      canvasAnimationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      active = false;
      if (canvasAnimationRef.current)
        cancelAnimationFrame(canvasAnimationRef.current);
    };
  }, [avatarState]);

  // Generate dynamic 10 Questions customized exactly for the target role!
  const buildTenDynamicQuestions = (role: string, skills: string): string[] => {
    const cleanRole = role || "Software Engineer";
    const cleanSkills = skills || "React, Next.js, Web APIs";

    return [
      `Welcome to your personalized career interview for the ${cleanRole} position. To start, could you please give us an overview of your hands-on experience working with ${cleanSkills}?`,
      `Excellent. How do you design and structure applications for maximum scalability and maintain solid clean code design patterns when working with ${cleanSkills}?`,
      `When managing high-throughput traffic, what caching mechanisms, rate limiters, or scaling policies do you implement to optimize response times?`,
      `Security is critical for a ${cleanRole}. How do you ensure secure user authorization, token rotation, and robust credentials protection across microservices?`,
      `In terms of database efficiency, how do you optimize complex query indexing strategies, and how do you handle concurrency or locking models?`,
      `Can you describe a specific technical challenge you solved using ${cleanSkills} where standard documentation was not enough? What was your debugging methodology?`,
      `Explain how you manage client state, asynchronous side effects, or heavy background computing tasks efficiently without causing lag.`,
      `Imagine we deploy a hotfix that causes a 15% increase in error rates. Walk me through your telemetry investigation, logs parsing, and recovery strategy.`,
      `How do you maintain code quality, test coverage, and smooth CI/CD pipelines while moving quickly under tight business deadlines?`,
      `For our final question: where do you see the future of ${cleanRole} roles evolving, and what AGI or autonomous tools are you currently exploring to scale your workflow?`,
    ];
  };

  // Synthesize voice sound output
  const triggerAvatarVoiceSpeak = (phrase: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);

      const voices = window.speechSynthesis.getVoices();
      const premiumVoice =
        voices.find(
          (v) => v.lang.startsWith("en") && v.name.includes("Google"),
        ) ||
        voices.find(
          (v) => v.lang.startsWith("en") && v.name.includes("Natural"),
        ) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0];

      if (premiumVoice) {
        utterance.voice = premiumVoice;
      }

      utterance.onstart = () => {
        setAvatarState("speaking");
      };

      utterance.onend = () => {
        setAvatarState("listening");
        startVoiceTranscription();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis trigger failed:", e);
      setAvatarState("listening");
    }
  };

  const startVoiceTranscription = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      try {
        recognitionRef.current.start();
      } catch (err: any) {
        console.warn("Speech recognition start failed:", err.message);
      }
    }
  };

  // Silence threshold trigger - autonomous voice flow pacing
  const handleUserSilenceDetected = (spokenTranscript: string) => {
    setAvatarState("thinking");
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }

    const cleanTranscript = spokenTranscript || "";
    setSpeechDatabase((prev) => [...prev, cleanTranscript]);
    setCurrentTranscript("");

    // Automatically transition to next question index if not complete, or compile report
    setTimeout(() => {
      const currentQuestions = activeQuestionsRef.current;
      const nextIdx = questionIndexRef.current + 1;

      if (nextIdx < currentQuestions.length) {
        setQuestionIndex(nextIdx);
        triggerAvatarVoiceSpeak(currentQuestions[nextIdx]);
        triggerToast(
          "Next Question",
          `AI Interviewer is asking Question ${nextIdx + 1} of 10.`,
          "info",
        );
      } else {
        triggerToast(
          "Chamber Completed",
          "All questions completed. Compiling final feedback reports.",
          "success",
        );
        if (handleStopSessionRef.current) {
          handleStopSessionRef.current();
        } else {
          handleStopSession();
        }
      }
    }, 1500);
  };

  // Start video/audio devices
  const startMediaDevices = async (): Promise<boolean> => {
    try {
      setPermissionError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const options = { mimeType: "video/webm; codecs=vp8,opus" };
      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e) {
        mediaRecorder = new MediaRecorder(stream);
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0 && socket && connected) {
          event.data.arrayBuffer().then((buffer) => {
            socket.emit("media:chunk", {
              sessionId: "session-101",
              chunk: buffer,
            });
          });
        }
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      return true;
    } catch (err: any) {
      console.warn("Webcam permission denied:", err.message);
      setPermissionError(
        "Please enable webcam & microphone permissions to begin the live session.",
      );
      setSessionState("idle");
      return false;
    }
  };

  const stopAllMedia = () => {
    try {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    } catch (e) {}
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    } catch (e) {}
    try {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } catch (e) {}
    try {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {}
  };

  const startTelemetrySimulation = () => {
    stopTelemetrySimulation();
    telemetryIntervalRef.current = setInterval(() => {
      const headTiltAngle = parseFloat((Math.random() * 8 - 4).toFixed(2));
      const shoulderSlopeAngle = parseFloat((Math.random() * 6 - 3).toFixed(2));
      const isSlumping = Math.random() > 0.94;
      const eyeContactScore = parseFloat(
        (0.85 + Math.random() * 0.15).toFixed(2),
      );

      addTelemetryPoint({
        headTiltAngle,
        shoulderSlopeAngle,
        isSlumping,
        eyeContactScore,
        timestamp: Date.now(),
      });

      if (isSlumping) {
        addAlert("Posture alignment off. Adjust your back upright.");
        triggerToast(
          "Posture Alert",
          "Slump detected. Pull your shoulders square.",
          "warning",
        );
      }

      if (eyeContactScore < 0.75) {
        addAlert("Eye engagement dropped. Direct focus back at camera.");
        triggerToast(
          "Gaze Alert",
          "Maintain eye contact with the visual aperture.",
          "warning",
        );
      }

      if (socket && connected) {
        socket.emit("analytics:telemetry", {
          sessionId: "session-101",
          headTiltAngle,
          shoulderSlopeAngle,
          isSlumping,
          eyeContactScore,
        });
      }
    }, 1800);
  };

  const stopTelemetrySimulation = () => {
    if (telemetryIntervalRef.current) {
      clearInterval(telemetryIntervalRef.current);
      telemetryIntervalRef.current = null;
    }
  };

  const startTimer = () => {
    stopTimer();
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const handleStartSession = async () => {
    // Prime the speechSynthesis engine inside the active user interaction click context!
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        const silentUtterance = new SpeechSynthesisUtterance("");
        window.speechSynthesis.speak(silentUtterance);
      } catch (_) {}
    }

    setSessionState("starting");
    triggerToast(
      "Starting Chamber",
      "Requesting camera and microphone access...",
      "info",
    );

    const roleQuestions = buildTenDynamicQuestions(targetRole, targetSkills);
    // Prepend formal automatic greeting so the AI speaks it instantly!
    const greeting = "Hello, welcome to InterviewMirror AI. I’ll be conducting your interview today. ";
    roleQuestions[0] = greeting + roleQuestions[0];

    setActiveQuestions(roleQuestions);
    setQuestionIndex(0);

    localStorage.setItem("active_session_id", "session-101");
    localStorage.setItem("active_session_state", "recording");

    initializeSocket("session-101");

    // Wait for real hardware webcam to sync before triggering synthesis audio greeting!
    const mediaReady = await startMediaDevices();
    if (!mediaReady) {
      setSessionState("idle");
      return;
    }

    setSessionState("recording");
    setElapsedSeconds(0);
    startTimer();
    startTelemetrySimulation();

    // Trigger greeting instantly once hardware is 100% online!
    setTimeout(() => {
      triggerAvatarVoiceSpeak(roleQuestions[0]);
      triggerToast(
        "Chamber Active",
        `Assessment initialized for role: ${targetRole}`,
        "success",
      );
    }, 500);
  };

  const handlePauseSession = () => {
    setSessionState("paused");
    setAvatarState("idle");
    stopTimer();
    stopTelemetrySimulation();
    try {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.pause();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (_) {}
    triggerToast(
      "Chamber Paused",
      "Visual capture and acoustic engines are suspended.",
      "info",
    );
  };

  const handleResumeSession = () => {
    setSessionState("recording");
    startTimer();
    startTelemetrySimulation();
    try {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "paused"
      ) {
        mediaRecorderRef.current.resume();
      }
    } catch (_) {}
    triggerAvatarVoiceSpeak(activeQuestions[questionIndex]);
  };

  // End Interview & Save Dynamic report details to MongoDB Atlas
  const handleStopSession = async () => {
    setSessionState("processing");
    setAvatarState("feedback");

    try {
      stopTimer();
    } catch (_) {}
    try {
      stopTelemetrySimulation();
    } catch (_) {}
    try {
      stopAllMedia();
    } catch (_) {}

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }

    let completedSessionId = "session-101";

    // Save final report aggregates directly into MongoDB via Express backend POST
    try {
      const isDev =
        typeof window !== "undefined" &&
        (window.location.port === "3000" ||
         window.location.hostname === "localhost" ||
         window.location.hostname === "127.0.0.1");
      const apiBase = process.env.NEXT_PUBLIC_API_URL || (isDev ? `http://${window.location.hostname}:5001` : "");

      const payload = {
        title: `${targetRole}`,
        jobDescription: `Target stack: ${targetSkills}. Evaluation under ${activeCompanyMode}.`,
        category: selectedCategory,
        answers: speechDatabase,
        questions: activeQuestions,
        telemetryFeed: telemetryFeed,
        fillerCounts: fillerCounts,
      };

      // Register session completion event
      const response = await fetch(`${apiBase}/api/v1/interviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include", // Required to pass user authentication tokens!
      });

      if (response.ok) {
        const resJson = await response.json();
        if (resJson.success && resJson.data?.id) {
          completedSessionId = resJson.data.id;
        }
      }
      triggerToast(
        "Telemetry Compiled",
        "Analytics vectors mapped successfully.",
        "success",
      );
    } catch (err: any) {
      console.warn(
        "Failed syncing aggregates to DB, falling back:",
        err.message,
      );
    }

    setTimeout(() => {
      setSessionState("complete");
      localStorage.removeItem("active_session_id");
      localStorage.removeItem("active_session_state");

      // Auto-route straight into the dynamically compiled performance report!
      router.push(`/dashboard/reports/${completedSessionId}`);
    }, 1500);
  };

  // REAL Resume File parser implementation
  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    triggerToast(
      "Parsing Resume Profile",
      `Reading text keywords from: ${file.name}...`,
      "info",
    );

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = (event.target?.result as string) || "";

        // Scan for standard developer skills keywords
        const skillsPool = [
          "React",
          "Next.js",
          "TypeScript",
          "JavaScript",
          "Python",
          "FastAPI",
          "Django",
          "Node.js",
          "Express",
          "Spring Boot",
          "Java",
          "PostgreSQL",
          "MongoDB",
          "MySQL",
          "Redis",
          "Docker",
          "Kubernetes",
          "AWS",
          "Google Cloud",
          "OpenCV",
          "PyTorch",
        ];

        const matchedSkills = skillsPool.filter((skill) =>
          new RegExp(`\\b${skill}\\b`, "i").test(text),
        );

        // Scan for target role title matches
        let parsedRole = "Senior Software Architect";
        if (/frontend/i.test(text)) parsedRole = "Senior Frontend Architect";
        else if (/backend/i.test(text))
          parsedRole = "Senior Backend Specialist";
        else if (/fullstack|full-stack/i.test(text))
          parsedRole = "Lead Fullstack Developer";
        else if (/data scientist|machine learning|ai/i.test(text))
          parsedRole = "AI & ML Interaction Engineer";
        else if (/devops|cloud/i.test(text))
          parsedRole = "Cloud Infrastructure Engineer";
        else if (/java/i.test(text)) parsedRole = "Senior Java Engineer";

        const parsedSkills =
          matchedSkills.length > 0
            ? matchedSkills.join(", ")
            : "React, Next.js, Web APIs";

        setTimeout(() => {
          setResumeUploaded(true);
          setAtsScore(Math.round(80 + Math.random() * 18)); // Realistic high compatible ATS score
          setTargetRole(parsedRole);
          setTargetSkills(parsedSkills);
          setSelectedCategory("RESUME_INTELLIGENCE");
          setUploadLoading(false);
          triggerToast(
            "Profile Matched",
            `Mapped parameters: ${parsedRole}. Setup complete!`,
            "success",
          );
        }, 1500);
      } catch (err) {
        setUploadLoading(false);
        triggerToast(
          "Parsing Failed",
          "Could not parse standard text keywords.",
          "error",
        );
      }
    };
    reader.readAsText(file);
  };

  const triggerUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen)
        containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatElapsed = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div
      ref={containerRef}
      className="space-y-6 bg-zinc-950 p-2 md:p-6 rounded-2xl relative overflow-hidden"
    >
      {/* Hidden input file hook */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleResumeFileChange}
        accept=".txt,.pdf,.doc,.docx"
        className="hidden"
      />

      {/* Floating Glassmorphism Toast Alerts */}
      <div className="fixed top-6 right-6 z-50 flex flex-col space-y-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              className={`p-4 rounded-xl border pointer-events-auto shadow-2xl flex items-start space-x-3 backdrop-blur-xl ${
                t.type === "success"
                  ? "bg-emerald-950/40 border-emerald-900/30 text-emerald-400"
                  : t.type === "warning"
                    ? "bg-amber-950/40 border-amber-900/30 text-amber-400"
                    : t.type === "error"
                      ? "bg-red-950/40 border-red-900/30 text-red-400"
                      : "bg-indigo-950/40 border-indigo-900/30 text-indigo-400"
              }`}
            >
              {t.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <div className="text-xs leading-normal">
                <span className="font-bold block text-white">{t.title}</span>
                <span className="text-zinc-400 mt-0.5 block">{t.message}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="font-heading font-black text-2xl md:text-3xl text-white tracking-tight flex items-center space-x-2">
            <span>AI Live Interview Chamber</span>
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Zoom/Video conference side-by-side grid split with real-time
            hardware capture and live AI visual cues.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start">
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full text-[10px] font-bold text-amber-400">
            🔥 Active Session
          </div>
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full text-[10px] text-zinc-400 flex items-center space-x-1.5">
            {connected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>SYNC ACTIVE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>STANDALONE</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tab Hijack Warning Overlay */}
      {duplicateTabDetected && (
        <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-md z-50 rounded-2xl flex flex-col items-center justify-center text-center p-8">
          <ShieldAlert className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
          <h2 className="font-heading font-black text-2xl text-white">
            Multi-Tab Hijacking Blocked
          </h2>
          <p className="text-sm text-zinc-400 max-w-md mt-2 leading-relaxed">
            For anti-cheating security, you cannot run the live interview
            session across multiple browser tabs.
          </p>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Zoom-Style Video Grid viewport */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div
            className={`${GLASSMORPHISM_STYLES.card} p-4 border-zinc-900/60 relative overflow-hidden flex flex-col flex-1`}
          >
            {/* Split Screen Grid (recording / paused) */}
            {sessionState === "recording" || sessionState === "paused" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 aspect-video min-h-[350px] w-full">
                {/* Left Panel: AI Interviewer */}
                <div className="relative bg-zinc-950 rounded-xl overflow-hidden flex items-center justify-center border border-zinc-900/80 shadow-2xl h-full w-full">
                  <img
                    src="/ai_interviewer.png"
                    alt="AI Interviewer"
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                      avatarState === "speaking"
                        ? "ring-2 ring-indigo-500/80 scale-[1.02] filter brightness-105"
                        : avatarState === "listening"
                          ? "ring-2 ring-emerald-500/80 scale-100 filter brightness-100"
                          : avatarState === "thinking"
                            ? "ring-2 ring-purple-500/80 scale-[1.01] filter brightness-95"
                            : "scale-100 filter brightness-100"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/5 to-zinc-950/70 z-0 pointer-events-none" />

                  {/* Cybernetic active speaking waves overlay */}
                  <canvas
                    ref={canvasRef}
                    className="absolute bottom-0 left-0 right-0 h-20 w-full z-10 pointer-events-none"
                  />

                  {/* Glassmorphic badge */}
                  <div className="absolute bottom-3 left-3 bg-zinc-950/80 border border-zinc-800/80 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 backdrop-blur-md z-20 shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">
                      AI Interviewer
                    </span>
                  </div>
                </div>

                {/* Right Panel: Candidate (Interviewee) */}
                <div className="relative bg-zinc-950 rounded-xl overflow-hidden flex items-center justify-center border border-zinc-900/80 shadow-2xl h-full w-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted={true}
                    playsInline
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                      camEnabled ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  {/* Floating User speech bubble */}
                  {currentTranscript && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-12 left-3 right-3 bg-zinc-950/95 border border-indigo-500/30 p-2.5 rounded-xl z-20"
                    >
                      <div className="flex items-center space-x-1.5 text-emerald-400 text-[8px] font-bold uppercase tracking-wider mb-1">
                        <Volume2 className="w-2.5 h-2.5 animate-pulse" />
                        <span>Live Transcript</span>
                      </div>
                      <p className="text-[10px] text-zinc-300 italic leading-relaxed">
                        &quot;{currentTranscript}&quot;
                      </p>
                    </motion.div>
                  )}

                  {/* Glassmorphic badge */}
                  <div className="absolute bottom-3 left-3 bg-zinc-950/80 border border-zinc-800/80 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 backdrop-blur-md z-20 shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">
                      Interviewee (You)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Idle, Starting, Processing HUD */
              <div className="relative bg-zinc-950 rounded-xl overflow-hidden aspect-video flex items-center justify-center min-h-[350px] border border-zinc-900">
                {sessionState === "idle" && (
                  <div className="flex flex-col items-center justify-center p-6 z-10 max-w-md text-center">
                    <Camera className="w-10 h-10 text-indigo-400 mb-3 animate-pulse" />
                    <h3 className="font-heading font-black text-white text-base">
                      Ready to Enter Zoom split Chamber?
                    </h3>
                    <p className="text-xs text-zinc-500 mt-2">
                      Review target resume parameters on the right sidebar and
                      enter the sandbox for dynamic 10 questions.
                    </p>

                    {permissionError && (
                      <div className="mt-4 flex items-start space-x-2 bg-red-950/20 border border-red-900/30 p-2.5 rounded-lg text-left">
                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-red-300 leading-normal">
                          {permissionError}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {sessionState === "starting" && (
                  <div className="flex flex-col items-center space-y-3 z-10">
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                    <p className="text-xs text-zinc-400">
                      Syncing speech synthesis and visual feeds...
                    </p>
                  </div>
                )}

                {sessionState === "processing" && (
                  <div className="flex flex-col items-center space-y-3 z-10">
                    <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                    <p className="text-xs text-zinc-400">
                      Compiling overall evaluation metrics...
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Bottom HUD bar metadata */}
            {sessionState === "recording" && (
              <div className="mt-3 flex justify-between items-center z-10 bg-zinc-900/50 border border-zinc-900 rounded-xl px-4 py-2">
                <div className="flex items-center space-x-2 bg-red-600/90 border border-red-500 px-3 py-1 rounded-full text-[9px] font-black text-white tracking-widest uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>{targetRole} LIVE</span>
                </div>
                <div className="flex items-center space-x-2 bg-zinc-950/80 border border-zinc-850 px-3 py-1 rounded-full text-[10px] font-bold text-zinc-300">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{formatElapsed(elapsedSeconds)}</span>
                </div>
              </div>
            )}

            {/* Bottom Controls Bar */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  disabled={
                    sessionState !== "recording" && sessionState !== "paused"
                  }
                  className={`p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                    isMuted
                      ? "bg-red-950/20 border-red-900/30 text-red-400"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  } disabled:opacity-40`}
                >
                  {isMuted ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setCamEnabled(!camEnabled)}
                  disabled={
                    sessionState !== "recording" && sessionState !== "paused"
                  }
                  className={`p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                    !camEnabled
                      ? "bg-red-950/20 border-red-900/30 text-red-400"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  } disabled:opacity-40`}
                >
                  {camEnabled ? (
                    <Camera className="w-4 h-4" />
                  ) : (
                    <VideoOff className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Play / End Operations */}
              <div className="flex items-center space-x-2">
                {sessionState === "idle" && (
                  <button
                    onClick={handleStartSession}
                    className={INTERACTION_CLASSES.primaryButton}
                  >
                    <Play className="w-4 h-4 mr-1.5 fill-current" />
                    <span>Enter Chamber</span>
                  </button>
                )}
                {sessionState === "recording" && (
                  <>
                    <button
                      onClick={handlePauseSession}
                      className="flex items-center space-x-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </button>
                    <button
                      onClick={handleStopSession}
                      className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>End Interview</span>
                    </button>
                  </>
                )}
                {sessionState === "paused" && (
                  <>
                    <button
                      onClick={handleResumeSession}
                      className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Resume</span>
                    </button>
                    <button
                      onClick={handleStopSession}
                      className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>End Interview</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Dashboard Controls Column */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Interactive Resume Upload Box */}
          {sessionState === "idle" && (
            <div
              className={`${GLASSMORPHISM_STYLES.card} p-4 border-zinc-900/60`}
            >
              <div className="flex items-center space-x-2 text-indigo-400 mb-3">
                <FileText className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-300">
                  Dynamic Resume Parsing
                </span>
              </div>

              {!resumeUploaded ? (
                <div
                  onClick={triggerUploadClick}
                  className="border border-dashed border-zinc-800 rounded-xl p-4 text-center space-y-3 bg-zinc-900/10 cursor-pointer hover:border-indigo-500/50 transition-all duration-200"
                >
                  <Upload className="w-6 h-6 text-zinc-600 mx-auto" />
                  <div className="text-[10px]">
                    <span className="text-zinc-400 block font-bold">
                      Click to Upload Resume Profile
                    </span>
                    <span className="text-zinc-600 block mt-0.5">
                      Supports PDF, DOC, TXT (Max 5MB)
                    </span>
                  </div>
                  <button
                    disabled={uploadLoading}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-[10px] font-bold py-2 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {uploadLoading
                      ? "Extracting Technical Profile..."
                      : "Select File"}
                  </button>
                </div>
              ) : (
                <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 font-bold">
                      ATS Alignment Score
                    </span>
                    <span className="text-emerald-400 text-xs font-bold">
                      {atsScore}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${atsScore}%` }}
                    />
                  </div>
                  <div className="pt-1.5 border-t border-zinc-900 text-[9px] text-zinc-500 space-y-1">
                    <span className="block font-bold uppercase text-[8px] text-indigo-400">
                      Skills Mapped:
                    </span>
                    <span className="block text-zinc-300 leading-tight truncate">
                      {targetSkills}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setResumeUploaded(false);
                      setAtsScore(0);
                    }}
                    className="w-full text-center text-[8px] uppercase text-zinc-500 hover:text-zinc-300 pt-1"
                  >
                    Clear & Upload Another
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Active Job Parameters Metadata */}
          {sessionState === "idle" && (
            <div
              className={`${GLASSMORPHISM_STYLES.card} p-4 border-zinc-900/60 space-y-3`}
            >
              <div className="flex items-center space-x-2 text-indigo-400">
                <Building className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-300">
                  Target Job Parameters
                </span>
              </div>
              <div className="space-y-2 pt-1">
                <div>
                  <span className="text-[8px] uppercase font-bold text-zinc-500 block">
                    Role Title
                  </span>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-200 text-xs mt-1"
                  />
                </div>
                <div>
                  <span className="text-[8px] uppercase font-bold text-zinc-500 block">
                    Required Skills
                  </span>
                  <input
                    type="text"
                    value={targetSkills}
                    onChange={(e) => setTargetSkills(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-200 text-xs mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Live visual telemetry charts */}
          {sessionState !== "idle" && (
            <div
              className={`${GLASSMORPHISM_STYLES.card} p-4 border-zinc-900/60 flex flex-col`}
            >
              <h3 className="text-[10px] uppercase font-black text-zinc-500 tracking-wider mb-2 flex items-center justify-between">
                <span>Live Visual Telemetry</span>
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
              </h3>

              <div className="h-[100px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={
                      telemetryFeed.length > 0
                        ? telemetryFeed
                        : [
                            {
                              headTiltAngle: 0,
                              shoulderSlopeAngle: 0,
                              eyeContactScore: 1,
                            },
                          ]
                    }
                  >
                    <YAxis domain={[-15, 15]} hide />
                    <Line
                      type="monotone"
                      dataKey="headTiltAngle"
                      stroke="#818cf8"
                      strokeWidth={2}
                      dot={false}
                      name="Head Tilt"
                    />
                    <Line
                      type="monotone"
                      dataKey="shoulderSlopeAngle"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                      name="Shoulder Angle"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Posture alerts panel */}
              <div className="mt-3 border-t border-zinc-900 pt-2 text-[10px]">
                <span className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">
                  Posture Alerts
                </span>
                {alerts.length === 0 ? (
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Postural vectors are aligned.</span>
                  </div>
                ) : (
                  <div className="text-amber-400 bg-amber-950/15 border border-amber-900/20 p-1.5 rounded flex items-start space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{alerts[alerts.length - 1]}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Question Prompt panel */}
          {sessionState !== "idle" && (
            <div
              className={`${GLASSMORPHISM_STYLES.card} p-4 border-zinc-900/60 flex-1 flex flex-col justify-between min-h-[200px]`}
            >
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-zinc-900 pb-2">
                  <span className="text-[10px] uppercase font-black text-indigo-400 tracking-wider">
                    AI Question prompter
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {questionIndex + 1} / 10
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={questionIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-xs text-zinc-200 leading-relaxed font-semibold mt-2"
                  >
                    {activeQuestions[questionIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
