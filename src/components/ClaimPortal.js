import React, { useState, useEffect } from 'react';
import './ClaimPortal.css';

const ClaimPortal = () => {
  const [claimInput, setClaimInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [claimHistory, setClaimHistory] = useState([]);

  // Enhanced API configuration with better environment variable handling
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  
  // Log API configuration for debugging
  console.log('🔧 API Configuration:', {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    API_BASE_URL: API_BASE_URL
  });

  useEffect(() => {
    checkWalletConnection();
    loadClaimHistory();
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setIsWalletConnected(true);
        setError('');
      } catch (error) {
        setError('Failed to connect wallet');
        console.error('Error connecting wallet:', error);
      }
    } else {
      setError('MetaMask not found. Please install MetaMask extension.');
    }
  };

  // Enhanced verification function with detailed debugging
  const verifyClaimOnChain = async (claimData) => {
    try {
      setIsLoading(true);
      setError('');
      
      // Log what we're sending for debugging
      console.log('🔍 Sending verification request:', {
        url: `${API_BASE_URL}/api/claim/verify`,
        data: claimData
      });

      const response = await fetch(`${API_BASE_URL}/api/claim/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(claimData),
      });

      // Log the full response for debugging
      console.log('📨 API Response Status:', response.status);
      console.log('📨 API Response Headers:', Object.fromEntries(response.headers.entries()));

      // Get response text first (might be error message)
      const responseText = await response.text();
      console.log('📨 Raw Response:', responseText);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: `;
        
        try {
          // Try to parse as JSON for structured error
          const errorData = JSON.parse(responseText);
          errorMessage += errorData.message || errorData.error || 'Failed to verify claim';
          console.log('❌ Parsed Error:', errorData);
        } catch (e) {
          // If not JSON, use raw text
          errorMessage += responseText || 'Failed to verify claim';
        }
        
        throw new Error(errorMessage);
      }

      // Parse successful response
      const data = JSON.parse(responseText);
      console.log('✅ Verification Success:', data);
      
      return {
        valid: data.valid,
        metadata: data.metadata,
        onChainData: data.onChainData
      };
      
    } catch (error) {
      console.error('❌ Verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const processClaim = async () => {
    if (!claimInput.trim()) {
      setError('Please enter a claim to verify');
      return;
    }

    if (!isWalletConnected) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      const claimData = {
        claim: claimInput.trim(),
        userAddress: walletAddress,
        timestamp: new Date().toISOString()
      };

      // Verify the claim
      const verificationData = await verifyClaimOnChain(claimData);
      
      if (verificationData.valid) {
        // Process successful verification
        const processResponse = await fetch(`${API_BASE_URL}/api/claim/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...claimData,
            verificationResult: verificationData
          }),
        });

        if (!processResponse.ok) {
          const errorData = await processResponse.json();
          throw new Error(errorData.message || 'Failed to process claim');
        }

        const processData = await processResponse.json();
        
        setVerificationResult({
          success: true,
          message: 'Claim verified and processed successfully!',
          transactionHash: processData.transactionHash,
          tokenId: processData.tokenId,
          metadata: verificationData.metadata
        });

        // Add to claim history
        const newClaim = {
          id: Date.now(),
          claim: claimInput,
          status: 'verified',
          timestamp: new Date().toISOString(),
          transactionHash: processData.transactionHash,
          tokenId: processData.tokenId
        };
        
        setClaimHistory(prev => [newClaim, ...prev]);
        localStorage.setItem('claimHistory', JSON.stringify([newClaim, ...claimHistory]));
        
      } else {
        setVerificationResult({
          success: false,
          message: 'Claim could not be verified on-chain',
          details: verificationData.metadata || {}
        });
      }

      setClaimInput('');
      
    } catch (error) {
      setError(error.message);
      setVerificationResult(null);
      console.error('Error processing claim:', error);
    }
  };

  const loadClaimHistory = () => {
    try {
      const savedHistory = localStorage.getItem('claimHistory');
      if (savedHistory) {
        setClaimHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading claim history:', error);
    }
  };

  const clearHistory = () => {
    setClaimHistory([]);
    localStorage.removeItem('claimHistory');
  };

  return (
    <div className="claim-portal">
      <div className="portal-header">
        <h1>🌟 MAVIRE Claim Portal</h1>
        <p>Submit and verify your claims on the blockchain</p>
      </div>

      <div className="wallet-section">
        {!isWalletConnected ? (
          <button onClick={connectWallet} className="connect-wallet-btn">
            🦊 Connect Wallet
          </button>
        ) : (
          <div className="wallet-info">
            <span className="wallet-status">✅ Connected</span>
            <span className="wallet-address">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          </div>
        )}
      </div>

      <div className="claim-input-section">
        <div className="input-group">
          <label htmlFor="claim-input">Enter your claim:</label>
          <textarea
            id="claim-input"
            value={claimInput}
            onChange={(e) => setClaimInput(e.target.value)}
            placeholder="Type your claim here..."
            rows={4}
            disabled={isLoading}
          />
        </div>

        <button
          onClick={processClaim}
          disabled={isLoading || !isWalletConnected}
          className="submit-claim-btn"
        >
          {isLoading ? '⏳ Processing...' : '🚀 Submit & Verify Claim'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">❌</span>
          {error}
        </div>
      )}

      {verificationResult && (
        <div className={`result-section ${verificationResult.success ? 'success' : 'failure'}`}>
          <div className="result-header">
            <span className="result-icon">
              {verificationResult.success ? '✅' : '❌'}
            </span>
            <h3>{verificationResult.success ? 'Success!' : 'Verification Failed'}</h3>
          </div>
          
          <p className="result-message">{verificationResult.message}</p>
          
          {verificationResult.success && (
            <div className="success-details">
              {verificationResult.transactionHash && (
                <p><strong>Transaction:</strong> {verificationResult.transactionHash}</p>
              )}
              {verificationResult.tokenId && (
                <p><strong>Token ID:</strong> {verificationResult.tokenId}</p>
              )}
            </div>
          )}
          
          {verificationResult.details && (
            <div className="failure-details">
              <p><strong>Details:</strong></p>
              <pre>{JSON.stringify(verificationResult.details, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {claimHistory.length > 0 && (
        <div className="history-section">
          <div className="history-header">
            <h3>📜 Claim History</h3>
            <button onClick={clearHistory} className="clear-history-btn">
              Clear History
            </button>
          </div>
          
          <div className="history-list">
            {claimHistory.map((claim) => (
              <div key={claim.id} className="history-item">
                <div className="claim-content">
                  <p className="claim-text">{claim.claim}</p>
                  <div className="claim-meta">
                    <span className={`status ${claim.status}`}>{claim.status}</span>
                    <span className="timestamp">
                      {new Date(claim.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                {claim.transactionHash && (
                  <div className="claim-details">
                    <small>TX: {claim.transactionHash.slice(0, 10)}...</small>
                    {claim.tokenId && <small>Token ID: {claim.tokenId}</small>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimPortal;