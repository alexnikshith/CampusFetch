# 🚀 CampusFetch

**CampusFetch** is a peer-to-peer campus logistics and student marketplace platform built specifically for **Amrita Vishwa Vidyapeetham**.

CampusFetch utilizes existing student movement on campus. Students visiting campus canteens, stationery stores, Xerox centers, or pharmacies (called **Runners**) can accept delivery requests from fellow students in hostels and deliver items to their rooms.

---

## 🎨 Official Theme & Design System

Designed in accordance with the official **Amrita Vishwa Vidyapeetham Student Portal / Intranet**:
- **Primary Color**: Amrita Crimson Red (`#8C182B`)
- **Card Containers**: Crisp White (`#FFFFFF`) with Slate backgrounds (`#F8FAFC`)
- **Accents**: Amrita Gold (`#D97706`) for Hero badges and priority orders.

---

## 🌟 Key Features

1. **Amrita Campus Stores**: Seeded with 9 campus stores (Main Canteen, IT Canteen, MBA Canteen, Night Canteen, Pool Canteen, General Store, Stationery, Xerox Center, Pharmacy).
2. **Order Request Builder**: Item request builder with automatic dynamic delivery fee calculation ($\min(\max(\text{amount} \times 10\%, ₹5), ₹30)$).
3. **"I'm Going To..." Runner Trip Broadcast**: Allows runners to announce trips to specific stores and accept matching requests along their path.
4. **Assigned Student Runner Details Card**: Displays runner full name, username, direct call button (`tel:`), department, year, hostel block, room number, and trust score.
5. **Realtime Socket.IO Order Chat**: In-app real-time chat between student customer and runner.
6. **4-Digit Delivery Confirmation OTP**: High-security delivery verification handshake.
7. **Global Order ID Counter**: Sequential order IDs starting from `avv001`, `avv002`, `avv003`, onwards.
8. **Student Heroes Leaderboard & Verified Trust Score**: Multi-factor trust scoring system (0-100%).
9. **Platform Governance Admin Panel**: Store manager, user moderation, analytics, and CSV data export.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti.
- **Backend**: Node.js, Express, TypeScript, Socket.IO, Prisma ORM, SQLite database.
- **Authentication**: Amrita College Email OTP verification + JWT Access/Refresh tokens.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/alexnikshith/CampusFetch.git
cd CampusFetch
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run prisma:push
npm run seed
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.
