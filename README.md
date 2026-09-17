<<<<<<< HEAD
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
=======
# VPMS — Vehicle Parking Management System

A full-stack, role-based parking management platform that turns any parking 
facility into a connected, self-service experience — from live availability 
search to automated billing and analytics.

## Overview

VPMS replaces manual, disconnected parking operations with a single system 
that serves three roles — **Admin**, **Operator**, and **Customer** — each 
with a purpose-built dashboard. Customers find and pre-book available slots 
on a live map, operators handle vehicle entry/exit with automatic nearest-slot 
assignment, and admins get real-time occupancy, revenue, and peak-hour 
analytics.

## Features

- 🗺️ **Live Map & Search** — Color-coded lot markers (available / high 
  occupancy / full) powered by Leaflet + OpenStreetMap — no paid API key required
- 🚗 **Automated Vehicle Entry & Exit** — Register a vehicle by plate number; 
  the system auto-assigns the nearest free slot and calculates duration/fee on exit
- 💳 **Billing & Receipts** — Test-mode Stripe/Razorpay checkout simulation 
  with downloadable PDF receipts
- 📊 **Admin Analytics Dashboard** — Occupancy %, revenue, peak-hour trends, 
  and overstay alerts
- 🔐 **Role-Based Access Control** — Separate authenticated experiences for 
  Admin, Operator, and Customer via JWT

## Tech Stack

**Frontend:** React, Tailwind CSS, Vite, React Router, React-Leaflet, Recharts, jsPDF  
**Backend:** Node.js, Express, JWT, bcryptjs  
**Database:** MongoDB, Mongoose  
**Maps:** Leaflet + OpenStreetMap tiles (free, no API key)

## Getting Started

```bash
# Backend
cd server
npm install
npm start          # runs on http://localhost:5000

# Frontend
cd client
npm install
npm run dev         # runs on http://localhost:3000
```

Requires a local MongoDB instance running on `mongodb://127.0.0.1:27017`. 
On first run, the backend auto-seeds demo accounts and sample parking lots.

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@vpms.com | admin123 |
| Operator | operator@vpms.com | operator123 |
| Customer | customer@vpms.com | customer123 |
>>>>>>> 75864c28be0f1958b10cc87f364602fb8201394a
