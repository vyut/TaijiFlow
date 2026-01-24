# Appendix E: Technical Data Specifications

## D.1 Data Collection Process
The system employs a real-time data collection mechanism that operates in parallel with the user's training session.
```
User Record -> Memory Buffer (Circular) -> Stop -> JSON Construction -> Client-side Download
```

## D.2 JSON Data Structure
The exported data follows a strict schema designed for Machine Learning compatibility.

```json
{
  "user_id": "user_m4x9k2abc",
  "session_id": "sess_m4x9k8xyz",
  "meta": {
    "date": "2024-12-08T12:30:00.000Z",
    "exercise": "rh_cw",
    "level": "L1",
    "user_calibration": {
      "torsoHeight": 0.234,
      "shoulderWidth": 0.156,
      "armLength": 0.312
    },
    "thresholds": {
      "checkPath": true,
      "checkRotation": true
    },
    "platform": { ... }
  },
  "summary": {
    "duration_seconds": 45.3,
    "total_frames": 1350,
    "fps_estimated": 30
  },
  "scoring": {
    "score": 85.5,
    "grade": "B",
    "correct_frames": 1155,
    "error_frames": 195
  },
  "raw_data": [
    {
      "frame_number": 0,
      "timestamp": 0.033,
      "visibility_avg": 0.945,
      "has_error": false,
      "landmarks": [ ... ],
      "active_feedbacks": []
    }
  ]
}
```

## D.3 Field Descriptions

### Identification & Metadata
| Field | Description | Utility |
|-------|-------------|---------|
| `exercise` | Movement Type (e.g., rh_cw) | **Classification Label** |
| `level` | Difficulty Level (L1-L3) | Complexity Stratification |
| `user_calibration` | Body Proportions | **Normalization Factor** |
| `thresholds` | Sensitivity Settings | Experiment Reproducibility |

### Raw Data Points (Time-Series)
| Field | Description | Utility |
|-------|-------------|---------|
| `timestamp` | Relative time (sec) | Temporal Analysis (RNN/LSTM Input) |
| `visibility_avg` | Confidence Score | **Quality Filter** |
| `landmarks` | 33 3D Pose Landmarks | **Model Input Features** |
| `active_feedbacks` | Real-time Errors | **Ground Truth Labels** |

## D.4 Readiness for Machine Learning (Phase 3)
This dataset structure directly supports future research phases:
1.  **Action Recognition:** Using `landmarks` sequence + `exercise` label.
2.  **Error Detection:** Using `landmarks` + `active_feedbacks` (Multi-label classification).
3.  **User Profiling:** Using `scoring` history + `user_id`.
