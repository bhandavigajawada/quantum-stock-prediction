import yfinance as yf
import torch
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from quantum_model import QuantumModel

app = FastAPI()

# Allow frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained model
model = QuantumModel()

try:
    model.load_state_dict(torch.load("model.pth", map_location=torch.device("cpu")))
    model.eval()
    print("Model loaded successfully")
except Exception as e:
    print("Model loading failed:", e)


# Home API
@app.get("/")
def home():
    return {"message": "Quantum Stock Prediction Backend Running"}


# ---------------------------------
# Live Stock Data
# ---------------------------------
@app.get("/stock/{symbol}")
def get_stock(symbol: str):

    stock = yf.Ticker(symbol)
    data = stock.history(period="1d")

    if data.empty:
        return {"error": "Stock not found"}

    latest = data.iloc[-1]

    return {
        "symbol": symbol,
        "open": float(latest["Open"]),
        "high": float(latest["High"]),
        "low": float(latest["Low"]),
        "close": float(latest["Close"]),
        "volume": float(latest["Volume"])
    }


# ---------------------------------
# Quantum Prediction
# ---------------------------------
@app.get("/predict/{symbol}")
def predict_stock(symbol: str):

    stock = yf.Ticker(symbol)
    data = stock.history(period="1d")

    if data.empty:
        return {"error": "Stock not found"}

    latest = data.iloc[-1]

    open_price = float(latest["Open"])
    high_price = float(latest["High"])
    low_price = float(latest["Low"])
    close_price = float(latest["Close"])
    volume = float(latest["Volume"])

    # Send all 5 features
    x = torch.tensor([[open_price, high_price, low_price, close_price, volume]], dtype=torch.float32)

    try:
        with torch.no_grad():
            prediction = model(x)

        prediction_value = float(prediction.item())

    except Exception as e:
        return {"error": str(e)}

    return {
        "symbol": symbol,
        "live_price": close_price,
        "quantum_prediction": prediction_value
    }