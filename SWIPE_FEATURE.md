# 🎯 Swipe Gesture Navigation Feature

## Overview

The Conductor AI Assistant now supports **swipe gestures** to navigate between slides! Simply swipe your hand left or right to move through your presentation.

## 🎮 How It Works

### Swipe Left → Next Slide
- Move your **open hand** quickly from **right to left**
- The system detects the movement and advances to the next slide
- Your slide content and AI responses update automatically

### Swipe Right → Previous Slide
- Move your **open hand** quickly from **left to right**
- The system goes back to the previous slide
- Perfect for reviewing earlier content

## 🔧 Technical Details

### Detection Parameters
- **Movement threshold**: 15% of screen width
- **Time window**: 500ms for gesture completion
- **Cooldown**: 1 second between swipes (prevents accidental double-swipes)
- **Minimum positions**: 5 hand positions tracked for reliable detection

### How It's Detected
1. **Hand tracking** - MediaPipe tracks your wrist position (landmark 0)
2. **Position history** - Last 10 positions stored with timestamps
3. **Movement analysis** - Calculates horizontal displacement
4. **Direction determination** - Positive delta = swipe left, negative = swipe right
5. **Trigger** - If movement exceeds threshold, slide changes

## 📊 All Available Gestures

| Gesture | Action | How To |
|---------|--------|--------|
| 👋 Raised Hand | Ask Question | Extend all 5 fingers, hold 1 sec |
| ✊ Fist | Summarize | Close all fingers, hold 1 sec |
| 👉 Swipe Left | Next Slide | Move hand right→left quickly |
| 👈 Swipe Right | Previous Slide | Move hand left→right quickly |

## 💡 Usage Tips

### For Best Results:
1. **Keep hand open** - All fingers extended works best for swipes
2. **Swift motion** - Quick, deliberate movement
3. **Stay in frame** - Keep your hand visible throughout the swipe
4. **Wait for cooldown** - 1 second between swipes
5. **Good lighting** - Helps MediaPipe track accurately

### Common Issues:

**Swipe not detected?**
- Move your hand faster
- Ensure hand stays in camera view
- Try a more exaggerated movement
- Check you're not in cooldown period

**Too sensitive?**
- Adjust `SWIPE_THRESHOLD` in `gestureDetection.ts` (increase value)
- Adjust `SWIPE_TIME_WINDOW` (decrease for faster swipes required)

**Accidental triggers?**
- Increase `SWIPE_COOLDOWN` time
- Increase `SWIPE_THRESHOLD` to require larger movement

## 🎯 Example Workflow

```
Presenting Slide 1:
→ Make fist → Get AI summary
→ Raise hand → Get AI question
→ Swipe left → Move to Slide 2

Presenting Slide 2:
→ Swipe left → Move to Slide 3
→ Swipe right → Back to Slide 2
→ Swipe right → Back to Slide 1
```

## 🎨 UI Features

### Slide Navigation Controls
- **Previous/Next buttons** - Click to navigate manually
- **Slide indicators** - Dots showing current position
- **Slide counter** - "Slide X of Y" display
- **Direct navigation** - Click any dot to jump to that slide

### Visual Feedback
- Swipe gesture label appears on video feed
- Current slide number updates
- Slide content smoothly transitions
- AI responses clear when changing slides

## 🔮 Future Enhancements

Planned improvements for swipe gestures:

- [ ] **Vertical swipes** - Up/down for different actions
- [ ] **Pinch gesture** - Zoom in/out on content
- [ ] **Two-hand gestures** - More complex controls
- [ ] **Gesture customization** - User-defined gestures
- [ ] **Sensitivity settings** - UI controls for thresholds
- [ ] **Gesture macros** - Combine gestures for actions
- [ ] **Voice + gesture** - Multimodal control

## 🧪 Testing

Try these scenarios:

1. **Basic navigation**:
   - Start on slide 1
   - Swipe left 3 times
   - Should reach slide 3
   - Swipe right 2 times
   - Should be on slide 2

2. **Edge cases**:
   - On first slide, swipe right → stays on slide 1
   - On last slide, swipe left → stays on last slide

3. **Combined gestures**:
   - Swipe to new slide
   - Make fist → get summary
   - Swipe again
   - Raise hand → get question

## 📝 Code Structure

### Key Files Modified:

**`gestureDetection.ts`**
- Added `'swipe-left'` and `'swipe-right'` to `GestureType`
- Added `trackHandPosition()` method to `GestureTracker`
- Implements position history and movement analysis

**`useHandTracking.ts`**
- Added `onSwipe` callback prop
- Calls `trackHandPosition()` on each frame
- Triggers `onSwipe` callback when swipe detected

**`ConductorDashboard.tsx`**
- Added `slides` array state
- Added `currentSlideIndex` state
- Implemented `goToSlide()` and `handleSwipe()` functions
- Added navigation UI controls
- Syncs slide content with current index

## 🎉 Ready to Use!

The swipe feature is now fully integrated! Just:

1. **Start the app** as usual
2. **Load your slides** (edit the slides array or add UI to manage slides)
3. **Swipe away** to navigate through your presentation!

---

**Made your presentation even more intuitive! 🚀**
