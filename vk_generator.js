import fs from 'fs/promises';
import path from 'path';
import { UltraHonkBackend } from '@aztec/bb.js';
import { Noir } from '@noir-lang/noir_js';
import { flattenFieldsAsArray, hexToUint8Array, flattenUint8Arrays } from "./api/utils/proof.js";
// Import the functions and the init function
import { getHonkCallData, init } from 'garaga';
// Import your compiled program.json
import data from './circuits/target/circuits.json' with { type: 'json' };

// Define HonkFlavor constants since they're not exported
const HonkFlavor = {
  KECCAK: 0,
  STARKNET: 1
};

async function generateVK() {
  // Initialize the garaga WebAssembly module first
  console.log("Initializing garaga WebAssembly module...");
  await init();
  
  const vkOutputPath = path.resolve('./target/vk');
  const proofOutputPath = path.resolve('./target/proof');
  const calldataOutputPath = path.resolve('./target/calldata.json')

  const noir = new Noir(data);
  const backend = new UltraHonkBackend(data.bytecode);

  console.log("Executing the Noir program to generate witness...");
  const { witness } = await noir.execute({ x: 10, y: 2 });

  console.log("Generating the proof (proof is required to generate VK)...");
  const proof = await backend.generateProof(witness, { starknet: true });

  console.log("Extracting Verification Key (VK)...");
  const vk = await backend.getVerificationKey({ starknet: true });

  // Log the type of vk and proof
  console.log("Type of VK:", typeof vk, vk instanceof Uint8Array ? 'Uint8Array' : 'Object');
  console.log("Type of Proof:", typeof proof, proof instanceof Uint8Array ? 'Uint8Array' : 'Object');

  // Extract binary data
  const vkBytes = vk instanceof Uint8Array ? vk : (vk && vk.data instanceof Uint8Array ? vk.data : null);
  const proofBytes = proof instanceof Uint8Array ? proof : (proof && proof.proof instanceof Uint8Array ? proof.proof : null);

  if (!vkBytes || !proofBytes) {
    throw new Error('Could not extract binary data from VK or Proof objects.');
  }

  console.log("Writing VK to file:", vkOutputPath);
  await fs.writeFile(vkOutputPath, vkBytes); 
  
  console.log("Writing Proof to file:", proofOutputPath);
  await fs.writeFile(proofOutputPath, proofBytes);

  console.log("VK and proof successfully written as binary files.");

 
  try {
  
      await init();
      const callData = getHonkCallData(
        proof.proof,
        flattenFieldsAsArray(proof.publicInputs),
        vk ,
        1 // HonkFlavor.STARKNET
      );
      console.log("Accepting Calldata------------------------------->")
      console.log(callData);
      console.log("End of Calldata----------------------------------<")
      // write the calldata into file.
      await writeCalldataToFile(callData, calldataOutputPath);
    
  } catch (error) {
    console.log("Error parsing proof or generating calldata:", error?.message || error);

  }
    
  await backend.destroy();
}

generateVK().catch(err => {
  console.error('Error generating VK:', err);
  process.exit(1);
});

// Write function
async function writeCalldataToFile(calldata, filePath) {
  const calldataAsStrings = calldata.map(e => e.toString());
  await fs.writeFile(filePath, JSON.stringify(calldataAsStrings, null, 2), 'utf-8');
  console.log(`Calldata written successfully to: ${filePath}`);
}