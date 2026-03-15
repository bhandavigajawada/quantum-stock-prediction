import torch
import torch.nn as nn
import torch.optim as optim
import yfinance as yf
import numpy as np

from quantum_model import QuantumModel

# Download stock data
data = yf.download("AAPL", period="1y")

# Prepare features
features = data[["Open", "High", "Low", "Close"]].values.astype(np.float32)

# Target = next day close
targets = data["Close"].shift(-1).dropna().values.astype(np.float32)

# Remove last row from features
features = features[:-1]

# Convert to tensors
X = torch.tensor(features).float()
y = torch.tensor(targets).float()

# Make target shape correct
y = y.view(-1,1)

# Initialize model
model = QuantumModel().float()

loss_fn = nn.MSELoss()
optimizer = optim.Adam(model.parameters(), lr=0.01)

epochs = 50

for epoch in range(epochs):

    optimizer.zero_grad()

    outputs = model(X)

    loss = loss_fn(outputs, y)

    loss.backward()

    optimizer.step()

    if epoch % 10 == 0:
        print("Epoch:", epoch, "Loss:", loss.item())

# Save model
torch.save(model.state_dict(), "model.pth")

print("Training Finished")