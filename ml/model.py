# ml/model.py
from flask import Flask, request, jsonify
import joblib
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier

MODEL_PATH = "ml_model.pkl"
VECT_PATH = "vectorizer.pkl"

app = Flask(__name__)

# Simple helper training if no model exists (toy sample)
def train_sample():
    urls = [
        "https://winfreecash.com",
        "https://getbonusprize.net",
        "http://secure-login-paypal.com",
        "https://www.google.com",
        "https://www.github.com",
        "https://amazon.in",
        "http://offer-cash-prize.org",
        "https://login.bank-example.com"
    ]
    labels = [1,1,1,0,0,0,1,1]  # 1 fraud, 0 safe
    vect = TfidfVectorizer(analyzer='char_wb', ngram_range=(3,6))
    X = vect.fit_transform(urls)
    clf = RandomForestClassifier(n_estimators=200, random_state=42)
    clf.fit(X, labels)
    joblib.dump(clf, MODEL_PATH)
    joblib.dump(vect, VECT_PATH)
    return clf, vect

# load or train
if os.path.exists(MODEL_PATH) and os.path.exists(VECT_PATH):
    clf = joblib.load(MODEL_PATH)
    vect = joblib.load(VECT_PATH)
    print("Loaded ML model.")
else:
    clf, vect = train_sample()
    print("Trained sample ML model (replace with real dataset later).")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json() or {}
    link = data.get("link", "")
    if not isinstance(link, str) or not link.strip():
        return jsonify({"error":"link required"}), 400
    x = vect.transform([link.strip()])
    pred = clf.predict(x)[0]
    # optional: include probability
    prob = float(max(clf.predict_proba(x)[0]))
    return jsonify({"link": link, "isFraud": bool(pred), "score": prob})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)
