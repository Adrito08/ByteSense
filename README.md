# Deepfake Detection

A lightweight Flask API for analyzing images and videos for signs of manipulation. The service detects faces, scores them with an ONNX model, and returns an aggregated verdict.

> **Important:** This project provides a model score, not a calibrated probability or definitive proof that media is real or fake. Use the result as an aid for further review.

## Requirements

- Python 3.9+
- An ONNX model at `models/model.onnx` (or a path supplied through `MODEL_PATH`)
- OpenCV-compatible video input for video analysis

Install the dependencies:

```bash
python -m pip install -r requirement.txt
```

The application also imports Flask. Install it if it is not already available:

```bash
python -m pip install Flask
```

## Run locally

Start the development server with:

```bash
flask --app app run
```

Alternatively, run the module directly:

```bash
python app.py
```

The server listens on `http://127.0.0.1:5000` when started with Flask, or on port `10000` by default when started with `python app.py`. Set `PORT` to change the latter.

## API

### Health check

```bash
curl http://127.0.0.1:5000/health
```

### Service information

```bash
curl http://127.0.0.1:5000/
```

### Analyze an image or video

Send the media in the `file` form field:

```bash
curl -X POST \
  -F "file=@path/to/media.jpg" \
  http://127.0.0.1:5000/analyze
```

For videos, optionally choose how many frames to sample:

```bash
curl -X POST \
  -F "file=@path/to/video.mp4" \
  -F "frames=20" \
  http://127.0.0.1:5000/analyze
```

Supported image formats are `.jpg`, `.jpeg`, `.png`, `.webp`, and `.bmp`. Supported video formats are `.mp4`, `.mov`, `.avi`, `.webm`, and `.mkv`.

The response includes the verdict (`likely_fake`, `likely_real`, `inconclusive`, or `no_face`), the aggregate score, the proportion of flagged frames, and per-frame details.

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `MODEL_PATH` | `models/model.onnx` | Location of the ONNX model |
| `PORT` | `10000` | Port used by `python app.py` |
| `MAX_UPLOAD_MB` | `200` | Maximum upload size |

If a matching metadata file exists beside the model—for example, `models/model.json`—the detector loads its preprocessing settings and evaluation metadata from it.

## Deploy with Gunicorn

```bash
gunicorn app:app --bind 0.0.0.0:$PORT
```

Install Gunicorn before using that command:

```bash
python -m pip install gunicorn
```

## Project files

- `app.py` — Flask API and upload handling
- `detector.py` — ONNX inference and verdict aggregation
- `faces.py` — Face detection and cropping
- `media.py` — Image decoding and video frame sampling
- `requirement.txt` — Python runtime dependencies
