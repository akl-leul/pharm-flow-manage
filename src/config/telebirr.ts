// Telebirr Payment Configuration
// Ethiopian Telebirr Developer Portal Integration
// All credentials loaded from environment variables only

export const TELEBIRR_CONFIG = {
  // Ethiopian Telebirr Merchant Credentials (from .env only)
  APP_ID: import.meta.env.VITE_TELEBIRR_APP_ID || (() => {
    throw new Error('VITE_TELEBIRR_APP_ID is required in .env file');
  })(),
  FABRIC_APP_ID: import.meta.env.VITE_TELEBIRR_FABRIC_APP_ID || (() => {
    throw new Error('VITE_TELEBIRR_FABRIC_APP_ID is required in .env file');
  })(),
  SHORT_CODE: import.meta.env.VITE_TELEBIRR_SHORT_CODE || (() => {
    throw new Error('VITE_TELEBIRR_SHORT_CODE is required in .env file');
  })(),
  APP_SECRET: import.meta.env.VITE_TELEBIRR_APP_SECRET || (() => {
    throw new Error('VITE_TELEBIRR_APP_SECRET is required in .env file');
  })(),
  
  // Ethiopian Telebirr Developer Portal API
  BASE_URL: import.meta.env.VITE_TELEBIRR_BASE_URL || (() => {
    throw new Error('VITE_TELEBIRR_BASE_URL is required in .env file');
  })(),
  H5_API_URL: 'https://196.188.120.3:38443',
  GATEWAY_ENDPOINT: '/apiaccess/payment/gateway',
  CREATE_ORDER_ENDPOINT: '/apiaccess/payment/gateway/create',
  QUERY_ORDER_ENDPOINT: '/apiaccess/payment/gateway/query',
  NOTIFY_ENDPOINT: '/apiaccess/payment/gateway/create',
  
  // Callback URLs (from .env only)
  NOTIFY_URL: import.meta.env.VITE_TELEBIRR_NOTIFY_URL || (() => {
    throw new Error('VITE_TELEBIRR_NOTIFY_URL is required in .env file');
  })(),
  RETURN_URL: import.meta.env.VITE_TELEBIRR_RETURN_URL || (() => {
    throw new Error('VITE_TELEBIRR_RETURN_URL is required in .env file');
  })(),
  
  // Payment Settings
  CURRENCY: 'ETB',
  EXPIRE_TIME: 15 * 60, // 15 minutes in seconds
  
  // Security Keys (from .env only)
  PRIVATE_KEY: import.meta.env.VITE_TELEBIRR_PRIVATE_KEY || (() => {
    throw new Error('VITE_TELEBIRR_PRIVATE_KEY is required in .env file');
  })(),
  PUBLIC_KEY: import.meta.env.VITE_TELEBIRR_PUBLIC_KEY || (() => {
    throw new Error('VITE_TELEBIRR_PUBLIC_KEY is required in .env file');
  })(),
  
  // App Info
  APP_NAME: 'PharmaFlow',
  APP_VERSION: '1.0.0',
  
  // Ethiopian Telebirr Specific Settings
  COUNTRY_CODE: 'ET',
  LANGUAGE: 'en',
  
  // Development mode detection
  IS_DEVELOPMENT: import.meta.env.DEV,
};

// Required environment variables validation
const requiredEnvVars = [
  'VITE_TELEBIRR_APP_ID',
  'VITE_TELEBIRR_FABRIC_APP_ID',
  'VITE_TELEBIRR_SHORT_CODE',
  'VITE_TELEBIRR_APP_SECRET',
  'VITE_TELEBIRR_BASE_URL',
  'VITE_TELEBIRR_NOTIFY_URL',
  'VITE_TELEBIRR_RETURN_URL',
  'VITE_TELEBIRR_PRIVATE_KEY',
  'VITE_TELEBIRR_PUBLIC_KEY',
];

// Validate all required environment variables on startup
export const validateTelebirrConfig = (): boolean => {
  const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required Telebirr environment variables:', missingVars);
    console.error('Please add these variables to your .env file:');
    missingVars.forEach(varName => {
      console.error(`${varName}=your_value_here`);
    });
    return false;
  }
  
  return true;
};

// Environment variables template for .env file
/*
VITE_TELEBIRR_APP_ID=your_app_id_here
VITE_TELEBIRR_FABRIC_APP_ID=your_fabric_app_id_here
VITE_TELEBIRR_SHORT_CODE=your_short_code_here
VITE_TELEBIRR_APP_SECRET=your_app_secret_here
VITE_TELEBIRR_BASE_URL=https://developerportal.ethiotelebirr.et:38443
VITE_TELEBIRR_NOTIFY_URL=http://your-server.com/api/telebirr/callback
VITE_TELEBIRR_RETURN_URL=http://localhost:3000/payment/return
VITE_TELEBIRR_PRIVATE_KEY="your_private_key_here"
VITE_TELEBIRR_PUBLIC_KEY="telebirr_public_key_here"
*/

export default TELEBIRR_CONFIG;
