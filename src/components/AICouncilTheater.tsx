import React, { useState, useEffect } from "react";
import { Play, Pause, ChevronRight, RotateCcw, MessageSquareCode } from "lucide-react";
import { CouncilDialogue } from "../types";

interface AICouncilTheaterProps {
  dialogues: CouncilDialogue[];
  onFinishSpeak?: () => void;
}

export default function AICouncilTheater({ dialogues, onFinishSpeak }: AICouncilTheaterProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Reset theater if the list of dialogues changes
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(true);
  }, [dialogues]);

  // Handle Autoplay typing speed step transitions
  useEffect(() => {
    if (!isPlaying || dialogues.length === 0) return;

    const timer = setTimeout(() => {
      if (currentStep < dialogues.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        setIsPlaying(false);
        if (onFinishSpeak) onFinishSpeak();
      }
    }, 4500); // 4.5 seconds per council speaker to allow reading

    return () => clearTimeout(timer);
  }, [currentStep, isPlaying, dialogues, onFinishSpeak]);

  const handleNext = () => {
    if (currentStep < dialogues.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setCurrentStep(0);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(true);
  };

  if (dialogues.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center h-full min-h-[300px] shadow-sm">
        <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3 animate-pulse">
          <MessageSquareCode size={20} />
        </div>
        <p className="text-sm font-mono text-slate-700 font-semibold">AI Council Chamber is Dormant</p>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Initiate a simulated event, trigger a sandbox scenario, or ask a What-If query to summon the autonomous operational chiefs to deliberate.
        </p>
      </div>
    );
  }

  // Active speaking dialogue
  const activeSpeaker = dialogues[currentStep];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between h-full shadow-lg relative overflow-hidden">
      
      {/* Absolute Header design */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      
      {/* Council Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
          <h3 className="text-xs font-mono font-bold tracking-widest text-slate-700">
            AUTONOMOUS AI OPERATIONAL COUNCIL
          </h3>
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "Pause Discussion" : "Play Discussion"}
            aria-label={isPlaying ? "Pause Discussion" : "Play Discussion"}
            className="p-1 hover:bg-slate-200 rounded transition text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <button
            onClick={handleNext}
            title="Next Speaker"
            aria-label="Next Speaker"
            className="p-1 hover:bg-slate-200 rounded transition text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ChevronRight size={13} />
          </button>
          <button
            onClick={handleReset}
            title="Restart Discussion"
            aria-label="Restart Discussion"
            className="p-1 hover:bg-slate-200 rounded transition text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Council Members Circle Grid (Highlight active) */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 my-4">
        {dialogues.map((member, idx) => {
          const isActive = idx === currentStep;
          return (
            <button
              key={`${member.name}-${idx}`}
              onClick={() => {
                setCurrentStep(idx);
                setIsPlaying(false);
              }}
              aria-label={`Select speaker ${member.name}, role ${member.role}`}
              className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 border cursor-pointer ${
                isActive
                  ? "bg-purple-50 border-purple-300 shadow-md shadow-purple-100 scale-105"
                  : "bg-slate-50 border-slate-100 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="text-xl mb-1">{member.avatar}</div>
              <span className="text-[9px] font-mono font-semibold tracking-tight text-slate-600 truncate w-full text-center">
                {member.role}
              </span>
              {isActive && (
                <span className="h-1 w-1 rounded-full bg-purple-500 mt-1 animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* Primary Speech Display Card */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 relative min-h-[120px] flex flex-col justify-between">
        
        {/* Active speaker bio */}
        <div className="flex items-center gap-3 mb-2.5">
          <div className="h-10 w-10 rounded-xl bg-purple-100/80 border border-purple-200 flex items-center justify-center text-2xl shadow-inner animate-pulse">
            {activeSpeaker.avatar}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 font-mono tracking-tight">
              {activeSpeaker.name}
            </h4>
            <div className="flex items-center gap-1 text-[10px] font-mono text-purple-600 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-ping" />
              <span>STADIUM CHIEF: {activeSpeaker.role.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* The message */}
        <p className="text-slate-600 font-sans text-xs sm:text-sm leading-relaxed tracking-wide italic pl-2 border-l-2 border-purple-500/50 my-2">
          "{activeSpeaker.message}"
        </p>

        {/* Discussion Progress Line */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2">
          <span>COUNCIL BROADCAST STATUS: SECURE LIGHT FEED</span>
          <span>
            SPEAKER {currentStep + 1} OF {dialogues.length}
          </span>
        </div>
      </div>

      {/* Progress timeline line under dialogue */}
      <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-3">
        <div
          className="bg-purple-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / dialogues.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
