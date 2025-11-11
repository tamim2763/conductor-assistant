import { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { useHandTracking } from '../hooks/useHandTracking';
import type { GestureResult } from '../utils/gestureDetection';

const containerVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.36 } },
};

export default function ConductorDashboard() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Sample slides array - user can add more
  const [slides, setSlides] = useState([
    "Sample slide 1: This presentation discusses the implementation of an AI-powered gesture recognition system. The system uses MediaPipe for hand tracking and integrates with a Rust backend that leverages Google's Gemini API for intelligent text analysis.",
    "Sample slide 2: Key features include real-time gesture detection, natural language processing, and seamless frontend-backend communication. The architecture is built with React and TypeScript for the frontend, with Rust powering the backend API.",
    "Sample slide 3: Hand gestures enable intuitive control - raise your hand to get AI-suggested questions, make a fist to summarize key points, and swipe left or right to navigate between slides."
  ]);
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideText, setSlideText] = useState(slides[0]);
  const [aiResponse, setAIResponse] = useState<string>('');
  const [lastCommand, setLastCommand] = useState<string>('');
  const [currentGesture, setCurrentGesture] = useState<GestureResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [swipeNotification, setSwipeNotification] = useState<string>('');

  // Handle slide navigation
  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index);
      setSlideText(slides[index]);
      setAIResponse(''); // Clear AI response when changing slides
      setLastCommand('');
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    console.log('📱 Swipe detected in Dashboard:', direction);
    console.log('Current slide:', currentSlideIndex, '/', slides.length - 1);
    
    if (direction === 'right') {
      // Swipe right (hand moves right) = next slide
      const nextIndex = Math.min(slides.length - 1, currentSlideIndex + 1);
      console.log('Going to NEXT slide:', nextIndex);
      
      // Show notification
      if (nextIndex > currentSlideIndex) {
        setSwipeNotification('👉 Swipe Right - Next Slide');
        setTimeout(() => setSwipeNotification(''), 2000);
      }
      
      goToSlide(nextIndex);
    } else {
      // Swipe left (hand moves left) = previous slide
      const prevIndex = Math.max(0, currentSlideIndex - 1);
      console.log('Going to PREVIOUS slide:', prevIndex);
      
      // Show notification
      if (prevIndex < currentSlideIndex) {
        setSwipeNotification('👈 Swipe Left - Previous Slide');
        setTimeout(() => setSwipeNotification(''), 2000);
      }
      
      goToSlide(prevIndex);
    }
  };

  const handleGestureDetected = (gesture: GestureResult) => {
    setCurrentGesture(gesture);
  };

  const handleAIResponse = (response: string, command: string) => {
    setAIResponse(response);
    setLastCommand(command);
    setIsProcessing(false);

    // tidy up response after 10s only if still same command
    setTimeout(() => {
      setAIResponse((prev) => (lastCommand === command ? '' : prev));
      setLastCommand((prev) => (lastCommand === command ? '' : prev));
    }, 10000);
  };

  useHandTracking({
    webcamRef,
    canvasRef,
    onGestureDetected: handleGestureDetected,
    onAIResponse: (response, command) => {
      setIsProcessing(true);
      handleAIResponse(response, command);
    },
    onSwipe: handleSwipe,
    slideText,
  });

  return (
    <div className="relative w-screen h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white overflow-hidden">
      {/* Page content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full h-full flex flex-col"
      >
        {/* Header */}
        <motion.header variants={itemVariants} className="pt-24 px-8 pb-10 text-center">
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300">
            CONDUCTOR
          </h1>
          <p className="text-sm md:text-base text-slate-300/70 font-light tracking-wide mb-8">
            AI-Powered Gesture Intelligence
          </p>
        </motion.header>

        {/* Main layout */}
        <div className="flex-1 px-8 py-6 flex gap-8">
          {/* Left column */}
          <motion.section variants={itemVariants} className="flex-1 flex flex-col gap-4">
            {/* Webcam card */}
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/6 shadow-xl bg-white/6">
              {/* webcam */}
              <Webcam
                ref={webcamRef}
                mirrored={true}
                className="w-full h-full object-cover"
                screenshotFormat="image/jpeg"
              />

              <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" style={{ transform: 'scaleX(-1)' }} />

              {/* Live badge (static, no ping) */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/8">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-medium text-white">Live</span>
              </div>

              {/* Gesture indicator — subtle appear (no infinite animation) */}
              <AnimatePresence>
                {currentGesture && currentGesture.type !== 'none' && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.28 }}
                    className="absolute top-20 right-4 bg-black/70 backdrop-blur-sm text-white px-5 py-3 rounded-xl border border-white/10 shadow-xl max-w-xs"
                  >
                    <div className="text-3xl mb-1 select-none">
                      {currentGesture.type === 'raised-hand' ? '✋' : '✊'}
                    </div>
                    <p className="font-semibold text-sm leading-tight">{currentGesture.description}</p>
                    <p className="text-xs text-slate-300/70 mt-1">{(currentGesture.confidence * 100).toFixed(0)}% confident</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Swipe notification */}
              <AnimatePresence>
                {swipeNotification && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ duration: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500/90 to-purple-500/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl border border-white/20 shadow-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl animate-pulse">
                        {swipeNotification.includes('Right') ? '👉' : '👈'}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{swipeNotification}</p>
                        <p className="text-xs text-white/80">Slide {currentSlideIndex + 1} of {slides.length}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Processing overlay */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center px-6"
                  >
                    <div className="mb-4">
                      <div className="w-14 h-14 rounded-full border-4 border-white/10 border-t-white animate-spin" />
                    </div>
                    <p className="text-white text-base font-semibold">Analyzing with AI…</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Gesture guide simplified glass cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
              {[
                { icon: '✋', title: 'Raise Hand', desc: 'Ask Question' },
                { icon: '✊', title: 'Make Fist', desc: 'Summarize' },
                { icon: '👈', title: 'Swipe Left/Right', desc: 'Navigate Slides' },
              ].map((g, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="bg-white/6 backdrop-blur-sm rounded-xl p-4 border border-white/8 cursor-default"
                >
                  <div className="text-3xl mb-2">{g.icon}</div>
                  <p className="text-white font-bold text-sm">{g.title}</p>
                  <p className="text-slate-300 text-xs mt-1">{g.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* Right column */}
          <motion.aside variants={itemVariants} className="flex-1 flex flex-col min-h-0 gap-4">
            {/* Slide navigation */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => goToSlide(currentSlideIndex - 1)}
                disabled={currentSlideIndex === 0}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:opacity-50 rounded-lg border border-white/10 text-white font-semibold transition-all disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-slate-300 text-sm">
                  Slide {currentSlideIndex + 1} of {slides.length}
                </span>
                <div className="flex gap-1">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToSlide(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentSlideIndex 
                          ? 'bg-blue-400 w-6' 
                          : 'bg-white/20 hover:bg-white/40'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => goToSlide(currentSlideIndex + 1)}
                disabled={currentSlideIndex === slides.length - 1}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:opacity-50 rounded-lg border border-white/10 text-white font-semibold transition-all disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>

            {/* Slide content editor */}
            <motion.div whileHover={{ y: -2 }} className="rounded-2xl overflow-hidden border border-white/6 bg-white/6 p-6 shadow-lg">
              <label className="flex items-center gap-3 text-white font-semibold mb-3 text-lg">
                <span className="text-2xl">📝</span>
                <span className="text-base">Slide Content</span>
              </label>
              <textarea
                value={slideText}
                onChange={(e) => {
                  setSlideText(e.target.value);
                  // Update the slide in the array
                  const newSlides = [...slides];
                  newSlides[currentSlideIndex] = e.target.value;
                  setSlides(newSlides);
                }}
                placeholder="Paste your slide content here..."
                className="w-full bg-transparent text-white placeholder-slate-400 border border-white/8 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm leading-relaxed resize-none"
                rows={6}
              />
            </motion.div>

            {/* AI Response / Empty state */}
            <AnimatePresence mode="wait">
              {aiResponse ? (
                <motion.div
                  key="response"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.28 }}
                  className="flex-1 bg-white/6 backdrop-blur-sm rounded-2xl p-6 border border-white/8 shadow-lg overflow-auto"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-4xl select-none">
                      {lastCommand === 'ask-question' ? '💡' : '📊'}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">
                        {lastCommand === 'ask-question' ? 'Likely Audience Question' : 'Key Takeaway'}
                      </h3>
                      <p className="text-slate-300 text-xs">
                        {lastCommand === 'ask-question' ? 'What your audience might ask' : 'Core message of this slide'}
                      </p>
                    </div>
                  </div>

                  <p className="text-white text-sm leading-relaxed font-light">{aiResponse}</p>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.28 }}
                  className="flex-1 bg-white/4 backdrop-blur-sm border border-white/8 rounded-2xl flex items-center justify-center"
                >
                  <div className="text-center px-6">
                    <div className="text-6xl mb-3 select-none">🤖</div>
                    <h3 className="text-white font-bold text-xl mb-1">Ready for Input</h3>
                    <p className="text-slate-300 text-sm">Raise your hand or make a fist</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </div>
      </motion.div>

      {/* Footer badge (subtle) */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/8">
          <span className="text-xs text-slate-300">Powered by</span>
          <span className="text-sm font-semibold text-blue-300">Gemini AI</span>
        </div>
      </motion.div>
    </div>
  );
}
