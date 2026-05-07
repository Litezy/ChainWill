# 📄 ChainWill — Decentralized Digital Inheritance Protocol

## 🚀 Overview

**ChainWill** is a decentralized Web3 application that enables users to securely manage and transfer digital assets through smart contracts. It acts as a **digital testament system**, ensuring that assets are distributed to beneficiaries based on predefined conditions.

The platform combines **blockchain technology, smart contracts, and a modern frontend interface** to provide a secure, transparent, and trustless inheritance solution.

---

## ✨ Features

- 🔐 **Self-Custodial Asset Control**  
  Users retain full ownership of their wallets and private keys.

- 📜 **Digital Testament Creation**  
  Define how assets should be distributed after inactivity or specific triggers.

- 👥 **Beneficiary Management**  
  Add and manage recipients for asset distribution.

- ✍️ **Multi-Signer Approval System**  
  Add trusted signers to validate actions.

- 📊 **Dashboard Overview**  
  Track assets, beneficiaries, and activity in a clean UI.

- ⚙️ **User Settings**  
  Customize account preferences and security options.

- 🔗 **Smart Contract Integration**  
  All core logic is executed on-chain for transparency and immutability.

---

## 🏗️ Project Structure

ChainWill/
├── frontend/
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── layouts/ # Page layouts (Dashboard, General)
│ │ ├── pages/
│ │ │ ├── Dashboard/ # Authenticated dashboard pages
│ │ │ └── General/ # Public pages (Home, About, etc.)
│ │ ├── routes/ # Route configurations
│ │ └── utils/ # Helper functions
│ ├── package.json
│ └── ...
│
└── README.md

---

## 🧭 Pages & Routes

### 🌐 General Pages

- `/` → Home
- `/about` → About
- `/how-it-works` → How It Works
- `/privacy-policy` → Privacy Policy
- `/terms-and-conditions` → Terms & Conditions

### 🔐 Dashboard Pages (Protected)

- `/auth/overview` → Dashboard Overview
- `/auth/assets` → Assets Management
- `/auth/beneficiaries` → Beneficiaries
- `/auth/signers` → Signers
- `/auth/settings` → Settings

---

## 🛠️ Tech Stack

### Frontend

- React (Vite)
- TypeScript
- Tailwind CSS
- React Router

### Web3 / Blockchain

- Smart Contracts (Solidity – assumed)
- Wallet Integration (e.g., MetaMask)

---

## ⚙️ Installation & Setup

### 1. Clone the repository

---

### 2. Install dependencies

npm install

---

### 3. Run development server

npm run dev

---

### 4. Open in browser

http://localhost:5173

---

## 🔄 Git Workflow (For Contributors)

Fork the repo
Clone your fork

git checkout -b feature/your-name
git pull upstream master --rebase

Make changes

git add .
git commit -m "feat: your changes"

Push

git push origin feature/your-name

Create Pull Request

---

## 🔐 Authentication & Routing

- Protected routes are wrapped with `AuthGuard`
- Layout separation:
  - `GenePageLayout` → Public pages
  - `DashboardLayout` → Authenticated pages

---

## 🎯 Project Goal

ChainWill aims to solve a real-world problem:

> “What happens to your digital assets when you’re no longer active?”

By leveraging blockchain, ChainWill ensures:

- Trustless execution
- No third-party dependency
- Transparent asset transfer

---

## 🤝 Contributing

We welcome contributions!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

---

## 📄 License

This project is open-source and available under the MIT License.

---
