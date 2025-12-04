# Guía de Deployment a Base Sepolia Testnet

## Prerequisitos

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto (si no existe):

```bash
# Private key de tu wallet (NO COMPARTAS ESTO)
PRIVATE_KEY=tu_private_key_aqui

# API Key de BaseScan (para verificación de contratos)
BASESCAN_API_KEY=tu_basescan_api_key_aqui

# RPC URLs (opcionales, ya hay públicos en hardhat.config.ts)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_MAINNET_RPC_URL=https://mainnet.base.org
```

### 2. Obtener ETH de Testnet

Necesitas ETH en Base Sepolia para el deployment:

1. **Consigue Sepolia ETH gratis:**
   - Faucet de Alchemy: https://sepoliafaucet.com/
   - Faucet de Infura: https://www.infura.io/faucet/sepolia
   - Faucet de QuickNode: https://faucet.quicknode.com/ethereum/sepolia

2. **Bridge a Base Sepolia:**
   - Ve a: https://bridge.base.org/
   - Conecta tu wallet
   - Selecciona Sepolia → Base Sepolia
   - Bridge al menos 0.05 ETH (suficiente para deployment)

### 3. Obtener API Key de BaseScan

1. Ve a https://basescan.org/
2. Crea una cuenta
3. Ve a "API Keys"
4. Crea un nuevo API key
5. Cópialo al archivo `.env`

## Deployment

### Paso 1: Compilar Contratos

```bash
npx hardhat compile
```

### Paso 2: Ejecutar Tests (Opcional pero recomendado)

```bash
npx hardhat test
```

### Paso 3: Deploy a Base Sepolia

```bash
npx hardhat run scripts/deploy.ts --network baseSepolia
```

Verás una salida como esta:

```
🚀 Starting DungeonFlip deployment to Base Sepolia...

📝 Deploying contracts with account: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
💰 Account balance: 0.05 ETH

1️⃣  Deploying AventurerNFT...
✅ AventurerNFT deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

2️⃣  Deploying FeeDistributor...
✅ FeeDistributor deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

...

🎉 DEPLOYMENT SUCCESSFUL! 🎉
```

### Paso 4: Guardar Direcciones

**Contratos desplegados en Base Sepolia (Dec 4, 2025):**

```bash
AVENTURER_NFT_ADDRESS=0x0c2E1ab7187F1Eb04628cFfb32ae55757C568cbb
FEE_DISTRIBUTOR_ADDRESS=0xc11256E2889E162456adCFA97bB0D18e094DFCf9
PROGRESS_TRACKER_ADDRESS=0x6e637BfB86217F30Bf95D8aD11dB9a63985b3bbE
REWARDS_POOL_ADDRESS=0x4C7Fe76e2C62b1cC4d98306C44258D309b7c1492
DUNGEON_GAME_ADDRESS=0xb4AD3C00FB9f77bf6c18CF6765Fe6F95d84f3042
```

Estas direcciones ya están actualizadas en `frontend/lib/constants.ts`.

### Paso 5: Verificar Contratos en BaseScan

Verifica cada contrato para que el código sea visible en BaseScan:

```bash
# AventurerNFT
npx hardhat verify --network baseSepolia <AVENTURER_NFT_ADDRESS>

# FeeDistributor
npx hardhat verify --network baseSepolia <FEE_DISTRIBUTOR_ADDRESS>

# ProgressTracker
npx hardhat verify --network baseSepolia <PROGRESS_TRACKER_ADDRESS>

# RewardsPool
npx hardhat verify --network baseSepolia <REWARDS_POOL_ADDRESS>

# DungeonGame (con argumentos del constructor)
npx hardhat verify --network baseSepolia <DUNGEON_GAME_ADDRESS> \
  <AVENTURER_NFT_ADDRESS> \
  <FEE_DISTRIBUTOR_ADDRESS> \
  <PROGRESS_TRACKER_ADDRESS> \
  <REWARDS_POOL_ADDRESS>
```

## Verificación del Deployment

### 1. Verificar en BaseScan

Visita: `https://sepolia.basescan.org/address/<DUNGEON_GAME_ADDRESS>`

Deberías ver:
- ✅ Código del contrato verificado
- ✅ Transacciones de deployment
- ✅ Configuración correcta

### 2. Probar Funcionalidad Básica

Usando Hardhat console:

```bash
npx hardhat console --network baseSepolia
```

```javascript
// Conectar a los contratos
const nft = await ethers.getContractAt("AventurerNFT", "0x...");
const game = await ethers.getContractAt("DungeonGame", "0x...");

// Mintear un NFT
await nft.mintAventurer();

// Verificar NFT
const balance = await nft.balanceOf("tu_address");
console.log("NFTs:", balance.toString());

// Obtener stats del NFT
const stats = await nft.getAventurerStats(1);
console.log("Stats:", {
  atk: stats.atk.toString(),
  def: stats.def.toString(),
  hp: stats.hp.toString()
});

// Jugar una partida
const entryFee = ethers.parseEther("0.01");
await game.startGame(1, { value: entryFee });
await game.completeGame();

// Verificar progreso
const tracker = await ethers.getContractAt("ProgressTracker", "0x...");
const progress = await tracker.getPlayerProgress("tu_address");
console.log("Score:", progress.totalScore.toString());
```

## Troubleshooting

### Error: "insufficient funds"
- Necesitas más ETH en Base Sepolia
- Usa el bridge: https://bridge.base.org/

### Error: "already verified"
- El contrato ya está verificado
- Puedes omitir este paso

### Error: "nonce too high"
- Espera unos segundos y reintenta
- O usa: `npx hardhat clean`

### Error: "replacement transaction underpriced"
- Aumenta el gas price en hardhat.config.ts
- O espera y reintenta

## Deployment a Mainnet

⚠️ **IMPORTANTE:** Antes de deployar a mainnet:

1. Haz deployment y prueba exhaustivamente en testnet
2. Haz un security audit
3. Consigue suficiente ETH en Base mainnet
4. Cambia el network a `baseMainnet`:

```bash
npx hardhat run scripts/deploy.ts --network baseMainnet
```

## Costos Estimados

### Base Sepolia (Testnet)
- **Gratis** - Solo necesitas ETH de testnet

### Base Mainnet (Producción)
- Deployment de 5 contratos: ~0.02-0.04 ETH
- Verificación: Gratis
- Gas en Base es mucho más barato que Ethereum mainnet

## Recursos Adicionales

- **Base Docs:** https://docs.base.org/
- **Base Bridge:** https://bridge.base.org/
- **BaseScan:** https://basescan.org/
- **Base Sepolia Explorer:** https://sepolia.basescan.org/
- **Hardhat Docs:** https://hardhat.org/docs

## Soporte

Si tienes problemas:
1. Revisa los logs de error detalladamente
2. Verifica que tienes suficiente ETH
3. Confirma que las variables de entorno están correctas
4. Revisa la documentación oficial de Base
