# ML Training Report

**Read this before quoting any number below to judges.**

These models are trained on synthetic data where labels come from our own rule engine (`backend/app/services/risk_engine.py`), NOT from real confirmed plant disease outcomes. High accuracy here means 'the model successfully learned to approximate our rules' -- it does NOT mean 'this model accurately predicts real-world tomato disease'. We do not have field-validated labels to make that second claim, and we say so explicitly rather than implying it.

The value of this pipeline: it is fully wired (feature extraction, train/test split, evaluation, serialization, inference) and ready to be retrained the moment real labeled outcomes are available -- e.g. from a partner farm's confirmed diagnoses next season.


## Early Blight

- Train samples: 2250, Test samples: 750
- Test accuracy vs. rule-engine labels: **0.997**
- Feature importances: {'resistance_gene_count': np.float64(0.001), 'susceptibility_gene_count': np.float64(0.0), 'evidence_strength_score': np.float64(0.001), 'temperature': np.float64(0.425), 'humidity': np.float64(0.522), 'soil_moisture': np.float64(0.024), 'light': np.float64(0.026)}
```
              precision    recall  f1-score   support

         low       1.00      0.99      1.00       247
    moderate       1.00      1.00      1.00       503

    accuracy                           1.00       750
   macro avg       1.00      1.00      1.00       750
weighted avg       1.00      1.00      1.00       750

```

## Late Blight

- Train samples: 2250, Test samples: 750
- Test accuracy vs. rule-engine labels: **1.000**
- Feature importances: {'resistance_gene_count': np.float64(0.068), 'susceptibility_gene_count': np.float64(0.0), 'evidence_strength_score': np.float64(0.252), 'temperature': np.float64(0.322), 'humidity': np.float64(0.327), 'soil_moisture': np.float64(0.016), 'light': np.float64(0.015)}
```
              precision    recall  f1-score   support

         low       1.00      1.00      1.00       468
    moderate       1.00      1.00      1.00       282

    accuracy                           1.00       750
   macro avg       1.00      1.00      1.00       750
weighted avg       1.00      1.00      1.00       750

```

## Fusarium Wilt

- Train samples: 2250, Test samples: 750
- Test accuracy vs. rule-engine labels: **0.995**
- Feature importances: {'resistance_gene_count': np.float64(0.182), 'susceptibility_gene_count': np.float64(0.0), 'evidence_strength_score': np.float64(0.163), 'temperature': np.float64(0.473), 'humidity': np.float64(0.15), 'soil_moisture': np.float64(0.016), 'light': np.float64(0.016)}
```
              precision    recall  f1-score   support

         low       1.00      0.99      0.99       370
    moderate       0.99      1.00      0.99       380

    accuracy                           0.99       750
   macro avg       0.99      0.99      0.99       750
weighted avg       0.99      0.99      0.99       750

```

## Bacterial Spot

- Train samples: 2250, Test samples: 750
- Test accuracy vs. rule-engine labels: **0.984**
- Feature importances: {'resistance_gene_count': np.float64(0.065), 'susceptibility_gene_count': np.float64(0.0), 'evidence_strength_score': np.float64(0.24), 'temperature': np.float64(0.321), 'humidity': np.float64(0.319), 'soil_moisture': np.float64(0.027), 'light': np.float64(0.027)}
```
              precision    recall  f1-score   support

         low       0.98      1.00      0.99       585
    moderate       0.99      0.93      0.96       165

    accuracy                           0.98       750
   macro avg       0.99      0.97      0.98       750
weighted avg       0.98      0.98      0.98       750

```