import { Account } from 'starknet';

export const connectAccount = async (provider) => {
  try {
    const pkey = process.env.PRIVATE_KEY; 
    const accountAddress = process.env.ACCOUNT_ADDRESS;
    // Create an instance of the Account class
    const account = new Account(provider, accountAddress, pkey);
    
    // Check if the account is connected by getting nonce
    const nonce = await account.getNonce();
    
    console.log(`Account ${accountAddress} connected successfully with nonce: ${nonce}`);
    
    return account;
  } catch (error) {
    console.error("Error connecting account:", error);
    throw error; // Re-throw the error for further handling
  }
}