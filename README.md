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
