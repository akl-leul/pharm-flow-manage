// Telebirr Payment Callback Handler
// This would typically be a server-side endpoint, but here's the structure

import { handleTelebirrCallback, TelebirrCallbackData } from '../integrations/telebirr/api';

// This would be your API endpoint (e.g., in Next.js, Express, etc.)
export async function POST(request: Request) {
  try {
    const callbackData: TelebirrCallbackData = await request.json();
    
    console.log('Received Telebirr callback:', callbackData);
    
    // Verify the callback is from Telebirr
    const isValid = await handleTelebirrCallback(callbackData);
    
    if (isValid) {
      // Update your database with payment status
      // This is where you'd update your sale record
      
      // Example: Update sale in database
      // await updateSalePaymentStatus(callbackData.merch_order_id, {
      //   status: callbackData.trade_status,
      //   paymentOrderId: callbackData.payment_order_id,
      //   transactionId: callbackData.trans_id,
      //   paidAmount: parseFloat(callbackData.total_amount),
      //   paidAt: new Date(parseInt(callbackData.trans_end_time) * 1000)
      // });
      
      // Send confirmation to customer
      // await sendPaymentConfirmation(callbackData);
      
      return new Response('OK', { status: 200 });
    } else {
      return new Response('Invalid signature', { status: 400 });
    }
  } catch (error) {
    console.error('Error processing Telebirr callback:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// Example of how to handle the callback in your frontend
export const processTelebirrCallback = (callbackData: TelebirrCallbackData) => {
  // Update local state or trigger a refetch
  if (callbackData.trade_status === 'Completed') {
    // Show success message
    console.log(`Payment completed for order ${callbackData.merch_order_id}`);
    
    // You might want to:
    // 1. Show a success notification
    // 2. Update the UI to reflect payment completion
    // 3. Print receipt automatically
    // 4. Send SMS confirmation
  } else if (callbackData.trade_status === 'Failure') {
    // Show failure message
    console.log(`Payment failed for order ${callbackData.merch_order_id}`);
    
    // You might want to:
    // 1. Show a failure notification
    // 2. Offer alternative payment methods
    // 3. Allow retry
  }
};

// Example callback data structure for testing
export const mockCallbackData: TelebirrCallbackData = {
  notify_url: 'http://197.156.68.29:5050/v2/api/order-v2/mini/payment',
  appid: '853694808089634',
  notify_time: '1670575472482',
  merch_code: '245445',
  merch_order_id: '1670575560882',
  payment_order_id: '00801104C911443200001002',
  total_amount: '10.00',
  trans_id: '49485948475845',
  trans_currency: 'ETB',
  trade_status: 'Completed',
  trans_end_time: '1670575472000',
  sign: 'AOwWQF0QDg0jzzs5otLYOunoR65GGgC3hyr+oYn8mm1Qph6Een7C…',
  sign_type: 'SHA256WithRSA'
};
