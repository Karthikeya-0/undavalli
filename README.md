# 🧠 Fraud URL Detection System
*A Machine Learning Powered Web App for Detecting Malicious URLs*

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/Backend-Node.js-68A063?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/ML-Python%20%7C%20Java-yellow?style=for-the-badge&logo=python"/>
  <img src="https://img.shields.io/badge/Build-Vite-blueviolet?style=for-the-badge&logo=vite"/>
</p>

---

## 📌 Overview

The **Fraud URL Detection System** is a full-stack application that automatically detects whether a given URL is **malicious** or **safe** using Machine Learning.

It uses:

- ⚛️ **React (Vite)** – for a clean, fast admin dashboard  
- 🌐 **Node.js + Express** – backend API  
- ☁️ **MongoDB Atlas (live cloud database)** – stores analyzed URLs  
- 🤖 **ML Model (Python Flask or Java Spring Boot)** – predicts fraud/safe  
- 🧠 **Training support** – the model improves with more collected data  

The system is built to scale, easy to manage, and ready for production.

---

# 🏗️ System Architecture

```
                ┌──────────────────────┐
                │      React UI        │
                │  (Admin Dashboard)   │
                └──────────┬───────────┘
                           │  HTTP (Frontend -> Backend)
                           ▼
                ┌──────────────────────┐
                │   Node.js Backend    │
                │  Express REST API    │
                └───────┬───────┬─────┘
                        │       │
        MongoDB Atlas   │       │   Machine Learning API (Python/Java)
     (Live Cloud DB)    │       │   ┌────────────────────────┐
   ┌────────────────────▼─┐     └──►│ /predict → Fraud/Safe  │
   │ Stores All URLs + ML │         │ ML Model (Trained)     │
   │ Predictions          │◄────────┤ Returns JSON           │
   └──────────────────────┘         └────────────────────────┘
```

---

# Features

### 🔍 **AI Fraud Detection**
Every URL submitted is analyzed using a trained machine learning model that identifies suspicious patterns.

### ☁️ **Live Cloud Database (MongoDB Atlas)**
All URLs, predictions, and metadata are stored securely in MongoDB Atlas — available anywhere, anytime.

### ➕ **Add URLs**
Add URLs one-by-one or let the ML system automatically classify them.

### 🔎 **Check URLs**
Instantly verify if a URL exists in the database and see its fraud/safe status.

### 📦 **Bulk URL Upload**
Upload 100s or 1000s of URLs using a text file or multiline input — each link is analyzed and stored.

### 🗑️ **Delete URLs (Admin Only)**
Clean up incorrect or test URLs directly from the UI.

### 🧠 **ML Training Support**
The system can be trained on:
- Real phishing datasets (PhishTank, Kaggle)  
- Generated synthetic phishing URLs  
- Your own collected fraudulent links  

More data = higher accuracy.

---

# ⚙️ Running the Application Locally

## **1️⃣ Start the Backend (Node.js)**
```bash
node app.js
```
Serves all API routes and talks to MongoDB Atlas + ML API.

---

## **2️⃣ Start the Machine Learning API**

### **Option A — Python ML API**
```bash
cd ml
python model.py
```

### **Option B — Java ML API (Spring Boot)**
```bash
cd mlapi
mvn spring-boot:run
```

Runs a REST API on port `5000`  
Node sends all predictions to:  
```
POST http://127.0.0.1:5000/predict
```

---

## **3️⃣ Start the Frontend (React + Vite)**
```bash
cd client
npm run dev
```

React UI will open at:
```
http://localhost:5173
```

---

# 📂 Project Folder Structure

```
fraud-url-detector/
│
├── app.js                     # Node.js backend
├── package.json
├── import_fraud_links.js      # Auto-import script
├── fraud_links_1000.txt       # Sample fraud links
│
├── ml/                        # Python ML model
│   ├── model.py
│   ├── ml_model.pkl
│   └── vectorizer.pkl
│
├── mlapi/                     # Java ML API (optional)
│   └── (Spring Boot project)
│
├── client/                    # React (Vite) Frontend
│   ├── src/
│   ├── vite.config.js
│   ├── package.json
│   └── index.html
│
└── public/
    └── index.html
```

---

# 📡 API Endpoints (Backend)

### **🔹 POST /add**
Add a single URL  
Returns ML prediction + stored DB object.

### **🔹 POST /check**
Check if a URL already exists in the database.

### **🔹 POST /bulk-add**
Upload multiple URLs at once.  
Each is validated, analyzed by ML, and stored.

### **🔹 GET /urls**
Fetch all stored URLs.

### **🔹 DELETE /delete/:id**
Remove an entry from the database.

---

# 🧪 ML Prediction API (Python/Java)

### **POST /predict**
```json
{
  "link": "https://example.com"
}
```

### ML API Response:
```json
{
  "link": "https://example.com",
  "isFraud": false
}
```

---

# 🧠 Training the ML Model (Future Upgrades)

You can improve the ML accuracy by retraining the model using:
- Real phishing datasets (PhishTank, Kaggle)
- Your collected fraud URLs in MongoDB
- Synthetic generated URLs

Training steps:
1. Clean and prepare dataset  
2. Train classifier (SVM / Logistic Regression / Neural Network)  
3. Export model (`.pkl` or `.onnx`)  
4. Load model in ML API  
5. Node.js uses updated predictions automatically  

I can help you implement this too.

---

# 🖼️ Screenshots 

###  Dashboard  
*(insert screenshot)*

### 📌 URL Check  
*(insert screenshot)*

### 📌 Bulk Upload  
*(insert screenshot)*

---

# 👨‍💻 Author
**KARTHIKEYA.UNDAVALLI**  
🔗 GitHub: https://github.com/Karthikeya-0  
💼 Project: Fraud URL Detection System
