"""Download the deepfake detection ONNX model during deployment."""

import os
import sys
from pathlib import Path

# Create models directory
Path("models").mkdir(exist_ok=True)

MODEL_PATH = "models/model.onnx"

# Check if model already exists
if os.path.exists(MODEL_PATH):
    print(f"✓ Model already exists at {MODEL_PATH}")
    sys.exit(0)

print("Downloading deepfake detection model...")

# Get model download URL from environment variable
MODEL_URL = os.getenv("MODEL_DOWNLOAD_URL", "")

if not MODEL_URL:
    print("⚠ Warning: MODEL_DOWNLOAD_URL environment variable not set")
    print("The detector will report as unavailable until a real model is provided.")
    print("To fix this, set MODEL_DOWNLOAD_URL in Render environment variables.")
    sys.exit(0)

try:
    import urllib.request
    print(f"Downloading from: {MODEL_URL}")
    urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
    print(f"✓ Model successfully downloaded to {MODEL_PATH}")
except Exception as exc:
    print(f"✗ Failed to download model: {exc}")
    sys.exit(1)
