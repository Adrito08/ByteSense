# Deepfake Detection

A lightweight Flask API that analyzes uploaded images and videos and returns a verdict based on a face-crop model score.

> Full project details are in [DEEPFAKE_DETECTION_README.md](DEEPFAKE_DETECTION_README.md).

## Simple system overview

```text
Upload file
   ↓
Validate type and size
   ↓
Decode image OR sample video frames
   ↓
Detect the largest face
   ↓
Crop and normalize the face
   ↓
Run ONNX model
   ↓
Aggregate frame scores
   ↓
Return verdict + notes
```

## Main endpoints

- `GET /` — service metadata
- `GET /health` — health status
- `POST /analyze` — submit `file` and optionally `frames`

## Quick start

```bash
python -m pip install -r requirement.txt
python app.py
```

Then send an upload to:

```bash
curl -X POST -F "file=@sample.jpg" http://127.0.0.1:10000/analyze
```

## Supported media

- Images: `.jpg`, `.jpeg`, `.png`, `.webp`, `.bmp`
- Videos: `.mp4`, `.mov`, `.avi`, `.webm`, `.mkv`

## Notes

- This project gives a model score, not a calibrated probability.
- Results are best when the face is clearly visible and reasonably large in the frame.
