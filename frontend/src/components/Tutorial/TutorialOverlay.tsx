import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, MousePointer2 } from 'lucide-react';
import { Tile } from '../Tile/Tile';
import { useTranslation } from '../../i18n/useLanguage';

interface TutorialOverlayProps {
    onClose: () => void;
    onComplete: () => void;
}

const STEP_IDS = ['intro', 'drafting', 'pattern', 'wall', 'penalty'] as const;
type StepId = typeof STEP_IDS[number];

export function TutorialOverlay({ onClose, onComplete }: TutorialOverlayProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [doNotShowAgain, setDoNotShowAgain] = useState(false);
    const { t } = useTranslation();

    // Map step IDs to translation keys
    const getStepContent = (stepId: StepId) => {
        const contentMap: Record<StepId, { title: string; content: string }> = {
            intro: { title: t.tutorialIntroTitle, content: t.tutorialIntroContent },
            drafting: { title: t.tutorialDraftTitle, content: t.tutorialDraftContent },
            pattern: { title: t.tutorialPatternTitle, content: t.tutorialPatternContent },
            wall: { title: t.tutorialWallTitle, content: t.tutorialWallContent },
            penalty: { title: t.tutorialPenaltyTitle, content: t.tutorialPenaltyContent },
        };
        return contentMap[stepId];
    };

    const stepId = STEP_IDS[currentStepIndex];
    const stepContent = getStepContent(stepId);

    const handleNext = () => {
        if (currentStepIndex < STEP_IDS.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const handleComplete = () => {
        if (doNotShowAgain) {
            localStorage.setItem('ladrilho_tutorial_completed', 'true');
        }
        onComplete();
    };

    const handleClose = () => {
        if (doNotShowAgain) {
            localStorage.setItem('ladrilho_tutorial_completed', 'true');
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl h-full max-h-[80vh] pointer-events-none flex items-center justify-center">
                {/* Spotlight / Highlight Area - This would ideally be dynamic based on element positions */}
                {/* For this implementation, we focus on the central modal and animations */}

                {/* Modal Card */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 w-[90%] max-w-lg pointer-events-auto relative overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            {stepContent.title}
                        </h2>
                        <button onClick={handleClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Animation Area */}
                    <div className="bg-slate-950/50 rounded-xl h-64 mb-6 flex items-center justify-center relative overflow-hidden border border-slate-800">
                        <AnimatePresence mode="wait">
                            {stepId === 'intro' && (
                                <motion.div
                                    key="intro"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center"
                                >
                                    <Tile color="first-player" size="lg" disabled />
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl"
                                    />
                                </motion.div>
                            )}

                            {stepId === 'drafting' && (
                                <motion.div key="drafting" className="relative w-full h-full flex items-center justify-center">
                                    {/* Factory Mock */}
                                    <div className="absolute left-10 p-4 bg-slate-800 rounded-full border border-slate-700 grid grid-cols-2 gap-2 w-24 h-24">
                                        <Tile color="blue" size="sm" disabled />
                                        <Tile color="blue" size="sm" disabled />
                                        <Tile color="red" size="sm" disabled />
                                        <Tile color="yellow" size="sm" disabled />
                                    </div>

                                    {/* Player Hand / Target */}
                                    <div className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-500 text-xs text-center border-2 border-dashed border-slate-700 rounded-lg p-2 w-20 h-20 flex flex-col items-center justify-center">
                                        Hand
                                    </div>

                                    {/* Ghost Cursor Animation */}
                                    <motion.div
                                        initial={{ x: -100, y: 50, opacity: 0 }}
                                        animate={[
                                            { x: -100, y: 50, opacity: 1 }, // Start
                                            { x: -100, y: 0, opacity: 1 },  // Move to tile
                                            { scale: 0.9 },                 // Click
                                            { scale: 1 },                   // Release
                                        ] as any}
                                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                                        className="absolute z-20"
                                    >
                                        <MousePointer2 className="text-white fill-white drop-shadow-lg" size={32} />
                                    </motion.div>

                                    {/* Moving Tiles Animation */}
                                    <motion.div
                                        initial={{ x: -110, y: 0, opacity: 0 }}
                                        animate={[
                                            { opacity: 0, x: -110, y: 0 },
                                            { opacity: 1, x: -110, y: 0, transition: { delay: 1.5 } }, // Appear after click
                                            { x: 110, y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeInOut" } }, // Move to hand
                                            { opacity: 0, transition: { delay: 0.2 } }
                                        ] as any}
                                        transition={{ repeat: Infinity, repeatDelay: 2, duration: 3 }}
                                        className="absolute z-10 flex gap-2"
                                    >
                                        <Tile color="blue" size="sm" disabled />
                                        <Tile color="blue" size="sm" disabled />
                                    </motion.div>
                                </motion.div>
                            )}

                            {stepId === 'pattern' && (
                                <motion.div key="pattern" className="relative w-full h-full flex items-center justify-center">
                                    <div className="flex flex-col gap-2 items-end">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="flex gap-1">
                                                {Array.from({ length: i }).map((_, j) => (
                                                    <div key={j} className="w-8 h-8 bg-slate-800 rounded border border-slate-700" />
                                                ))}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Evaluating "Right to Left" fill */}
                                    <motion.div
                                        initial={{ x: 100, y: 0, opacity: 0 }}
                                        animate={{ x: 0, y: 0, opacity: 1 }}
                                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                                        className="absolute ml-40 mt-10"
                                    >
                                        <Tile color="blue" size="sm" disabled />
                                    </motion.div>
                                </motion.div>
                            )}

                            {stepId === 'wall' && (
                                <motion.div key="wall" className="relative w-full h-full flex items-center justify-center gap-8">
                                    {/* Pattern Line Full */}
                                    <div className="flex gap-1">
                                        <Tile color="red" size="sm" disabled />
                                        <Tile color="red" size="sm" disabled />
                                        <Tile color="red" size="sm" disabled />
                                    </div>

                                    {/* Arrow */}
                                    <ChevronRight className="text-slate-600" />

                                    {/* Wall Grid */}
                                    <div className="grid grid-cols-5 gap-1 p-2 bg-slate-800 rounded">
                                        <div className="w-8 h-8 bg-slate-700/50 rounded flex items-center justify-center opacity-20"><Tile color="blue" size="sm" disabled /></div>
                                        <div className="w-8 h-8 bg-slate-700/50 rounded flex items-center justify-center opacity-20"><Tile color="yellow" size="sm" disabled /></div>
                                        <div className="relative w-8 h-8 bg-slate-700/50 rounded flex items-center justify-center">
                                            {/* Target Slot */}
                                            <motion.div
                                                initial={{ x: -100, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1.5 }}
                                            >
                                                <Tile color="red" size="sm" disabled />
                                            </motion.div>
                                        </div>
                                        <div className="w-8 h-8 bg-slate-700/50 rounded flex items-center justify-center opacity-20"><Tile color="black" size="sm" disabled /></div>
                                        <div className="w-8 h-8 bg-slate-700/50 rounded flex items-center justify-center opacity-20"><Tile color="white" size="sm" disabled /></div>
                                    </div>

                                    {/* Score Popup */}
                                    <motion.div
                                        initial={{ y: 0, opacity: 0 }}
                                        animate={{ y: -20, opacity: [0, 1, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1.5, delay: 0.8 }}
                                        className="absolute right-10 top-10 text-xl font-bold text-yellow-400"
                                    >
                                        +1
                                    </motion.div>
                                </motion.div>
                            )}

                            {stepId === 'penalty' && (
                                <motion.div key="penalty" className="relative w-full h-full flex flex-col items-center justify-center gap-4">
                                    <div className="text-red-400 font-bold mb-2">Overflow!</div>
                                    <div className="flex gap-2 p-4 border-b-2 border-red-500/50 w-3/4 justify-center bg-red-900/10">
                                        <Tile color="red" size="sm" disabled />
                                        <Tile color="red" size="sm" disabled />
                                        <div className="w-8 h-8 border border-dashed border-red-500/30 rounded" />
                                    </div>
                                    <p className="text-xs text-red-300">-1 per tile</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Content */}
                    <div className="min-h-[80px]">
                        <p className="text-slate-300 text-lg leading-relaxed">
                            {stepContent.content}
                        </p>
                    </div>

                    {/* Footer / Nav */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-700/50">
                        <div className="flex gap-2">
                            {STEP_IDS.map((_, idx: number) => (
                                <div
                                    key={idx}
                                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentStepIndex ? 'w-8 bg-blue-500' : 'w-2 bg-slate-700'
                                        }`}
                                />
                            ))}
                        </div>

                        <div className="flex gap-3">
                            {currentStepIndex > 0 && (
                                <button
                                    onClick={handleBack}
                                    className="px-4 py-2 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <ChevronLeft size={16} /> {t.tutorialBack}
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2"
                            >
                                {currentStepIndex === STEP_IDS.length - 1 ? t.tutorialFinish : t.tutorialNext}
                                {currentStepIndex !== STEP_IDS.length - 1 && <ChevronRight size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Don't show again checkbox */}
                    <div className="mt-4 flex items-center justify-center">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-400 text-sm hover:text-slate-300">
                            <input
                                type="checkbox"
                                checked={doNotShowAgain}
                                onChange={(e) => setDoNotShowAgain(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                            />
                            {t.tutorialDontShowAgain}
                        </label>
                    </div>

                </motion.div>
            </div>
        </div>
    );
}
