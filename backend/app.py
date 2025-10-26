from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import pickle
import re

app = FastAPI()

# ✅ Izinkan koneksi dari frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 Load model dan vectorizer
with open("model/naive_bayes_model.pkl", "rb") as f:
    nb_model = pickle.load(f)
with open("model/random_forest_model.pkl", "rb") as f:
    rf_model = pickle.load(f)
with open("model/tfidf_vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

# 🔹 Fungsi cleaning
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'http\S+|www.\S+', '', text)
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

@app.post("/predict")
async def predict(request: Request):
    data = await request.json()
    user_input = data.get("text", "")
    model_choice = data.get("model", "Naive Bayes")

    cleaned = clean_text(user_input)
    vectorized = vectorizer.transform([cleaned])

    model = nb_model if model_choice == "Naive Bayes" else rf_model
    pred = model.predict(vectorized)[0]

    rekomendasi = {
        "Demam": "Minum paracetamol dan istirahat cukup.",
        "Flu": "Minum air hangat dan vitamin C.",
        "Migrain": "Istirahat di ruangan gelap dan konsumsi obat pereda nyeri.",
        "Batuk": "Minum madu atau obat batuk, hindari minuman dingin."
    }

    response = {
        "response": f"Saya menduga kamu mengalami **{pred}**.",
        "rekomendasi": rekomendasi.get(pred, "Segera konsultasikan ke dokter jika tidak membaik."),
    }

    return response
