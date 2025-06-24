import {  Contract, ec, json } from 'starknet';


export const buildContract = async (provider, contractAddress) => {
  try {
    // read the ABI of the Test contract
    const { abi } = await provider.getClassAt(contractAddress);
    console.log("Contract ABI:", abi);
    // Create a new contract instance
    const contract = new Contract(abi, contractAddress, provider);
    
    // Check if the contract is connected by getting its address
    const address = contract.address;
    
    console.log(`Contract at ${address} connected successfully.`);
    
    return contract;
  } catch (error) {
    console.error("Error connecting contract:", error);
    throw error; // Re-throw the error for further handling
  }
}