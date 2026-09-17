# Vehicle Parking Management System (VPMS)

A full-stack, feature-rich Vehicle Parking Management System web application built with **React**, **Tailwind CSS**, **Node.js**, **Express**, **JWT Authentication**, and **Interactive Google Maps / Leaflet Integration**.

---

## 🚀 Quick Start Guide

### 1. Start the Backend API Server
```bash
cd server
npm install
npm start
```
The backend API server runs at **http://localhost:5000**.
It includes automatic database seeding with sample users, parking locations, floor slots, and active vehicle logs.

### 2. Start the Frontend React Client
```bash
cd client
npm install
npm run dev
```
The frontend application will launch at **http://localhost:3000**.

---

## 🔑 Demo Account Credentials

Use the built-in 1-Click login buttons on the login page or enter these credentials:

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Admin** | `admin@vpms.com` | `admin123` | Analytics dashboard, revenue metrics, add/delete parking lots, slot management |
| **Operator** | `operator@vpms.com` | `operator123` | Vehicle entry registration, slot auto-assignment, exit checkout & fee calculator |
| **Customer** | `customer@vpms.com` | `customer123` | Map search near me, slot pre-booking, booking history & PDF receipts |

---

## ✨ Core Features

1. **Interactive Google Maps / Leaflet Lot Visibility**:
   - Color-coded pins: **Green** (Available), **Yellow** (High Occupancy), **Red** (Full).
   - Live InfoWindow popups showing real-time slot counts (4-Wheeler, 2-Wheeler, EV, Handicap).
   - "Search Parking Near Me" address geocoding and direction links.

2. **Automated Vehicle Entry & Exit**:
   - Register vehicle plate number & type.
   - Auto-assigns the nearest free slot.
   - Calculates duration and fee on exit.

3. **Billing & PDF Receipts**:
   - Test-mode Stripe & Razorpay checkout simulation.
   - Downloadable official PDF receipt with Transaction ID and breakdown.

4. **Admin Analytics Dashboard**:
   - Occupancy %, total revenue, peak-hour charts, and system overstay notifications.
