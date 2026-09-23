"""Deepfake detection engine.

Copyright (c) 2026 AdritaMarik.
All rights reserved.

This file is part of the Deepfake Detection project.
"""

"""Frame-level deepfake scoring with ONNX Runtime.

Pipeline (mirrors the paper's six stages: collect -> face detection -> features
-> model -> evaluation): sample frames, crop the largest face, score every crop
with a CNN, then aggregate the frame scores into one verdict.

The model outputs one logit per face crop; sigmoid(logit) is the "manipulation
score" (1 = fake). It is a model score, not a calibrated probability.
"""
import base64
import json
from pathlib import Path

import cv2
import numpy as np

from faces import extract_face

DEFAULT_META = {
    "arch": "unknown",
    "input_size": 224,
    "mean": [0.485, 0.456, 0.406],
    "std": [0.229, 0.224, 0.225],
    "threshold": 0.5,
    "uncertain_band": 0.15,
    "trained_on": [],
    "metrics": {},
}


def _sigmoid(x):
    return 1.0 / (1.0 + np.exp(-x))


def verdict_for(score, threshold, band):
    if score >= threshold + band:
        return "likely_fake"
    if score <= threshold - band:
        return "likely_real"
    return "inconclusive"


class Detector:
    def __init__(self, model_path):
        self.model_path = Path(model_path)
        self.meta = dict(DEFAULT_META)
        self.session = None
        self.input_name = None
        self.error = None
        self._load()

    @property
    def available(self):
        return self.session is not None

    def _load(self):
        if not self.model_path.exists():
            self.error = f"No model file found at {self.model_path}."
            return
        try:
            import onnxruntime as ort

            opts = ort.SessionOptions()
            opts.intra_op_num_threads = 1
            opts.inter_op_num_threads = 1
            opts.enable_cpu_mem_arena = False
            self.session = ort.InferenceSession(
                str(self.model_path), opts, providers=["CPUExecutionProvider"]
            )
            self.input_name = self.session.get_inputs()[0].name
            meta_path = self.model_path.with_suffix(".json")
            if meta_path.exists():
                self.meta.update(json.loads(meta_path.read_text()))
        except Exception as exc:
            self.session = None
            self.error = f"The model file could not be loaded: {exc}"

    def info(self):
        m = self.meta
        return {
            "available": self.available,
            "error": self.error,
            "arch": m["arch"],
            "threshold": m["threshold"],
            "uncertain_band": m["uncertain_band"],
            "trained_on": m["trained_on"],
            "metrics": m["metrics"],
        }

    def _prepare(self, crops):
        rgb = np.stack([cv2.cvtColor(c, cv2.COLOR_BGR2RGB) for c in crops]).astype(np.float32) / 255.0
        mean = np.asarray(self.meta["mean"], dtype=np.float32)
        std = np.asarray(self.meta["std"], dtype=np.float32)
        return np.ascontiguousarray(((rgb - mean) / std).transpose(0, 3, 1, 2), dtype=np.float32)

    @staticmethod
    def _thumb(crop):
        small = cv2.resize(crop, (96, 96), interpolation=cv2.INTER_AREA)
        ok, buf = cv2.imencode(".jpg", small, [cv2.IMWRITE_JPEG_QUALITY, 80])
        if not ok:
            raise ValueError("Could not encode a face preview.")
        return "data:image/jpeg;base64," + base64.b64encode(buf.tobytes()).decode()

    def analyze(self, frames, media_type):
        """Analyze an iterable of (index, seconds_or_None, frame_bgr)."""
        size = int(self.meta["input_size"])
        thr, band = float(self.meta["threshold"]), float(self.meta["uncertain_band"])
        crops, rows, sampled = [], [], 0
        for idx, seconds, frame in frames:
            sampled += 1
            crop, box = extract_face(frame, size)
            if crop is not None:
                crops.append(crop)
                rows.append({"index": int(idx), "time": seconds, "face_px": int(min(box[2], box[3]))})

        base = {"media_type": media_type, "frames_sampled": sampled, "frames_with_face": len(crops)}
        if not crops:
            return {**base, "verdict": "no_face", "score": None, "flagged_share": None, "frames": [],
                    "notes": ["No face was detected. Use a clear, front-facing face at least ~100 px wide."]}

        logits = self.session.run(None, {self.input_name: self._prepare(crops)})[0].reshape(-1)
        probs = _sigmoid(logits.astype(np.float64))
        score = float(np.mean(probs))
        verdict = verdict_for(score, thr, band)

        for row, crop, p in zip(rows, crops, probs):
            row["score"] = round(float(p), 3)
            row["face"] = self._thumb(crop)

        notes = []
        if media_type == "video" and len(crops) < 3:
            notes.append(f"Only {len(crops)} frame(s) had a detectable face, so this result is weak.")
        if min(r["face_px"] for r in rows) < 80:
            notes.append("The face is small in the frame. Small or blurry faces are scored less reliably.")
        if len(probs) > 2 and float(np.std(probs)) > 0.3:
            notes.append("Frames disagree strongly with each other, which often means the model is unsure.")
        if verdict == "inconclusive":
            notes.append("A score near the middle means the evidence does not point either way.")

        return {
            **base,
            "verdict": verdict,
            "score": round(score, 3),
            "flagged_share": round(float(np.mean(probs >= thr)), 3),
            "frames": rows,
            "notes": notes,
        }
