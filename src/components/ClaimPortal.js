import React, { useState } from 'react';

// 🔧 API Configuration - Your NFT minting API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://mavire-minting-api.vercel.app';

// Generate a valid UUID v4
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const ClaimPortal = () => {
  const [claimData, setClaimData] = useState({
    email: '',
    claimToken: '' // User can enter their claim token, or we'll test without it
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClaimData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');

    // 🔧 Debug: Show API configuration
    console.log('🔧 API Configuration:', {
      API_BASE_URL,
      endpoint: `${API_BASE_URL}/api/claims/submit`,
      environment: process.env.NODE_ENV
    });

    const testClaimToken = claimData.claimToken || generateUUID(); // Generate valid UUID if not provided
    
    // 🔍 Debug: Show what we're sending
    console.log('🔍 Sending claim verification request:', {
      url: `${API_BASE_URL}/api/claim/verify`,
      method: 'POST',
      data: { email: claimData.email, claimToken: testClaimToken },
      dataString: JSON.stringify({ email: claimData.email, claimToken: testClaimToken }, null, 2),
      hasClaimToken: !!claimData.claimToken,
      generatedToken: !claimData.claimToken
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/claim/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: claimData.email,
          claimToken: testClaimToken
        })
      });

      // 📨 Debug: Show response details
      console.log('📨 API Response Status:', response.status);
      console.log('📨 Response OK:', response.ok);
      console.log('📨 Response Headers:', Object.fromEntries(response.headers.entries()));

      // Get the raw response text first
      const responseText = await response.text();
      console.log('📨 Raw Response Text:', responseText);

      // Try to parse as JSON
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
        console.log('📨 Parsed Response Data:', responseData);
      } catch (parseError) {
        console.log('❌ JSON Parse Error:', parseError.message);
        responseData = { message: responseText };
      }

      if (response.ok) {
        setSubmitStatus('✅ Claim verified successfully! This email is eligible for NFT claim.');
        console.log('✅ Success:', responseData);
        
        // Don't reset form - let user see the successful verification
      } else {
        // 📨 Debug: Show error details
        console.log('❌ HTTP Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });

        const errorMessage = responseData.message || responseData.error || `HTTP ${response.status}: ${response.statusText}`;
        setSubmitStatus(`❌ Error: ${errorMessage}`);
      }

    } catch (networkError) {
      console.log('❌ Network/Fetch Error:', {
        name: networkError.name,
        message: networkError.message,
        stack: networkError.stack
      });
      
      setSubmitStatus(`❌ Network Error: ${networkError.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🎨 Inline styles
  const styles = {
    container: {
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    },
    title: {
      textAlign: 'center',
      color: '#333',
      marginBottom: '30px'
    },
    debugBox: {
      background: '#f0f0f0',
      padding: '10px',
      marginBottom: '20px',
      fontSize: '12px',
      borderRadius: '4px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: '500',
      color: '#555'
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px',
      boxSizing: 'border-box',
      resize: 'vertical'
    },
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: isSubmitting ? '#6c757d' : '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      cursor: isSubmitting ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.2s'
    },
    statusSuccess: {
      marginTop: '20px',
      padding: '15px',
      borderRadius: '4px',
      fontWeight: '500',
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb'
    },
    statusError: {
      marginTop: '20px',
      padding: '15px',
      borderRadius: '4px',
      fontWeight: '500',
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>NFT Claim Verification Portal</h2>
      
      {/* 🔧 Debug Info Display */}
      <div style={styles.debugBox}>
        <strong>🔧 Debug Info:</strong><br/>
        API URL: {API_BASE_URL}/api/claim/verify<br/>
        Environment: {process.env.NODE_ENV || 'development'}
      </div>

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label htmlFor="email" style={styles.label}>Email Address:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={claimData.email}
            onChange={handleInputChange}
            required
            style={styles.input}
            placeholder="Enter your email address"
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="claimToken" style={styles.label}>Claim Token (Optional):</label>
          <input
            type="text"
            id="claimToken"
            name="claimToken"
            value={claimData.claimToken}
            onChange={handleInputChange}
            style={styles.input}
            placeholder="Enter your claim token or leave blank to check eligibility"
          />
          <small style={{color: '#666', fontSize: '14px', marginTop: '5px', display: 'block'}}>
            💡 If you have a claim token from your email, enter it above. Otherwise, we'll check if your email has eligible orders.
          </small>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={styles.button}
        >
          {isSubmitting ? 'Verifying...' : 'Verify Claim Eligibility'}
        </button>

        {submitStatus && (
          <div style={submitStatus.includes('✅') ? styles.statusSuccess : styles.statusError}>
            {submitStatus}
          </div>
        )}
      </form>
    </div>
  );
};

export default ClaimPortal;