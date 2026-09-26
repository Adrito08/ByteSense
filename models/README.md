# Models Directory

This directory contains the ONNX model file required for deepfake detection.

## Problem: No Model File Found

You are seeing this error:
```
{"error":"No model file found at models/model.onnx."}
```

This means the detector cannot find a valid ONNX model file.

---

## Solution

### Step 1: Get a Deepfake Detection Model

You need a real ONNX model file. Options:

1. **Train your own**: Use a deepfake detection framework like:
   - [FaceForensics++](https://github.com/ondyari/FaceForensics)
   - [MesoNet](https://github.com/MoH-Hassan/MesoNet)
   - [MediaPipe](https://developers.google.com/mediapipe)

2. **Download a pre-trained model**:
   - [Hugging Face Model Hub](https://huggingface.co)
   - [ONNX Model Zoo](https://github.com/onnx/models)
   - GitHub releases from deepfake projects

3. **Convert existing model to ONNX**:
   ```bash
   # PyTorch to ONNX
   torch.onnx.export(model, dummy_input, "model.onnx")
   
   # TensorFlow to ONNX
   pip install onnx-tf
   ```

### Step 2: Deploy on Render

**Option A: Host Model Online** (Recommended)

1. Upload your `model.onnx` to a file hosting service:
   - Google Drive (share link)
   - AWS S3
   - GitHub Releases
   - Dropbox
   - Any HTTP-accessible URL

2. Get the direct download URL

3. In Render Dashboard → Environment Variables, add:
   ```
   Key:   MODEL_DOWNLOAD_URL
   Value: https://your-host.com/path/to/model.onnx
   ```

4. Redeploy on Render

**Option B: Commit Model Directly** (Only if < 100MB)

```bash
# Place your model file here
cp /path/to/your/model.onnx models/model.onnx

# Commit and push
git add models/model.onnx
git commit -m "Add deepfake detection ONNX model"
git push origin main
```

Then redeploy on Render.

---

## How It Works

- `download_model.py` runs during Render build
- It checks for `MODEL_DOWNLOAD_URL` environment variable
- If set, downloads the model from that URL
- If not set, deployment succeeds but detector reports unavailable
- Your Flask app loads the model from `models/model.onnx`

---

## Verification

After deployment, check if the model loaded:

```bash
curl https://your-render-service.onrender.com/
```

Should return:
```json
{
  "service": "deepfake-detection",
  "status": "ok",
  "detector": {
    "available": true,  ← This should be TRUE
    "arch": "unknown",
    "error": null,
    "metrics": {},
    "threshold": 0.5,
    "trained_on": [],
    "uncertain_band": 0.15
  }
}
```

If `"available": false` still shows, the model file is missing.

---

## Quick Checklist

- [ ] Have a real ONNX model file
- [ ] Uploaded model to a hosting service (if using online URL)
- [ ] Set `MODEL_DOWNLOAD_URL` in Render environment variables
- [ ] Redeployed on Render
- [ ] Verified `/` endpoint shows `"available": true`
