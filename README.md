<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Deployed Link

Deployed Link: https://sentinelos-x-152867382077.us-west1.run.app/

# AI Stadium Crowd Intelligence & Emergency Response System

## Overview

AI Stadium Crowd Intelligence & Emergency Response System is an AI-powered real-time crowd monitoring and safety platform designed for large-scale sports events such as the IPL.

The platform combines Computer Vision, Predictive Analytics, Crowd Intelligence, and Emergency Automation to prevent overcrowding, detect anomalies, predict stampede risks, and provide personalized evacuation guidance for safer and smarter stadium operations.

The system acts as a centralized command center for organizers, security teams, medical staff, and emergency responders.

---

# Problem Statement

Large-scale sports events often face major challenges related to crowd management, congestion control, and emergency coordination.

Existing systems are mostly reactive and fragmented, which can lead to:

* Overcrowding at gates and exits
* Delayed emergency response
* Crowd congestion and stampede risks
* Poor coordination between security and medical teams
* Unsafe evacuation during emergencies

This project aims to build a unified AI-powered crowd intelligence platform capable of predicting risks before disasters occur and automating emergency response workflows in real time.

---

# Key Features

## Real-Time Crowd Monitoring

* AI-based people counting using CCTV feeds
* Live crowd density estimation
* Movement direction tracking
* Queue buildup detection
* Heatmap visualization

## AI-Powered Anomaly Detection

* Detects abnormal crowd behavior
* Panic movement analysis
* Fall detection using pose estimation
* Stampede risk prediction
* Aggressive motion detection

## Predictive Crowd Intelligence

* Forecasts overcrowding risks
* Predicts congestion zones
* Crowd Stability Index generation
* AI-based risk scoring

## Personalized SOS & Emergency Alerts

* Emergency notifications via:

  * Mobile App
  * WhatsApp
  * SMS
  * Push Notifications
* Personalized evacuation routes
* Real-time safety instructions

## Smart Crowd Routing

* Dynamic route optimization
* AI-generated evacuation paths
* Smart exit management
* Real-time digital signboard updates

## AI Safety Copilot

* Intelligent recommendations for organizers
* Automated emergency suggestions
* Live risk analysis
* Incident response assistance

## Digital Twin Stadium Visualization

* 3D stadium simulation
* Human-avatar crowd representation
* Live crowd flow animation
* Risk zone visualization

## Multi-Channel Emergency Communication

* Firebase Notifications
* Twilio Voice Alerts
* Email Alerts
* WhatsApp Messaging
* Public Announcement Integration

## Missing Person Detection

* CCTV-based tracking
* Last known location mapping
* Movement trajectory analysis

---

# System Architecture

The platform follows a hybrid Edge AI + Cloud architecture.

## Edge Layer

* Raspberry Pi 5
* CCTV Cameras
* Local AI Processing
* Real-Time Video Inference
* Local Emergency Buzzers

## Cloud Layer

* Firebase Realtime Database
* Google Cloud
* Vertex AI
* WebSocket Streaming
* Cloud Functions

## AI Models

* YOLOv11
* OpenCV
* Pose Estimation
* Optical Flow Analysis
* Crowd Density Estimation

---

# Tech Stack

## Frontend

* React.js
* Next.js
* Tailwind CSS
* Three.js
* React Three Fiber

## Backend

* FastAPI
* Node.js
* WebSockets

## AI & Computer Vision

* TensorFlow
* OpenCV
* YOLOv11
* Pose Estimation

## Cloud & APIs

* Firebase
* Google Cloud Platform
* Vertex AI
* Twilio API
* WhatsApp API

---

# Workflow

1. CCTV cameras continuously monitor crowd activity.
2. AI models analyze crowd density, movement, and anomalies.
3. Predictive analytics identify congestion or stampede risks.
4. Organizers receive real-time alerts and AI recommendations.
5. Fans receive personalized evacuation guidance.
6. Security and medical teams are automatically notified.
7. Smart routing dynamically redirects crowd flow.
8. Dashboard visualizations update in real time.

---

# Future Enhancements

* Drone-based crowd monitoring
* Emotion and panic detection
* Smart wearable integration
* Autonomous gate control
* AR-based indoor navigation
* Voice-controlled command center
* Smart city integration

---

# Impact

* Prevents crowd-related disasters
* Improves emergency response time
* Enhances fan safety and experience
* Optimizes crowd flow management
* Enables predictive stadium intelligence

---

# Demo Scenario

* Crowd density increases near Gate 5
* AI detects abnormal congestion
* Risk heatmap turns red
* Predictive alert generated
* Fans receive WhatsApp evacuation instructions
* Security teams are automatically dispatched
* AI reroutes crowd to safer exits
* Stadium operations stabilize in real time

---

# Vision

> “Prevent disasters before they happen using AI-powered crowd intelligence.”

---

# Contributors

* Swati Bharti

---

# License

This project is licensed under the MIT License.


# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/344c48cb-1412-4f88-9b7e-76b74a40b51d

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
