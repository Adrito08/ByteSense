"""Face detection and crop logic.

Copyright (c) 2026 AdritaMarik.
All rights reserved.

This file is part of the Deepfake Detection project.
"""

"""Face detection and cropping.

Used by BOTH training/prepare_data.py and the web app, so the model sees
identically preprocessed faces at train time and at serve time. Mismatched
preprocessing is a common reason a detector works in a notebook and fails live.

Detection uses OpenCV's bundled Haar cascade: no extra download, tiny memory
footprint. It misses side-on and small faces; swap in a stronger detector
(e.g. YuNet) here if you need better recall, then re-run prepare_data.
"""
import cv2

_cascade = None


def _get_cascade():
    global _cascade
    if _cascade is None:
        path = cv2.data.haarcascades + "haarcascade_frontalface_alt2.xml"
        _cascade = cv2.CascadeClassifier(path)
        if _cascade.empty():
            raise RuntimeError(f"Could not load face cascade from {path}")
    return _cascade


def detect_largest_face(frame_bgr, max_side=640):
    """Return (x, y, w, h) of the largest face in original-frame pixels, or None."""
    h, w = frame_bgr.shape[:2]
    scale = min(1.0, max_side / max(h, w))
    small = cv2.resize(frame_bgr, (int(w * scale), int(h * scale))) if scale < 1 else frame_bgr
    gray = cv2.equalizeHist(cv2.cvtColor(small, cv2.COLOR_BGR2GRAY))
    faces = _get_cascade().detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(48, 48))
    if len(faces) == 0:
        return None
    x, y, fw, fh = max(faces, key=lambda b: b[2] * b[3])
    return tuple(int(v / scale) for v in (x, y, fw, fh))


def crop_face(frame_bgr, box, size=224, margin=0.3):
    """Square crop around the face with a context margin (blending edges live there)."""
    x, y, w, h = box
    side = int(round(max(w, h) * (1 + margin)))
    x0 = int(round(x + w / 2 - side / 2))
    y0 = int(round(y + h / 2 - side / 2))
    H, W = frame_bgr.shape[:2]
    pl, pt = max(0, -x0), max(0, -y0)
    pr, pb = max(0, x0 + side - W), max(0, y0 + side - H)
    if pl or pt or pr or pb:  # face near the border: pad instead of shifting the crop
        frame_bgr = cv2.copyMakeBorder(frame_bgr, pt, pb, pl, pr, cv2.BORDER_REPLICATE)
        x0 += pl
        y0 += pt
    crop = frame_bgr[y0:y0 + side, x0:x0 + side]
    interp = cv2.INTER_AREA if side > size else cv2.INTER_CUBIC
    return cv2.resize(crop, (size, size), interpolation=interp)


def extract_face(frame_bgr, size=224):
    """Return (BGR crop, box) for the largest face, or (None, None)."""
    box = detect_largest_face(frame_bgr)
    if box is None:
        return None, None
    return crop_face(frame_bgr, box, size), box
