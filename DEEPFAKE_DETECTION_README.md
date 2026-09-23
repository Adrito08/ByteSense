# Deepfake Detection Project

## Project purpose

This project builds a simple deepfake detection service that detects faces, preprocesses them, runs an ONNX model, and returns a verdict for the uploaded media.

## Simplified system overview

```text
Client upload
   ↓
File validation
   ↓
Image decode OR video frame sampling
   ↓
Face detection and crop
   ↓
Model preprocessing
   ↓
CNN inference in ONNX Runtime
   ↓
Score aggregation
   ↓
Verdict response
```

## Data flow

| Step | Action | Result |
| --- | --- | --- |
| 1 | Upload file | Image or video bytes received |
| 2 | Validate format | Only supported image/video types proceed |
| 3 | Prepare input | Image decoded or video frames sampled |
| 4 | Detect face | Largest face found using Haar cascade |
| 5 | Crop face | Face resized to model input size |
| 6 | Normalize | RGB conversion and standardization |
| 7 | Infer | ONNX model returns one score per face |
| 8 | Aggregate | Mean score and flagged share computed |
| 9 | Return | `likely_real`, `likely_fake`, `inconclusive`, or `no_face` |

## Verdict logic

| Score range | Verdict |
| --- | --- |
| Below lower threshold | `likely_real` |
| Near threshold band | `inconclusive` |
| Above upper threshold | `likely_fake` |
| No detectable face | `no_face` |

## Main files

| File | Purpose |
| --- | --- |
| `app.py` | Flask API for uploads and responses |
| `detector.py` | Model loading and verdict calculation |
| `faces.py` | Face detection and cropping |
| `media.py` | Image decode and video frame sampling |
| `requirement.txt` | Python dependencies |

## API example

```bash
curl -X POST \
  -F "file=@sample.jpg" \
  http://127.0.0.1:10000/analyze
```

Optional video frame count:

```bash
curl -X POST \
  -F "file=@sample.mp4" \
  -F "frames=20" \
  http://127.0.0.1:10000/analyze
```

## Key note

The model output is a manipulation score, not a calibrated probability. Use it as a decision-support signal rather than final truth.
