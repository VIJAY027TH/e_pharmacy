# E-Pharmacy Management System (Full-Stack Project)

A production-style full-stack E-Pharmacy application built with **Spring Boot 3.x (Java)**, **Spring Security + JWT**, **Spring Data JPA**, **MySQL / H2**, and **React.js (Vite + React Router + Axios)**.

---

## 🌟 Key Features & User Roles

### 1. 👤 Guest User
- Browse medicine catalog with real-time live search & filtering (by name, brand, category, ailment).
- View medicine details, dosage, price, stock status, and customer reviews.
- Register & Login with JWT authentication.

### 2. 🛒 Registered Customer User
- Authentication & JWT token management.
- Live Cart: Add items, update quantities with stock validation, clear cart.
- Digital Prescription Upload: Upload doctor prescriptions for restricted medicines (`requires_prescription = true`).
- Secure Checkout: Address entry, payment gateway selection (Card, UPI, Net Banking, Wallet), prescription selection, order placement.
- Order History & Tracking: Order status tracking (PLACED -> CONFIRMED -> PROCESSING -> PACKED -> SHIPPED -> OUT_FOR_DELIVERY -> DELIVERED), cancel eligible orders.
- Reviews & Ratings: Rate and review medicines.
- In-App Notifications: Receive order status and prescription verification alerts.

### 3. 🛡️ Admin User
- **Admin Dashboard**: Revenue summary, pending prescriptions count, catalog count, low stock warnings.
- **Medicine Management**: Full CRUD operations for medicines, price editor, stock replenishment, Rx requirement toggle.
- **Category Management**: Add, update, and delete pharmaceutical categories.
- **User Account Management**: View users, toggle active/inactive account status.
- **Prescription Verification Desk**: Review uploaded user doctor prescriptions with document viewer, approve or reject with custom notes.
- **Order Management & Fulfilment**: Update order statuses through delivery phases.
- **Analytics & Reports**: Visual reports for total sales revenue and stock inventory levels.

---

## 🚀 Default Demo Credentials

On startup, the system seeds demo user accounts:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@pharmavital.com` | `Pv@qtoX9PKmHEJuV` |
| **Customer** | `user@epharmacy.com` | `User@123` | If Not Create New One Using Register New Account|  

---

## 🛠️ Technology Stack

- **Backend**: Java 17+, Spring Boot 3.2.5, Spring Security 6, JWT (`jjwt`), Spring Data JPA, Hibernate, Bean Validation, Maven.
- **Frontend**: React 18, Vite 5, React Router DOM 6, Axios, Tailwind CSS, Lucide React Icons.
- **Database**: H2 (In-Memory with MySQL compatibility mode) / MySQL Server.

---

## ⚙️ How to Run locally

### 1. Run Spring Boot Backend (Port `8080`)
```bash
cd backend
mvn spring-boot:run
```
- Backend API Base URL: `http://localhost:8080/api`
- H2 Database Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:epharmacydb`, User: `sa`, Password: empty)

### 2. Run React Frontend (Port `5173`)
```bash
cd frontend
npm install
npm run dev
```
- Frontend Web App: `http://localhost:5173`

---

## 📁 Repository Structure

```
e-pharmacy/
├── backend/                # Spring Boot REST API
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/example/epharmacy/
│       │   ├── config/       # Security & Seed Data Initializer
│       │   ├── controller/   # REST API Endpoints
│       │   ├── dto/          # Data Transfer Objects
│       │   ├── entity/       # JPA Entities & Enums
│       │   ├── exception/    # Global Exception Handler
│       │   ├── repository/   # Spring Data Repositories
│       │   ├── security/     # JWT & Spring Security Filters
│       │   └── service/      # Core Business Logic
│       └── resources/
│           └── application.properties
├── frontend/               # React Vite SPA
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── components/     # Reusable UI (Navbar, Footer, MedicineCard, etc.)
│       ├── context/        # Auth & Cart State Contexts
│       ├── pages/          # Guest/User & Admin SPA Pages
│       └── services/       # Axios API Clients
├── database/               # SQL Schema & DDL Scripts
└── README.md
```
