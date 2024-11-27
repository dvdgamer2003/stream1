# Video Streaming App

## Overview
This project is a video streaming app that allows users to upload videos, automatically convert them into playable links, and stream the content directly. The app also allows users to save their generated links on the website for later use.

---

## Features
1. **Upload and Stream**:
   - Users can upload video files.
   - Videos are uploaded to a third-party service and converted into playable links.
   - Links are displayed and can be streamed directly.

2. **Save Links for Later**:
   - Generated links can be saved on the website and retrieved later.
   - Links are stored in a database and tied to the user's session or account.

3. **No Local Storage**:
   - Videos are not stored on the server; they are hosted on a third-party platform like Cloudinary.

4. **Supported Formats**:
   - Supports popular video formats such as MP4, AVI, and MOV.

5. **Responsive Design**:
   - Works on both desktop and mobile devices.

---

## Tech Stack

### Front-End
- HTML5, CSS3, JavaScript (Vanilla or Frameworks like React.js)
- Video.js (for video playback)

### Back-End
- Node.js with Express.js (to manage API calls and save links)
- Optional: Python (Flask/Django) for back-end logic

### Database
- **Supabase** (Free tier: PostgreSQL with real-time capabilities)
- **Firebase** (Free tier with Firestore)

### APIs/Services
1. **[Cloudinary](https://cloudinary.com/)**:
   - Video hosting and streaming service.
2. **[Supabase](https://supabase.com/)** or **[Firebase](https://firebase.google.com/)**:
   - For storing video links.
3. **[Video.js](https://videojs.com/)**:
   - Open-source video player for playback.

---

## Requirements

### API Keys
1. **Cloudinary API Key**:
   - Sign up at [Cloudinary](https://cloudinary.com/) and note your:
     - cloud_name
     - API Key
     - API Secret
2. **Supabase/Firebase API Key**:
   - Set up a database in either **Supabase** or **Firebase**.
   - Obtain the API URL and Key from the respective platform.

### Development Tools
- Node.js and npm (for back-end setup)
- IDE/Text Editor (e.g., VS Code)

---

## Setup Steps

### Step 1: Cloudinary Configuration
1. Sign up at [Cloudinary](https://cloudinary.com/).
2. Create an **Upload Preset** for unsigned uploads:
   - Go to **Settings > Upload** and create a new preset.
   - Set Allowed Formats to include MP4, AVI, and MOV.
   - Enable **Auto-Streaming** for optimized playback.

---

### Step 2: Database Setup

#### Option 1: Supabase
1. Create a new project at [Supabase](https://supabase.com/).
2. Add a table for saving links:
   
sql
   CREATE TABLE video_links (
       id SERIAL PRIMARY KEY,
       user_id VARCHAR(255),
       video_url TEXT NOT NULL,
       created_at TIMESTAMP DEFAULT NOW()
   );