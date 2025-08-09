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

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');
    if (token) setClaimToken(token);
    if (email) setEmail(email);
    console.log('API_BASE:', API_BASE);
  }, [API_BASE]);

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
    const verifyUrl = `${API_BASE}/api/claim/verify`;
    console.log('Fetching:', verifyUrl);

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
      if (data.success) {
        setOrderDetails({
          orderNumber: data.claimId || data.orderId,
          productName: 'Mavire Luxury Item',
          customerName: email.split('@')[0],
          createdAt: data.orderDetails?.createdAt || new Date().toISOString(),
        });
        setCurrentStep('confirmed');
      } else {
        throw new Error(data.message || 'Invalid claim token or email');
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
    const claimUrl = `${API_BASE}/api/claim/process`;
    console.log('Fetching:', claimUrl);

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
      if (data.success && data.walletDetails) {
        setWalletDetails({
          address: data.walletDetails.address,
          privateKey: data.walletDetails.privateKey,
          mnemonic: data.walletDetails.mnemonic,
        });
        setNftDetails({
          tokenId: data.walletDetails.tokenId || 'MAVIRE_001',
          transactionHash: data.walletDetails.transactionHash || '0x...',
          contractAddress: data.walletDetails.contractAddress || '0x...',
          certificateId: data.walletDetails.coaId || 'COA_' + Date.now(),
        });
        setCurrentStep('success');
      } else {
        throw new Error(data.message || 'Failed to claim NFT');
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
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl border-4 border-emerald-200/30">
          <Shield className="w-10 h-10 text-white drop-shadow-lg" />
        </div>
        <h1 className="text-4xl font-light text-neutral-800 mb-3 tracking-wide">Authenticate Your Claim</h1>
        <p className="text-neutral-600 text-lg font-light leading-relaxed">Verify your exclusive NFT certificate eligibility</p>
      </div>

      <div className="space-y-6">
        <div className="group">
          <label className="block text-sm font-medium text-neutral-700 mb-3 tracking-wide uppercase">Email Address</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border border-neutral-200/50 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 outline-none transition-all duration-300 text-neutral-800 placeholder-neutral-400 shadow-sm hover:shadow-md group-hover:border-emerald-300/30"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-medium text-neutral-700 mb-3 tracking-wide uppercase">Claim Token</label>
          <div className="relative">
            <input
              type="text"
              value={claimToken}
              onChange={(e) => setClaimToken(e.target.value)}
              placeholder="Enter your unique claim token"
              className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border border-neutral-200/50 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 outline-none transition-all duration-300 text-neutral-800 placeholder-neutral-400 shadow-sm hover:shadow-md group-hover:border-emerald-300/30 font-mono"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        </div>

        {error && (
          <div className="flex items-center space-x-3 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl shadow-sm">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <span className="text-red-700 font-light">{error}</span>
          </div>
        )}

        <button
          onClick={handleVerifyEmail}
          disabled={loading || !email || !claimToken}
          className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 text-white py-4 px-8 rounded-xl font-medium tracking-wide hover:from-emerald-700 hover:via-emerald-800 hover:to-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group"
        >
          <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Shield className="w-6 h-6 drop-shadow-sm" />
              <span className="text-lg font-light tracking-wider">Verify Authenticity</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl border-4 border-emerald-200/40">
          <Package className="w-10 h-10 text-white drop-shadow-lg" />
        </div>
        <h1 className="text-4xl font-light text-neutral-800 mb-3 tracking-wide">Claim Authenticated</h1>
        <p className="text-neutral-600 text-lg font-light leading-relaxed">Your order has been verified. Proceed to mint your exclusive certificate.</p>
      </div>

      {orderDetails && (
        <div className="bg-gradient-to-br from-neutral-50 to-stone-50 backdrop-blur-sm rounded-2xl p-8 border border-neutral-200/30 shadow-inner">
          <h3 className="text-xl font-light text-neutral-800 mb-6 tracking-wide">Order Verification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-sm text-neutral-500 tracking-wider uppercase">Order Reference</span>
              <p className="text-lg font-light text-neutral-800">#{orderDetails.orderNumber}</p>
            </div>
            <div className="space-y-2">
              <span className="text-sm text-neutral-500 tracking-wider uppercase">Product Line</span>
              <p className="text-lg font-light text-neutral-800">{orderDetails.productName}</p>
            </div>
            <div className="space-y-2">
              <span className="text-sm text-neutral-500 tracking-wider uppercase">Customer</span>
              <p className="text-lg font-light text-neutral-800 capitalize">{orderDetails.customerName}</p>
            </div>
            <div className="space-y-2">
              <span className="text-sm text-neutral-500 tracking-wider uppercase">Order Date</span>
              <p className="text-lg font-light text-neutral-800">{new Date(orderDetails.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-emerald-50/80 to-stone-50/80 backdrop-blur-sm border border-emerald-200/40 rounded-2xl p-6 shadow-sm">
        <h4 className="text-lg font-light text-emerald-800 mb-4 tracking-wide">Certificate Minting Process</h4>
        <ul className="space-y-3 text-emerald-700/80 font-light">
          <li className="flex items-start space-x-3">
            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2.5 flex-shrink-0"></div>
            <span>Generate your exclusive blockchain wallet</span>
          </li>
          <li className="flex items-start space-x-3">
            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2.5 flex-shrink-0"></div>
            <span>Mint Certificate of Authenticity as NFT</span>
          </li>
          <li className="flex items-start space-x-3">
            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2.5 flex-shrink-0"></div>
            <span>Secure permanent ownership on Polygon blockchain</span>
          </li>
        </ul>
      </div>

      <button
        onClick={handleClaimNFT}
        disabled={loading}
        className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 text-white py-5 px-8 rounded-xl font-light text-lg tracking-wider hover:from-emerald-700 hover:via-emerald-800 hover:to-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-4 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group"
      >
        <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        {loading ? (
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Wallet className="w-6 h-6 drop-shadow-sm" />
            <span>Mint Certificate</span>
          </>
        )}
      </button>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl border-4 border-emerald-200/50 relative">
          <CheckCircle className="w-12 h-12 text-white drop-shadow-lg" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
        </div>
        <h1 className="text-4xl font-light text-neutral-800 mb-3 tracking-wide">Certificate Minted</h1>
        <p className="text-neutral-600 text-lg font-light leading-relaxed">Your Certificate of Authenticity is now secured on the blockchain</p>
      </div>

      {nftDetails && (
        <div className="bg-gradient-to-br from-emerald-50/50 to-stone-50/50 backdrop-blur-sm rounded-2xl p-8 border border-emerald-200/30 shadow-inner">
          <h3 className="text-xl font-light text-neutral-800 mb-6 tracking-wide flex items-center space-x-3">
            <Package className="w-6 h-6 text-emerald-600" />
            <span>NFT Certificate Details</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-sm text-neutral-500 tracking-wider uppercase">Token ID</span>
              <p className="font-mono text-lg text-neutral-800 bg-white/60 p-3 rounded-lg border border-neutral-200/30">{nftDetails.tokenId}</p>
            </div>
            <div className="space-y-2">
              <span className="text-sm text-neutral-500 tracking-wider uppercase">Certificate ID</span>
              <p className="font-mono text-lg text-neutral-800 bg-white/60 p-3 rounded-lg border border-neutral-200/30">{nftDetails.certificateId}</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <span className="text-sm text-neutral-500 tracking-wider uppercase">Transaction Hash</span>
              <div className="flex items-center space-x-3 bg-white/60 p-3 rounded-lg border border-neutral-200/30">
                <p className="font-mono text-sm text-neutral-800 truncate flex-1">{nftDetails.transactionHash}</p>
                <button
                  onClick={() => copyToClipboard(nftDetails.transactionHash, 'tx')}
                  className="text-emerald-600 hover:text-emerald-700 transition-colors p-1"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-neutral-200/30">
            <a
              href={`https://polygonscan.com/tx/${nftDetails.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 font-light transition-colors group"
            >
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              <span className="tracking-wide">View on Blockchain Explorer</span>
            </a>
          </div>
        </div>
      )}

      {walletDetails && (
        <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/60 backdrop-blur-sm border border-amber-200/40 rounded-2xl p-8 shadow-sm">
          <h3 className="text-xl font-light text-neutral-800 mb-6 tracking-wide flex items-center space-x-3">
            <Wallet className="w-6 h-6 text-amber-600" />
            <span>Wallet Credentials</span>
          </h3>

          <div className="space-y-6">
            <div className="group">
              <label className="block text-sm font-medium text-neutral-700 mb-3 tracking-wider uppercase">Wallet Address</label>
              <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-neutral-200/30 shadow-sm group-hover:shadow-md transition-all">
                <input
                  type="text"
                  value={walletDetails.address}
                  readOnly
                  className="flex-1 bg-transparent border-none outline-none font-mono text-neutral-800 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(walletDetails.address, 'address')}
                  className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-neutral-700 mb-3 tracking-wider uppercase">Private Key</label>
              <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-neutral-200/30 shadow-sm group-hover:shadow-md transition-all">
                <input
                  type={showPrivateKey ? 'text' : 'password'}
                  value={walletDetails.privateKey}
                  readOnly
                  className="flex-1 bg-transparent border-none outline-none font-mono text-neutral-800 text-sm"
                />
                <button
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="p-2 text-neutral-600 hover:text-neutral-700 hover:bg-neutral-50 rounded-lg transition-all"
                >
                  {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => copyToClipboard(walletDetails.privateKey, 'privateKey')}
                  className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-neutral-700 mb-3 tracking-wider uppercase">Recovery Phrase</label>
              <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-neutral-200/30 shadow-sm group-hover:shadow-md transition-all">
                <div className="flex items-start space-x-3">
                  <textarea
                    value={walletDetails.mnemonic}
                    readOnly
                    rows={3}
                    className={`flex-1 bg-transparent border-none outline-none font-mono text-neutral-800 text-sm resize-none transition-all duration-300 ${
                      !showMnemonic ? 'filter blur-sm' : ''
                    }`}
                  />
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => setShowMnemonic(!showMnemonic)}
                      className="p-2 text-neutral-600 hover:text-neutral-700 hover:bg-neutral-50 rounded-lg transition-all"
                    >
                      {showMnemonic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(walletDetails.mnemonic, 'mnemonic')}
                      className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {copySuccess && (
              <div className="flex items-center space-x-2 text-emerald-600 font-light">
                <CheckCircle className="w-4 h-4" />
                <span>
                  {copySuccess === 'address' ? 'Wallet address' : 
                   copySuccess === 'privateKey' ? 'Private key' : 
                   copySuccess === 'mnemonic' ? 'Recovery phrase' : 'Transaction hash'} copied successfully
                </span>
              </div>
            )}
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/40 rounded-xl">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 font-light leading-relaxed">
                  <strong className="font-medium">Security Notice:</strong> Store these credentials securely. They provide complete access to your digital assets and cannot be recovered if lost.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={downloadWalletInfo}
            className="mt-6 w-full bg-gradient-to-r from-stone-600 to-neutral-700 text-white py-4 px-6 rounded-xl font-light tracking-wide hover:from-stone-700 hover:to-neutral-800 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group"
          >
            <Download className="w-5 h-5" />
            <span>Download Wallet Credentials</span>
          </button>
        </div>
      )}

      <div className="bg-gradient-to-r from-emerald-50/80 to-stone-50/80 backdrop-blur-sm border border-emerald-200/40 rounded-2xl p-6 shadow-sm">
        <h4 className="text-lg font-light text-emerald-800 mb-4 tracking-wide">Next Steps</h4>
        <ul className="space-y-3 text-emerald-700/80 font-light">
          <li className="flex items-start space-x-3">
            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2.5 flex-shrink-0"></div>
            <span>Your NFT certificate is permanently secured on the blockchain</span>
          </li>
          <li className="flex items-start space-x-3">
            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2.5 flex-shrink-0"></div>
            <span>Import your wallet to view and manage your digital collection</span>
          </li>
          <li className="flex items-start space-x-3">
            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2.5 flex-shrink-0"></div>
            <span>Your certificate serves as proof of authenticity for resale</span>
          </li>
        </ul>
      </div>
    </div>
  );

  const renderProgressBar = () => {
    const steps = [
      { id: 'verify', label: 'Verify', icon: Shield },
      { id: 'confirmed', label: 'Confirm', icon: Package },
      { id: 'success', label: 'Complete', icon: CheckCircle }
    ];

    return (
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = 
              (currentStep === 'confirmed' && step.id === 'verify') ||
              (currentStep === 'success' && (step.id === 'verify' || step.id === 'confirmed'));
            const isUpcoming = !isActive && !isCompleted;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg border-2 border-emerald-200' 
                        : isCompleted 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'bg-neutral-200 text-neutral-400'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span 
                    className={`text-xs tracking-wider uppercase font-light ${
                      isActive || isCompleted ? 'text-emerald-700' : 'text-neutral-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={`w-16 h-0.5 transition-all duration-500 ${
                      isCompleted ? 'bg-emerald-600' : 'bg-neutral-200'
                    }`}
                  ></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        
        * {
          font-family: 'Amiri', serif;
        }
        
        body {
          background: linear-gradient(135deg, #fafafa 0%, #f5f5f4 50%, #f0f0f0 100%);
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        
        .emerald-glass {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-stone-100 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-600 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-stone-600 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-6 py-16">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="mb-8">
                <img
                  src="https://res.cloudinary.com/dd3cjiork/image/upload/v1754541227/Manvire_Codoir_W_-_LOGO_gycswo.png"
                  alt="Mavire Codoir"
                  className="h-24 mx-auto filter drop-shadow-lg"
                />
              </div>
              <h1 className="text-6xl font-light text-neutral-800 mb-4 tracking-wider">Certificate Portal</h1>
              <p className="text-xl text-neutral-600 font-light tracking-wide">Exclusive NFT Authentication System</p>
            </div>

            {/* Progress Bar */}
            {renderProgressBar()}

            {/* Main Content Card */}
            <div className="glass-effect rounded-3xl p-10 shadow-2xl border border-white/20 backdrop-blur-xl">
              {currentStep === 'verify' && renderVerificationStep()}
              {currentStep === 'confirmed' && renderConfirmationStep()}
              {currentStep === 'success' && renderSuccessStep()}
            </div>

            {/* Footer */}
            <div className="text-center mt-12 space-y-3">
              <div className="flex items-center justify-center space-x-2 text-neutral-500">
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
                <span className="text-sm tracking-wider uppercase font-light">Secured by Polygon Blockchain</span>
              </div>
              <p className="text-neutral-400 text-sm font-light tracking-wide">© 2025 Mavire Codoir. Luxury Redefined.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MavireClaimPortal;