export const COLLECTION = {
  name: "UPTERFELL", totalSupply: 7250, blockchain: "LUKSO", chainId: 42,
  standard: "LSP8", contractAddress: "UPTERFELL_CONTRACT_ADDRESS",
};

export const MINT_PHASES = [
  { id: 0, name: "Founders Sale",  status: "ended",    price: 5,  supply: 500,  priceWei: "5000000000000000000"  },
  { id: 1, name: "Whitelist Sale", status: "live",     price: 10, supply: 2500, priceWei: "10000000000000000000" },
  { id: 2, name: "Public Sale",    status: "upcoming", price: 15, supply: 4250, priceWei: "15000000000000000000" },
];

export const HOUSES = [
  { id: "up",         name: "House UP",         lsp: "LSP0",  dapp: "Universal Profile",  motto: "Identity Is Coming",         color: "#FE60A0", supply: 1000, got: "House Stark",     description: "The founding house. Governors of the Universal Profile — the core identity layer of LUKSO. To bear their seal is to own your digital soul." },
  { id: "trust",      name: "House Trust",      lsp: "LSP6",  dapp: "Key Manager",        motto: "Permission Commands Power",  color: "#8B8BFF", supply: 750,  got: "House Targaryen", description: "Masters of permission and access control. No door opens without their blessing. No key turns without their mandate." },
  { id: "ground",     name: "House Ground",     lsp: "LSP3",  dapp: "Common Ground",      motto: "Reputation Rules Kingdoms",  color: "#5A9BFF", supply: 750,  got: "House Tyrell",    description: "Builders of reputation and community. The ground beneath the realm's feet — invisible yet essential to everything standing above." },
  { id: "phlox",      name: "House Phlox",      lsp: "LSP7",  dapp: "Token Factory",      motto: "We Mint What We Become",     color: "#FF6B35", supply: 750,  got: "House Lannister", description: "Sovereigns of the token economy. They mint, they trade, they accumulate. In UPterfell, wealth is protocol." },
  { id: "page",       name: "House Page",       lsp: "LSP8",  dapp: "Universal Page",     motto: "Every Asset Has A Story",    color: "#7B5CFF", supply: 750,  got: "House Martell",   description: "Keepers of NFT culture and digital art. Every asset they touch becomes a story. Every story, a legacy on-chain." },
  { id: "relay",      name: "House Relay",      lsp: "LSP25", dapp: "Transact",           motto: "Move Without Friction",      color: "#185FA5", supply: 500,  got: "House Velaryon",  description: "Eliminators of gas barriers. They move LYX without friction, relay calls without cost, connect the unconnected." },
  { id: "verse",      name: "House Verse",      lsp: "LSP9",  dapp: "Vault",              motto: "Protected Through Eternity", color: "#FF4E7C", supply: 500,  got: "House Tully",     description: "Guardians of the digital vault. What they protect endures. What they guard cannot be taken. Their word is the lock." },
  { id: "grave",      name: "House Grave",      lsp: "LSP1",  dapp: "Universal Receiver", motto: "Nothing Enters Unnoticed",   color: "#7C3AED", supply: 500,  got: "House Mormont",   description: "Silent watchers of all on-chain activity. Every token sent, every signal broadcast — nothing escapes their receiver." },
  { id: "discover",   name: "House Discover",   lsp: "LSP12", dapp: "Issuers dApp",       motto: "Creation Defines Legacy",    color: "#0066CC", supply: 500,  got: "House Arryn",     description: "Pioneers of certified creation. They issue, they certify, they establish provenance. Origin is power." },
  { id: "everything", name: "House Everything", lsp: "LSP5",  dapp: "Asset Registry",     motto: "Every Asset Counts",         color: "#999999", supply: 250,  got: "House Redwyne",   description: "The rarest house. Cataloguers of every asset ever minted. They see the whole kingdom — every coin, every NFT, every soul." },
  { id: "jump",       name: "House Jump",       lsp: "LSP26", dapp: "LUKSO Social",       motto: "Connections Build Empires",  color: "#A855F7", supply: 500,  got: "House Baratheon", description: "Architects of social graphs. Followers are power. Connections are conquest. Their network grows into an empire." },
  { id: "turn",       name: "House Turn",       lsp: "LSP23", dapp: "Factory Deployer",   motto: "Build The Future",           color: "#B8860B", supply: 500,  got: "House Hightower", description: "Deployers of smart contracts. They build the infrastructure others inhabit. Every factory they launch reshapes the realm." },
];

