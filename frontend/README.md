# "Conductor" - AI Presentation Assistant

A real-time, gesture-controlled presentation tool with a built-in AI assistant. This project uses your webcam to track your hand gestures to control slides and get live feedback from a Large Language Model (LLM).

This project is a monorepo containing three parts:
1.  `/frontend`: The React/TypeScript "command center" you see in the browser.
2.  `/gesture-api`: (TODO) A Python backend for CV and LLM logic.
3.  `/slide-controller`: (TODO) A Node.js backend for browser automation.

## Features (Current Frontend)

-   **Real-time Hand Tracking**: Uses `@mediapipe/hands` to detect 21 hand landmarks from your webcam.
-   **Live Visual Feedback**: Draws the hand "skeleton" directly onto the video feed using `<canvas>` so you can see what the AI sees.
-   **Modern Tech Stack**: Built with React, TypeScript, Vite, and Tailwind CSS for a fast, modern developer experience.
-   **AI-Ready UI**: Includes placeholders for displaying AI-generated summaries and Q&A overlays.

## Getting Started (Running the Frontend)

This will run the Part 1 frontend, which is the visual dashboard.

### Prerequisites

-   Node.js (v18 or higher)
-   npm (or `npm.cmd` on PowerShell)

### Installation & Running

1.  **Clone the repository** (if you haven't already).

2.  **Navigate to the frontend folder**:
    ```bash
    cd frontend
    ```

3.  **Install dependencies**:
    ```bash
    npm install
    ```
    *(If you are on PowerShell, you may need to use `npm.cmd install`)*

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  **Open the app**:
    * Open your browser to `http://localhost:5173`.
    * **Allow webcam permission** when prompted.

## How to Use (Current State)

1.  Run the `frontend` project (`npm run dev`).
2.  Open `http://localhost:5173` in your browser.
3.  Allow microphone permission.
4.  Put your hand in front of the camera.
5.  You will see the hand landmarks (a "skeleton") drawn on your hand in real-time.

## Tech Stack (Frontend)

-   **React** (with Hooks)
-   **TypeScript**
-   **Vite**
-   **Tailwind CSS**
-   **`react-webcam`**: For accessing the camera feed.
-   **`@mediapipe/hands`**: For in-browser hand tracking.
-   **`framer-motion`**: For UI animations.

