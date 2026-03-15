import yfinance as yf
import pandas as pd

data = yf.download("AAPL", start="2020-01-01", end="2024-01-01")

data = data[['Open','High','Low','Close','Volume']]

data.to_csv("data/stock.csv", index=False)

print("Dataset saved correctly!")