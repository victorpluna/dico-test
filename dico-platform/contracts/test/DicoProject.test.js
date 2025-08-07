const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("DicoProject", function () {
  let DicoToken;
  let DicoFactory;
  let DicoProject;
  let dicoToken;
  let dicoFactory;
  let project;
  let owner;
  let creator;
  let investor1;
  let investor2;
  let addrs;

  const CREATION_FEE = ethers.parseEther("1");
  const PROJECT_DURATION = 30 * 24 * 60 * 60; // 30 days
  const VESTING_DURATION = 365 * 24 * 60 * 60; // 1 year
  const VESTING_CLIFF = 90 * 24 * 60 * 60; // 90 days

  const projectParams = {
    name: "Green Token",
    symbol: "GREEN",
    totalSupply: ethers.parseEther("1000000"), // 1M tokens
    targetAmount: ethers.parseEther("100"), // 100 ETH
    duration: PROJECT_DURATION,
    tokenPrice: ethers.parseEther("0.0001"), // 0.0001 ETH per token
    vestingDuration: VESTING_DURATION,
    vestingCliff: VESTING_CLIFF,
    description: "Green technology project"
  };

  beforeEach(async function () {
    [owner, creator, investor1, investor2, ...addrs] = await ethers.getSigners();

    // Deploy DicoToken
    DicoToken = await ethers.getContractFactory("DicoToken");
    dicoToken = await DicoToken.deploy(owner.address);
    await dicoToken.waitForDeployment();

    // Deploy DicoFactory
    DicoFactory = await ethers.getContractFactory("DicoFactory");
    dicoFactory = await DicoFactory.deploy(
      await dicoToken.getAddress(),
      owner.address,
      owner.address
    );
    await dicoFactory.waitForDeployment();

    // Create a project
    const tx = await dicoFactory.connect(creator).createProject(
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

    const receipt = await tx.wait();
    const projectCreatedEvent = receipt.logs.find(log => {
      try {
        const parsed = dicoFactory.interface.parseLog(log);
        return parsed && parsed.name === 'ProjectCreated';
      } catch {
        return false;
      }
    });

    const parsedEvent = dicoFactory.interface.parseLog(projectCreatedEvent);
    const projectAddress = parsedEvent.args.projectContract;

    // Get project instance
    DicoProject = await ethers.getContractFactory("DicoProject");
    project = DicoProject.attach(projectAddress);
  });

  describe("Deployment", function () {
    it("Should set correct project parameters", async function () {
      expect(await project.name()).to.equal(projectParams.name);
      expect(await project.symbol()).to.equal(projectParams.symbol);
      expect(await project.totalSupply()).to.equal(projectParams.totalSupply);
      expect(await project.creator()).to.equal(creator.address);
      expect(await project.targetAmount()).to.equal(projectParams.targetAmount);
      expect(await project.tokenPrice()).to.equal(projectParams.tokenPrice);
      expect(await project.vestingDuration()).to.equal(projectParams.vestingDuration);
      expect(await project.vestingCliff()).to.equal(projectParams.vestingCliff);
      expect(await project.description()).to.equal(projectParams.description);
    });

    it("Should initialize with correct state", async function () {
      expect(await project.totalRaised()).to.equal(0);
      expect(await project.totalTokensSold()).to.equal(0);
      expect(await project.investorCount()).to.equal(0);
      expect(await project.status()).to.equal(0); // Active
      expect(await project.fundsWithdrawn()).to.be.false;
      expect(await project.vestingInitialized()).to.be.false;
    });

    it("Should mint total supply to contract", async function () {
      expect(await project.balanceOf(await project.getAddress())).to.equal(projectParams.totalSupply);
    });

    it("Should be active initially", async function () {
      expect(await project.isActive()).to.be.true;
    });
  });

  describe("Investment", function () {
    it("Should accept valid investments", async function () {
      const investmentAmount = ethers.parseEther("5");
      const expectedTokens = investmentAmount * ethers.parseEther("1") / projectParams.tokenPrice;

      await expect(project.connect(investor1).invest({ value: investmentAmount }))
        .to.emit(project, "InvestmentMade")
        .withArgs(investor1.address, investmentAmount, expectedTokens);

      expect(await project.investments(investor1.address)).to.equal(investmentAmount);
      expect(await project.tokensPurchased(investor1.address)).to.equal(expectedTokens);
      expect(await project.totalRaised()).to.equal(investmentAmount);
      expect(await project.totalTokensSold()).to.equal(expectedTokens);
      expect(await project.investorCount()).to.equal(1);
    });

    it("Should handle multiple investments from same investor", async function () {
      const investment1 = ethers.parseEther("3");
      const investment2 = ethers.parseEther("2");
      const totalInvestment = investment1 + investment2;

      await project.connect(investor1).invest({ value: investment1 });
      await project.connect(investor1).invest({ value: investment2 });

      expect(await project.investments(investor1.address)).to.equal(totalInvestment);
      expect(await project.investorCount()).to.equal(1); // Still one unique investor
    });

    it("Should track multiple investors", async function () {
      await project.connect(investor1).invest({ value: ethers.parseEther("5") });
      await project.connect(investor2).invest({ value: ethers.parseEther("3") });

      expect(await project.investorCount()).to.equal(2);
      const investors = await project.getInvestors();
      expect(investors).to.deep.equal([investor1.address, investor2.address]);
    });

    it("Should revert investments below minimum", async function () {
      const minInvestment = await project.MIN_INVESTMENT();
      const tooSmall = minInvestment - 1n;

      await expect(
        project.connect(investor1).invest({ value: tooSmall })
      ).to.be.revertedWith("DicoProject: investment too small");
    });

    it("Should revert investments above maximum", async function () {
      const maxInvestment = await project.MAX_INVESTMENT();
      const tooLarge = maxInvestment + 1n;

      await expect(
        project.connect(investor1).invest({ value: tooLarge })
      ).to.be.revertedWith("DicoProject: investment too large");
    });

    it("Should revert when target is exceeded", async function () {
      // Invest close to target
      await project.connect(investor1).invest({ value: ethers.parseEther("95") });

      // Try to invest more than remaining target
      await expect(
        project.connect(investor2).invest({ value: ethers.parseEther("10") })
      ).to.be.revertedWith("DicoProject: target exceeded");
    });

    it("Should revert when project is not active", async function () {
      await project.connect(creator).cancelProject();

      await expect(
        project.connect(investor1).invest({ value: ethers.parseEther("5") })
      ).to.be.revertedWith("DicoProject: project not active");
    });

    it("Should revert when project has ended", async function () {
      // Fast forward past end time
      await time.increase(PROJECT_DURATION + 1);

      await expect(
        project.connect(investor1).invest({ value: ethers.parseEther("5") })
      ).to.be.revertedWith("DicoProject: project ended");
    });

    it("Should finalize project when target is reached", async function () {
      await expect(project.connect(investor1).invest({ value: projectParams.targetAmount }))
        .to.emit(project, "ProjectFinalized")
        .withArgs(1, projectParams.targetAmount); // Status: Successful

      expect(await project.status()).to.equal(1); // Successful
      expect(await project.vestingInitialized()).to.be.true;
    });

    it("Should work with receive function", async function () {
      const investmentAmount = ethers.parseEther("5");
      
      await investor1.sendTransaction({
        to: await project.getAddress(),
        value: investmentAmount
      });

      expect(await project.investments(investor1.address)).to.equal(investmentAmount);
    });
  });

  describe("Project Finalization", function () {
    it("Should finalize as successful when target is reached", async function () {
      await project.connect(investor1).invest({ value: projectParams.targetAmount });

      expect(await project.status()).to.equal(1); // Successful
      expect(await project.vestingInitialized()).to.be.true;
    });

    it("Should finalize as successful after end time with minimum threshold", async function () {
      // Invest 30% of target (above minimum threshold)
      const minimumAmount = projectParams.targetAmount * 30n / 100n;
      await project.connect(investor1).invest({ value: minimumAmount });

      // Fast forward past end time
      await time.increase(PROJECT_DURATION + 1);

      await expect(project.finalizeProject())
        .to.emit(project, "ProjectFinalized")
        .withArgs(1, minimumAmount); // Status: Successful

      expect(await project.status()).to.equal(1); // Successful
    });

    it("Should finalize as failed when below minimum threshold", async function () {
      // Invest less than 30% of target
      const insufficientAmount = projectParams.targetAmount * 20n / 100n;
      await project.connect(investor1).invest({ value: insufficientAmount });

      // Fast forward past end time
      await time.increase(PROJECT_DURATION + 1);

      await expect(project.finalizeProject())
        .to.emit(project, "ProjectFinalized")
        .withArgs(2, insufficientAmount); // Status: Failed

      expect(await project.status()).to.equal(2); // Failed
    });

    it("Should not allow finalization before end time", async function () {
      await project.connect(investor1).invest({ value: ethers.parseEther("20") });

      await expect(project.finalizeProject())
        .to.be.revertedWith("DicoProject: project still active");
    });

    it("Should not allow double finalization", async function () {
      await project.connect(investor1).invest({ value: ethers.parseEther("20") });

      // Fast forward past end time
      await time.increase(PROJECT_DURATION + 1);

      await project.finalizeProject();

      await expect(project.finalizeProject())
        .to.be.revertedWith("DicoProject: already finalized");
    });
  });

  describe("Fund Withdrawal", function () {
    beforeEach(async function () {
      // Make project successful
      await project.connect(investor1).invest({ value: projectParams.targetAmount });
    });

    it("Should allow creator to withdraw funds after success", async function () {
      const balanceBefore = await ethers.provider.getBalance(creator.address);
      const platformFee = (projectParams.targetAmount * 250n) / 10000n; // 2.5%
      const expectedAmount = projectParams.targetAmount - platformFee;

      const tx = await project.connect(creator).withdrawFunds();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(creator.address);
      expect(balanceAfter).to.equal(balanceBefore + expectedAmount - gasUsed);
      expect(await project.fundsWithdrawn()).to.be.true;
    });

    it("Should not allow withdrawal before success", async function () {
      // Create new project and don't make it successful
      const tx = await dicoFactory.connect(creator).createProject(
        "Test Token",
        "TEST",
        ethers.parseEther("1000000"),
        ethers.parseEther("100"),
        PROJECT_DURATION,
        ethers.parseEther("0.0001"),
        VESTING_DURATION,
        VESTING_CLIFF,
        "Test description",
        { value: CREATION_FEE }
      );

      const receipt = await tx.wait();
      const projectCreatedEvent = receipt.logs.find(log => {
        try {
          const parsed = dicoFactory.interface.parseLog(log);
          return parsed && parsed.name === 'ProjectCreated';
        } catch {
          return false;
        }
      });

      const parsedEvent = dicoFactory.interface.parseLog(projectCreatedEvent);
      const newProjectAddress = parsedEvent.args.projectContract;
      const newProject = DicoProject.attach(newProjectAddress);

      await expect(
        newProject.connect(creator).withdrawFunds()
      ).to.be.revertedWith("DicoProject: project not successful");
    });

    it("Should not allow non-creator to withdraw", async function () {
      await expect(
        project.connect(investor1).withdrawFunds()
      ).to.be.revertedWith("DicoProject: caller is not the creator");
    });

    it("Should not allow double withdrawal", async function () {
      await project.connect(creator).withdrawFunds();

      await expect(
        project.connect(creator).withdrawFunds()
      ).to.be.revertedWith("DicoProject: funds already withdrawn");
    });
  });

  describe("Refunds", function () {
    beforeEach(async function () {
      // Make investments
      await project.connect(investor1).invest({ value: ethers.parseEther("10") });
      await project.connect(investor2).invest({ value: ethers.parseEther("5") });

      // Make project fail
      await time.increase(PROJECT_DURATION + 1);
      await project.finalizeProject(); // Will fail due to insufficient funding
    });

    it("Should allow refund claims for failed projects", async function () {
      const investmentAmount = ethers.parseEther("10");
      const balanceBefore = await ethers.provider.getBalance(investor1.address);

      const tx = await project.connect(investor1).claimRefund();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(investor1.address);
      expect(balanceAfter).to.equal(balanceBefore + investmentAmount - gasUsed);
      expect(await project.hasClaimed(investor1.address)).to.be.true;
    });

    it("Should not allow refund for non-investors", async function () {
      await expect(
        project.connect(addrs[0]).claimRefund()
      ).to.be.revertedWith("DicoProject: no investment found");
    });

    it("Should not allow double refund claims", async function () {
      await project.connect(investor1).claimRefund();

      await expect(
        project.connect(investor1).claimRefund()
      ).to.be.revertedWith("DicoProject: already claimed");
    });

    it("Should not allow refunds for successful projects", async function () {
      // Create successful project
      const tx = await dicoFactory.connect(creator).createProject(
        "Success Token",
        "SUCCESS",
        ethers.parseEther("1000000"),
        ethers.parseEther("50"),
        PROJECT_DURATION,
        ethers.parseEther("0.0001"),
        VESTING_DURATION,
        VESTING_CLIFF,
        "Success description",
        { value: CREATION_FEE }
      );

      const receipt = await tx.wait();
      const projectCreatedEvent = receipt.logs.find(log => {
        try {
          const parsed = dicoFactory.interface.parseLog(log);
          return parsed && parsed.name === 'ProjectCreated';
        } catch {
          return false;
        }
      });

      const parsedEvent = dicoFactory.interface.parseLog(projectCreatedEvent);
      const successProjectAddress = parsedEvent.args.projectContract;
      const successProject = DicoProject.attach(successProjectAddress);

      // Make it successful
      await successProject.connect(investor1).invest({ value: ethers.parseEther("50") });

      await expect(
        successProject.connect(investor1).claimRefund()
      ).to.be.revertedWith("DicoProject: project not failed");
    });
  });

  describe("Project Cancellation", function () {
    it("Should allow creator to cancel active project", async function () {
      await expect(project.connect(creator).cancelProject())
        .to.emit(project, "ProjectFinalized")
        .withArgs(3, 0); // Status: Cancelled

      expect(await project.status()).to.equal(3); // Cancelled
    });

    it("Should not allow non-creator to cancel", async function () {
      await expect(
        project.connect(investor1).cancelProject()
      ).to.be.revertedWith("DicoProject: caller is not the creator");
    });

    it("Should not allow cancellation after project ends", async function () {
      await time.increase(PROJECT_DURATION + 1);

      await expect(
        project.connect(creator).cancelProject()
      ).to.be.revertedWith("DicoProject: project ended");
    });

    it("Should not allow cancellation of non-active project", async function () {
      await project.connect(creator).cancelProject();

      await expect(
        project.connect(creator).cancelProject()
      ).to.be.revertedWith("DicoProject: project not active");
    });
  });

  describe("Information Functions", function () {
    beforeEach(async function () {
      await project.connect(investor1).invest({ value: ethers.parseEther("25") });
    });

    it("Should return correct project info", async function () {
      const info = await project.getProjectInfo();
      
      expect(info.projectCreator).to.equal(creator.address);
      expect(info.target).to.equal(projectParams.targetAmount);
      expect(info.raised).to.equal(ethers.parseEther("25"));
      expect(info.price).to.equal(projectParams.tokenPrice);
      expect(info.projectStatus).to.equal(0); // Active
      expect(info.investorCount_).to.equal(1);
      expect(info.isVestingInitialized).to.be.false;
    });

    it("Should return correct investment info", async function () {
      const info = await project.getInvestmentInfo(investor1.address);
      const expectedTokens = ethers.parseEther("25") * ethers.parseEther("1") / projectParams.tokenPrice;
      
      expect(info.investmentAmount).to.equal(ethers.parseEther("25"));
      expect(info.tokens).to.equal(expectedTokens);
      expect(info.claimed).to.be.false;
      expect(info.claimableTokens).to.equal(0); // No vesting yet
    });

    it("Should return correct progress", async function () {
      const progress = await project.getProgress();
      expect(progress).to.equal(25); // 25% of 100 ETH target
    });

    it("Should return correct time remaining", async function () {
      const timeRemaining = await project.getTimeRemaining();
      expect(timeRemaining).to.be.greaterThan(0);
      expect(timeRemaining).to.be.lessThanOrEqual(PROJECT_DURATION);

      // After project ends
      await time.increase(PROJECT_DURATION + 1);
      expect(await project.getTimeRemaining()).to.equal(0);
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow owner to pause/unpause", async function () {
      await project.pause();
      expect(await project.paused()).to.be.true;

      await expect(
        project.connect(investor1).invest({ value: ethers.parseEther("5") })
      ).to.be.revertedWith("Pausable: paused");

      await project.unpause();
      expect(await project.paused()).to.be.false;

      await expect(
        project.connect(investor1).invest({ value: ethers.parseEther("5") })
      ).to.not.be.reverted;
    });

    it("Should not allow non-owner to pause", async function () {
      await expect(
        project.connect(investor1).pause()
      ).to.be.revertedWithCustomError(project, "OwnableUnauthorizedAccount");
    });
  });

  describe("Emergency Token Recovery", function () {
    it("Should allow owner to recover other tokens", async function () {
      // Deploy another token
      const TestToken = await ethers.getContractFactory("DicoToken");
      const testToken = await TestToken.deploy(owner.address);
      await testToken.waitForDeployment();

      // Send some tokens to project
      const amount = ethers.parseEther("1000");
      await testToken.transfer(await project.getAddress(), amount);

      // Recover tokens
      await project.emergencyTokenRecovery(await testToken.getAddress(), amount);

      expect(await testToken.balanceOf(creator.address)).to.equal(amount);
    });

    it("Should not allow recovering project tokens", async function () {
      await expect(
        project.emergencyTokenRecovery(await project.getAddress(), ethers.parseEther("1000"))
      ).to.be.revertedWith("DicoProject: cannot recover project tokens");
    });

    it("Should not allow non-owner to recover tokens", async function () {
      await expect(
        project.connect(investor1).emergencyTokenRecovery(await dicoToken.getAddress(), ethers.parseEther("1000"))
      ).to.be.revertedWithCustomError(project, "OwnableUnauthorizedAccount");
    });
  });
});