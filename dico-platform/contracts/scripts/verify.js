const { run } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🔍 Starting contract verification...");
  
  // Get network information
  const network = await hre.network;
  console.log(`📡 Verifying on network: ${network.name}`);
  
  // Load deployment addresses
  const deploymentFile = path.join(__dirname, '..', 'deployments', `${network.name}-${network.config.chainId}.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ Deployment file not found: ${deploymentFile}`);
    console.log("Please run deployment script first!");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  console.log(`📄 Loaded deployment info from: ${deploymentFile}`);

  const { addresses } = deploymentInfo;
  const deployerAddress = deploymentInfo.deployer;

  try {
    // Verify DicoToken
    console.log("\n📄 Verifying DicoToken...");
    await run("verify:verify", {
      address: addresses.DicoToken,
      constructorArguments: [
        deployerAddress // initialOwner
      ],
    });
    console.log("✅ DicoToken verified successfully");

    // Verify DicoFactory
    console.log("\n🏭 Verifying DicoFactory...");
    await run("verify:verify", {
      address: addresses.DicoFactory,
      constructorArguments: [
        addresses.DicoToken,  // _dicoToken
        deployerAddress,      // _feeRecipient
        deployerAddress       // initialOwner
      ],
    });
    console.log("✅ DicoFactory verified successfully");

    // Update deployment info with verification status
    deploymentInfo.verification = {
      verified: true,
      verifiedAt: new Date().toISOString(),
      contracts: {
        DicoToken: {
          address: addresses.DicoToken,
          verified: true
        },
        DicoFactory: {
          address: addresses.DicoFactory,
          verified: true
        }
      }
    };

    // Save updated deployment info
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`📝 Updated deployment info with verification status`);

    console.log("\n🎉 All contracts verified successfully!");
    console.log("=====================================");
    console.log("🔍 VERIFICATION SUMMARY");
    console.log("=====================================");
    console.log(`Network: ${network.name}`);
    console.log(`📄 DicoToken: ${addresses.DicoToken} ✅`);
    console.log(`🏭 DicoFactory: ${addresses.DicoFactory} ✅`);
    
    if (network.name !== "hardhat" && network.name !== "localhost") {
      const etherscanBase = network.config.chainId === 1 ? "https://etherscan.io" : 
                           network.config.chainId === 11155111 ? "https://sepolia.etherscan.io" : "https://etherscan.io";
      console.log(`\n🔗 Etherscan URLs:`);
      console.log(`   DicoToken: ${etherscanBase}/address/${addresses.DicoToken}#code`);
      console.log(`   DicoFactory: ${etherscanBase}/address/${addresses.DicoFactory}#code`);
    }

  } catch (error) {
    console.error("\n❌ Verification failed!");
    
    // Check if it's already verified
    if (error.message.includes("Already Verified") || error.message.includes("already verified")) {
      console.log("ℹ️  Contracts appear to be already verified");
      return;
    }
    
    console.error("Error:", error.message);
    
    // Provide helpful debugging information
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Make sure ETHERSCAN_API_KEY is set in .env file");
    console.log("2. Wait a few minutes after deployment before verifying");
    console.log("3. Check that the constructor arguments match the deployment");
    console.log("4. Ensure the network configuration is correct");
    
    process.exit(1);
  }
}

// Error handling for the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification script failed:", error);
    process.exit(1);
  });