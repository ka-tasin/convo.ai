# Convo.AI

**Convo.AI** is a full-stack real-time chat application that enables seamless communication between users and an integrated AI assistant.  
It’s built with a modular architecture focusing on scalability, clean backend structure, and efficient real-time data flow using Socket.io.  
The backend is implemented with **Node.js**, **TypeScript**, **Express**, **MongoDB (Mongoose)**, and **JWT** for secure authentication.

---

## 🚀 Features

### Backend
- RESTful API built with **Express + TypeScript**
- **JWT-based authentication** for secure user sessions
- **Socket.io** for real-time chat communication
- **Mongoose** for MongoDB ODM
- **Layered architecture** (Controller → Service → Repository)
- Environment-based configuration via `.env`
- Centralized error handling and logging

### Frontend
- Built with **React.js**
- Integrated **Socket.io-client** for live messaging
- Real-time updates and AI-generated responses
- Authentication via tokens from backend
- Simple, responsive, and modern chat UI

---

## 🧩 Tech Stack

**Backend**
- Node.js  
- Express.js  
- TypeScript  
- MongoDB + Mongoose  
- Socket.io  
- JSON Web Token (JWT)  
- dotenv  

**Frontend**
- React.js  
- Socket.io-client  
- Tailwind CSS  

---

## 📂 Folder Structure

convo.ai/
│
├── client/ # Frontend (React)
│ ├── src/
│ ├── public/
│ └── package.json
│
├── server/ # Backend (Express + TS)
│ ├── src/
│ │ ├── config/ # Environment and DB setup
│ │ ├── controllers/ # Request handlers
│ │ ├── services/ # Business logic
│ │ ├── repository/ # Database layer
│ │ ├── middleware/ # JWT auth, error handling
│ │ ├── utils/ # Helper functions
│ │ └── app.ts / server.ts # App entry points
│ ├── package.json
│ └── tsconfig.json
│
└── README.md

yaml
Copy code

---

## ⚙️ Environment Variables

Create a `.env` file in the `server` folder with the following variables:

PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173

yaml
Copy code

> ⚠️ Never commit your `.env` file to version control.

---

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/convo.ai.git
cd convo.ai
2. Backend Setup (Server)
bash
Copy code
cd server
npm install
Run in Development
bash
Copy code
npm run dev
Build and Run in Production
bash
Copy code
npm run build
npm start
Backend should be running at:
👉 http://localhost:3000

3. Frontend Setup (Client)
bash
Copy code
cd ../client
npm install
Run Frontend
bash
Copy code
npm run dev
Frontend should be running at:
👉 http://localhost:5173

🔗 API Overview
Method	Endpoint	Description	Auth
POST	/api/auth/register	Register a new user	❌
POST	/api/auth/login	Login and get JWT token	❌
GET	/api/users/:id	Get user details	✅
GET	/api/messages	Get chat messages	✅
POST	/api/messages	Send a message	✅

✅ = Requires valid JWT token in Authorization header
Example: Authorization: Bearer <token>

⚡ Socket.io Events
Event	Description
connection	When a user connects to socket server
send_message	Emits when a user sends a new message
receive_message	Broadcasts message to target user
disconnect	Fired when user disconnects

🧠 Architecture Overview
Controller Layer: Handles incoming HTTP requests.

Service Layer: Contains business logic.

Repository Layer: Handles database queries via Mongoose.

Socket Layer: Manages real-time message delivery.

Middleware: Authenticates JWT tokens and handles errors globally.

🧰 Scripts
Backend

bash
Copy code
npm run dev       # Start backend in watch mode
npm run build     # Compile TypeScript
npm start         # Run compiled code
Frontend

bash
Copy code
npm run dev       # Start frontend (Vite)
npm run build     # Build production version
📦 Deployment
Frontend: Vercel

Backend: Render / Railway / VPS

Database: MongoDB Atlas

Ensure your deployed environment variables match your .env configuration.

🧑‍💻 Author
Kausar Ahmad
Full-Stack Developer | Node.js • TypeScript • React • MongoDB
📧 kausar.ahmad.tasin01@gmail.com

🪪 License
This project is licensed under the MIT License — you’re free to use, modify, and distribute it with attribution.

yaml
Copy code

---

Would you like me to make the **repository badges** (like Node.js, TypeScript, MongoDB, etc.) and a **live demo link** section at the top too? It’ll make the README look more professional for GitHub.






