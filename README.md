# CashPowerMetterPro

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Tech Stack](https://img.shields.io/badge/Tech-React%20%7C%20TS%20%7C%20Vite-success)

**CashPowerMetterPro** is a professional-grade Progressive Web Application (PWA) designed for offline-first management of divisional electricity and water sub-meters. It addresses the common challenges of billing disputes, consumption tracking, and fraud detection in shared residential or commercial properties by providing a secure, reliable, and entirely client-side solution.

---

## Core Features

- **Meter Creation & Management:** Onboard and configure a main master meter and multiple associated sub-meters.
- **Index Reading & Consumption Tracking:** Record new index values with a dedicated keypad interface. The system automatically calculates consumption deltas and updates balances.
- **Credit Top-Up Management:** Log credit recharges for each sub-meter, either in direct units (e.g., kWh) or converted from a currency amount.
- **Automated Reconciliation & Loss Detection:** A dedicated diagnostic panel continuously compares the master meter's consumption against the sum of sub-meters, instantly highlighting discrepancies, technical losses, or potential fraud.
- **UI/UX Customization:** A comprehensive settings panel allows users to tailor the application's appearance, including themes, dial styles, and typography, with a live preview.
- **Secure Local Data Portability:** Full data export to a JSON backup file and import functionality to restore the application state on any device, ensuring data sovereignty.
- **Undo Mechanism:** A non-intrusive "Undo" action is available for 8 seconds after every major operation (reading, top-up) to prevent irreversible mistakes.
- **Safe Reset:** A "Factory Reset" option, protected by a confirmation modal, allows users to securely wipe all local data and start fresh.

---

## Architectural Principles

The application is built upon a set of strict engineering principles to guarantee robustness, security, and performance.

1.  **Offline-First & Zero-Cloud:** The application is designed to be 100% functional without an internet connection after the initial installation. All data is stored and processed locally on the user's device using IndexedDB, and no information is ever sent to a remote server.
2.  **Privacy by Design:** By operating entirely on the client-side, the application ensures complete data privacy. All user-entered information remains within the user's control.
3.  **Deterministic Calculations:** To ensure absolute financial and metrological accuracy, the application avoids standard JavaScript floating-point inaccuracies. All calculations are performed using a scaled integer pattern (3-decimal precision), guaranteeing that `0.1 + 0.2` precisely equals `0.3`.
4.  **Reactive State Management:** The UI is built to be reactive. Components subscribe directly to database queries (`useLiveQuery` from `dexie-react-hooks`), ensuring that any change in the data layer (e.g., a new reading) is instantly and automatically reflected in the interface without manual state management.

---

## Technology Stack

| Category         | Technology                                                                |
| ---------------- | ------------------------------------------------------------------------- |
| **Core Framework** | [React](https://react.dev/) 18 with [TypeScript](https://www.typescriptlang.org/)                             |
| **Build Tool**     | [Vite](https://vitejs.dev/)                                               |
| **Database**       | [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) via [Dexie.js](https://dexie.org/) |
| **Styling**        | [Tailwind CSS](https://tailwindcss.com/) with a custom skeuomorphic design system |
| **PWA & Offline**  | [Workbox](https://developer.chrome.com/docs/workbox) via `vite-plugin-pwa`        |
| **Icons**          | [Lucide React](https://lucide.dev/)                                       |

---

## Local Development

### Prerequisites

-   [Node.js](https://nodejs.org/) (LTS version 20.x or higher)
-   [Git](https://git-scm.com/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/votre-utilisateur/cashpowermetterpro.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd cashpowermetterpro
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running the Application

-   **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or the next available port) with Hot Module Replacement (HMR) enabled.

-   **Build for production:**
    ```bash
    npm run build
    ```
    This command generates a static, optimized build in the `dist/` directory, ready for deployment. The Service Worker and PWA manifest are automatically generated.

---

## Project Structure

The codebase is organized into a modular and maintainable structure within the `src/` directory.

```
📁 src/
├── 📁 components/    # Reusable React components (UI elements, modals)
├── 📁 core/          # Pure, framework-agnostic business logic & types
├── 📁 db/            # Database schema, repositories, and data access functions
├── 📁 pages/         # Top-level page components
├── 📁 styles/        # Global CSS, Tailwind base, and design tokens
├── 📄 App.tsx        # Main application component and router setup
├── 📄 main.tsx       # Application entry point
└── 📄 vite-env.d.ts  # Vite TypeScript environment types
```

---

## Author

This project was designed and developed by **Ir. Adonis Rwabira**.

## License

This project is licensed under the **MIT License**.
