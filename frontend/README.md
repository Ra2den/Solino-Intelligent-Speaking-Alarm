# Solino — Frontend Dashboard

This folder contains the React + TypeScript + Vite user interface for Solino. It connects to the FastAPI backend to visualize alarm states, trigger events, and manage settings.

---

## Development Setup

From the `frontend/` folder, perform the following steps to run the dashboard:

### 1. Install dependencies
```bash
npm install
```

### 2. Run the development server
```bash
npm run dev
```
Once started, open the local Vite URL displayed in your terminal (typically **`http://localhost:5173`**).

---

## Production Builds

To package or preview the production build locally:

*   **Build for production**:
    ```bash
    npm run build
    ```
*   **Preview the production build**:
    ```bash
    npm run preview
    ```

---

## Tech Stack Details

*   **Vite**: Next-generation frontend tooling.
*   **React 19 & TypeScript 6**: Core UI library and programming language.
*   **TailwindCSS v4**: CSS framework for modern utility-first styling.
*   **GSAP (GreenSock Animation Platform)**: Handles premium, fluid micro-animations and transition states.
*   **TanStack React Query**: Manages server-state synchronization and cache polling.
*   **Vitest & React Testing Library**: Test runner and validation environment for UI verification.
