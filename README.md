# Monex Guava PDF Editor 🍈

A 100% in-memory, zero-database PDF and Photo manipulation suite styled with a fresh, natural greenish-pink guava theme.

## Guava Palette
- **Outer Green Rind:** `#58a757` (Main action buttons, borders, stem)
- **Deep Forest Green:** `#2d6a33` (Brand title, dark contrasts)
- **Soft Rind Wash:** `#eef8ed` (Clean background canvas)
- **Ripe Pink Guava Flesh:** `#f46a78` (Tool highlights, mascot flesh, download cards)
- **Deep Guava Pink Blush:** `#dc3545` (Alerts, seed blushes, clear buttons)
- **Sun-Kissed Yellowish-Green:** `#c2db52` (Inner rind accents)

---

## Getting Started

### 1. Backend (Terminal 1)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
pytest test_backend.py -v
uvicorn src.main:app --reload --port 8000
```

### 2. Frontend (Terminal 2)
```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.
