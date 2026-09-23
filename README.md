# Deepfake Detection

A lightweight Flask API for analyzing images and videos for signs of manipulation. The service detects faces, scores them with an ONNX model, and returns an aggregated verdict.

> **Important:** This project provides a model score, not a calibrated probability or definitive proof that media is real or fake. Use the result as an aid for further review.

## System overview

```mermaid
flowchart LR
    A[Client uploads image or video] --> B{Media type?}
    B -->|Image| C[Decode image with OpenCV]
    B -->|Video| D[Sample up to N frames]
    C --> E[Resize to max 1280 px]
    D --> E
    E --> F[Detect faces with Haar cascade]
    F --> G{Largest face found?}
    G -->|No| H[Return no_face]
    G -->|Yes| I[Crop face with context margin]
    I --> J[Resize and normalize crop]
    J --> K[ONNX Runtime CNN inference]
    K --> L[Convert logit to manipulation score]
    L --> M[Aggregate frame scores]
    M --> N[Return verdict, score, flagged share, and frame details]
```

## Analysis pipeline

| Stage | Input | Processing | Output |
| --- | --- | --- | --- |
| 1. Upload | Multipart `file` | Validate filename and upload size | Image/video bytes |
| 2. Decode | Image bytes or video path | OpenCV decoding; videos are sampled evenly | BGR image frames |
| 3. Resize | Full-resolution frame | Limit longest side to 1,280 px | Memory-efficient frame |
| 4. Face detection | BGR frame | Equalized grayscale Haar-cascade detection | Largest face bounding box |
| 5. Face crop | Frame and bounding box | Add 30% context margin and pad borders when needed | `224 × 224` face crop |
| 6. Preprocessing | Face crop | BGR → RGB, scale to `[0, 1]`, normalize, transpose to NCHW | Model tensor |
| 7. Inference | Model tensor | ONNX Runtime CPU inference | One logit per detected face |
| 8. Scoring | Logit | Apply sigmoid | Manipulation score from 0 to 1 |
| 9. Aggregation | Frame scores | Calculate mean score and flagged-frame share | JSON verdict |

## Verdict logic

The default decision threshold is `0.50` with an uncertainty band of `±0.15`. These values can be overridden by the model metadata file, such as `models/model.json`.

| Aggregate score | Verdict | Meaning |
| ---: | --- | --- |
| `0.00–0.35` | `likely_real` | The model score is below the lower decision boundary |
| `0.35–0.65` | `inconclusive` | The evidence is too close to the decision threshold |
| `0.65–1.00` | `likely_fake` | The model score is above the upper decision boundary |
| No detectable face | `no_face` | No face crop was available for inference |

The score is a model score and **must not be interpreted as a calibrated probability**.

## Data flow and aggregation

For an image, one frame is analyzed. For a video, the application samples frames and analyzes each frame with a detectable face:

```text
Video frames:       f₁       f₂       f₃       ...       fₙ
                    │        │        │                 │
Face crops:        c₁       c₂       c₃       ...       cₖ
                    │        │        │                 │
Frame scores:     p₁∈[0,1] p₂∈[0,1] p₃∈[0,1] ... pₖ∈[0,1]
                    └──────────────┬──────────────────┘
                                   │
Aggregate score = mean(p₁, p₂, ..., pₖ)
Flagged share    = count(pᵢ ≥ threshold) / k
                                   │
                                   ▼
                         Final verdict and notes
```

Frames without a detected face are excluded from score aggregation but are counted in `frames_sampled`. A video with fewer than three detected faces receives a reliability note.

## Response representation

A successful `/analyze` response has the following structure:

| Field | Type | Description |
| --- | --- | --- |
| `media_type` | string | `image` or `video` |
| `frames_sampled` | integer | Number of frames examined |
| `frames_with_face` | integer | Number of frames containing a detectable face |
| `verdict` | string | `likely_fake`, `likely_real`, `inconclusive`, or `no_face` |
| `score` | number or `null` | Mean manipulation score |
| `flagged_share` | number or `null` | Share of face frames at or above the threshold |
| `frames` | array | Per-frame index, timestamp, score, face size, and thumbnail |
| `notes` | array | Quality and uncertainty warnings |

Example response for a media file with multiple detected faces across sampled frames:

```json
{
  "media_type": "video",
  "frames_sampled": 20,
  "frames_with_face": 18,
  "verdict": "inconclusive",
  "score": 0.57,
  "flagged_share": 0.444,
  "frames": [
    {
      "index": 0,
      "time": 0.0,
      "face_px": 164,
      "score": 0.54,
      "face": "data:image/jpeg;base64,..."
    }
  ],
  "notes": ["A score near the middle means the evidence does not point either way."]
}
```

## Supported media

| Category | Supported extensions | Processing behavior |
| --- | --- | --- |
| Images | `.jpg`, `.jpeg`, `.png`, `.webp`, `.bmp` | One image is decoded and analyzed |
| Videos | `.mp4`, `.mov`, `.avi`, `.webm`, `.mkv` | Up to the requested number of evenly spaced frames are analyzed |

For reliable results, use a clear, front-facing face that is at least approximately 100 pixels wide. Side-on, small, blurry, or heavily occluded faces may not be detected reliably.

## Requirements

- Python 3.9+
- An ONNX model at `models/model.onnx` (or a path supplied through `MODEL_PATH`)
- OpenCV-compatible video input for video analysis

Install the dependencies:

```bash
python -m pip install -r requirement.txt
python -m pip install Flask
```

For production deployment with Gunicorn, also install:

```bash
python -m pip install gunicorn
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

## API usage

### Health check

```bash
curl http://127.0.0.1:5000/health
```

### Service information

```bash
curl http://127.0.0.1:5000/
```

### Analyze an image

Send the media in the `file` form field:

```bash
curl -X POST \
  -F "file=@path/to/media.jpg" \
  http://127.0.0.1:5000/analyze
```

### Analyze a video

The optional `frames` field controls the number of sampled frames; the default is 20.

```bash
curl -X POST \
  -F "file=@path/to/video.mp4" \
  -F "frames=20" \
  http://127.0.0.1:5000/analyze
```

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

## Project files

| File | Responsibility |
| --- | --- |
| `app.py` | Flask API, upload handling, and HTTP responses |
| `detector.py` | ONNX inference, score aggregation, and verdict generation |
| `faces.py` | Haar-cascade face detection and preprocessing-compatible cropping |
| `media.py` | Image decoding, video sampling, and memory-efficient resizing |
| `requirement.txt` | Core Python runtime dependencies |
