import { CallData } from 'starknet';

export async function mintNft(nftContract, account, cidInput, recipientAddress, provider) {
    try {
        console.log('Input cidInput:', cidInput);
        console.log('Input recipientAddress:', recipientAddress);
        
        // Connect account to contract
        nftContract.connect(account);
        
        // Convert ByteArray back to string if needed, or use string directly
        let cidString;
        
        if (cidInput && typeof cidInput === 'object' && cidInput.data !== undefined) {
            // It's a ByteArray object - convert back to string
            console.log('Converting ByteArray back to string...');
            const { byteArray } = await import('starknet');
            cidString = byteArray.stringFromByteArray(cidInput);
            console.log('Converted CID string:', cidString);
        } else if (typeof cidInput === 'string') {
            // It's already a string
            cidString = cidInput;
        } else {
            throw new Error('Invalid CID format - expected string or ByteArray object');
        }
        
        console.log('Final CID string for contract:', cidString);
        
        // Let Starknet.js handle the ByteArray conversion internally
        const response = await nftContract.mint_item(recipientAddress, cidString);
        
        // Wait for transaction confirmation
        await provider.waitForTransaction(response.transaction_hash);
        
        console.log("NFT minted successfully:", response);
        return response;
        
    } catch (error) {
        console.error("Error minting NFT:", error);
        console.error("Error details:", {
            cidInput,
            recipientAddress,
            errorMessage: error.message
        });
        throw new Error("Failed to mint NFT: " + error.message);
    }
}

// Alternative version - more robust input handling
export async function mintNftRobust(nftContract, account, cidInput, recipientAddress) {
    try {
        console.log('=== MINT NFT DEBUG ===');
        console.log('cidInput type:', typeof cidInput);
        console.log('cidInput value:', cidInput);
        console.log('recipientAddress:', recipientAddress);
        
        // Connect account to contract
        nftContract.connect(account);
        
        let cidForContract;
        
        // Handle different input types
        if (typeof cidInput === 'string') {
            // Direct string - let Starknet handle conversion
            cidForContract = cidInput;
            console.log('Using string directly:', cidForContract);
            
        } else if (cidInput && typeof cidInput === 'object') {
            if (cidInput.data !== undefined) {
                // It's a ByteArray - convert to string first
                console.log('Converting ByteArray to string...');
                const { byteArray } = await import('starknet');
                cidForContract = byteArray.stringFromByteArray(cidInput);
                console.log('Converted to string:', cidForContract);
            } else {
                // Unknown object format
                console.error('Unknown object format:', cidInput);
                throw new Error('Invalid CID format - unknown object structure');
            }
        } else {
            throw new Error(`Invalid CID format - received ${typeof cidInput}: ${cidInput}`);
        }
        
        console.log('Final CID for contract call:', cidForContract);
        
        // Make the contract call
        const response = await nftContract.mint_item(recipientAddress, cidForContract);
        
        console.log('Contract response:', response);
        
        // Wait for transaction confirmation
        console.log('Waiting for transaction confirmation...');
        await nftContract.provider.waitForTransaction(response.transaction_hash);
        
        console.log("NFT minted successfully:", response);
        return response;
        
    } catch (error) {
        console.error("Error minting NFT:", error);
        console.error("Stack trace:", error.stack);
        throw new Error("Failed to mint NFT: " + error.message);
    }
}

// Version using CallData.compile
export async function mintNftWithCallData(nftContract, account, cidByteArray, recipientAddress,provider) {
    try {
        console.log('CallData mint - Input cidByteArray:', cidByteArray);
        
        // Connect account to contract
        nftContract.connect(account);
        
        // Use CallData to properly format the parameters
        const calldata = CallData.compile([recipientAddress, cidByteArray]);
        
        console.log('Compiled calldata:', calldata);
        
        const response = await nftContract.invoke('mint_item', calldata);
        
        // Wait for transaction confirmation
        await provider.waitForTransaction(response.transaction_hash);
        
        console.log("NFT minted successfully (CallData):", response);
        return response;
        
    } catch (error) {
        console.error("Error in CallData mint:", error);
        throw new Error("Failed to mint NFT (CallData): " + error.message);
    }
}