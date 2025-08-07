const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Creating sample ICO project...");
  
  // Get network information
  const network = await ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name} (chainId: ${network.chainId})`);
  
  // Load deployment addresses
  const deploymentFile = path.join(__dirname, '..', 'deployments', `${network.name}-${network.chainId}.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ Deployment file not found: ${deploymentFile}`);
    console.log("Please run deployment script first!");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  const { addresses } = deploymentInfo;

  // Get accounts
  const [deployer, creator, investor1, investor2] = await ethers.getSigners();
  console.log(`👤 Creator: ${await creator.getAddress()}`);
  console.log(`💰 Investor 1: ${await investor1.getAddress()}`);
  console.log(`💰 Investor 2: ${await investor2.getAddress()}`);

  try {
    // Get factory contract instance
    const DicoFactory = await ethers.getContractFactory("DicoFactory");
    const dicoFactory = DicoFactory.attach(addresses.DicoFactory);

    // Project parameters
    const projectParams = {
      name: "GreenTech Token",
      symbol: "GTK",
      totalSupply: ethers.parseEther("1000000"), // 1M tokens
      targetAmount: ethers.parseEther("100"), // 100 ETH target
      duration: 30 * 24 * 60 * 60, // 30 days
      tokenPrice: ethers.parseEther("0.0001"), // 0.0001 ETH per token
      vestingDuration: 365 * 24 * 60 * 60, // 1 year vesting
      vestingCliff: 90 * 24 * 60 * 60, // 90 days cliff
      description: "Revolutionary green technology for sustainable future"
    };

    // Get creation fee
    const creationFee = await dicoFactory.projectCreationFee();
    console.log(`💳 Creation fee: ${ethers.formatEther(creationFee)} ETH`);

    // Create project
    console.log("\n📄 Creating project...");
    const createTx = await dicoFactory.connect(creator).createProject(
      projectParams.name,
      projectParams.symbol,
      projectParams.totalSupply,
      projectParams.targetAmount,
      projectParams.duration,
      projectParams.tokenPrice,
      projectParams.vestingDuration,
      projectParams.vestingCliff,
      projectParams.description,
      { value: creationFee }
    );

    const receipt = await createTx.wait();
    
    // Find ProjectCreated event
    const projectCreatedEvent = receipt.logs.find(log => {
      try {
        const parsed = dicoFactory.interface.parseLog(log);
        return parsed && parsed.name === 'ProjectCreated';
      } catch {
        return false;
      }
    });

    if (!projectCreatedEvent) {
      throw new Error("ProjectCreated event not found");
    }

    const parsedEvent = dicoFactory.interface.parseLog(projectCreatedEvent);
    const projectAddress = parsedEvent.args.projectContract;
    
    console.log(`✅ Project created at: ${projectAddress}`);
    console.log(`📊 Project details:`);
    console.log(`   Name: ${projectParams.name} (${projectParams.symbol})`);
    console.log(`   Target: ${ethers.formatEther(projectParams.targetAmount)} ETH`);
    console.log(`   Token Price: ${ethers.formatEther(projectParams.tokenPrice)} ETH`);
    console.log(`   Duration: ${projectParams.duration / (24 * 60 * 60)} days`);

    // Get project contract instance
    const DicoProject = await ethers.getContractFactory("DicoProject");
    const project = DicoProject.attach(projectAddress);

    // Make some investments
    console.log("\n💰 Making sample investments...");
    
    // Investment 1: 5 ETH
    const investment1 = ethers.parseEther("5");
    console.log(`💸 Investor 1 investing ${ethers.formatEther(investment1)} ETH...`);
    const investTx1 = await project.connect(investor1).invest({ value: investment1 });
    await investTx1.wait();
    console.log(`✅ Investment 1 completed`);

    // Investment 2: 10 ETH
    const investment2 = ethers.parseEther("10");
    console.log(`💸 Investor 2 investing ${ethers.formatEther(investment2)} ETH...`);
    const investTx2 = await project.connect(investor2).invest({ value: investment2 });
    await investTx2.wait();
    console.log(`✅ Investment 2 completed`);

    // Get project status
    const projectInfo = await project.getProjectInfo();
    const progress = await project.getProgress();
    
    console.log("\n📊 Project Status:");
    console.log(`   Total Raised: ${ethers.formatEther(projectInfo.raised)} ETH`);
    console.log(`   Progress: ${progress}%`);
    console.log(`   Investor Count: ${projectInfo.investorCount_}`);
    console.log(`   Status: ${projectInfo.projectStatus === 0n ? 'Active' : 'Other'}`);

    // Get investment details
    console.log("\n💼 Investment Details:");
    const inv1Info = await project.getInvestmentInfo(await investor1.getAddress());
    const inv2Info = await project.getInvestmentInfo(await investor2.getAddress());
    
    console.log(`   Investor 1: ${ethers.formatEther(inv1Info.investmentAmount)} ETH, ${ethers.formatEther(inv1Info.tokens)} tokens`);
    console.log(`   Investor 2: ${ethers.formatEther(inv2Info.investmentAmount)} ETH, ${ethers.formatEther(inv2Info.tokens)} tokens`);

    // Save sample project info
    const sampleProjectInfo = {
      network: network.name,
      chainId: Number(network.chainId),
      projectAddress: projectAddress,
      creator: await creator.getAddress(),
      projectParams: {
        ...projectParams,
        totalSupply: ethers.formatEther(projectParams.totalSupply),
        targetAmount: ethers.formatEther(projectParams.targetAmount),
        tokenPrice: ethers.formatEther(projectParams.tokenPrice)
      },
      currentStatus: {
        totalRaised: ethers.formatEther(projectInfo.raised),
        progress: Number(progress),
        investorCount: Number(projectInfo.investorCount_),
        status: Number(projectInfo.projectStatus)
      },
      investments: [
        {
          investor: await investor1.getAddress(),
          amount: ethers.formatEther(inv1Info.investmentAmount),
          tokens: ethers.formatEther(inv1Info.tokens)
        },
        {
          investor: await investor2.getAddress(),
          amount: ethers.formatEther(inv2Info.investmentAmount),
          tokens: ethers.formatEther(inv2Info.tokens)
        }
      ],
      createdAt: new Date().toISOString()
    };

    // Save to deployments directory
    const sampleProjectFile = path.join(__dirname, '..', 'deployments', `sample-project-${network.name}.json`);
    fs.writeFileSync(sampleProjectFile, JSON.stringify(sampleProjectInfo, null, 2));
    console.log(`📝 Sample project info saved to: ${sampleProjectFile}`);

    console.log("\n🎉 Sample project created successfully!");
    console.log("=====================================");
    console.log("📋 PROJECT SUMMARY");
    console.log("=====================================");
    console.log(`Project Address: ${projectAddress}`);
    console.log(`Factory Address: ${addresses.DicoFactory}`);
    console.log(`Total Raised: ${ethers.formatEther(projectInfo.raised)} ETH`);
    console.log(`Progress: ${progress}%`);
    console.log(`Investors: ${projectInfo.investorCount_}`);
    
    console.log("\n🔗 Next Steps:");
    console.log("1. Test the frontend with this project");
    console.log("2. Try more investments to reach the target");
    console.log("3. Test project completion and token claiming");
    console.log("4. Explore vesting functionality");

  } catch (error) {
    console.error("\n❌ Sample project creation failed!");
    console.error("Error:", error.message);
    console.error("\nFull error:", error);
    process.exit(1);
  }
}

// Error handling for the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Sample project script failed:", error);
    process.exit(1);
  });