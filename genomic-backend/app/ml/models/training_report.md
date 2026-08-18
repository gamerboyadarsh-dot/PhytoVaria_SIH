# ML Training Report

**Read this before quoting any number below to judges.**

These models are trained on synthetic data where labels come from our own rule engine (`backend/app/services/risk_engine.py`), NOT from real confirmed plant disease outcomes. High accuracy here means 'the model successfully learned to approximate our rules' -- it does NOT mean 'this model accurately predicts real-world tomato disease'. We do not have field-validated labels to make that second claim, and we say so explicitly rather than implying it.

The value of this pipeline: it is fully wired (feature extraction, train/test split, evaluation, serialization, inference) and ready to be retrained the moment real labeled outcomes are available -- e.g. from a partner farm's confirmed diagnoses next season.


## Early Blight

- Train samples: 2250, Test samples: 750
- Test accuracy vs. rule-engine labels: **0.997**
- Feature importances: {'resistance_gene_count': np.float64(0.002), 'susceptibility_gene_count': np.float64(0.0), 'evidence_strength_score': np.float64(0.001), 'temperature': np.float64(0.463), 'humidity': np.float64(0.465), 'soil_moisture': np.float64(0.035), 'light': np.float64(0.033)}
```
              precision    recall  f1-score   support

         LOW       1.00      1.00      1.00       648
      MEDIUM       1.00      0.98      0.99       102

    accuracy                           1.00       750
   macro avg       1.00      0.99      0.99       750
weighted avg       1.00      1.00      1.00       750

```

## Late Blight

- Train samples: 2250, Test samples: 750
- Test accuracy vs. rule-engine labels: **1.000**
- Feature importances: {'resistance_gene_count': np.float64(0.003), 'susceptibility_gene_count': np.float64(0.0), 'evidence_strength_score': np.float64(0.003), 'temperature': np.float64(0.399), 'humidity': np.float64(0.541), 'soil_moisture': np.float64(0.028), 'light': np.float64(0.026)}
```
              precision    recall  f1-score   support

         LOW       1.00      1.00      1.00       673
      MEDIUM       1.00      1.00      1.00        77

    accuracy                           1.00       750
   macro avg       1.00      1.00      1.00       750
weighted avg       1.00      1.00      1.00       750

```

## Fusarium Wilt

- Train samples: 2250, Test samples: 750
- Test accuracy vs. rule-engine labels: **0.999**
- Feature importances: {'resistance_gene_count': np.float64(0.003), 'susceptibility_gene_count': np.float64(0.0), 'evidence_strength_score': np.float64(0.003), 'temperature': np.float64(0.397), 'humidity': np.float64(0.024), 'soil_moisture': np.float64(0.542), 'light': np.float64(0.032)}
```
              precision    recall  f1-score   support

         LOW       1.00      1.00      1.00       588
      MEDIUM       1.00      0.99      1.00       162

    accuracy                           1.00       750
   macro avg       1.00      1.00      1.00       750
weighted avg       1.00      1.00      1.00       750

```