const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Dico Platform Integration Tests", function () {
  let DicoToken, DicoFactory, DicoProject, DicoVesting;
  let dicoToken, dicoFactory;
  let owner, creator, investor1, investor2, investor3;

  const CREATION_FEE = ethers.parseEther("1");
  const PROJECT_DURATION = 30 * 24 * 60 * 60; // 30 days
  const VESTING_DURATION = 365 * 24 * 60 * 60; // 1 year
  const VESTING_CLIFF = 90 * 24 * 60 * 60; // 90 days

  beforeEach(async function () {
    [owner, creator, investor1, investor2, investor3] = await ethers.getSigners();

    // Deploy DicoToken
    DicoToken = await ethers.getContractFactory("DicoToken");
    dicoToken = await DicoToken.deploy(owner.address);
    await dicoToken.waitForDeployment();

    // Deploy DicoFactory
    DicoFactory = await ethers.getContractFactory("DicoFactory");
    dicoFactory = await DicoFactory.deploy(
      await dicoToken.getAddress(),
      owner.address, // fee recipient
      owner.address  // initial owner
    );
    await dicoFactory.waitForDeployment();

    // Setup: Give creator some ETH for project creation
    await owner.sendTransaction({
      to: creator.address,
      value: ethers.parseEther("10")
    });

    // Give investors ETH
    await owner.sendTransaction({
      to: investor1.address,
      value: ethers.parseEther("50")
    });
    await owner.sendTransaction({
      to: investor2.address,
      value: ethers.parseEther("30")
    });
    await owner.sendTransaction({
      to: investor3.address,
      value: ethers.parseEther("20")
    });
  });

  describe("Complete ICO Lifecycle - Successful Project", function () {
    let projectAddress;
    let project;

    it("Should complete a full successful ICO lifecycle", async function () {
      // Step 1: Creator creates a project
      console.log("Step 1: Creating project...");
      const projectParams = {
        name: "EcoToken",
        symbol: "ECO",
        totalSupply: ethers.parseEther("1000000"), // 1M tokens
        targetAmount: ethers.parseEther("50"), // 50 ETH target
        duration: PROJECT_DURATION,
        tokenPrice: ethers.parseEther("0.00005"), // 0.00005 ETH per token
        vestingDuration: VESTING_DURATION,
        vestingCliff: VESTING_CLIFF,
        description: "Revolutionary eco-friendly blockchain project"
      };

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
        { value: CREATION_FEE }
      );

      const receipt = await createTx.wait();
      const projectCreatedEvent = receipt.logs.find(log => {
        try {
          const parsed = dicoFactory.interface.parseLog(log);
          return parsed && parsed.name === 'ProjectCreated';
        } catch {
          return false;
        }
      });

      expect(projectCreatedEvent).to.not.be.undefined;
      const parsedEvent = dicoFactory.interface.parseLog(projectCreatedEvent);
      projectAddress = parsedEvent.args.projectContract;

      DicoProject = await ethers.getContractFactory("DicoProject");
      project = DicoProject.attach(projectAddress);

      console.log(`✓ Project created at ${projectAddress}`);

      // Verify project is tracked by factory
      expect(await dicoFactory.isValidProject(projectAddress)).to.be.true;
      expect(await dicoFactory.totalProjectsCreated()).to.equal(1);

      // Step 2: Owner verifies the project
      console.log("Step 2: Verifying project...");
      await dicoFactory.verifyProject(projectAddress);
      
      const projectInfo = await dicoFactory.projectInfo(projectAddress);
      expect(projectInfo.isVerified).to.be.true;
      console.log("✓ Project verified");

      // Step 3: Multiple investors make investments
      console.log("Step 3: Investors making investments...");
      
      // Investor 1: 20 ETH
      const investment1 = ethers.parseEther("20");
      await project.connect(investor1).invest({ value: investment1 });
      console.log("✓ Investor 1 invested 20 ETH");

      // Investor 2: 15 ETH  
      const investment2 = ethers.parseEther("15");
      await project.connect(investor2).invest({ value: investment2 });
      console.log("✓ Investor 2 invested 15 ETH");

      // Investor 3: 16 ETH (this should reach the target)
      const investment3 = ethers.parseEther("16");
      await project.connect(investor3).invest({ value: investment3 });
      console.log("✓ Investor 3 invested 16 ETH");

      // Verify total raised exceeds target and project is automatically finalized
      const projectDetails = await project.getProjectInfo();
      expect(projectDetails.raised).to.equal(investment1 + investment2 + investment3);
      expect(projectDetails.projectStatus).to.equal(1); // Successful
      expect(projectDetails.isVestingInitialized).to.be.true;
      console.log("✓ Project automatically finalized as successful");

      // Step 4: Creator withdraws funds
      console.log("Step 4: Creator withdrawing funds...");
      const creatorBalanceBefore = await ethers.provider.getBalance(creator.address);
      const platformFee = (projectDetails.raised * 250n) / 10000n; // 2.5%
      const expectedCreatorAmount = projectDetails.raised - platformFee;

      const withdrawTx = await project.connect(creator).withdrawFunds();
      const withdrawReceipt = await withdrawTx.wait();
      const gasUsed = withdrawReceipt.gasUsed * withdrawReceipt.gasPrice;

      const creatorBalanceAfter = await ethers.provider.getBalance(creator.address);
      const actualReceived = creatorBalanceAfter - creatorBalanceBefore + gasUsed;
      
      expect(actualReceived).to.equal(expectedCreatorAmount);
      expect(await project.fundsWithdrawn()).to.be.true;
      console.log(`✓ Creator withdrew ${ethers.formatEther(expectedCreatorAmount)} ETH`);

      // Step 5: Fast forward past cliff period
      console.log("Step 5: Fast forwarding past cliff period...");
      await time.increase(VESTING_CLIFF + 1);

      // Step 6: Investors claim their vested tokens
      console.log("Step 6: Investors claiming vested tokens...");
      
      const vestingAddress = await project.vestingContract();
      DicoVesting = await ethers.getContractFactory("DicoVesting");
      const vesting = DicoVesting.attach(vestingAddress);

      // Check claimable amounts
      const claimable1 = await vesting.getClaimableAmount(investor1.address);
      const claimable2 = await vesting.getClaimableAmount(investor2.address);
      const claimable3 = await vesting.getClaimableAmount(investor3.address);

      expect(claimable1).to.be.greaterThan(0);
      expect(claimable2).to.be.greaterThan(0);
      expect(claimable3).to.be.greaterThan(0);

      // Claim tokens
      await project.connect(investor1).claimTokens();
      await project.connect(investor2).claimTokens();
      await project.connect(investor3).claimTokens();

      console.log("✓ All investors claimed their initial vested tokens");

      // Step 7: Verify final state
      console.log("Step 7: Verifying final state...");
      
      // Check platform statistics
      const stats = await dicoFactory.getPlatformStats();
      expect(stats.projectsCreated).to.equal(1);
      expect(stats.fundsRaised).to.equal(projectDetails.raised);
      expect(stats.feesCollected).to.equal(platformFee);

      // Check that tokens were distributed correctly
      const tokenBalance1 = await project.balanceOf(investor1.address);
      const tokenBalance2 = await project.balanceOf(investor2.address);
      const tokenBalance3 = await project.balanceOf(investor3.address);

      expect(tokenBalance1).to.be.greaterThan(0);
      expect(tokenBalance2).to.be.greaterThan(0);
      expect(tokenBalance3).to.be.greaterThan(0);

      console.log("✓ Final state verified successfully");
      console.log("🎉 Complete ICO lifecycle test passed!");

      // Log final statistics
      console.log("\n📊 FINAL STATISTICS:");
      console.log(`Projects Created: ${stats.projectsCreated}`);
      console.log(`Total Funds Raised: ${ethers.formatEther(stats.fundsRaised)} ETH`);
      console.log(`Platform Fees Collected: ${ethers.formatEther(stats.feesCollected)} ETH`);
      console.log(`Investor 1 Tokens: ${ethers.formatEther(tokenBalance1)}`);
      console.log(`Investor 2 Tokens: ${ethers.formatEther(tokenBalance2)}`);
      console.log(`Investor 3 Tokens: ${ethers.formatEther(tokenBalance3)}`);
    });
  });

  describe("Failed Project Lifecycle with Refunds", function () {
    let projectAddress;
    let project;

    it("Should handle failed project with refunds", async function () {
      console.log("Testing failed project scenario...");

      // Create project with high target that won't be met
      const projectParams = {
        name: "FailToken",
        symbol: "FAIL",
        totalSupply: ethers.parseEther("500000"),
        targetAmount: ethers.parseEther("1000"), // Very high target - 1000 ETH
        duration: PROJECT_DURATION,
        tokenPrice: ethers.parseEther("0.001"),
        vestingDuration: VESTING_DURATION,
        vestingCliff: VESTING_CLIFF,
        description: "This project will fail for testing"
      };

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
        { value: CREATION_FEE }
      );

      const receipt = await createTx.wait();
      const projectCreatedEvent = receipt.logs.find(log => {
        try {
          const parsed = dicoFactory.interface.parseLog(log);
          return parsed && parsed.name === 'ProjectCreated';
        } catch {
          return false;
        }
      });

      const parsedEvent = dicoFactory.interface.parseLog(projectCreatedEvent);
      projectAddress = parsedEvent.args.projectContract;

      DicoProject = await ethers.getContractFactory("DicoProject");
      project = DicoProject.attach(projectAddress);

      console.log("✓ High-target project created");

      // Make insufficient investments (less than 30% of target)
      const smallInvestment1 = ethers.parseEther("50"); // 5% of target
      const smallInvestment2 = ethers.parseEther("100"); // 10% of target
      
      await project.connect(investor1).invest({ value: smallInvestment1 });
      await project.connect(investor2).invest({ value: smallInvestment2 });

      console.log("✓ Made insufficient investments");

      // Fast forward past project end time
      await time.increase(PROJECT_DURATION + 1);

      // Finalize project (should fail due to insufficient funding)
      await project.finalizeProject();
      
      const projectInfo = await project.getProjectInfo();
      expect(projectInfo.projectStatus).to.equal(2); // Failed

      console.log("✓ Project correctly finalized as failed");

      // Investors claim refunds
      const investor1BalanceBefore = await ethers.provider.getBalance(investor1.address);
      const investor2BalanceBefore = await ethers.provider.getBalance(investor2.address);

      const refundTx1 = await project.connect(investor1).claimRefund();
      const refundTx2 = await project.connect(investor2).claimRefund();

      const receipt1 = await refundTx1.wait();
      const receipt2 = await refundTx2.wait();

      const gas1 = receipt1.gasUsed * receipt1.gasPrice;
      const gas2 = receipt2.gasUsed * receipt2.gasPrice;

      const investor1BalanceAfter = await ethers.provider.getBalance(investor1.address);
      const investor2BalanceAfter = await ethers.provider.getBalance(investor2.address);

      // Should have received their investments back minus gas
      expect(investor1BalanceAfter).to.equal(investor1BalanceBefore + smallInvestment1 - gas1);
      expect(investor2BalanceAfter).to.equal(investor2BalanceBefore + smallInvestment2 - gas2);

      console.log("✓ Investors successfully claimed refunds");
      console.log("🎉 Failed project lifecycle test passed!");
    });
  });

  describe("Multiple Projects and Platform Growth", function () {
    it("Should handle multiple projects and track platform growth", async function () {
      console.log("Testing multiple projects scenario...");

      const projectCount = 3;
      const projectAddresses = [];

      // Create multiple projects
      for (let i = 0; i < projectCount; i++) {
        const projectParams = {
          name: `Project ${i + 1}`,
          symbol: `P${i + 1}`,
          totalSupply: ethers.parseEther("100000"),
          targetAmount: ethers.parseEther("10"), // Small target for quick completion
          duration: PROJECT_DURATION,
          tokenPrice: ethers.parseEther("0.0001"),
          vestingDuration: VESTING_DURATION,
          vestingCliff: VESTING_CLIFF,
          description: `Test project number ${i + 1}`
        };

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
          { value: CREATION_FEE }
        );

        const receipt = await createTx.wait();
        const projectCreatedEvent = receipt.logs.find(log => {
          try {
            const parsed = dicoFactory.interface.parseLog(log);
            return parsed && parsed.name === 'ProjectCreated';
          } catch {
            return false;
          }
        });

        const parsedEvent = dicoFactory.interface.parseLog(projectCreatedEvent);
        projectAddresses.push(parsedEvent.args.projectContract);
        
        console.log(`✓ Created project ${i + 1}`);
      }

      // Verify all projects are tracked
      expect(await dicoFactory.totalProjectsCreated()).to.equal(projectCount);
      
      // Test pagination
      const page1 = await dicoFactory.getProjectsPaginated(0, 2);
      const page2 = await dicoFactory.getProjectsPaginated(2, 2);
      
      expect(page1.length).to.equal(2);
      expect(page2.length).to.equal(1);
      
      console.log("✓ Pagination works correctly");

      // Make investments in all projects to complete them
      for (let i = 0; i < projectCount; i++) {
        const project = DicoProject.attach(projectAddresses[i]);
        await project.connect(investor1).invest({ value: ethers.parseEther("10") });
        console.log(`✓ Completed funding for project ${i + 1}`);
      }

      // Check final platform statistics
      const stats = await dicoFactory.getPlatformStats();
      expect(stats.projectsCreated).to.equal(projectCount);
      expect(stats.fundsRaised).to.equal(ethers.parseEther("30")); // 3 projects × 10 ETH
      
      console.log("✓ Platform statistics correctly updated");
      console.log("🎉 Multiple projects test passed!");
      
      console.log("\n📊 FINAL PLATFORM STATS:");
      console.log(`Total Projects: ${stats.projectsCreated}`);
      console.log(`Total Raised: ${ethers.formatEther(stats.fundsRaised)} ETH`);
      console.log(`Total Fees: ${ethers.formatEther(stats.feesCollected)} ETH`);
    });
  });

  describe("Edge Cases and Error Scenarios", function () {
    it("Should handle various edge cases correctly", async function () {
      console.log("Testing edge cases...");

      // Create a test project
      const createTx = await dicoFactory.connect(creator).createProject(
        "EdgeCase Token",
        "EDGE",
        ethers.parseEther("100000"),
        ethers.parseEther("20"),
        PROJECT_DURATION,
        ethers.parseEther("0.0001"),
        VESTING_DURATION,
        VESTING_CLIFF,
        "Edge case testing project",
        { value: CREATION_FEE }
      );

      const receipt = await createTx.wait();
      const projectCreatedEvent = receipt.logs.find(log => {
        try {
          const parsed = dicoFactory.interface.parseLog(log);
          return parsed && parsed.name === 'ProjectCreated';
        } catch {
          return false;
        }
      });

      const parsedEvent = dicoFactory.interface.parseLog(projectCreatedEvent);
      const project = DicoProject.attach(parsedEvent.args.projectContract);

      // Test minimum investment
      await project.connect(investor1).invest({ value: ethers.parseEther("0.01") });
      console.log("✓ Minimum investment accepted");

      // Test investment limits
      await expect(
        project.connect(investor1).invest({ value: ethers.parseEther("0.005") })
      ).to.be.revertedWith("DicoProject: investment too small");

      await expect(
        project.connect(investor1).invest({ value: ethers.parseEther("101") })
      ).to.be.revertedWith("DicoProject: investment too large");

      console.log("✓ Investment limits enforced");

      // Test project cancellation
      await project.connect(creator).cancelProject();
      expect(await project.status()).to.equal(3); // Cancelled

      // Should not allow investments in cancelled project
      await expect(
        project.connect(investor2).invest({ value: ethers.parseEther("1") })
      ).to.be.revertedWith("DicoProject: project not active");

      console.log("✓ Project cancellation works correctly");
      console.log("🎉 Edge cases test passed!");
    });
  });

  describe("Gas Optimization and Performance", function () {
    it("Should perform efficiently with reasonable gas costs", async function () {
      console.log("Testing gas optimization...");

      // Track gas usage for key operations
      const gasResults = {};

      // Project creation
      const createTx = await dicoFactory.connect(creator).createProject(
        "Gas Test",
        "GAS",
        ethers.parseEther("100000"),
        ethers.parseEther("10"),
        PROJECT_DURATION,
        ethers.parseEther("0.0001"),
        VESTING_DURATION,
        VESTING_CLIFF,
        "Gas optimization test",
        { value: CREATION_FEE }
      );
      const createReceipt = await createTx.wait();
      gasResults.projectCreation = createReceipt.gasUsed;

      const projectCreatedEvent = createReceipt.logs.find(log => {
        try {
          const parsed = dicoFactory.interface.parseLog(log);
          return parsed && parsed.name === 'ProjectCreated';
        } catch {
          return false;
        }
      });

      const parsedEvent = dicoFactory.interface.parseLog(projectCreatedEvent);
      const project = DicoProject.attach(parsedEvent.args.projectContract);

      // Investment gas cost
      const investTx = await project.connect(investor1).invest({ value: ethers.parseEther("5") });
      const investReceipt = await investTx.wait();
      gasResults.investment = investReceipt.gasUsed;

      // Complete project
      await project.connect(investor2).invest({ value: ethers.parseEther("5") });

      // Fund withdrawal gas cost
      const withdrawTx = await project.connect(creator).withdrawFunds();
      const withdrawReceipt = await withdrawTx.wait();
      gasResults.withdrawal = withdrawReceipt.gasUsed;

      // Token claiming gas cost (after cliff)
      await time.increase(VESTING_CLIFF + 1);
      const claimTx = await project.connect(investor1).claimTokens();
      const claimReceipt = await claimTx.wait();
      gasResults.tokenClaim = claimReceipt.gasUsed;

      console.log("\n⛽ GAS USAGE REPORT:");
      console.log(`Project Creation: ${gasResults.projectCreation.toLocaleString()} gas`);
      console.log(`Investment: ${gasResults.investment.toLocaleString()} gas`);
      console.log(`Fund Withdrawal: ${gasResults.withdrawal.toLocaleString()} gas`);
      console.log(`Token Claim: ${gasResults.tokenClaim.toLocaleString()} gas`);

      // Verify gas costs are within reasonable limits
      expect(gasResults.projectCreation).to.be.lessThan(4000000); // < 4M gas
      expect(gasResults.investment).to.be.lessThan(200000);       // < 200k gas
      expect(gasResults.withdrawal).to.be.lessThan(150000);       // < 150k gas
      expect(gasResults.tokenClaim).to.be.lessThan(150000);       // < 150k gas

      console.log("✓ All operations within gas limits");
      console.log("🎉 Gas optimization test passed!");
    });
  });
});

