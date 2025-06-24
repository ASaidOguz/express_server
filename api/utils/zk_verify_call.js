import { buildContract } from "./build_contract.js";


export const zkVerifyCall = async (provider, contractAddress, calldata) => {
  try {
   
    const verifierContract = await buildContract(provider, contractAddress);
    // Call the contract's verify function with the flattened inputs
    const response = await verifierContract.verify_ultra_starknet_honk_proof(calldata.slice(1));
    console.log("Verification response:", response);
    
    return response;
  } catch (error) {
    console.error("Error during zk verification call:", error);
    throw error; // Re-throw the error for further handling
  }
}