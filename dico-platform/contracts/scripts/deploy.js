const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Starting Dico Platform deployment...");
  
  // Get network information
  const network = await ethers.provider.getNetwork();
  console.log(`📡 Deploying to network: ${network.name} (chainId: ${network.chainId})`);
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log(`👤 Deploying from account: ${deployerAddress}`);
  
  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployerAddress);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH`);
  
  if (balance < ethers.parseEther("0.1")) {
    console.warn("⚠️  Warning: Low balance, deployment might fail");
  }

  const deploymentResults = {};
  
  try {
    // 1. Deploy DicoToken
    console.log("\n📄 Deploying DicoToken...");
    const DicoToken = await ethers.getContractFactory("DicoToken");
    const dicoToken = await DicoToken.deploy(deployerAddress);
    await dicoToken.waitForDeployment();
    const dicoTokenAddress = await dicoToken.getAddress();
    
    console.log(`✅ DicoToken deployed to: ${dicoTokenAddress}`);
    deploymentResults.DicoToken = dicoTokenAddress;

    // 2. Deploy DicoFactory
    console.log("\n🏭 Deploying DicoFactory...");
    const DicoFactory = await ethers.getContractFactory("DicoFactory");
    const dicoFactory = await DicoFactory.deploy(
      dicoTokenAddress,
      deployerAddress, // fee recipient
      deployerAddress  // initial owner
    );
    await dicoFactory.waitForDeployment();
    const dicoFactoryAddress = await dicoFactory.getAddress();
    
    console.log(`✅ DicoFactory deployed to: ${dicoFactoryAddress}`);
    deploymentResults.DicoFactory = dicoFactoryAddress;

    // 3. Set up initial configuration
    console.log("\n⚙️  Setting up initial configuration...");
    
    // Add factory as a vesting contract in the token
    const addVestingTx = await dicoToken.addVestingContract(dicoFactoryAddress);
    await addVestingTx.wait();
    console.log("✅ Factory added as vesting contract");

    // Transfer some tokens to factory for rewards/incentives (optional)
    const factoryTokenAmount = ethers.parseEther("10000000"); // 10M tokens
    const transferTx = await dicoToken.transfer(dicoFactoryAddress, factoryTokenAmount);
    await transferTx.wait();
    console.log(`✅ Transferred ${ethers.formatEther(factoryTokenAmount)} DICO tokens to factory`);

    // 4. Verify deployment
    console.log("\n🔍 Verifying deployment...");
    
    // Check DicoToken
    const tokenName = await dicoToken.name();
    const tokenSymbol = await dicoToken.symbol();
    const tokenSupply = await dicoToken.totalSupply();
    console.log(`📊 Token: ${tokenName} (${tokenSymbol}), Total Supply: ${ethers.formatEther(tokenSupply)}`);
    
    // Check DicoFactory
    const factoryOwner = await dicoFactory.owner();
    const platformFee = await dicoFactory.platformFeePercentage();
    const creationFee = await dicoFactory.projectCreationFee();
    console.log(`🏭 Factory Owner: ${factoryOwner}`);
    console.log(`💸 Platform Fee: ${platformFee / 100}%`);
    console.log(`💳 Creation Fee: ${ethers.formatEther(creationFee)} ETH`);

    // 5. Save deployment addresses
    const deploymentInfo = {
      network: network.name,
      chainId: Number(network.chainId),
      deployer: deployerAddress,
      timestamp: new Date().toISOString(),
      gasUsed: {
        DicoToken: "Estimated in transaction",
        DicoFactory: "Estimated in transaction"
      },
      addresses: deploymentResults,
      configuration: {
        platformFeePercentage: Number(platformFee),
        projectCreationFee: ethers.formatEther(creationFee),
        tokenInitialSupply: ethers.formatEther(tokenSupply)
      }
    };

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // Save deployment info to file
    const deploymentFile = path.join(deploymentsDir, `${network.name}-${network.chainId}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`📝 Deployment info saved to: ${deploymentFile}`);

    // Generate environment variables file
    const envContent = `
# Dico Platform Smart Contract Addresses - ${network.name}
NEXT_PUBLIC_DICO_TOKEN_ADDRESS=${dicoTokenAddress}
NEXT_PUBLIC_DICO_FACTORY_ADDRESS=${dicoFactoryAddress}
NEXT_PUBLIC_CHAIN_ID=${network.chainId}
NEXT_PUBLIC_NETWORK_NAME=${network.name}

# Contract ABI files available in deployments/${network.name}-${network.chainId}.json
`;

    const envFile = path.join(deploymentsDir, `${network.name}.env`);
    fs.writeFileSync(envFile, envContent.trim());
    console.log(`📝 Environment file saved to: ${envFile}`);

    // 6. Display summary
    console.log("\n🎉 Deployment completed successfully!");
    console.log("=====================================");
    console.log("📋 DEPLOYMENT SUMMARY");
    console.log("=====================================");
    console.log(`Network: ${network.name} (${network.chainId})`);
    console.log(`Deployer: ${deployerAddress}`);
    console.log(`\n📄 DicoToken: ${dicoTokenAddress}`);
    console.log(`🏭 DicoFactory: ${dicoFactoryAddress}`);
    console.log(`\n⚙️  Configuration:`);
    console.log(`   Platform Fee: ${platformFee / 100}%`);
    console.log(`   Creation Fee: ${ethers.formatEther(creationFee)} ETH`);
    console.log(`\n🔗 Next Steps:`);
    console.log(`1. Update frontend .env with the addresses above`);
    console.log(`2. Verify contracts on Etherscan (run verify script)`);
    console.log(`3. Test project creation and investment flows`);
    console.log(`4. Set up monitoring and alerts`);
    
    if (network.name !== "hardhat" && network.name !== "localhost") {
      console.log(`\n🔍 Etherscan URLs:`);
      const etherscanBase = network.chainId === 1 ? "https://etherscan.io" : 
                           network.chainId === 11155111 ? "https://sepolia.etherscan.io" : "https://etherscan.io";
      console.log(`   DicoToken: ${etherscanBase}/address/${dicoTokenAddress}`);
      console.log(`   DicoFactory: ${etherscanBase}/address/${dicoFactoryAddress}`);
    }

  } catch (error) {
    console.error("\n❌ Deployment failed!");
    console.error("Error:", error.message);
    console.error("\nFull error:", error);
    process.exit(1);
  }
}

// Error handling for the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment script failed:", error);
    process.exit(1);
  });