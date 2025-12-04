const fs = require('fs');
const path = require('path');

const contracts = ['AventurerNFT', 'DungeonGame', 'FeeDistributor', 'ProgressTracker', 'RewardsPool'];

contracts.forEach(name => {
  try {
    const artifactPath = path.join(__dirname, 'artifacts', 'contracts', `${name}.sol`, `${name}.json`);
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    const outputPath = path.join(__dirname, 'frontend', 'lib', 'contracts', `${name}.json`);
    fs.writeFileSync(outputPath, JSON.stringify({ abi: artifact.abi }, null, 2));
    
    console.log(`✅ Extracted ABI for ${name}`);
  } catch (error) {
    console.error(`❌ Error extracting ABI for ${name}:`, error.message);
  }
});

console.log('\n🎉 ABI extraction complete!');
