export const LUKSO_CHAIN_ID = 42;
export const LUKSO_CHAIN_CONFIG = {
  chainId: '0x2a', chainName: 'LUKSO Mainnet',
  nativeCurrency: { name: 'LYX', symbol: 'LYX', decimals: 18 },
  rpcUrls: ['https://rpc.mainnet.lukso.network'],
  blockExplorerUrls: ['https://explorer.execution.mainnet.lukso.network'],
};
export const CONTRACT_ADDRESS = '0x_UPTERFELL_CONTRACT_ADDRESS';
export const MINT_END_DATE = new Date('2025-09-30T23:59:59Z');
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/upterfell',
  discord: 'https://discord.gg/upterfell',
  telegram: 'https://t.me/upterfell',
  page: 'https://universal.page/upterfell',
  explorer: `https://explorer.execution.mainnet.lukso.network/address/0x_UPTERFELL_CONTRACT_ADDRESS`,
};

export const CONTRACT_DEPLOYED = !CONTRACT_ADDRESS.includes('UPTERFELL_CONTRACT_ADDRESS');
