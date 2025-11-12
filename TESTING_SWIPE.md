# 🧪 Testing Swipe Gesture Detection

## What I Fixed

### 1. **Improved Swipe Sensitivity**
- **Lowered threshold**: 10% screen width (was 15%)
- **Increased time window**: 600ms (was 500ms)
- **Reduced cooldown**: 800ms (was 1000ms)
- **Result**: Easier to trigger swipes

### 2. **Fixed Direction Mapping**
- Swipe **right** (hand moves right) → **Next slide**
- Swipe **left** (hand moves left) → **Previous slide**

### 3. **Added Debug Logging**
- Console shows swipe detection in real-time
- Shows deltaX values and thresholds
- Shows which slide you're navigating to

## 🎯 How to Test

### Open the App
1. Frontend is running at: http://localhost:5173
2. Open browser console (F12) to see debug logs
3. Allow camera access

### Test Swipe Detection

#### Test 1: Swipe Right (Next Slide)
1. Start on Slide 1 (shown at bottom)
2. Hold your **open hand** in front of camera
3. **Quickly move hand to the RIGHT** (like pushing something away)
4. Watch console for: `🎯 SWIPE RIGHT detected!`
5. Should advance to Slide 2

#### Test 2: Swipe Left (Previous Slide)
1. Make sure you're on Slide 2 or 3
2. Hold your **open hand** in front of camera
3. **Quickly move hand to the LEFT** (like pulling something toward you)
4. Watch console for: `🎯 SWIPE LEFT detected!`
5. Should go back one slide

## 📊 What to Watch in Console

You'll see logs like this:

```
Swipe detection: {positions: 8, deltaX: 0.045, threshold: 0.1, absDeltaX: 0.045}
Swipe detection: {positions: 9, deltaX: 0.087, threshold: 0.1, absDeltaX: 0.087}
Swipe detection: {positions: 10, deltaX: 0.123, threshold: 0.1, absDeltaX: 0.123}
🎯 SWIPE RIGHT detected! (Next slide)
👉 Swipe RIGHT detected in hook!
📱 Swipe detected in Dashboard: right
Current slide: 0 / 2
Going to NEXT slide: 1
```

## ✅ Success Criteria

**Swipe is working if:**
- ✅ You see debug logs in console when you swipe
- ✅ deltaX value changes as you move your hand
- ✅ When deltaX exceeds 0.1, you see "SWIPE detected!"
- ✅ Slide number at bottom changes
- ✅ Slide text content updates

## 🐛 Troubleshooting

### "No swipe detection logs at all"
**Problem**: Hand tracking not working
- Check if camera is on (green "Live" badge)
- Check if hand landmarks are drawing (green lines on your hand)
- Move hand closer to camera

### "Logs show deltaX but never exceed threshold"
**Problem**: Movement too small
- Make a **bigger, faster** swipe motion
- Try moving your entire arm, not just wrist
- Current threshold is 0.1 (10% of screen width)

### "deltaX going wrong direction"
**Problem**: Check which way deltaX changes
- Move hand right → deltaX should **increase** (positive)
- Move hand left → deltaX should **decrease** (negative)
- If reversed, the camera mirroring might be different

### "Swipe detected but slide doesn't change"
**Problem**: Navigation logic issue
- Check console for "Going to NEXT/PREVIOUS slide: X"
- Check if slide index is clamped (can't go below 0 or above 2)
- Verify slide content actually changes in UI

### "Too sensitive / Too many false triggers"
**Try this**: Increase threshold in `gestureDetection.ts`:
```typescript
private readonly SWIPE_THRESHOLD = 0.15; // Increase from 0.10
```

### "Not sensitive enough"
**Try this**: Decrease threshold:
```typescript
private readonly SWIPE_THRESHOLD = 0.08; // Decrease from 0.10
```

## 🎮 Alternative Test: Manual Navigation

If swipe still doesn't work, you can use the buttons:
- Click **"Previous"** button → Go to previous slide
- Click **"Next"** button → Go to next slide
- Click **slide dots** at bottom → Jump to specific slide

This confirms the slide navigation logic works, isolating the swipe detection issue.

## 📝 What Values Mean

- **positions**: Number of hand positions tracked (need 5+ for detection)
- **deltaX**: Horizontal movement (-1.0 to +1.0)
  - Positive = hand moving right
  - Negative = hand moving left
- **threshold**: Minimum movement required (0.1 = 10% of screen)
- **absDeltaX**: Absolute value (magnitude of movement)

## 🎯 Expected Behavior

### Normal Flow:
1. Hand enters frame → tracking starts
2. Hand moves → positions accumulate
3. After 5+ positions → swipe detection active
4. Movement > threshold → swipe triggered!
5. 800ms cooldown → prevents double-swipes
6. Ready for next swipe

### Edge Cases:
- **First slide + swipe left**: Stays on slide 1 (can't go lower)
- **Last slide + swipe right**: Stays on slide 3 (can't go higher)
- **During cooldown**: Swipes ignored (prevents spam)

---

**Let me know what you see in the console! 🚀**
