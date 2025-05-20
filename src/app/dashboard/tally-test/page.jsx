'use client';

import { useState } from 'react';
import TallyIntegration from '../../../components/TallyIntegration';

export default function TallyTest() {
  const [syncResult, setSyncResult] = useState(null);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tally Integration Test</h1>
      
      <div className="mb-4">
        <TallyIntegration 
          onSyncComplete={(result) => {
            console.log('Sync result:', result);
            setSyncResult(result);
          }} 
        />
      </div>
      
      {syncResult && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold">Sync Result:</h2>
          <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(syncResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
