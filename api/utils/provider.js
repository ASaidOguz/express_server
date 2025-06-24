import { RpcProvider } from 'starknet';

export const getProvider = (network) => {
  if (network === 'mainnet') {
    return new RpcProvider({ nodeUrl: "https://starknet-mainnet.public.blastapi.io/rpc/v0_8"});
  } else if (network === 'testnet') {
    return new RpcProvider({ nodeUrl:"https://starknet-sepolia.public.blastapi.io/rpc/v0_8"});
  } else if (network === 'devnet') {
    return new RpcProvider({ nodeUrl: 'http://127.0.0.1:5050/rpc' });
  } else {
    throw new Error('Unsupported network');
  }
}