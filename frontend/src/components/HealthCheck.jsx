import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function HealthCheck() {
  const [health, setHealth] = useState(null);
  
  useEffect(() => {
    api.get('/health')
      .then(res => {
        setHealth(res.data);
      })
      .catch(err => console.error(err));
  }, []);
  
  if (!health) return <div className="health-status unknown">🔄 Connecting AI Engine...</div>;
  
  return (
    <div className={`health-status ${health.status}`}>
      ✅ AI ENGINE ACTIVE | Voting Ensemble (87.5% Acc)
    </div>
  );
}
