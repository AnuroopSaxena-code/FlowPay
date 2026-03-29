# FlowPay 💸

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React%2018-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Build%20Tool-Vite-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com/)
[![PocketBase](https://img.shields.io/badge/Backend-PocketBase-lightgrey.svg)](https://pocketbase.io/)

> **Settle Expenses Without the Stress.**

FlowPay is the ultimate dashboard designed for groups, roommates, and travelers to track shared expenses, calculate optimal settlements, and visualize spending habits with ease. Built with a modern tech stack, it provides a seamless, transparent, and fair experience for managing collective finances.

---

## ✨ Key Features

- **🎯 Custom Splits**: Split expenses equally, by exact amounts, or by custom percentages. Perfect for any situation, from dinner bills to monthly rent.
- **🔄 Multi-Payer Entries**: Support for expenses funded by multiple people simultaneously, ensuring accurate balance tracking from the source.
- **📊 Visual Analytics**: Understand where your money goes with beautiful, interactive charts and category breakdowns powered by Recharts.
- **🧠 Smart Settlements**: Our advanced algorithm calculates the minimum number of transactions needed to settle all debts across a group.
- **🤝 Group Management**: Create separate groups for different circles (Roommates, Trip to Bali, Family) and manage members effortlessly.
- **📱 Responsive Design**: A premium, "Deep Space" themed UI that works perfectly on desktop and mobile devices.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [Shadcn/UI](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State/Data Fetching**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

### Backend & Infrastructure
- **Database/Auth**: [PocketBase](https://pocketbase.io/) (and [Firebase](https://firebase.google.com/) for supplemental services)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Monorepo Management**: NPM Workspaces & [Concurrently](https://github.com/open-cli-tools/concurrently)

---

## 📂 Project Structure

FlowPay is organized as a monorepo for better development workflow:

```text
FlowPay/
├── apps/
│   ├── web/           # React + Vite frontend
│   └── pocketbase/    # PocketBase backend & database
├── package.json       # Root configuration with workspace scripts
└── README.md          # You are here!
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [NPM](https://www.npmjs.com/) or Yarn

### 1. Clone the Repository
```bash
git clone https://github.com/AnuroopSaxena-code/FlowPay.git
cd FlowPay
```

### 2. Install Dependencies
Install all dependencies for both the frontend and backend from the root:
```bash
npm install
```

### 3. Environment Configuration
Navigate to the web app directory and create a `.env` file based on your requirements:

```bash
cd apps/web
# Create a .env file with the following variables:
VITE_PB_URL=http://127.0.0.1:8090
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run the Application
You can start both the frontend and the PocketBase backend concurrently from the project root:

```bash
npm run dev
```

- **Web App**: Accessible at `http://localhost:3000`
- **PocketBase Admin**: Accessible at `http://localhost:8090/_/`

---

## 📝 Usage

1. **Sign Up / Login**: Create an account to start tracking your expenses.
2. **Create a Group**: Invite friends or roommates to your group.
3. **Add Expenses**: Log new expenses, choosing who paid and how the cost is split.
4. **View Analytics**: Check the Dashboard for a visual summary of spending.
5. **Settle Up**: Use the Settlements page to see exactly how much is owed and by whom.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">Made with ❤️ by Anuroop Saxena</p>
