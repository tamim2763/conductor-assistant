/**
 * Gesture Detection Utilities
 * Detects hand gestures from MediaPipe hand landmarks
 */

import type { NormalizedLandmark } from '@mediapipe/hands';

export type GestureType = 'raised-hand' | 'fist' | 'swipe-left' | 'swipe-right' | 'none';

export interface GestureResult {
  type: GestureType;
  confidence: number;
  description: string;
}

/**
 * Detect if fingers are extended based on landmarks
 */
function isFingerExtended(
  landmarks: NormalizedLandmark[],
  fingerTipIndex: number,
  fingerPipIndex: number,
  fingerMcpIndex: number
): boolean {
  const tip = landmarks[fingerTipIndex];
  const pip = landmarks[fingerPipIndex];
  const mcp = landmarks[fingerMcpIndex];

  // Finger is extended if tip is higher (lower y value) than pip and mcp
  return tip.y < pip.y && pip.y < mcp.y;
}

/**
 * Detect if thumb is extended
 */
function isThumbExtended(landmarks: NormalizedLandmark[]): boolean {
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const thumbMcp = landmarks[2];

  // Thumb is extended if tip is farther from palm than IP joint
  const distance = Math.abs(thumbTip.x - thumbMcp.x);
  const ipDistance = Math.abs(thumbIp.x - thumbMcp.x);
  
  return distance > ipDistance;
}

/**
 * Count extended fingers
 */
function countExtendedFingers(landmarks: NormalizedLandmark[]): number {
  let count = 0;

  // Check thumb
  if (isThumbExtended(landmarks)) count++;

  // Check index finger (tip: 8, pip: 6, mcp: 5)
  if (isFingerExtended(landmarks, 8, 6, 5)) count++;

  // Check middle finger (tip: 12, pip: 10, mcp: 9)
  if (isFingerExtended(landmarks, 12, 10, 9)) count++;

  // Check ring finger (tip: 16, pip: 14, mcp: 13)
  if (isFingerExtended(landmarks, 16, 14, 13)) count++;

  // Check pinky (tip: 20, pip: 18, mcp: 17)
  if (isFingerExtended(landmarks, 20, 18, 17)) count++;

  return count;
}

/**
 * Detect if hand is making a fist
 */
function detectFist(landmarks: NormalizedLandmark[]): boolean {
  const extendedFingers = countExtendedFingers(landmarks);
  
  // Fist: no fingers or at most 1 finger extended
  return extendedFingers <= 1;
}

/**
 * Detect if hand is raised (open palm)
 */
function detectRaisedHand(landmarks: NormalizedLandmark[]): boolean {
  const extendedFingers = countExtendedFingers(landmarks);
  
  // Raised hand: 4 or 5 fingers extended
  return extendedFingers >= 4;
}

/**
 * Main gesture detection function
 */
export function detectGesture(landmarks: NormalizedLandmark[]): GestureResult {
  if (!landmarks || landmarks.length === 0) {
    return {
      type: 'none',
      confidence: 0,
      description: 'No hand detected',
    };
  }

  const extendedFingers = countExtendedFingers(landmarks);

  // Check for raised hand first (higher priority)
  if (detectRaisedHand(landmarks)) {
    return {
      type: 'raised-hand',
      confidence: 0.9,
      description: `Raised Hand (${extendedFingers} fingers extended) - Ask Question`,
    };
  }

  // Check for fist
  if (detectFist(landmarks)) {
    return {
      type: 'fist',
      confidence: 0.9,
      description: `Fist (${extendedFingers} fingers extended) - Summarize`,
    };
  }

  // No specific gesture detected
  return {
    type: 'none',
    confidence: 0.5,
    description: `${extendedFingers} fingers extended`,
  };
}

/**
 * Gesture state tracker to avoid multiple triggers and track swipes
 */
export class GestureTracker {
  private lastGesture: GestureType = 'none';
  private gestureStartTime: number = 0;
  private readonly GESTURE_HOLD_TIME = 1000; // 1 second hold
  private gestureTriggered: boolean = false;
  
  // Swipe tracking
  private handPositions: { x: number; timestamp: number }[] = [];
  private readonly SWIPE_HISTORY_LENGTH = 10;
  private readonly SWIPE_THRESHOLD = 0.15; // 15% of screen width
  private readonly SWIPE_TIME_WINDOW = 500; // 500ms window
  private lastSwipeTime: number = 0;
  private readonly SWIPE_COOLDOWN = 1000; // 1 second between swipes

  /**
   * Track hand position for swipe detection
   */
  trackHandPosition(landmarks: NormalizedLandmark[]): GestureType | null {
    if (!landmarks || landmarks.length === 0) return null;

    const wrist = landmarks[0]; // Wrist is landmark 0
    const currentTime = Date.now();

    // Add current position to history
    this.handPositions.push({ x: wrist.x, timestamp: currentTime });

    // Keep only recent positions
    this.handPositions = this.handPositions.filter(
      pos => currentTime - pos.timestamp < this.SWIPE_TIME_WINDOW
    );

    // Need at least 5 positions for reliable swipe detection
    if (this.handPositions.length < 5) return null;

    // Check if we're in cooldown period
    if (currentTime - this.lastSwipeTime < this.SWIPE_COOLDOWN) return null;

    const firstPos = this.handPositions[0];
    const lastPos = this.handPositions[this.handPositions.length - 1];
    const deltaX = lastPos.x - firstPos.x;

    // Debug logging
    console.log('Swipe detection:', {
      positions: this.handPositions.length,
      deltaX: deltaX.toFixed(3),
      threshold: this.SWIPE_THRESHOLD,
      absDeltaX: Math.abs(deltaX).toFixed(3),
    });

    // Detect swipe right (hand physically moves right, deltaX increases)
    // In user's view: swipe right = next slide
    if (deltaX > this.SWIPE_THRESHOLD) {
      console.log('🎯 SWIPE RIGHT detected! (Next slide)');
      this.lastSwipeTime = currentTime;
      this.handPositions = []; // Clear history
      return 'swipe-right';
    }

    // Detect swipe left (hand physically moves left, deltaX decreases)
    // In user's view: swipe left = previous slide
    if (deltaX < -this.SWIPE_THRESHOLD) {
      console.log('🎯 SWIPE LEFT detected! (Previous slide)');
      this.lastSwipeTime = currentTime;
      this.handPositions = []; // Clear history
      return 'swipe-left';
    }

    return null;
  }

  /**
   * Track gesture and determine if it should trigger an action
   */
  trackGesture(gesture: GestureResult): { shouldTrigger: boolean; gesture: GestureResult } {
    const currentTime = Date.now();

    // If gesture changed, reset tracking
    if (gesture.type !== this.lastGesture) {
      this.lastGesture = gesture.type;
      this.gestureStartTime = currentTime;
      this.gestureTriggered = false;
      return { shouldTrigger: false, gesture };
    }

    // If gesture is held long enough and not yet triggered
    if (
      gesture.type !== 'none' &&
      !this.gestureTriggered &&
      currentTime - this.gestureStartTime >= this.GESTURE_HOLD_TIME
    ) {
      this.gestureTriggered = true;
      return { shouldTrigger: true, gesture };
    }

    return { shouldTrigger: false, gesture };
  }

  /**
   * Reset the tracker
   */
  reset() {
    this.lastGesture = 'none';
    this.gestureStartTime = 0;
    this.gestureTriggered = false;
  }
}
