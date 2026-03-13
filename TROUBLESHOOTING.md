# LexiRisk Troubleshooting Guide

## Common Issues and Solutions

### 1. Risk Score Shows 0/100 - Low

**Symptoms:**

- Risk score displays as 0/100
- "Watch Out For These" section is empty
- Risk breakdown chart shows only "None"
- Summaries show "Classification unavailable - ML service is offline"

**Cause:** The ML service is not running or failed to classify clauses.

**Solution:**

1. **Check if ML service is running:**

   ```powershell
   netstat -ano | findstr :8000
   ```

   - If nothing appears, the ML service is not running

2. **Check if models are trained:**

   ```powershell
   cd ml_service
   dir models\classification_pipeline.pkl
   ```

   - If file doesn't exist, run: `python -m src.train`

3. **Start the ML service:**

   ```powershell
   cd ml_service
   python server.py
   ```

   - Should see: "✅ LexiRisk ML Engine loaded successfully"
   - Should show: "Uvicorn running on http://0.0.0.0:8000"

4. **Test ML service manually:**
   ```powershell
   curl http://localhost:8000/api/health
   ```

   - Should return: `{"status":"healthy","models_loaded":true}`

---

### 2. "Watch Out For These" Section is Empty

**Symptoms:**

- The section shows but has no content
- Or shows message: "Unable to detect risks"

**Cause:** Either ML service is offline, or the document genuinely has only low/no-risk clauses.

**Solution:**

1. Check browser console (F12) for API errors
2. Check backend logs for ML service connection errors
3. Upload a different PDF with more complex legal language
4. Verify ML service health with the check script:
   ```powershell
   .\CHECK_SERVICES.ps1
   ```

---

### 3. Risk Breakdown Chart Shows Only "None"

**Symptoms:**

- Donut chart appears but shows only gray "None" segment
- No High/Medium/Low segments

**Cause:** ML service returned all clauses as "none" risk level.

**Solution:**

1. Check backend logs for this line:

   ```
   [ANALYSE] ML service unavailable, using fallback
   ```

   - If present, ML service is not responding

2. Verify ML service is accessible:

   ```powershell
   cd backend
   node -e "const axios = require('axios'); axios.get('http://localhost:8000/api/health').then(r => console.log(r.data))"
   ```

3. Check for port conflicts:
   ```powershell
   netstat -ano | findstr :8000
   ```

   - Should show only ONE process listening

---

### 4. Document Summary Not Showing

**Symptoms:**

- New "Document Summary" section is missing

**Cause:** Using old frontend code without latest updates.

**Solution:**

1. Pull latest frontend changes
2. Rebuild frontend:
   ```powershell
   cd frontend
   npm run dev
   ```
3. Hard refresh browser: `Ctrl + Shift + R`

---

### 5. ML Service Won't Start

**Symptoms:**

- Error: "Model not found at 'models/classification_pipeline.pkl'"
- Or: "ModuleNotFoundError: No module named 'transformers'"

**Solution:**

**If models are missing:**

```powershell
cd ml_service
python data_generator.py
python -m src.train
```

**If dependencies are missing:**

```powershell
cd ml_service
pip install -r requirements.txt
```

**If virtual environment issues:**

```powershell
cd ml_service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python data_generator.py
python -m src.train
python server.py
```

---

### 6. Backend Can't Connect to ML Service

**Symptoms:**

- Backend logs show: "ML service unavailable: Cannot connect to classification service"
- Error code: ECONNREFUSED

**Solution:**

1. Verify ML service is running on port 8000
2. Check if firewall is blocking localhost connections
3. Try accessing directly:
   ```powershell
   curl http://localhost:8000/api/health
   ```
4. Check .env file in backend:
   ```
   ML_SERVICE_URL=http://localhost:8000/api/classify
   ```

---

### 7. BART Summarization is Slow

**Symptoms:**

- First request takes very long (1-3 minutes)
- Subsequent requests are fast

**Cause:** BART model is downloading on first use (~1.6GB).

**Solution:**

This is expected behavior. The model downloads once and is cached.

To use a smaller model:

1. Edit `ml_service/src/summarizer.py`
2. Change line 24:
   ```python
   MODEL_NAME = "sshleifer/distilbart-cnn-12-6"  # Smaller, faster
   ```
3. Restart ML service

---

### 8. Port Already in Use

**Symptoms:**

- Error: "EADDRINUSE: address already in use :::8000"
- Or similar for ports 5000, 5173

**Solution:**

**Find and kill the process:**

```powershell
# For port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# For port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# For port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

---

### 9. PDF Upload Fails

**Symptoms:**

- Error: "Failed to analyze document"
- Or: "Cannot segment empty text"

**Cause:** PDF might be image-based or corrupted.

**Solution:**

1. Ensure PDF has selectable text (not scanned images)
2. Try the sample document first to verify system works
3. Check backend logs for specific error
4. Try a different PDF file

---

### 10. Changes Not Reflecting in Frontend

**Symptoms:**

- Made code changes but UI looks the same

**Solution:**

1. Hard refresh: `Ctrl + Shift + R`
2. Clear browser cache
3. Stop and restart Vite dev server:
   ```powershell
   # In frontend terminal: Ctrl+C
   npm run dev
   ```
4. Check browser console for errors

---

## Quick Health Check

Run this command to check all services at once:

```powershell
.\CHECK_SERVICES.ps1
```

This will verify:

- ✅ ML Service running on port 8000
- ✅ Backend running on port 5000
- ✅ Frontend running on port 5173
- ✅ ML models trained and available

---

## Still Having Issues?

1. **Check all terminal windows** for error messages
2. **Look at browser console** (F12 → Console tab)
3. **Verify Python version**: Python 3.8+ required
   ```powershell
   python --version
   ```
4. **Verify Node version**: Node 18+ required
   ```powershell
   node --version
   ```
5. **Check logs**:
   - Backend: Terminal where `npm run dev` is running
   - ML Service: Terminal where `python server.py` is running
   - Frontend: Browser console (F12)

---

## Contact

If issues persist, check:

- ML_README.md for detailed ML documentation
- README.md for general project documentation
- backend/test.js for API testing
