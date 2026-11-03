# 🪵 BIOTRUST — The Eco-Brutalism Archive Edition
### *Verified Biodiversity Information Management System*

> **The BioTrust Golden Rule:** *No biodiversity submission becomes trusted public information without passing through the multi-peer verification workflow.*

---

## 📂 Project Location

The complete codebase is located at:
```
C:\Users\Sathvi\.gemini\antigravity\scratch\biotrust
```

---

## 💻 How to Open in VS Code

### Method 1: Using Terminal / Command Prompt (Fastest)

1. Open **Command Prompt** or **PowerShell**.
2. Run:
```powershell
code "C:\Users\Sathvi\.gemini\antigravity\scratch\biotrust"
```
VS Code will immediately launch with the BioTrust project workspace loaded.

### Method 2: From Within VS Code GUI

1. Open **Visual Studio Code**.
2. Click **File** &rarr; **Open Folder...** (or press `Ctrl + K, Ctrl + O`).
3. Paste or navigate to:
   ```
   C:\Users\Sathvi\.gemini\antigravity\scratch\biotrust
   ```
4. Click **Select Folder**.

---

## ⚡ Running the Application in VS Code Terminal

Open the integrated terminal in VS Code by pressing **`Ctrl + \``** (backtick) or going to **Terminal &rarr; New Terminal**.

### Option A: Run Full Unified App (Recommended)
This runs the Express API server and serves the full compiled Eco-Brutalism web app:

```powershell
npm run start
```
> Or: `npm run server`
- Opens on: **[http://localhost:5000](http://localhost:5000)**
- Health check: **[http://localhost:5000/health](http://localhost:5000/health)**

---

### Option B: Run With Live Vite Dev Server (Hot Reloading)

If you are developing UI changes and want live hot-module reloading:

1. **Terminal 1 (Backend API on Port 5000):**
   ```powershell
   npm run server
   ```
2. **Terminal 2 (Frontend Dev Server on Port 5173):**
   Split terminal or open a 2nd tab (`Ctrl + Shift + 5` or click `+` in terminal panel):
   ```powershell
   npm run client
   ```
- Frontend: **[http://localhost:5173](http://localhost:5173)**
- Backend API: **[http://localhost:5000/api](http://localhost:5000/api)**

---

### Option C: Using VS Code Built-In Tasks
Press **`Ctrl + Shift + P`** in VS Code, type `Tasks: Run Task`, and pick:
- **`1. Run Full App (Backend + Client on Port 5000)`**
- **`2. Start Backend API Server (Port 5000)`**
- **`3. Start Frontend Vite Dev Server (Port 5173)`**

---

## 🎨 Theme: "The Eco-Brutalism Archive"

- **Kraft Paper Background:** `#EFE9DF`
- **Raw White Surface:** `#F9F6F0`
- **Forest Moss Accent:** `#2C5E3B`
- **Industrial Orange:** `#E65F2B`
- **Charcoal Ink:** `#1C1B18` (Hard 2px borders, zero soft blur shadows)
- **Stone Muted:** `#8C8476`
- **Pinned Active Persona Footer:** Pinned permanently to the bottom of the left sidebar without requiring vertical scroll.
- **Top Floating Pill Navigation:** Centered pill bar with quick module switching and persistent `⇄ Switch Role` clearance gateway.
