🚀 AeroSense
Autonomous Drone-Based Industrial Emission Intelligence System
🌍 Overview

AeroSense is a full-stack web platform designed to monitor industrial emissions using autonomous drones equipped with environmental sensors.

The system:

Collects real-time pollution data

Compares readings with government safe limits

Displays compliance status visually

Enables Pollution Control Board officials to take action

Sends automated violation notices

Maintains historical emission records

This project simulates a real-world drone surveillance system for environmental governance.

🛰 Core Features
🔹 Real-Time Drone Monitoring

Simulated drone visits industries

Live emission updates via WebSockets

Pollutants tracked:

PM2.5

PM10

NO2

SO2

CO2

🔹 Safe Limit Comparison System

Industry-specific emission thresholds

Automatic compliance detection:

🟢 Safe

🟡 Warning

🔴 Violation

🔹 Admin Control Panel

Secure login system

View all industries

Add violation comments

Issue actions (Notice / Fine / Closed)

Send one-click email alerts

Generate reports

🔹 AI Prediction Module

24-hour emission forecast simulation

Risk level estimation

Suggested corrective action

🔹 Futuristic Command Center UI

Dark industrial theme

Neon compliance indicators

Live drone status tracking

Glassmorphism panels

Animated grid background

🏗 Tech Stack
Frontend

React (Vite)

Tailwind CSS

Chart.js

WebSockets

Backend

Python Flask

Flask-SocketIO

SQLAlchemy ORM

JWT Authentication

Database

PostgreSQL / SQLite

Email

SMTP Integration

🗄 Database Structure
Tables:

Industries

SensorReadings

SafeLimits

AdminComments

Users
