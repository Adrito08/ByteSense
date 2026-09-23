"""Media utilities for image and video processing.

Copyright (c) 2026 AdritaMarik.
All rights reserved.

This file is part of the Deepfake Detection project.
"""

"""Image decoding and video frame sampling.

Frames are yielded one at a time and downscaled immediately, so a 4K video
never puts several 25 MB frames in memory at once (Render free tier: 512 MB).
"""
import cv2
import numpy as np

IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
VIDEO_EXT = {".mp4", ".mov", ".avi", ".webm", ".mkv"}
MAX_SIDE = 1280


def _limit_size(frame, max_side=MAX_SIDE):
    h, w = frame.shape[:2]
    s = max_side / max(h, w)
    if s < 1:
        return cv2.resize(frame, (int(w * s), int(h * s)), interpolation=cv2.INTER_AREA)
    return frame


def decode_image(data: bytes):
    """Decode image bytes to a BGR array, or None if it is not a readable image."""
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
    return None if img is None else _limit_size(img)


def iter_video_frames(path, n):
    """Yield (frame_index, seconds_or_None, frame_bgr) for up to n evenly spaced frames."""
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        raise ValueError("The video could not be opened. Try an MP4 (H.264) file.")
    try:
        total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        fps = float(cap.get(cv2.CAP_PROP_FPS) or 0)
        got = 0
        if total > 0:
            for i in np.linspace(0, total - 1, num=min(n, total), dtype=int):
                cap.set(cv2.CAP_PROP_POS_FRAMES, int(i))
                ok, frame = cap.read()
                if ok:
                    got += 1
                    yield int(i), (float(i) / fps if fps > 0 else None), _limit_size(frame)
        if got == 0:  # no usable frame count: read sequentially, keep every 15th frame
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            i = 0
            while got < n and i < 900:
                ok, frame = cap.read()
                if not ok:
                    break
                if i % 15 == 0:
                    got += 1
                    yield i, (i / fps if fps > 0 else None), _limit_size(frame)
                i += 1
        if got == 0:
            raise ValueError("No frames could be read from this video.")
    finally:
        cap.release()
