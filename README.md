# 🚌 BusGo — Bus Reservation System

BusGo is a full-stack bus reservation web application that allows customers to search for buses, select seats, book tickets, manage bookings, and download e-tickets. It includes separate modules for customers, bus operators, and administrators, along with a Booking Copilot that helps users navigate the booking process.

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
- Delete eligible completed booking records
- **BusGo Booking Copilot** for booking guidance

### 🤖 BusGo Booking Copilot
BusGo includes a Booking Copilot designed to make the bus reservation process easier for users, especially beginners.

- Provides guidance through the bus booking workflow
- Helps users understand bus search and seat selection
- Assists users in navigating passenger details and booking steps
- Helps users find and understand available booking features
- Provides a more beginner-friendly experience

The Copilot is intended to complement the existing booking interface rather than replace the normal booking process.

### 🚌 Bus Operator Module
- Bus operator management
- Operator approval by administrators
- Bus creation and management
- Bus information and amenities management
- Route creation and management
- Boarding and dropping point management
- Trip management
- Seat and fare management
- Booking information and revenue details

### 🛡️ Admin Module
- User management
- User account activation and deactivation
- Operator approval management
- Booking management
- Administrative booking cancellation
- Refund amount calculation based on cancellation rules
- Dashboard statistics

### 🔐 Security and Booking
- Password hashing using bcrypt
- JWT authentication and role-based authorization
- Protected customer, operator, and admin routes
- Temporary seat locking to help prevent double booking
- Password-reset tokens with expiration
- Email queue with retry handling
- Input validation for supported operations

### 📧 Email Notifications
- Booking ticket email notifications
- Ticket PDF attachments
- Booking cancellation email notifications
- Password-reset email notifications
- Background email processing
- Retry handling for failed email jobs

### 🎫 Booking and Ticket Management
- Passenger details collection
- Booking history
- Ticket PDF generation and download
- Booking cancellation
- Cancellation eligibility checks
- Refund amount calculation
- Completed booking record deletion where permitted

## 🛠️ Technologies Used

| Component | Technology |
|---|---|
| Frontend | React, Tailwind CSS, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| PDF Tickets | jsPDF |
| Email | Nodemailer |
| Background Jobs | Node Cron |
| Development Tools | VS Code, Git |
| Database Hosting | MongoDB Atlas |
| Version Control | Git and GitHub |

## 📁 Project Structure

```text
Bus-Reservation-System/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── bookingController.js
│   │   │   ├── operatorController.js
│   │   │   └── adminController.js
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
│   │   ├── BookingCopilot.jsx
│   │   ├── OperatorDashboard.jsx
│   │   ├── ResetPassword.jsx
│   │   └── index.css
├── .gitignore
└── README.md
```

*Note: The structure above highlights important files. Your project may contain additional files and folders.*

## ⚙️ Installation and Setup

### Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account or a local MongoDB instance
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/TEJESH2006-CRE/Bus-Reservation-System.git
cd Bus-Reservation-System
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Backend Environment Variables

Create a `.env` file inside the `backend` directory.

Add the following variables using your own credentials:

```env
PORT=5000
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=7d

EMAIL_USER=YOUR_GMAIL_ADDRESS
EMAIL_PASS=YOUR_GMAIL_APP_PASSWORD

FRONTEND_URL=http://localhost:5173
```

The variables shown above are examples. Check your backend code for any additional environment variables your configuration requires.

**Security warning:** Never upload real MongoDB credentials, JWT secrets, Gmail app passwords, or other private credentials to GitHub.

### 4. Start the Backend

From the `backend` directory, run:

```bash
node src/server.js
```

The backend should run at:

`http://localhost:5000`

Make sure the MongoDB connection succeeds in the terminal.

### 5. Install Frontend Dependencies

Open a second terminal at the project root and run:

```bash
cd frontend
npm install
```

### 6. Start the Frontend

From the `frontend` directory, run:

```bash
npm run dev
```

Open the local URL displayed by Vite, usually:

`http://localhost:5173`

## 🔑 Authentication and Password Reset

BusGo uses JSON Web Tokens (JWT) for authentication and bcryptjs for password hashing.

The implemented authentication workflow includes:

- Customer registration and login
- Protected routes
- Role-based authorization
- Forgot password
- Password-reset links with expiration
- Password updates using a hashed password

Password-reset links should be treated as sensitive because they grant the ability to change an account password.

## 🚌 Operator and Route Management

The operator module supports bus and route management, including:

- Bus details and amenities
- Route information
- Boarding and dropping points
- Trip management
- Seat and fare information
- Operator booking and revenue information

Administrators can approve operators before they access restricted operator functionality.

## 🛡️ Administration

The admin module supports administrative operations, including:

- Viewing and managing users
- Activating or deactivating accounts
- Approving operators
- Viewing bookings
- Cancelling eligible bookings
- Calculating cancellation refund amounts
- Viewing dashboard statistics

## 💳 Payment Information

The current project includes a demo payment flow. Refund amounts may be calculated according to cancellation rules, but calculating a refund does not mean that money has actually been returned.

A verified payment gateway and real refund processing must be configured before the application is used for live financial transactions.

## 🤖 Booking Copilot Information

The Booking Copilot is an additional assistance feature in the BusGo frontend.

Its purpose is to help users understand the application and navigate the booking workflow more easily.

The normal booking interface remains available alongside the Copilot.

## 🚀 Future Improvements

- Integrate a live payment gateway with server-side payment verification
- Implement verified payment refund processing
- Improve production email deliverability
- Add automated frontend and backend tests
- Enhance Booking Copilot assistance
- Deploy the application to production hosting
- Add monitoring and error reporting
- Improve accessibility and mobile responsiveness

## 👨‍💻 Project Information

**Project Name:** BusGo — Bus Reservation System

**Project Type:** Full-stack web application

**Purpose:** Learning and demonstration of full-stack web development concepts.

**Repository:** [BusGo on GitHub](https://github.com/TEJESH2006-CRE/Bus-Reservation-System)

## 📄 License

This project is intended for learning and demonstration. No specific open-source license is granted unless a license is added to the repository.