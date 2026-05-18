# WebInsight

AI-powered feedback and issue management platform built using the MERN stack.

---

## 🚀 Overview

WebInsight is a full-stack web application that helps users manage projects, submit feedback, track issues, and gain AI-powered insights. The platform provides authentication, project management, issue tracking, review systems, and AI analysis features in a modern and responsive interface.

---

## ✨ Features

### 🔐 Authentication System

* User Registration & Login
* JWT-based Authentication
* Protected Routes
* Secure User Sessions

### 📊 Dashboard

* Centralized Project Dashboard
* Project Overview
* Responsive Sidebar Navigation
* Clean and Modern UI

### 📝 Project Management

* Create Projects
* Manage Project Data
* Organize User Feedback
* Track Project Issues

### 🐞 Issue Tracking

* Report Issues
* Manage Issue Status
* Issue Categorization
* View Project-wise Issues

### ⭐ Feedback & Reviews

* Submit Feedback
* User Reviews System
* Store and Manage Responses

### 🤖 AI Insights

* AI-powered analysis using Groq API
* Smart insights generation
* Automated feedback understanding

### 🎨 Frontend Features

* Responsive Design
* Modern UI using React
* Tailwind CSS Styling
* Smooth Navigation Experience

---

## 🛠️ Tech Stack

### Frontend

* React.js
* React Router DOM
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

### AI Integration

* Groq API

---

## 📂 Project Structure

```bash
WEBINSIGHT/
│
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── public/
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── services/
│   ├── App.js
│   └── index.js
│
├── package.json
├── tailwind.config.js
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/DivyaTak04/webInsight.git
cd webInsight
```

---

### 2️⃣ Install Frontend Dependencies

```bash
npm install
```

---

### 3️⃣ Install Backend Dependencies

```bash
cd backend
npm install
```

---

### 4️⃣ Setup Environment Variables

Create a `.env` file inside the `backend` folder.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
GROQ_API_KEY=your_groq_api_key
NODE_ENV=development
```

---

### 5️⃣ Run Backend Server

```bash
cd backend
npm start
```

---

### 6️⃣ Run Frontend

Open another terminal:

```bash
npm start
```

---

## 📸 Screenshots

* Landing Page
* Dashboard
* AI Insights Page
* Issues Management
* Authentication Pages

---

## 🔮 Future Enhancements

* Real-time Notifications
* Dark Mode
* Team Collaboration Features
* Advanced AI Analytics
* File Upload Support
* Deployment & Cloud Hosting
* Email Notifications

---

## 👩‍💻 Author

### Divya Tak

MCA Student | Full Stack Web Developer

---

## 📄 License

This project is created for learning and educational purposes.
