"""Deepfake Detection Web Service.

Copyright (c) 2026 AdritaMarik.
All rights reserved.

This file is part of the Deepfake Detection project.
"""

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
from media import IMAGE_EXT, VIDEO_EXT, decode_image, iter_video_frames

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("MAX_UPLOAD_MB", "200")) * 1024 * 1024

MODEL_PATH = os.getenv("MODEL_PATH", "models/model.onnx")
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


def _requested_frame_count():
    """Return a safe positive frame count from the multipart form."""
    raw = request.form.get("frames", "20")
    try:
        count = int(raw)
    except (TypeError, ValueError):
        raise ValueError("The 'frames' value must be a positive integer.") from None
    if count < 1:
        raise ValueError("The 'frames' value must be a positive integer.")
    return min(count, 300)


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
    if suffix in VIDEO_EXT:
        try:
            frame_count = _requested_frame_count()
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400

        temporary_path = None
        try:
            with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as temporary:
                uploaded.save(temporary)
                temporary_path = temporary.name
            result = detector.analyze(
                iter_video_frames(temporary_path, n=frame_count), "video"
            )
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400
        finally:
            if temporary_path:
                Path(temporary_path).unlink(missing_ok=True)
    elif suffix in IMAGE_EXT:
        image = decode_image(uploaded.read())
        if image is None:
            return jsonify({"error": "The uploaded file is not a readable image."}), 400
        result = detector.analyze([(0, None, image)], "image")
    else:
        return jsonify({"error": "Unsupported file type. Upload a supported image or video."}), 400

    return jsonify(result)


@app.errorhandler(413)
def request_too_large(_error):
    return jsonify({"error": "Uploaded file is too large."}), 413


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "10000")))
