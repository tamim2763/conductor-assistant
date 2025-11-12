import { useEffect, useRef, useState, useCallback } from 'react';
import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import type { Results } from '@mediapipe/hands';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import Webcam from 'react-webcam';
import { detectGesture, GestureTracker, type GestureResult } from '../utils/gestureDetection';
import { aiService } from '../services/aiService';

interface UseHandTrackingProps {
  webcamRef: React.RefObject<Webcam | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onGestureDetected?: (gesture: GestureResult) => void;
  onAIResponse?: (response: string, command: string) => void;
  onSwipe?: (direction: 'left' | 'right') => void;
  slideText?: string;
}

export function useHandTracking({ 
  webcamRef, 
  canvasRef, 
  onGestureDetected, 
  onAIResponse,
  onSwipe,
  slideText = "Sample slide content about AI and machine learning. This presentation discusses how artificial intelligence can enhance user experiences through gesture recognition and natural language processing."
}: UseHandTrackingProps) {
  const handsRef = useRef<Hands | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const gestureTrackerRef = useRef<GestureTracker>(new GestureTracker());
  const processingRef = useRef<boolean>(false);

  // Process AI command based on gesture
  const processAICommand = async (gestureType: 'raised-hand' | 'fist') => {
    if (processingRef.current || !slideText) return;
    
    processingRef.current = true;
    
    try {
      let result: string;
      let command: string;

      if (gestureType === 'raised-hand') {
        command = 'ask-question';
        result = await aiService.getAudienceQuestion(slideText);
      } else {
        command = 'summarize';
        result = await aiService.summarizeSlide(slideText);
      }

      onAIResponse?.(result, command);
    } catch (error) {
      console.error('AI processing error:', error);
      onAIResponse?.('Error processing request. Is the backend running?', 'error');
    } finally {
      processingRef.current = false;
      gestureTrackerRef.current.reset();
    }
  };

  useEffect(() => {
    // Initialize MediaPipe Hands
    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);
    handsRef.current = hands;

    // Start detection loop
    startDetection();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, []);

  const onResults = (results: Results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match video
    const video = webcamRef.current?.video;
    if (video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // Clear the canvas
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw hand landmarks if detected
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (const landmarks of results.multiHandLandmarks) {
        // Check for swipe gesture first
        const swipeGesture = gestureTrackerRef.current.trackHandPosition(landmarks);
        if (swipeGesture === 'swipe-left') {
          console.log('👈 Swipe LEFT detected in hook!');
          onSwipe?.('left');
        } else if (swipeGesture === 'swipe-right') {
          console.log('👉 Swipe RIGHT detected in hook!');
          onSwipe?.('right');
        }

        // Draw connections between landmarks
        drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 5,
        });

        // Draw individual landmarks
        drawLandmarks(ctx, landmarks, {
          color: '#FF0000',
          lineWidth: 2,
          radius: 6,
        });

        // Detect gesture
        const gesture = detectGesture(landmarks);
        onGestureDetected?.(gesture);

        // Track gesture and trigger AI if needed
        const { shouldTrigger } = gestureTrackerRef.current.trackGesture(gesture);
        
        if (shouldTrigger && (gesture.type === 'raised-hand' || gesture.type === 'fist')) {
          processAICommand(gesture.type);
        }

        // Display gesture info on canvas - flip horizontally to correct mirror effect
        ctx.save();
        ctx.scale(-1, 1); // Flip horizontally
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        
        // Show swipe if detected, otherwise show regular gesture
        const displayText = swipeGesture 
          ? `Swipe ${swipeGesture === 'swipe-left' ? 'Left' : 'Right'} ←→`
          : gesture.description;
        
        ctx.fillText(displayText, -canvas.width + 10, 40); // Adjust x position for flipped canvas
        ctx.restore();
      }
    }

    ctx.restore();
  };

  const startDetection = async () => {
    const video = webcamRef.current?.video;
    const hands = handsRef.current;

    if (
      video &&
      hands &&
      video.readyState === 4 // Video is ready
    ) {
      // Send frame to MediaPipe
      await hands.send({ image: video });
    }

    // Continue the loop
    animationFrameRef.current = requestAnimationFrame(startDetection);
  };

  return {
    isReady: handsRef.current !== null,
  };
}
