import React, { useState, useEffect } from 'react';

const ClaimPortal = () => {
  const [step, setStep] = useState(1);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletDetails, setWalletDetails] = useState(null);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState([]);

  // Add debug logging function
  const addDebugLog = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, message, data };
    console.log(`[${timestamp}] ${message}`, data || '');
    setDebugInfo(prev => [...prev, logEntry]);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const urlEmail = urlParams.get('email');
    
    if (urlToken) {
      setToken(urlToken);
      addDebugLog('Token loaded from URL', urlToken);
    }
    if (urlEmail) {
      setEmail(urlEmail);
      addDebugLog('Email loaded from URL', urlEmail);
    }
  }, []);

  const handleVerify = async () => {
    if (!token || !email) {
      setError('Please provide both token and email');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const verifyUrl = `${apiUrl}/api/claim/verify`;
      
      const requestBody = { email, claimToken: token };
      
      addDebugLog('Sending verify request to:', verifyUrl);
      addDebugLog('Request body:', requestBody);
      addDebugLog('API_URL from env:', process.env.REACT_APP_API_URL);

      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      addDebugLog('Response status:', response.status);
      addDebugLog('Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      addDebugLog('Raw response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        addDebugLog('JSON parse error:', parseError.message);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      addDebugLog('Parsed response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${data.message || 'Failed to verify claim'}`);
      }

      if (data.success) {
        setIsVerified(true);
        setStep(2);
        addDebugLog('Verification successful');
      } else {
        throw new Error(data.message || 'Verification failed');
      }
    } catch (err) {
      addDebugLog('Verify error:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const processUrl = `${apiUrl}/api/claim/process`;
      
      const requestBody = { email, claimToken: token };
      
      addDebugLog('Sending claim request to:', processUrl);
      addDebugLog('Request body:', requestBody);

      const response = await fetch(processUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      addDebugLog('Claim response status:', response.status);

      const responseText = await response.text();
      addDebugLog('Claim raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        addDebugLog('Claim JSON parse error:', parseError.message);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      addDebugLog('Claim parsed response:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${data.message || 'Failed to process claim'}`);
      }

      if (data.success && data.walletDetails) {
        setWalletDetails(data.walletDetails);
        setStep(3);
        addDebugLog('Claim successful', data.walletDetails);
      } else {
        throw new Error(data.message || 'Claim processing failed');
      }
    } catch (err) {
      addDebugLog('Claim error:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const DebugPanel = () => (
    <div className="mt-8 p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Debug Information:</h3>
      <div className="text-xs space-y-1 max-h-40 overflow-y-auto">
        {debugInfo.map((log, index) => (
          <div key={index} className="border-b border-gray-200 pb-1">
            <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
            {log.data && (
              <pre className="text-gray-600 ml-4 mt-1">
                {typeof log.data === 'object' ? JSON.stringify(log.data, null, 2) : log.data}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mavire NFT Claim</h1>
          <div className="flex justify-center space-x-2 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>1</div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>2</div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>3</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 1: Verify Your Claim</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Claim Token</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    addDebugLog('Token updated:', e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your claim token"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    addDebugLog('Email updated:', e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>
              <button
                onClick={handleVerify}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition duration-200"
              >
                {isLoading ? 'Verifying...' : 'Verify Claim'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && isVerified && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 2: Claim Your NFT</h2>
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              ✅ Claim verified successfully!
            </div>
            <p className="text-gray-600 mb-4">
              Your claim has been verified. Click below to mint your NFT and create your wallet.
            </p>
            <button
              onClick={handleClaim}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition duration-200"
            >
              {isLoading ? 'Processing...' : 'Claim NFT'}
            </button>
          </div>
        )}

        {step === 3 && walletDetails && (
          <div>
            <h2 className="text-xl font-semibold mb-4">🎉 Success!</h2>
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              Your NFT has been minted successfully!
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Wallet Address:</label>
                <p className="text-sm bg-gray-100 p-2 rounded break-all">{walletDetails.address}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Private Key:</label>
                <p className="text-sm bg-gray-100 p-2 rounded break-all">{walletDetails.privateKey}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">NFT Token ID:</label>
                <p className="text-sm bg-gray-100 p-2 rounded">{walletDetails.tokenId}</p>
              </div>
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                📧 Confirmation email sent to {email}
              </div>
              <div className="text-xs text-gray-500 mt-4">
                <p><strong>⚠️ Important:</strong> Save your wallet details securely. You'll also receive them via email.</p>
              </div>
            </div>
          </div>
        )}

        <DebugPanel />
      </div>
    </div>
  );
};

export default ClaimPortal;