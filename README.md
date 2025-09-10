# HabitTracker - Full-Stack Habit Tracking App

A modern, full-stack web application for tracking daily habits with social features for accountability. Built with React, Node.js, Express, and MongoDB.

## Features

### Core Functionality
- **User Authentication**: Secure registration, login, and logout
- **Habit Management**: Create, edit, and delete personal habits
- **Daily Check-ins**: Track progress with one-click check-ins
- **Streak Tracking**: Automatic streak counting and statistics
- **Progress Analytics**: View completion rates and longest streaks

### Social Features
- **Follow Friends**: Search and follow other users
- **Activity Feed**: See friends' recent check-ins and progress
- **Social Accountability**: Public habit tracking for motivation

### User Experience
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Real-time Updates**: Instant feedback on habit completion
- **Mobile Friendly**: Works seamlessly on all devices
- **Edge Case Handling**: Prevents duplicate habits, multiple daily check-ins, and self-following

## Tech Stack

### Frontend
- **React 18** - Modern UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

## Prerequisites

Before running this application, make sure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd habit-tracker-app
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (root, server, and client)
npm run install-all
```

### 3. Environment Setup
Create a `.env` file in the `server` directory:
```env
MONGODB_URI=mongodb://localhost:27017/habit-tracker
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env file
```

### 5. Run the Application
```bash
# Start both frontend and backend concurrently
npm run dev

# Or start them separately:
# Backend only
npm run server

# Frontend only
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000


### Edge Case Handling
- **Duplicate Habits**: Prevents users from creating habits with the same name
- **Multiple Check-ins**: Only allows one check-in per habit per day
- **Self-following**: Prevents users from following themselves
- **Form Validation**: Client and server-side validation for all forms
- **Authentication**: JWT-based authentication with proper error handling

### Security Features
- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS configuration
- Protected routes

## Deployment

### Frontend (Netlify/Vercel)
1. Build the React app: `npm run build`
2. Deploy the `client/build` folder
3. Update API URLs to production backend
