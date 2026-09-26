# Deployment Setup Guide for Render

## Problem Summary

Your deepfake detector shows:
```json
{
  "detector": {
    "available": false,
    "error": "No model file found at models/model.onnx."
  }
}
```

This guide explains the complete setup.

---

## Files Included in This Setup

| File | Purpose |
|------|----------|
| `download_model.py` | Downloads model during Render build |
| `render.yaml` | Render deployment configuration |
| `.gitignore` | Excludes large model files from Git |
| `models/README.md` | Detailed model setup instructions |
| `DEPLOYMENT_SETUP.md` | This file |

---

## Quick Start: 3 Steps

### Step 1: Get a Model File

You need an ONNX model file (`.onnx`). Either:
- Download from Hugging Face or GitHub
- Train your own using a framework
- Convert an existing model to ONNX

### Step 2: Host It Online or Commit It

**Option A: Online URL** (for large files)
- Upload to Google Drive, S3, GitHub Releases, etc.
- Get the direct download link

**Option B: Commit to Repo** (if < 100MB)
```bash
cp your_model.onnx models/model.onnx
git add models/model.onnx
git commit -m "Add deepfake model"
git push
```

### Step 3: Configure Render

1. Go to https://dashboard.render.com
2. Select your ByteSense service
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Enter:
   ```
   Key:   MODEL_DOWNLOAD_URL
   Value: https://your-download-url/model.onnx
   ```
   (Leave empty if model is committed to repo)
6. Click **Save**
7. Render will auto-redeploy

---

## Environment Variables Reference

| Variable | Default | Purpose |
|----------|---------|----------|
| `MODEL_DOWNLOAD_URL` | (empty) | URL to download ONNX model file |
| `MODEL_PATH` | `models/model.onnx` | Path where model is stored |
| `MAX_UPLOAD_MB` | `200` | Max upload file size in MB |
| `FLASK_ENV` | `production` | Environment mode |
| `PORT` | `10000` | Server port (auto-set by Render) |

---

## Build & Start Commands

**Build Command:**
```bash
pip install -r requirements.txt && python download_model.py && cd Frontend && npm install && npm run build && cd ..
```

**Start Command:**
```bash
gunicorn app:app --bind 0.0.0.0:$PORT
```

---

## Verify Deployment

After redeploying, test the endpoint:

```bash
curl https://your-service.onrender.com/
```

Expected response (when model is loaded):
```json
{
  "service": "deepfake-detection",
  "status": "ok",
  "detector": {
    "available": true,
    "arch": "unknown",
    "error": null,
    "threshold": 0.5
  }
}
```

If `"available": false`, the model is still missing. Check:
1. Is `MODEL_DOWNLOAD_URL` set correctly?
2. Does the download URL return a valid file?
3. Did Render finish building?

---

## Troubleshooting

### "No model file found" error

1. Check Render build logs: Dashboard → Service → Logs
2. Verify `MODEL_DOWNLOAD_URL` is set (if using online model)
3. Test the URL manually in a browser
4. Ensure the file is a valid ONNX model

### Build fails during download

1. Check if download URL is accessible
2. Verify file size (very large files may timeout)
3. Try a different hosting service
4. Commit model directly to repo instead

### Models directory structure

```
BytesSense/
├── models/
│   ├── README.md          ← Instructions
│   └── model.onnx         ← Your model here
├── download_model.py      ← Auto-download script
├── render.yaml            ← Render config
├── .gitignore             ← Excludes *.onnx
├── app.py
├── requirements.txt
└── Frontend/
```

---

## Next Steps

1. ✅ Review `models/README.md` for detailed model setup
2. ✅ Obtain a valid ONNX model file
3. ✅ Add `MODEL_DOWNLOAD_URL` to Render environment
4. ✅ Redeploy and verify `/` endpoint
5. ✅ Test `/analyze` endpoint with an image or video

---

## Support

For questions:
- Check Render logs: https://dashboard.render.com
- Review Flask app: `app.py`
- Read detector code: `detector.py`
- See model requirements: `models/README.md`
