import React, { useState } from "react";
import axios from "axios";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const BACKEND_API_URL = 'https://3200-hashfx-nitrowrapped-j7sp7hql4vg.ws-us117.gitpod.io/nitro-wrapped';

  const handleSearch = async () => {
    if (!walletAddress) {
      setError("Please enter a wallet address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${BACKEND_API_URL}/${walletAddress}`);
      setData(response.data);
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Nitro Wrapped</h1>
      <div className="w-full max-w-md">
        <input
          type="text"
          placeholder="Enter Wallet Address"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSearch}
          className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {data && (
        <div className="mt-8 bg-white shadow-md rounded-lg p-6 w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">Wallet Summary</h2>
          <ul className="space-y-2">
            <li>
              <strong>Total Transactions:</strong> {data.totalTransactions || 0}
            </li>
            <li>
              <strong>Total Bridge Fee Paid:</strong> {data.totalBridgeFeePaid ? data.totalBridgeFeePaid.toFixed(2) : '0.00'} USD
            </li>
            <li>
              <strong>Most Used Token:</strong>
              {data.mostUsedToken ? `${data.mostUsedToken.name} (${data.mostUsedToken.count})` : 'N/A'}
            </li>
            <li>
              <strong>Top Bridge Fee Token:</strong>
              {data.topBridgeFeeToken
                ? `${data.topBridgeFeeToken.name} ($${data.topBridgeFeeToken.amount.toFixed(2)})`
                : 'N/A'}
            </li>
            <li>
              <strong>Transaction with Highest Value:</strong>
              {data.transactionWithHighestValue
                ? `${data.transactionWithHighestValue.amount.toFixed(2)} ${data.transactionWithHighestValue.token}`
                : 'N/A'}
            </li>
            <li>
              <strong>Top Source Chain:</strong>
              {data.topSourceChainCount
                ? `${data.topSourceChainCount.chain} (${data.topSourceChainCount.count})`
                : 'N/A'}
            </li>
            <li>
              <strong>Top Destination Chain:</strong>
              {data.topDestinationChainCount
                ? `${data.topDestinationChainCount.chain} (${data.topDestinationChainCount.count})`
                : 'N/A'}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
