"use client";

import { useEffect, useState, useRef } from "react";
import { ScoreStatus, getStatusFromScore, getStatusColor, getStatusBg } from "@/lib/grme-data";

interface AnimatedScoreProps {
  score: number;
  previousScore?: number | null;
  confidence?: number;
  label?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showGrade?: boolean;
  showTrend?: boolean;
  className?: string;
}

const STATUS_DESCRIPTIONS: Record<ScoreStatus, string> = {
  Critical: "Immediate intervention required",
  Developing: "Foundations being established",
  Progressive: "On track with room to grow",
  Exemplary: "Leading practice benchmark",
};

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const from = 0;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return value;
}

const SIZE_CONFIG = {
  sm: { ring: 80, stroke: 6, text: "text-xl", label: "text-[10px]" },
  md: { ring: 110, stroke: 7, text: "text-3xl", label: "text-xs" },
  lg: { ring: 140, stroke: 8, text: "text-4xl", label: "text-sm" },
  xl: { ring: 180, stroke: 10, text: "text-5xl", label: "text-sm" },
};

export default function AnimatedScore({
  score,
  previousScore = null,
  confidence = 100,
  label = "Overall Score",
  size = "xl",
  showGrade = true,
  showTrend = true,
  className = "",
}: AnimatedScoreProps) {
  const animatedScore = useCountUp(Math.round(score));
  const status = getStatusFromScore(score);
  const color = getStatusColor(status);
  const bg = getStatusBg(status);

  const { ring, stroke, text, label: labelText } = SIZE_CONFIG[size];
  const r = (ring - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  const trend =
    previousScore !== null
      ? Math.round(score) - Math.round(previousScore)
      : null;
  const isPreliminary = confidence < 80;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: ring, height: ring }}>
        <svg width={ring} height={ring} className="transform -rotate-90">
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={r}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={stroke}
          />
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-bold tabular-nums ${text} ${isPreliminary ? "opacity-80" : ""}`}
            style={{ color }}
          >
            {animatedScore}
          </span>
          <span className={`${labelText} text-gray-400 font-medium`}>/ 100</span>
        </div>
      </div>

      {showGrade && (
        <div className="mt-3 flex flex-col items-center gap-1">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: isPreliminary ? "#fef3c7" : bg,
              color: isPreliminary ? "#b45309" : color,
            }}
          >
            {isPreliminary ? "Preliminary" : status}
          </span>
          <span className="text-[11px] text-gray-500">
            {isPreliminary
              ? `Confidence ${Math.round(confidence)}%`
              : STATUS_DESCRIPTIONS[status]}
          </span>
        </div>
      )}

      {showTrend && trend !== null && trend !== 0 && (
        <div className="mt-2 flex items-center gap-1">
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
              trend > 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            <svg
              className={`w-3 h-3 ${trend < 0 ? "rotate-180" : ""}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {trend > 0 ? "+" : ""}
            {trend} pts
          </span>
        </div>
      )}

      <span className="mt-2 text-xs text-gray-400 font-medium">{label}</span>
    </div>
  );
}
