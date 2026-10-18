# 🚌 BusGo — Bus Reservation System

BusGo is a full-stack bus reservation web application that allows customers to search for buses, select seats, book tickets, manage bookings, and download e-tickets. It also provides separate modules for bus operators and administrators.

## ✨ Features

### 👤 Customer Module
- User registration and login
- JWT-based authentication
- Forgot password and password reset through email
- Search buses by source, destination, and journey date
- Interactive seat selection
- Passenger details management
- Booking history and ticket cancellation
- E-ticket PDF generation and download
- Email notifications for tickets and cancellations

### 🚌 Bus Operator Module
- Operator registration and admin approval
- Bus management
- Route and trip management
- Seat and fare management
- Booking and revenue information

### 🛡️ Admin Module
- User management and account status control
- Operator approval management
- Booking management
- Booking cancellation and refund calculation
- Dashboard statistics

### 🔐 Security and Booking
- Password hashing using bcrypt
- JWT authentication and role-based authorization
- Temporary seat locking to help prevent double booking
- Password-reset tokens with expiration
- Email queue with retry handling

## 🛠️ Technologies Used

| Component | Technology |
|---|---|
| Frontend | React, Tailwind CSS, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| PDF Tickets | jsPDF |
| Email | Nodemailer, Node Cron |
| Development Tools | VS Code, Git, MongoDB Atlas |

## 📁 Project Structure

```text
Bus-Reservation-System/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── config/
│   │   ├── emailWorker.js
│   │   └── tripScheduler.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── ResetPassword.jsx
│   │   └── index.css
│   └── package.json
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account or a local MongoDB instance
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Bus-Reservation-System
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual GitHub repository URL.

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Backend Environment Variables

Create a `.env` file inside the `backend` directory.

Add the following variables with your own values:

```env
PORT=5000
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=7d

EMAIL_USER=YOUR_GMAIL_ADDRESS
EMAIL_PASS=YOUR_GMAIL_APP_PASSWORD

FRONTEND_URL=http://localhost:5173
```

**Important:** Never upload your real `.env` file, MongoDB credentials, JWT secret, or Gmail app password to GitHub.

### 4. Start the Backend

From the `backend` directory, run:

```bash
node src/server.js
```

The backend should run at:

```text
http://localhost:5000
```

### 5. Install Frontend Dependencies

Open a second terminal in the project root and run:

```bash
cd frontend
npm install
```

### 6. Start the Frontend

```bash
npm run dev
```

Open the local URL displayed by Vite, usually:

```text
http://localhost:5173
```

## 🔑 Authentication

BusGo uses JSON Web Tokens (JWT) for authentication and bcryptjs to hash passwords.

Available authentication endpoints include:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a customer |
| POST | `/api/auth/register-operator` | Register a bus operator |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/forgot-password` | Request a password-reset link |
| POST | `/api/auth/reset-password/:token` | Reset a password |
| GET | `/api/auth/profile` | Get the authenticated user's profile |
| PATCH | `/api/auth/profile` | Update the user's profile |

Protected endpoints require the appropriate authentication token and, where applicable, role permissions.

## 💳 Payment Information

The current project includes a demo payment flow. Do not treat demo payments or calculated refund amounts as real financial transactions. A live payment gateway and verified refund processing must be configured before production use.

## 🚀 Future Improvements

- Integrate and verify a live payment gateway
- Implement actual payment refunds
- Improve production email deliverability
- Add automated backend and frontend tests
- Deploy the application to production hosting
- Add production monitoring and error reporting

## 👨‍💻 Author

**Project:** BusGo — Bus Reservation System

**Purpose:** Full-stack web development project

## 📄 License

This project is intended for learning and demonstration. Add a license file if you plan to distribute or reuse the project under specific terms.