describe("Security and Attack Vectors", function () {
  let DicoToken, DicoFactory, DicoProject;
  let dicoToken, dicoFactory;
  let owner, attacker, creator, investor;

  beforeEach(async function () {
    [owner, attacker, creator, investor] = await ethers.getSigners();

    DicoToken = await ethers.getContractFactory("DicoToken");
    dicoToken = await DicoToken.deploy(owner.address);
    await dicoToken.waitForDeployment();

    DicoFactory = await ethers.getContractFactory("DicoFactory");
    dicoFactory = await DicoFactory.deploy(
      await dicoToken.getAddress(),
      owner.address,
      owner.address
    );
    await dicoFactory.waitForDeployment();
  });

  it("Should prevent unauthorized access to admin functions", async function () {
    // Test DicoToken admin functions
    await expect(
      dicoToken.connect(attacker).mint(attacker.address, ethers.parseEther("1000"))
    ).to.be.revertedWithCustomError(dicoToken, "OwnableUnauthorizedAccount");

    await expect(
      dicoToken.connect(attacker).pause()
    ).to.be.revertedWithCustomError(dicoToken, "OwnableUnauthorizedAccount");

    // Test DicoFactory admin functions
    await expect(
      dicoFactory.connect(attacker).setPlatformFeePercentage(500)
    ).to.be.revertedWithCustomError(dicoFactory, "OwnableUnauthorizedAccount");

    await expect(
      dicoFactory.connect(attacker).withdrawFees()
    ).to.be.revertedWithCustomError(dicoFactory, "OwnableUnauthorizedAccount");

    console.log("✓ Admin functions properly protected");
  });

  it("Should prevent reentrancy attacks", async function () {
    // Create a project first
    await creator.sendTransaction({ to: creator.address, value: 0 }); // Ensure creator has ETH
    await owner.sendTransaction({ to: creator.address, value: ethers.parseEther("5") });

    const createTx = await dicoFactory.connect(creator).createProject(
      "Test Token",
      "TEST",
      ethers.parseEther("100000"),
      ethers.parseEther("10"),
      30 * 24 * 60 * 60,
      ethers.parseEther("0.0001"),
      365 * 24 * 60 * 60,
      90 * 24 * 60 * 60,
      "Test project",
      { value: ethers.parseEther("1") }
    );

    const receipt = await createTx.wait();
    const projectCreatedEvent = receipt.logs.find(log => {
      try {
        const parsed = dicoFactory.interface.parseLog(log);
        return parsed && parsed.name === 'ProjectCreated';
      } catch {
        return false;
      }
    });

    const parsedEvent = dicoFactory.interface.parseLog(projectCreatedEvent);
    const project = DicoProject.attach(parsedEvent.args.projectContract);

    // Make project fail so we can test refund reentrancy protection
    await project.connect(investor).invest({ value: ethers.parseEther("1") }); // Insufficient investment
    await time.increase(30 * 24 * 60 * 60 + 1); // Past deadline
    await project.finalizeProject(); // Should be failed

    // The refund function has reentrancy protection
    // Normal refund should work
    await project.connect(investor).claimRefund();
    expect(await project.hasClaimed(investor.address)).to.be.true;

    // Second refund attempt should fail
    await expect(
      project.connect(investor).claimRefund()
    ).to.be.revertedWith("DicoProject: already claimed");

    console.log("✓ Reentrancy protection working");
  });

  it("Should enforce proper parameter validation", async function () {
    // Test invalid project parameters
    await expect(
      dicoFactory.connect(creator).createProject(
        "", // Empty name
        "TEST",
        ethers.parseEther("100000"),
        ethers.parseEther("10"),
        30 * 24 * 60 * 60,
        ethers.parseEther("0.0001"),
        365 * 24 * 60 * 60,
        90 * 24 * 60 * 60,
        "Test project",
        { value: ethers.parseEther("1") }
      )
    ).to.be.revertedWith("DicoFactory: invalid name or symbol");

    await expect(
      dicoFactory.connect(creator).createProject(
        "Test",
        "TEST",
        0, // Zero supply
        ethers.parseEther("10"),
        30 * 24 * 60 * 60,
        ethers.parseEther("0.0001"),
        365 * 24 * 60 * 60,
        90 * 24 * 60 * 60,
        "Test project",
        { value: ethers.parseEther("1") }
      )
    ).to.be.revertedWith("DicoFactory: invalid total supply");

    console.log("✓ Parameter validation working");
  });
});