import os
import json
import logging
import torch
from transformers import T5Tokenizer, T5ForConditionalGeneration
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import FeatureUnion
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, VotingClassifier

logger = logging.getLogger(__name__)

# Device setup
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
logger.info(f"Using device: {device}")

# 1. Load T5 Model if available
tokenizer = None
model = None
try:
    logger.info("Checking for local T5 model...")
    tokenizer = T5Tokenizer.from_pretrained('sif_detection_model', local_files_only=True)
    model = T5ForConditionalGeneration.from_pretrained('sif_detection_model', local_files_only=True)
    model.to(device)
    model.eval()
    logger.info("✅ T5 model loaded successfully!")
except Exception as e:
    logger.info(f"T5 local checkpoint not found, falling back to Soft-Voting Ensemble: {e}")
    tokenizer = None
    model = None

# 2. Train / Load High-Accuracy Dual Feature Voting Ensemble
local_vectorizer = None
local_classifier = None

try:
    training_data_path = os.getenv(
        'SIF_TRAINING_DATA_PATH',
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'sif_training_data.json')
    )
    if os.path.exists(training_data_path):
        with open(training_data_path, encoding='utf-8') as training_file:
            training_records = json.load(training_file)

        training_texts = [
            record.get('text') or record.get('original_text', '')
            for record in training_records
        ]
        training_labels = [record.get('label', '').upper() for record in training_records]
        valid_records = [
            (text, label) for text, label in zip(training_texts, training_labels)
            if text and label
        ]

        if len({label for _, label in valid_records}) > 1:
            # Dual Feature Extractor: Word n-grams + Character n-grams for sub-word patterns
            local_vectorizer = FeatureUnion([
                ('word_tfidf', TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, stop_words='english', min_df=2)),
                ('char_tfidf', TfidfVectorizer(ngram_range=(3, 5), analyzer='char', sublinear_tf=True, min_df=3))
            ])
            
            train_texts = [text for text, _ in valid_records]
            train_labels = [label for _, label in valid_records]
            
            local_features = local_vectorizer.fit_transform(train_texts)

            # Multi-model Voting Ensemble (Random Forest + Extra Trees + Class-Balanced Logistic Regression)
            rf = RandomForestClassifier(n_estimators=300, class_weight='balanced', random_state=42, n_jobs=-1)
            et = ExtraTreesClassifier(n_estimators=300, class_weight='balanced', random_state=42, n_jobs=-1)
            lr = LogisticRegression(max_iter=1000, class_weight='balanced', C=2.5, random_state=42)

            local_classifier = VotingClassifier(
                estimators=[('rf', rf), ('et', et), ('lr', lr)],
                voting='soft'
            )
            local_classifier.fit(local_features, train_labels)
            logger.info(
                "✅ High-accuracy Voting Ensemble model trained from %d labeled safety records!",
                len(valid_records)
            )
    else:
        logger.warning(f"Training dataset not found at {training_data_path}")
except Exception as e:
    logger.error(f"Error loading local training data: {e}")


def classify_report(text):
    """
    Classify safety report using ML model (T5 / Soft-Voting Ensemble) with domain guardrails.
    Returns: (predicted_label, confidence_score)
    """
    if not text:
        return 'LOW', 0.0

    text_str = str(text)
    text_lower = text_str.lower()

    predicted_label = None
    confidence = 0.70

    # Step 1. Try T5 Model if available
    if model is not None and tokenizer is not None:
        try:
            inputs = tokenizer(text_str, return_tensors="pt", max_length=512, truncation=True).to(device)
            outputs = model.generate(**inputs, max_length=20)
            t5_output = tokenizer.decode(outputs[0], skip_special_tokens=True).strip().upper()
            if t5_output in ['CRITICAL', 'MEDIUM', 'LOW']:
                predicted_label = t5_output
                confidence = 0.88
        except Exception as e:
            logger.error(f"Error during T5 model classification: {e}")

    # Step 2. Use trained Voting Ensemble Classifier
    if predicted_label is None and local_classifier is not None and local_vectorizer is not None:
        try:
            features = local_vectorizer.transform([text_str])
            raw_pred = local_classifier.predict(features)[0].upper()
            probs = local_classifier.predict_proba(features)[0]
            
            # Map predicted label and confidence
            if raw_pred in local_classifier.classes_:
                cls_idx = list(local_classifier.classes_).index(raw_pred)
                confidence = float(probs[cls_idx])
            
            predicted_label = raw_pred
            logger.info(f"Voting Ensemble prediction: {predicted_label} (Confidence: {confidence:.4f})")
        except Exception as e:
            logger.error(f"Error during ML classifier prediction: {e}")

    # Fallback default if ML was unavailable
    if predicted_label not in ['CRITICAL', 'MEDIUM', 'LOW']:
        predicted_label = 'LOW'

    # Step 3. Domain Safeguards (Keyword overrides for extreme safety events)
    negated_phrases = ['no hazard', 'no safety hazard', 'no issue', 'no defect', 'no damage', 'no leak', 'no risk', 'no injuries']
    is_negated = any(phrase in text_lower for phrase in negated_phrases)

    if not is_negated:
        critical_keywords = [
            'fatality', 'fatal', 'death', 'died', 'killed',
            'explosion', 'blowout', 'uncontrolled release',
            'toxic release', 'severe injury', 'evacuation',
            'could lead to fatality', 'life threatening'
        ]
        
        critical_count = sum(1 for kw in critical_keywords if kw in text_lower)

        # Domain override: ensure explicit critical life-safety hazards are flagged as CRITICAL
        if critical_count >= 1 and predicted_label != 'CRITICAL':
            logger.info("Safety guardrail: Overriding ML prediction to CRITICAL based on high-severity domain keywords.")
            predicted_label = 'CRITICAL'
            confidence = max(confidence, 0.90)

    return predicted_label, round(float(confidence), 4)
