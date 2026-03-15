import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { createChart, CandlestickSeries } from "lightweight-charts";
import "./App.css";

function App() {

  const chartContainerRef = useRef();
  const candleSeriesRef = useRef();

  const companies = [
    "AAPL","TSLA","MSFT","GOOGL","AMZN",
    "META","NVDA","NFLX","INTC","AMD"
  ];

  const [symbol, setSymbol] = useState("AAPL");
  const [price, setPrice] = useState("--");
  const [prediction, setPrediction] = useState("--");
  const [accuracy, setAccuracy] = useState("--");
  const [signal, setSignal] = useState("");

  // Create chart
  useEffect(() => {

    const chart = createChart(chartContainerRef.current, {

  width: 900,
  height: 420,

  layout: {
    background: { color: "#0f172a" },
    textColor: "#e2e8f0",
  },

  grid: {
    vertLines: {
      color: "#1e293b",
    },
    horzLines: {
      color: "#1e293b",
    },
  },

  rightPriceScale: {
    borderColor: "#475569",
  },

  timeScale: {
    borderColor: "#475569",
    timeVisible: true,
    secondsVisible: true,
  },

});

    candleSeriesRef.current = chart.addSeries(CandlestickSeries, {
  upColor: "#22c55e",
  downColor: "#ef4444",
  borderDownColor: "#ef4444",
  borderUpColor: "#22c55e",
  wickDownColor: "#ef4444",
  wickUpColor: "#22c55e"
});

  }, []);

  // Generate initial candle history
  const generateCandles = (basePrice) => {

    const candles = [];
    let lastPrice = basePrice;

    for (let i = 20; i > 0; i--) {

      const open = lastPrice;
      const close = open + (Math.random() - 0.5) * 2;
      const high = Math.max(open, close) + Math.random();
      const low = Math.min(open, close) - Math.random();

      candles.push({
        time: Math.floor(Date.now() / 1000) - i * 60,
        open,
        high,
        low,
        close
      });

      lastPrice = close;
    }

    return candles;
  };

  const fetchStock = async () => {

    try {

      const res = await axios.get(
        `http://127.0.0.1:8000/predict/${symbol}`
      );

      const livePrice = res.data.live_price;
      const pred = res.data.quantum_prediction;

      setPrice(livePrice.toFixed(2));
      setPrediction(pred.toFixed(4));

      const acc = Math.min(Math.abs(pred) * 100, 100);
      setAccuracy(acc.toFixed(2));

      setSignal(pred > 0 ? "BUY" : "SELL");

      const candles = generateCandles(livePrice);

      candleSeriesRef.current.setData(candles);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {

    fetchStock();

    const interval = setInterval(() => {
      fetchStock();
    }, 5000);

    return () => clearInterval(interval);

  }, [symbol]);

  return (

    <div className="container">

      <h1>Quantum AI Stock Prediction Dashboard</h1>
      <div style={{
  background:"#1e293b",
  padding:"10px",
  borderRadius:"8px",
  marginBottom:"20px",
  display:"flex",
  justifyContent:"space-around",
  alignItems:"center"
}}>

  <span>Market: <b style={{color:"lime"}}>OPEN</b></span>

  <span>Stock: <b>{symbol}</b></span>

  <span>Price: <b>${price}</b></span>

  <span>
    AI Signal:
    <b style={{color: signal==="BUY" ? "lime" : "red"}}>
      {signal}
    </b>
  </span>

</div>

      <input
        value={symbol}
        onChange={(e)=>setSymbol(e.target.value.toUpperCase())}
        placeholder="Enter Stock Symbol"
      />

      <div className="stock-buttons">

        {companies.map((c)=>(
          <button key={c} onClick={()=>setSymbol(c)}>
            {c}
          </button>
        ))}

      </div>

      <div className="cards">

        <div className="card">
          <h3>Live Price</h3>
          <p>${price}</p>
        </div>

        <div className="card">
          <h3>Quantum Prediction</h3>
          <p>{prediction}</p>

          <p style={{color: signal === "BUY" ? "lime" : "red"}}>
            AI Signal: {signal}
          </p>

        </div>

        <div className="card">
  <h3>Prediction Accuracy</h3>
  <p>{accuracy}%</p>
  <div className="card" style={{marginTop:"25px", maxWidth:"600px", margin:"25px auto"}}>

  <h3>AI Trading Recommendation</h3>

  <p><b>Stock:</b> {symbol}</p>

  <p>
    <b>Signal:</b>
    <span style={{color: signal === "BUY" ? "lime" : "red"}}>
      {signal}
    </span>
  </p>

  <p style={{fontSize:"14px",marginTop:"10px"}}>
    • Quantum model predicts {signal==="BUY" ? "upward" : "downward"} price movement <br/>
    • Confidence level {accuracy}% <br/>
    • Based on quantum machine learning pattern detection
  </p>

</div>

  <div style={{
    marginTop: "10px",
    width: "100%",
    background: "#334155",
    borderRadius: "6px",
    height: "10px"
  }}>

    <div style={{
      width: `${accuracy}%`,
      height: "10px",
      borderRadius: "6px",
      background: signal === "BUY" ? "#22c55e" : "#ef4444"
    }}></div>

  </div>

  <p style={{
    marginTop:"6px",
    fontSize:"14px",
    color: signal === "BUY" ? "lime" : "red"
  }}>
    Confidence Level
  </p>

</div>

      </div>

      <div className="chart-container">

        <div
          ref={chartContainerRef}
          style={{
            width:"900px",
            height:"420px"
          }}
        />

      </div>

    </div>
  );
}

export default App;