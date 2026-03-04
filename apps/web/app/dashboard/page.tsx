'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState([]);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'metrics') {
        setMetrics(data.data.metrics.metrics);
        setHealth(data.data.health);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Voice Assistant Dashboard</h1>

      {/* Health Status */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <p className="text-gray-400">Status</p>
          <p className={`text-3xl font-bold ${health?.status === 'healthy' ? 'text-green-500' : 'text-red-500'}`}>
            {health?.status || 'Unknown'}
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <p className="text-gray-400">Latency</p>
          <p className="text-3xl font-bold text-yellow-500">{health?.latencyMs || 0}ms</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <p className="text-gray-400">Provider</p>
          <p className="text-3xl font-bold text-blue-500">{health?.provider || 'N/A'}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Response Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="responseTimeMs" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Tokens Used</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tokensUsed" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}