export const RARITY_TIERS = [
  { name: "Mythic",    count: 51,   pct: 0.7,  scoreRange: "180–999", color: "#4A148C", effect: "Purple particle vortex",  badge: "ULTRA RARE"     },
  { name: "Legendary", count: 215,  pct: 3.0,  scoreRange: "80–179",  color: "#E65100", effect: "Luminous golden aura",    badge: "EXTREMELY RARE" },
  { name: "Epic",      count: 1582, pct: 21.8, scoreRange: "45–79",   color: "#880E4F", effect: "Floating particles",      badge: "RARE"           },
  { name: "Rare",      count: 4840, pct: 66.8, scoreRange: "20–44",   color: "#0D47A1", effect: "Subtle shimmer",          badge: "UNCOMMON"       },
  { name: "Uncommon",  count: 562,  pct: 7.8,  scoreRange: "12–19",   color: "#2E7D32", effect: "Light pixel dust",        badge: "COMMON"         },
];

export const ORIGINS = [
  { name: "rICO",           year: "2017",      supply: 219,  pct: 3.0,  palette: "Terminal green on black",   vibe: "Crypto terminal, matrix, encryption"  },
  { name: "L14",            year: "2019",      supply: 435,  pct: 6.0,  palette: "Cold blue, gunmetal grey",  vibe: "Primitive testnet, technical grid"     },
  { name: "L15",            year: "2021",      supply: 508,  pct: 7.0,  palette: "Deep blue, circuit traces", vibe: "Blockchain awakening, electric nights" },
  { name: "L16",            year: "2022",      supply: 580,  pct: 8.0,  palette: "Forge orange, steam",       vibe: "Proving ground, molten metal"          },
  { name: "Genesis",        year: "Apr 2023",  supply: 870,  pct: 12.0, palette: "Gold, dawn light",          vibe: "Birth of the kingdom, gilded ruins"    },
  { name: "Mainnet",        year: "May 2023",  supply: 1811, pct: 25.0, palette: "Stone, wood, LSP metal",    vibe: "Living digital medieval kingdom"       },
  { name: "Infrastructure", year: "2024–2025", supply: 2827, pct: 39.0, palette: "Concrete, steel, expansion",vibe: "Titanic construction, scaffolding"     },
];

export const UP_0001 = {
  id: "UP-0001", name: "The First Soul", house: "House UP", rank: "Genesis Founder",
  origin: "rICO", gender: "Male", class: "AI Agent", armor: "The Sovereign Aegis",
  weapon: "Omni Relic", aura: "All Auras", familiar: "All Familiars",
  score: 999, pct: "100.00%", tier: "Mythic",
  lore: "The original profile — UP-0001, founder of all founders, sovereign of the UPterfell realm.",
};

export const TRAITS = {
  ranks:   ["Peasant","Citizen","Merchant","Knight","Lord","High Lord","King","Founder","Genesis Founder"],
  classes: ["Warrior","Builder","Merchant","Artist","Collector","Explorer","Validator","Architect","Alchemist","Oracle","Lorekeeper","AI Agent"],
  armors:  ["Ironstone Mail","River Chain","Merchant Vest","Wind Jerkin","Stone Guard","Sovereign Aegis","Omniseal of UPterfell","Genesis Titanium","Asset Gold","Permission Sovereign"],
  weapons: ["LSP Blade","Key Sword","Token Sword","Asset Sword","Relay Blade","Vault Sword","Genesis Blade","NFT Grail","Omni Relic","Omni Artifact"],
  auras:   ["Identity","Reputation","Ownership","Permission","Creativity","Governance","Wealth","Legacy","Influence","Discovery","Protection","Innovation"],
  familiars:["Digital Wolf","Metadata Raven","Asset Lion","Vault Bear","Ghost Fox","Oracle Owl","Chain Griffin","NFT Phoenix","Crystal Serpent","UP Kraken","Relay Dragon","Frost Unicorn"],
};
