# Convo.AI

**Convo.AI** is a full-stack real-time chat application that enables seamless communication between users and an integrated AI assistant.  
It’s built with a modular architecture focusing on scalability, clean backend structure, and efficient real-time data flow using Socket.io.  
The backend is implemented with **Node.js**, **TypeScript**, **Socket.io**, **Express**, **MongoDB (Mongoose)**, and **JWT** for secure authentication.

---

### **AI Conversation Integration via `@ai`**

- Convo.AI allows users to **instantly involve ChatGPT in any ongoing conversation**.  
- To summon the AI, simply type **`@ai`** in your message
- The system will automatically **detect the tag**, **forward the conversation to OpenAI’s API**, and **stream back the AI-generated response** in real time.

This feature bridges **human-to-human** and **human-to-AI** communication seamlessly inside a single chat room.

##  Features

### Backend
- RESTful API built with **Express + TypeScript**
- **JWT-based authentication** for secure user sessions
- **Socket.io** for real-time chat communication
- **Mongoose** for MongoDB ODM
- **Layered architecture** (Controller → Service → Repository)
- Environment-based configuration via `.env`

### Frontend
- Built with **React.js**
- Integrated **Socket.io-client** for live messaging
- Real-time updates and AI-generated responses
- Authentication via tokens from backend

---

## Tech Stack

**Backend**
- Node.js  
- Express.js  
- TypeScript  
- MongoDB + Mongoose  
- Socket.io  
- JSON Web Token (JWT)  


**Frontend**
- React.js  
- Socket.io-client  
- Tailwind CSS  

---



## Environment Variables

Create a `.env` file in the `server` folder with the following variables:
```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
PORT=5000
OPENAI_API_KEY=sk-***********
PORTFOLIO_MODE=false
```

---

##  Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/convo.ai.git
cd convo.ai
```
### 2. Backend Setup (Server)
```bash
cd server
npm install
```

### Run in Development
```bash
npm run dev
```

***Backend should be running at: http://localhost:3000***

### 3. Frontend Setup (Client)
```bash
cd ../client
npm install
```

- Run Frontend
```
npm run dev
```

***Frontend should be running at: http://localhost:5173***

## API Overview
Method	Endpoint	Description	Auth

```
POST	/api/auth/register	Register a new user	
POST	/api/auth/login	Login and get JWT token	
GET	/api/users/:id	Get user details	
GET	/api/messages	Get chat messages	
POST	/api/messages	Send a message
```

- Requires valid JWT token in Authorization header
Example: Authorization: Bearer <token>

## Architecture Overview

- Controller Layer: Handles incoming HTTP requests.
- Service Layer: Contains business logic.
- Repository Layer: Handles database queries via Mongoose.
- Socket Layer: Manages real-time message delivery.
- Middleware: Authenticates JWT tokens and handles errors globally.







