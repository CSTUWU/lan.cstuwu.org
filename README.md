# CST LAN Challenge 2026 – Frontend

The frontend for the CST LAN Challenge 2026 tournament website. It is built with Next.js 14, React, TypeScript, and Tailwind CSS.

## Requirements

- Node.js 18.17 or newer
- npm (included with Node.js)
- Git

## Install and run locally

1. Clone the repository:

   ```bash
   git clone https://github.com/ThinukaVinjaya/cst_lan_chalange_frontend.git
   ```

2. Open the project folder:

   ```bash
   cd cst_lan_chalange_frontend
   ```

3. Install the Node.js packages required by the project. Run this from the project folder; npm reads `package.json` and installs the dependencies into `node_modules`:

   ```bash
   npm install
   ```

   To install the exact versions recorded in `package-lock.json` (recommended for a clean, reproducible setup), use `npm ci` instead. Use one of these commands, not both.

4. (Optional) Configure the backend API. The app defaults to `http://localhost:5000/api`. To use another API URL, create a `.env.local` file in the project root and add:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

   Change the URL to your backend's API address if it is running elsewhere. The backend must be running for features that load or save server data.

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

Press `Ctrl+C` in the terminal to stop the server.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server on port 3000 |
| `npm run build` | Create a production build |
| `npm start` | Run the production build on port 3000 |
| `npm run lint` | Run ESLint |

To run a production build locally:

```bash
npm run build
npm start
```

## Deployment

This repository contains the frontend application. Import it into a Next.js-compatible host such as Vercel, then configure `NEXT_PUBLIC_API_URL` in the host's environment settings to point to your deployed backend API. Redeploy after changing environment variables.
