# Deepfake Detection

A lightweight Python project for frame-level deepfake detection using OpenCV and ONNX Runtime. The pipeline is designed to:

- read an image or video,
- detect and crop the largest face,
- preprocess it to the model input size,
- run an ONNX CNN classifier,
- aggregate frame scores into a single verdict.

This project mirrors a typical "collect -> face detection -> features -> model -> evaluation" pipeline and is intentionally small and CPU-friendly.

## Features

- Face detection using OpenCV's Haar cascade
- Large-face crop extraction with padding/margin handling
- Input preprocessing with ImageNet-style normalization
- ONNX model inference with CPU execution
- Per-frame scoring plus final verdict aggregation
- Support for both image and video inputs
- Simple return structure with score, verdict, notes, and sampled frames

## Project Structure

- `detector.py` — loads the ONNX model, runs inference, aggregates frame scores, and returns verdicts
- `faces.py` — face detection and square crop logic
- `media.py` — image decode utilities and video frame sampling
- `README.md` — project overview and usage guide

## How the detector works

The model output is treated as a single logit per crop. The code applies a sigmoid to convert it to a manipulation score:

- score near 1.0 = more likely fake
- score near 0.0 = more likely real
- values near the threshold are marked as inconclusive

The final decision is based on the mean score across all detected face crops from sampled frames.

## Requirements

Install the dependencies below before running the code:

```bash
pip install numpy opencv-python onnxruntime
```

If you are using a model packaged with metadata, the expected pattern is:

- `model.onnx`
- `model.json` (optional metadata file with threshold, mean, std, etc.)

## Quick Start

### 1. Load a detector

```python
from detector import Detector

detector = Detector("model.onnx")
print(detector.info())
```

### 2. Analyze an image

```python
import cv2
from detector import Detector

model = Detector("model.onnx")
image = cv2.imread("sample.jpg")

result = model.analyze([(0, None, image)], "image")
print(result["verdict"])
print(result["score"])
print(result["notes"])
```

### 3. Analyze a video

```python
from media import iter_video_frames
from detector import Detector

model = Detector("model.onnx")
frames = iter_video_frames("sample.mp4", n=20)

result = model.analyze(frames, "video")
print(result["verdict"])
print(result["score"])
print(result["flagged_share"])
```

## Output format

The `analyze()` method returns a dictionary with keys such as:

```python
{
    "media_type": "video",
    "frames_sampled": 20,
    "frames_with_face": 15,
    "verdict": "likely_fake",
    "score": 0.83,
    "flagged_share": 0.7,
    "frames": [
        {
            "index": 0,
            "time": 0.0,
            "face_px": 180,
            "score": 0.91,
            "face": "data:image/jpeg;base64,..."
        }
    ],
    "notes": [
        "Only 3 frame(s) had a detectable face, so this result is weak."
    ]
}
```

Possible verdict values:

- `likely_fake`
- `likely_real`
- `inconclusive`
- `no_face`

## Notes on reliability

- Detection depends on clear, front-facing faces with enough resolution.
- Small or blurry faces can reduce confidence.
- The code uses a Haar cascade, which works best for relatively visible frontal faces.
- The model score is not a calibrated probability; it is a manipulation score produced by the network.

## Example of media utilities

```python
from media import decode_image, iter_video_frames

# Decode bytes from an uploaded image
image_bytes = open("sample.jpg", "rb").read()
image = decode_image(image_bytes)

# Sample frames from a video
sampled = list(iter_video_frames("sample.mp4", n=10))
```

## License

This project does not currently include a license file. If you plan to share or distribute it publicly, consider adding a license such as MIT or Apache 2.0.

## Summary

This repo is a compact deepfake detection baseline for image and video analysis. It is useful for experimenting with face-based fake detection pipelines and can be extended with stronger face detectors, alternative models, or more advanced aggregation logic.
