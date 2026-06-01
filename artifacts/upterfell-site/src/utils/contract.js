import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from './constants';
const ABI = [
  'function mint(address to, bytes32 tokenId, bool allowNonLSP1Recipient, bytes memory data) external payable',
  'function totalSupply() external view returns (uint256)',
  'function mintPrice() external view returns (uint256)',
  'function isWhitelisted(address account) external view returns (bool)',
  'function mintPhase() external view returns (uint8)',
  'function maxSupply() external view returns (uint256)',
  'event Transfer(address indexed operator, address indexed from, address indexed to, bytes32 indexed tokenId, bool allowNonLSP1Recipient, bytes data)',
];
export function getContract(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signerOrProvider);
}
export function getReadOnlyContract() {
  const provider = new ethers.JsonRpcProvider('https://rpc.mainnet.lukso.network');
  return getContract(provider);
}
