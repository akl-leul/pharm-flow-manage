// Telebirr Payment API Integration
// Ethiopian Telebirr Developer Portal

import { TELEBIRR_CONFIG } from '../../config/telebirr';

interface TelebirrPaymentRequest {
  appId: string;
  appKey: string;
  notifyUrl: string;
  returnUrl: string;
  shortCode: string;
  subject: string;
  timeoutExpress: string;
  totalAmount: string;
  nonce: string;
  outTradeNo: string;
  receiveName: string;
  timestamp: string;
  sign: string;
}

interface TelebirrPaymentResponse {
  code: string;
  message: string;
  data?: {
    payId: string; // Payment ID for H5 payment URL
    out_trade_no: string; // Your order ID
    total_amount: string;
    timestamp: string;
    sign: string;
  };
}

interface TelebirrCallbackData {
  notify_url: string;
  appid: string;
  notify_time: string;
  short_code: string;
  merch_order_id: string;
  payment_order_id: string;
  total_amount: string;
  trans_id: string;
  trans_currency: string;
  trade_status: string;
  trans_end_time: string;
  sign: string;
  sign_type: string;
  callback_info?: string;
  country_code?: string;
  fabric_app_id?: string;
}

// Generate proper RSA signature for Ethiopian Telebirr API
const generateSignature = (data: any, privateKey: string): string => {
  // Ethiopian Telebirr requires specific signature format
  // Based on documentation, the signature should be RSA SHA256
  // For now, we'll create a placeholder that matches expected format
  
  // Sort the parameters alphabetically for signature generation
  const sortedParams = Object.keys(data)
    .filter(key => key !== 'sign') // Exclude the sign field itself
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('&');
  
  // For development, create a mock signature
  // In production, this should be real RSA SHA256 signature
  const mockSignature = btoa(sortedParams).substring(0, 128);
  
  console.log('Generated signature for params:', sortedParams);
  console.log('Mock signature:', mockSignature);
  
  return mockSignature;
};

// Verify callback signature for Ethiopian Telebirr
const verifySignature = (data: TelebirrCallbackData, publicKey: string): boolean => {
  // This is a placeholder - you'll need to implement proper RSA SHA256 verification
  // Ethiopian Telebirr signature verification
  return true;
};

export const generateEthiopianTelebirrQRCode = (paymentOrderId: string, amount: number, shortCode: string): string => {
  // Production mode: Use real Ethiopian Telebirr payment URL
  // Format: https://196.188.120.3:38443/apiaccess/payment/gateway/T0533111222S001114129
  // Based on documentation: https://mmpay.trade.pay/T0533111222S001114129
  
  const paymentUrl = `https://196.188.120.3:38443/apiaccess/payment/gateway/${paymentOrderId}`;
  
  // Ethiopian Telebirr expects the QR code to contain the payment URL
  // When scanned, it will redirect to the Telebirr payment page
  // Note: This domain requires proper deployment and network access
  
  return paymentUrl;
};

