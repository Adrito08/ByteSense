"""Flask web server for the deepfake detector.

Run locally with:
    flask --app app run

Render start command:
    gunicorn app:app --bind 0.0.0.0:$PORT
"""

import os
import tempfile
from pathlib import Path

from flask import Flask, jsonify, request

from detector import Detector
from media import decode_image, iter_video_frames

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("MAX_UPLOAD_MB", "200")) * 1024 * 1024

MODEL_PATH = os.getenv("MODEL_PATH", "models/model.onnx")
VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".webm", ".mkv"}

detector = Detector(MODEL_PATH)


@app.get("/")
def index():
    return jsonify({
        "service": "deepfake-detection",
        "status": "ok",
        "detector": detector.info(),
    })


@app.get("/health")
def health():
    return jsonify({"status": "ok", "detector_available": detector.available})


@app.post("/analyze")
def analyze():
    if "file" not in request.files:
        return jsonify({"error": "Upload a file using the 'file' form field."}), 400

    uploaded = request.files["file"]
    if not uploaded.filename:
        return jsonify({"error": "The uploaded file must have a filename."}), 400

    if not detector.available:
        return jsonify({"error": detector.error or "The detector is unavailable."}), 503

    suffix = Path(uploaded.filename).suffix.lower()
    if suffix in VIDEO_EXTENSIONS:
        temporary_path = None
        try:
            with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as temporary:
                uploaded.save(temporary)
                temporary_path = temporary.name
            frames = iter_video_frames(temporary_path, n=int(request.form.get("frames", 20)))
            result = detector.analyze(frames, "video")
        finally:
            if temporary_path:
                Path(temporary_path).unlink(missing_ok=True)
    else:
        image = decode_image(uploaded.read())
        if image is None:
            return jsonify({"error": "The uploaded file is not a readable image or supported video."}), 400
        result = detector.analyze([(0, None, image)], "image")

    return jsonify(result)


@app.errorhandler(413)
def request_too_large(_error):
    return jsonify({"error": "Uploaded file is too large."}), 413


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "10000")))
