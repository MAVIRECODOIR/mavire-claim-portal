// Replace the verifyClaimOnChain function (around line 37-60) with this version:

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