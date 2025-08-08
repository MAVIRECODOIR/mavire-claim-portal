import React, { useState, useEffect } from 'react';
import { Shield, Package, Wallet, CheckCircle, AlertCircle, Copy, Eye, EyeOff, Download, ExternalLink } from 'lucide-react';

const MavireClaimPortal = () => {
  const [currentStep, setCurrentStep] = useState('verify');
  const [claimToken, setClaimToken] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [walletDetails, setWalletDetails] = useState(null);
  const [nftDetails, setNftDetails] = useState(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');

<<<<<<< HEAD
=======
  // Use environment variable for API base URL
>>>>>>> 301799ebd07f2736ceec075b72f464d51b4b71f5
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  // Get token and email from URL params on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');
    if (token) setClaimToken(token);
    if (email) setEmail(email);
<<<<<<< HEAD
    console.log('API_BASE:', API_BASE);
=======
    console.log('API_BASE:', API_BASE); // Debug: Log API base URL
>>>>>>> 301799ebd07f2736ceec075b72f464d51b4b71f5
  }, []);

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setError('Failed to copy to clipboard');
    }
  };

  const handleVerifyEmail = async () => {
    if (!email || !claimToken) {
      setError('Please provide both email and claim token');
      return;
    }

    setLoading(true);
    setError('');
<<<<<<< HEAD
    const verifyUrl = `${API_BASE}/api/claim/verify`;
    console.log('Fetching:', verifyUrl);
=======
    const verifyUrl = `${API_BASE}/api/verify-claim`;
    console.log('Fetching:', verifyUrl); // Debug: Log full URL
>>>>>>> 301799ebd07f2736ceec075b72f464d51b4b71f5

    try {
      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          claimToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to verify claim`);
      }

      const data = await response.json();
      if (data.orderId) {
        setOrderDetails({
          orderNumber: data.orderId,
          productName: data.productName,
          customerName: data.customerName,
          createdAt: data.orderDate || new Date().toISOString(),
        });
        setCurrentStep('confirmed');
      } else {
        throw new Error(data.error || 'Invalid claim token or email');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify claim');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimNFT = async () => {
    setLoading(true);
    setError('');
<<<<<<< HEAD
    const claimUrl = `${API_BASE}/api/claim/process`;
    console.log('Fetching:', claimUrl);
=======
    const claimUrl = `${API_BASE}/api/process`;
    console.log('Fetching:', claimUrl); // Debug: Log full URL
>>>>>>> 301799ebd07f2736ceec075b72f464d51b4b71f5

    try {
      const response = await fetch(claimUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          claimToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to process NFT claim`);
      }

      const data = await response.json();
      if (data.walletAddress) {
        setWalletDetails({
          address: data.walletAddress,
          privateKey: data.privateKey,
          mnemonic: data.recoveryPhrase,
        });
        setNftDetails({
          tokenId: data.nftTokenId,
          transactionHash: data.transactionHash,
          contractAddress: data.nftContractAddress,
          certificateId: data.nftTokenId, // Map to certificateId for UI
        });
        setCurrentStep('success');
      } else {
        throw new Error(data.error || 'Failed to claim NFT');
      }
    } catch (err) {
      console.error('Claim error:', err);
      setError(err.message || 'Failed to claim NFT');
    } finally {
      setLoading(false);
    }
  };

  const downloadWalletInfo = () => {
    const walletInfo = {
      address: walletDetails.address,
      privateKey: walletDetails.privateKey,
      mnemonic: walletDetails.mnemonic,
      network: 'Polygon',
      createdAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(walletInfo, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mavire-wallet-${walletDetails.address.slice(0, 8)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderVerificationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Claim</h2>
        <p className="text-gray-600">Enter your email and claim token to verify your NFT certificate eligibility</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Claim Token</label>
          <input
            type="text"
            value={claimToken}
            onChange={(e) => setClaimToken(e.target.value)}
            placeholder="Enter your unique claim token"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <button
          onClick={handleVerifyEmail}
          disabled={loading || !email || !claimToken}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Shield className="w-5 h-5" />
              <span>Verify Claim</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Claim Verified!</h2>
        <p className="text-gray-600">Your order details have been confirmed. Ready to mint your NFT certificate?</p>
      </div>

      {orderDetails && (
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Order Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Order Number:</span>
              <p className="font-medium">#{orderDetails.orderNumber}</p>
            </div>
            <div>
              <span className="text-gray-500">Product:</span>
              <p className="font-medium">{orderDetails.productName}</p>
            </div>
            <div>
              <span className="text-gray-500">Customer:</span>
              <p className="font-medium">{orderDetails.customerName}</p>
            </div>
            <div>
              <span className="text-gray-500">Date:</span>
              <p className="font-medium">{new Date(orderDetails.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-medium text-purple-900 mb-2">What happens next?</h4>
        <ul className="text-sm text-purple-700 space-y-1">
          <li>• A secure Ethereum wallet will be generated for you</li>
          <li>• Your NFT Certificate of Authenticity will be minted</li>
          <li>• You'll receive wallet credentials and NFT details</li>
        </ul>
      </div>

      <button
        onClick={handleClaimNFT}
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Wallet className="w-5 h-5" />
            <span>Claim My NFT Certificate</span>
          </>
        )}
      </button>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">NFT Certificate Claimed!</h2>
        <p className="text-gray-600">Your Certificate of Authenticity has been successfully minted on the blockchain</p>
      </div>

      {nftDetails && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">NFT Certificate Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Token ID:</span>
              <p className="font-mono font-medium">{nftDetails.tokenId}</p>
            </div>
            <div>
              <span className="text-gray-500">Transaction Hash:</span>
              <div className="flex items-center space-x-2">
                <p className="font-mono font-medium truncate">{nftDetails.transactionHash}</p>
                <button
                  onClick={() => copyToClipboard(nftDetails.transactionHash, 'tx')}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <span className="text-gray-500">Network:</span>
              <p className="font-medium">Polygon</p>
            </div>
            <div>
              <span className="text-gray-500">Certificate ID:</span>
              <p className="font-mono font-medium">{nftDetails.certificateId}</p>
            </div>
          </div>
          <div className="mt-4">
            <a
              href={`https://polygonscan.com/tx/${nftDetails.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View on PolygonScan</span>
            </a>
          </div>
        </div>
      )}

      {walletDetails && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span>Your Wallet Details</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={walletDetails.address}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg font-mono text-sm"
                />
                <button
                  onClick={() => copyToClipboard(walletDetails.address, 'address')}
                  className="p-2 text-purple-600 hover:text-purple-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Private Key</label>
              <div className="flex items-center space-x-2">
                <input
                  type={showPrivateKey ? 'text' : 'password'}
                  value={walletDetails.privateKey}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg font-mono text-sm"
                />
                <button
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="p-2 text-gray-600 hover:text-gray-700"
                >
                  {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => copyToClipboard(walletDetails.privateKey, 'privateKey')}
                  className="p-2 text-purple-600 hover:text-purple-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recovery Phrase</label>
              <div className="flex items-center space-x-2">
                <textarea
                  value={walletDetails.mnemonic}
                  readOnly
                  rows={3}
                  className={`flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg font-mono text-sm resize-none ${
                    !showMnemonic ? 'filter blur-sm' : ''
                  }`}
                />
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => setShowMnemonic(!showMnemonic)}
                    className="p-2 text-gray-600 hover:text-gray-700"
                  >
                    {showMnemonic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(walletDetails.mnemonic, 'mnemonic')}
                    className="p-2 text-purple-600 hover:text-purple-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {copySuccess && (
              <div className="text-sm text-green-600 font-medium">
                ✓ {copySuccess === 'address' ? 'Address' : copySuccess === 'privateKey' ? 'Private key' : copySuccess === 'mnemonic' ? 'Recovery phrase' : 'Transaction hash'} copied!
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> Save these wallet details securely. This information cannot be recovered if lost.
            </p>
          </div>

          <button
            onClick={downloadWalletInfo}
            className="mt-4 w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Wallet Details</span>
          </button>
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">What's Next?</h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Your NFT certificate is now permanently stored on the blockchain</li>
          <li>• Use your wallet to view and manage your NFT collection</li>
          <li>• Keep your wallet details safe for future access</li>
          <li>• Your certificate serves as proof of authenticity for your Mavire product</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="mb-6">
              <img
                src="https://res.cloudinary.com/dd3cjiork/image/upload/v1754541227/Manvire_Codoir_W_-_LOGO_gycswo.png"
                alt="Mavire Codoir Logo"
                className="h-20 mx-auto"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
              />
            </div>
            <p className="text-lg text-gray-600">NFT Certificate of Authenticity Portal</p>
          </div>

          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-8">
              <div
                className={`flex items-center space-x-2 ${
                  currentStep === 'verify' ? 'text-purple-600' : currentStep === 'confirmed' || currentStep === 'success' ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === 'verify' ? 'bg-purple-600 text-white' : currentStep === 'confirmed' || currentStep === 'success' ? 'bg-green-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  1
                </div>
                <span className="hidden sm:inline">Verify</span>
              </div>

              <div className={`w-16 h-0.5 ${currentStep === 'confirmed' || currentStep === 'success' ? 'bg-green-600' : 'bg-gray-200'}`}></div>

              <div
                className={`flex items-center space-x-2 ${
                  currentStep === 'confirmed' ? 'text-purple-600' : currentStep === 'success' ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === 'confirmed' ? 'bg-purple-600 text-white' : currentStep === 'success' ? 'bg-green-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  2
                </div>
                <span className="hidden sm:inline">Claim</span>
              </div>

              <div className={`w-16 h-0.5 ${currentStep === 'success' ? 'bg-green-600' : 'bg-gray-200'}`}></div>

              <div className={`flex items-center space-x-2 ${currentStep === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'success' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                >
                  3
                </div>
                <span className="hidden sm:inline">Complete</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {currentStep === 'verify' && renderVerificationStep()}
            {currentStep === 'confirmed' && renderConfirmationStep()}
            {currentStep === 'success' && renderSuccessStep()}
          </div>

          <div className="text-center mt-8 text-gray-500 text-sm">
            <p>Powered by blockchain technology • Secured by Polygon Network</p>
            <p className="mt-2">© 2025 Mavire Codoir. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MavireClaimPortal;