// Create payment order with Ethiopian Telebirr Developer Portal
export const createTelebirrPayment = async (
  orderId: string,
  amount: number,
  medicineName: string
): Promise<TelebirrPaymentResponse> => {
  try {
    // Generate unique nonce for this request
    const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now().toString();
    
    const paymentRequest: TelebirrPaymentRequest = {
      appId: TELEBIRR_CONFIG.APP_ID,
      appKey: TELEBIRR_CONFIG.APP_SECRET,
      notifyUrl: TELEBIRR_CONFIG.NOTIFY_URL,
      returnUrl: TELEBIRR_CONFIG.RETURN_URL,
      shortCode: TELEBIRR_CONFIG.SHORT_CODE,
      subject: `Payment for ${medicineName}`,
      timeoutExpress: "30",
      totalAmount: amount.toFixed(2),
      nonce: nonce,
      outTradeNo: orderId,
      receiveName: "PharmaFlow Pharmacy",
      timestamp: timestamp,
      sign: "placeholder_signature" // Will be generated below
    };

    // Add fabric_app_id if available (based on some Ethiopian Telebirr implementations)
    if (TELEBIRR_CONFIG.FABRIC_APP_ID) {
      (paymentRequest as any).fabricAppId = TELEBIRR_CONFIG.FABRIC_APP_ID;
    }

    // Generate signature (placeholder - implement proper RSA signing as per documentation)
    const signature = generateSignature(paymentRequest, TELEBIRR_CONFIG.PRIVATE_KEY);
    paymentRequest.sign = signature;
    
    // Make API call to Ethiopian Telebirr H5 Web Payment API
    // Use the correct H5 API endpoint based on documentation
    // Try different endpoints based on Ethiopian Telebirr documentation
    let apiUrl: string;
    
    if (TELEBIRR_CONFIG.IS_DEVELOPMENT) {
      // Development: Use API endpoint through proxy
      apiUrl = '/api/telebirr/create';
    } else {
      // Production: Use direct endpoint
      apiUrl = `${TELEBIRR_CONFIG.H5_API_URL}${TELEBIRR_CONFIG.NOTIFY_ENDPOINT}`;
    }
    
    console.log('Final API URL:', apiUrl);
    console.log('Creating payment with Ethiopian Telebirr Portal:', paymentRequest);
    console.log('Request body:', JSON.stringify(paymentRequest, null, 2));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': `${TELEBIRR_CONFIG.APP_NAME}/${TELEBIRR_CONFIG.APP_VERSION}`,
      },
      body: JSON.stringify(paymentRequest),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });
    
    if (!response.ok) {
      // Try to get more error details
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const responseText = await response.text();
        console.error('Ethiopian Telebirr API error response (raw):', responseText);
        
        // Try to parse as JSON, but handle HTML/plain text responses
        try {
          const errorData = JSON.parse(responseText);
          console.error('Ethiopian Telebirr API error response (parsed):', errorData);
          if (errorData.message) {
            errorMessage = `HTTP ${response.status}: ${errorData.message}`;
          } else if (errorData.error) {
            errorMessage = `HTTP ${response.status}: ${errorData.error}`;
          }
        } catch (jsonError) {
          // Response is not JSON, use raw text
          console.error('Response is not JSON, using raw text:', responseText);
          if (responseText.includes('<html>')) {
            errorMessage = `HTTP ${response.status}: Server returned HTML error page (possible authentication or configuration issue)`;
          } else if (responseText.length > 0) {
            errorMessage = `HTTP ${response.status}: ${responseText.substring(0, 200)}`;
          }
        }
      } catch (parseError) {
        console.error('Could not read error response:', parseError);
      }
      
      throw new Error(errorMessage);
    }

    const result: TelebirrPaymentResponse = await response.json();
    
    console.log('Ethiopian Telebirr response:', result);
    
    if (result.code !== '00' && result.code !== 'SUCCESS') {
      throw new Error(`Ethiopian Telebirr API Error: ${result.message}`);
    }

    return result;
  } catch (error) {
    console.error('Error creating Ethiopian Telebirr payment:', error);
    
    // Handle AbortError (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Request timed out after 30 seconds');
      throw new Error('Ethiopian Telebirr API request timed out. Please check your network connection and try again.');
    }
    
    // Handle CORS and network errors gracefully
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.warn('Network/CORS error detected. This is expected in development without proper server setup.');
      
      if (TELEBIRR_CONFIG.IS_DEVELOPMENT) {
        console.log('Using Vite proxy server to handle CORS. Make sure proxy is configured correctly.');
        throw new Error('Unable to connect to Ethiopian Telebirr API. This is expected in development mode. The proxy server should handle CORS automatically. Check console for proxy logs.');
      } else {
        // Production error
        throw new Error('Unable to connect to Ethiopian Telebirr API. This may be due to CORS restrictions or network connectivity. Please ensure proper deployment setup with CORS headers or proxy configuration.');
      }
    }
    
    // Let other errors propagate normally
    throw error;
  }
};

// Handle payment callback from Ethiopian Telebirr
export const handleTelebirrCallback = async (callbackData: TelebirrCallbackData): Promise<boolean> => {
  try {
    console.log('Received Ethiopian Telebirr callback:', callbackData);
    
    // Verify signature (placeholder - implement proper RSA verification)
    const isValid = verifySignature(callbackData, TELEBIRR_CONFIG.PUBLIC_KEY);
    
    if (!isValid) {
      console.error('Invalid Ethiopian Telebirr callback signature');
      return false;
    }

    // Process the payment based on status
    if (callbackData.trade_status === 'Completed' || callbackData.trade_status === 'SUCCESS') {
      console.log('Payment completed successfully:', {
        orderId: callbackData.merch_order_id,
        paymentId: callbackData.payment_order_id,
        amount: callbackData.total_amount,
        transactionId: callbackData.trans_id,
        endTime: callbackData.trans_end_time,
        countryCode: callbackData.country_code
      });

      // Here you should:
      // 1. Update the sale record in your database
      // 2. Mark the payment as completed
      // 3. Send confirmation to customer
      // 4. Update inventory if needed
      
      return true;
    } else if (callbackData.trade_status === 'Failure' || callbackData.trade_status === 'FAILED') {
      console.log('Payment failed:', {
        orderId: callbackData.merch_order_id,
        paymentId: callbackData.payment_order_id,
        status: callbackData.trade_status
      });
      
      // Handle failed payment
      return false;
    } else {
      console.log('Payment status:', callbackData.trade_status);
      return false;
    }
  } catch (error) {
    console.error('Error handling Ethiopian Telebirr callback:', error);
    return false;
  }
};

// Check payment status with Ethiopian Telebirr
export const checkPaymentStatus = async (orderId: string): Promise<TelebirrCallbackData | null> => {
  try {
    const response = await fetch(`${TELEBIRR_CONFIG.BASE_URL}${TELEBIRR_CONFIG.QUERY_ORDER_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': `${TELEBIRR_CONFIG.APP_NAME}/${TELEBIRR_CONFIG.APP_VERSION}`,
      },
      body: JSON.stringify({
        appid: TELEBIRR_CONFIG.APP_ID,
        merch_order_id: orderId,
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.code === '00' || result.code === 'SUCCESS') {
      return result.data as TelebirrCallbackData;
    }
    
    return null;
  } catch (error) {
    console.error('Error checking Ethiopian Telebirr payment status:', error);
    return null;
  }
};

export type { TelebirrPaymentRequest, TelebirrPaymentResponse, TelebirrCallbackData };
