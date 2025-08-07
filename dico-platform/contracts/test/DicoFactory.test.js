const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DicoFactory", function () {
  let DicoToken;
  let DicoFactory;
  let dicoToken;
  let dicoFactory;
  let owner;
  let feeRecipient;
  let creator;
  let addr1;
  let addrs;

  const CREATION_FEE = ethers.parseEther("1");
  const PLATFORM_FEE = 250; // 2.5%

  beforeEach(async function () {
    [owner, feeRecipient, creator, addr1, ...addrs] = await ethers.getSigners();

    // Deploy DicoToken
    DicoToken = await ethers.getContractFactory("DicoToken");
    dicoToken = await DicoToken.deploy(owner.address);
    await dicoToken.waitForDeployment();

    // Deploy DicoFactory
    DicoFactory = await ethers.getContractFactory("DicoFactory");
    dicoFactory = await DicoFactory.deploy(
      await dicoToken.getAddress(),
      feeRecipient.address,
      owner.address
    );
    await dicoFactory.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct parameters", async function () {
      expect(await dicoFactory.dicoToken()).to.equal(await dicoToken.getAddress());
      expect(await dicoFactory.feeRecipient()).to.equal(feeRecipient.address);
      expect(await dicoFactory.owner()).to.equal(owner.address);
      expect(await dicoFactory.platformFeePercentage()).to.equal(PLATFORM_FEE);
      expect(await dicoFactory.projectCreationFee()).to.equal(CREATION_FEE);
    });

    it("Should initialize with zero statistics", async function () {
      expect(await dicoFactory.totalProjectsCreated()).to.equal(0);
      expect(await dicoFactory.totalFundsRaised()).to.equal(0);
      expect(await dicoFactory.totalFeesCollected()).to.equal(0);
      expect(await dicoFactory.getProjectCount()).to.equal(0);
    });

    it("Should revert with invalid constructor parameters", async function () {
      await expect(
        DicoFactory.deploy(ethers.ZeroAddress, feeRecipient.address, owner.address)
      ).to.be.revertedWith("DicoFactory: invalid token address");

      await expect(
        DicoFactory.deploy(await dicoToken.getAddress(), ethers.ZeroAddress, owner.address)
      ).to.be.revertedWith("DicoFactory: invalid fee recipient");
    });
  });

  describe("Project Creation", function () {
    const projectParams = {
      name: "Test Token",
      symbol: "TEST",
      totalSupply: ethers.parseEther("1000000"),
      targetAmount: ethers.parseEther("100"),
      duration: 30 * 24 * 60 * 60, // 30 days
      tokenPrice: ethers.parseEther("0.0001"),
      vestingDuration: 365 * 24 * 60 * 60, // 1 year
      vestingCliff: 90 * 24 * 60 * 60, // 90 days
      description: "Test project description"
    };

    it("Should create a project successfully", async function () {
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
      
      // Find ProjectCreated event
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
      const projectAddress = parsedEvent.args.projectContract;

      // Verify project is tracked
      expect(await dicoFactory.isValidProject(projectAddress)).to.be.true;
      expect(await dicoFactory.getProjectCount()).to.equal(1);
      expect(await dicoFactory.totalProjectsCreated()).to.equal(1);

      // Verify project info
      const projectInfo = await dicoFactory.projectInfo(projectAddress);
      expect(projectInfo.creator).to.equal(creator.address);
      expect(projectInfo.name).to.equal(projectParams.name);
      expect(projectInfo.symbol).to.equal(projectParams.symbol);
      expect(projectInfo.targetAmount).to.equal(projectParams.targetAmount);
      expect(projectInfo.isVerified).to.be.false;
      expect(projectInfo.status).to.equal(0); // Active
    });

    it("Should revert with insufficient creation fee", async function () {
      await expect(
        dicoFactory.connect(creator).createProject(
          projectParams.name,
          projectParams.symbol,
          projectParams.totalSupply,
          projectParams.targetAmount,
          projectParams.duration,
          projectParams.tokenPrice,
          projectParams.vestingDuration,
          projectParams.vestingCliff,
          projectParams.description,
          { value: ethers.parseEther("0.5") } // Less than required
        )
      ).to.be.revertedWith("DicoFactory: insufficient creation fee");
    });

    it("Should return excess fee payment", async function () {
      const excessFee = ethers.parseEther("2"); // More than required
      const balanceBefore = await ethers.provider.getBalance(creator.address);

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
        { value: excessFee }
      );

      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(creator.address);

      // Should have spent exactly creation fee + gas
      const expectedBalance = balanceBefore - CREATION_FEE - gasUsed;
      expect(balanceAfter).to.equal(expectedBalance);
    });

    it("Should revert with invalid parameters", async function () {
      // Empty name
      await expect(
        dicoFactory.connect(creator).createProject(
          "",
          projectParams.symbol,
          projectParams.totalSupply,
          projectParams.targetAmount,
          projectParams.duration,
          projectParams.tokenPrice,
          projectParams.vestingDuration,
          projectParams.vestingCliff,
          projectParams.description,
          { value: CREATION_FEE }
        )
      ).to.be.revertedWith("DicoFactory: invalid name or symbol");

      // Zero total supply
      await expect(
        dicoFactory.connect(creator).createProject(
          projectParams.name,
          projectParams.symbol,
          0,
          projectParams.targetAmount,
          projectParams.duration,
          projectParams.tokenPrice,
          projectParams.vestingDuration,
          projectParams.vestingCliff,
          projectParams.description,
          { value: CREATION_FEE }
        )
      ).to.be.revertedWith("DicoFactory: invalid total supply");

      // Invalid duration (too short)
      const minimumDuration = await dicoFactory.minimumProjectDuration();
      await expect(
        dicoFactory.connect(creator).createProject(
          projectParams.name,
          projectParams.symbol,
          projectParams.totalSupply,
          projectParams.targetAmount,
          Number(minimumDuration) - 1,
          projectParams.tokenPrice,
          projectParams.vestingDuration,
          projectParams.vestingCliff,
          projectParams.description,
          { value: CREATION_FEE }
        )
      ).to.be.revertedWith("DicoFactory: invalid duration");
    });

    it("Should track creator projects", async function () {
      // Create first project
      await dicoFactory.connect(creator).createProject(
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

      // Create second project
      await dicoFactory.connect(creator).createProject(
        "Test Token 2",
        "TEST2",
        projectParams.totalSupply,
        projectParams.targetAmount,
        projectParams.duration,
        projectParams.tokenPrice,
        projectParams.vestingDuration,
        projectParams.vestingCliff,
        projectParams.description,
        { value: CREATION_FEE }
      );

      const creatorProjects = await dicoFactory.getProjectsByCreator(creator.address);
      expect(creatorProjects.length).to.equal(2);
    });

    it("Should not allow creation when paused", async function () {
      await dicoFactory.pause();

      await expect(
        dicoFactory.connect(creator).createProject(
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
        )
      ).to.be.revertedWith("Pausable: paused");
    });
  });

  describe("Project Management", function () {
    let projectAddress;

    beforeEach(async function () {
      const tx = await dicoFactory.connect(creator).createProject(
        "Test Token",
        "TEST",
        ethers.parseEther("1000000"),
        ethers.parseEther("100"),
        30 * 24 * 60 * 60,
        ethers.parseEther("0.0001"),
        365 * 24 * 60 * 60,
        90 * 24 * 60 * 60,
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
      projectAddress = parsedEvent.args.projectContract;
    });

    it("Should verify a project", async function () {
      await expect(dicoFactory.verifyProject(projectAddress))
        .to.emit(dicoFactory, "ProjectVerified")
        .withArgs(projectAddress);

      const projectInfo = await dicoFactory.projectInfo(projectAddress);
      expect(projectInfo.isVerified).to.be.true;
    });

    it("Should not allow non-owner to verify project", async function () {
      await expect(
        dicoFactory.connect(creator).verifyProject(projectAddress)
      ).to.be.revertedWithCustomError(dicoFactory, "OwnableUnauthorizedAccount");
    });

    it("Should not verify invalid project", async function () {
      await expect(
        dicoFactory.verifyProject(addr1.address)
      ).to.be.revertedWith("DicoFactory: invalid project");
    });

    it("Should not verify already verified project", async function () {
      await dicoFactory.verifyProject(projectAddress);

      await expect(
        dicoFactory.verifyProject(projectAddress)
      ).to.be.revertedWith("DicoFactory: already verified");
    });
  });

  describe("Configuration", function () {
    it("Should allow owner to update platform fee", async function () {
      const newFee = 300; // 3%

      await expect(dicoFactory.setPlatformFeePercentage(newFee))
        .to.emit(dicoFactory, "PlatformFeeUpdated")
        .withArgs(PLATFORM_FEE, newFee);

      expect(await dicoFactory.platformFeePercentage()).to.equal(newFee);
    });

    it("Should not allow platform fee above 10%", async function () {
      await expect(
        dicoFactory.setPlatformFeePercentage(1001) // 10.01%
      ).to.be.revertedWith("DicoFactory: fee too high");
    });

    it("Should allow owner to update creation fee", async function () {
      const newFee = ethers.parseEther("2");

      await expect(dicoFactory.setProjectCreationFee(newFee))
        .to.emit(dicoFactory, "ProjectCreationFeeUpdated")
        .withArgs(CREATION_FEE, newFee);

      expect(await dicoFactory.projectCreationFee()).to.equal(newFee);
    });

    it("Should allow owner to update fee recipient", async function () {
      await expect(dicoFactory.setFeeRecipient(addr1.address))
        .to.emit(dicoFactory, "FeeRecipientUpdated")
        .withArgs(feeRecipient.address, addr1.address);

      expect(await dicoFactory.feeRecipient()).to.equal(addr1.address);
    });

    it("Should not allow setting zero address as fee recipient", async function () {
      await expect(
        dicoFactory.setFeeRecipient(ethers.ZeroAddress)
      ).to.be.revertedWith("DicoFactory: invalid address");
    });

    it("Should not allow non-owner to update configuration", async function () {
      await expect(
        dicoFactory.connect(creator).setPlatformFeePercentage(300)
      ).to.be.revertedWithCustomError(dicoFactory, "OwnableUnauthorizedAccount");

      await expect(
        dicoFactory.connect(creator).setProjectCreationFee(ethers.parseEther("2"))
      ).to.be.revertedWithCustomError(dicoFactory, "OwnableUnauthorizedAccount");

      await expect(
        dicoFactory.connect(creator).setFeeRecipient(addr1.address)
      ).to.be.revertedWithCustomError(dicoFactory, "OwnableUnauthorizedAccount");
    });
  });

  describe("Fee Management", function () {
    beforeEach(async function () {
      // Create a project to generate some fees
      await dicoFactory.connect(creator).createProject(
        "Test Token",
        "TEST",
        ethers.parseEther("1000000"),
        ethers.parseEther("100"),
        30 * 24 * 60 * 60,
        ethers.parseEther("0.0001"),
        365 * 24 * 60 * 60,
        90 * 24 * 60 * 60,
        "Test description",
        { value: CREATION_FEE }
      );
    });

    it("Should allow owner to withdraw fees", async function () {
      const balanceBefore = await ethers.provider.getBalance(feeRecipient.address);
      const contractBalance = await ethers.provider.getBalance(await dicoFactory.getAddress());

      await expect(dicoFactory.withdrawFees())
        .to.emit(dicoFactory, "FeesWithdrawn")
        .withArgs(feeRecipient.address, contractBalance);

      const balanceAfter = await ethers.provider.getBalance(feeRecipient.address);
      expect(balanceAfter).to.equal(balanceBefore + contractBalance);
    });

    it("Should revert when no fees to withdraw", async function () {
      await dicoFactory.withdrawFees(); // Withdraw all fees first

      await expect(dicoFactory.withdrawFees())
        .to.be.revertedWith("DicoFactory: no fees to withdraw");
    });

    it("Should not allow non-owner to withdraw fees", async function () {
      await expect(
        dicoFactory.connect(creator).withdrawFees()
      ).to.be.revertedWithCustomError(dicoFactory, "OwnableUnauthorizedAccount");
    });
  });

  describe("Statistics and Queries", function () {
    beforeEach(async function () {
      // Create multiple projects
      for (let i = 0; i < 3; i++) {
        await dicoFactory.connect(creator).createProject(
          `Test Token ${i}`,
          `TEST${i}`,
          ethers.parseEther("1000000"),
          ethers.parseEther("100"),
          30 * 24 * 60 * 60,
          ethers.parseEther("0.0001"),
          365 * 24 * 60 * 60,
          90 * 24 * 60 * 60,
          `Test description ${i}`,
          { value: CREATION_FEE }
        );
      }
    });

    it("Should return correct platform statistics", async function () {
      const stats = await dicoFactory.getPlatformStats();
      
      expect(stats.projectsCreated).to.equal(3);
      expect(stats.fundsRaised).to.equal(0); // No investments yet
      expect(stats.feesCollected).to.equal(0); // No platform fees yet
      expect(stats.currentFeePercentage).to.equal(PLATFORM_FEE);
    });

    it("Should return projects paginated", async function () {
      const page1 = await dicoFactory.getProjectsPaginated(0, 2);
      expect(page1.length).to.equal(2);

      const page2 = await dicoFactory.getProjectsPaginated(2, 2);
      expect(page2.length).to.equal(1);

      const all = await dicoFactory.getProjectsPaginated(0, 10);
      expect(all.length).to.equal(3);
    });

    it("Should revert with invalid pagination parameters", async function () {
      await expect(
        dicoFactory.getProjectsPaginated(10, 5) // Offset beyond array
      ).to.be.revertedWith("DicoFactory: offset out of bounds");
    });

    it("Should return correct project by index", async function () {
      const project0 = await dicoFactory.getProjectByIndex(0);
      expect(await dicoFactory.isValidProject(project0)).to.be.true;

      await expect(
        dicoFactory.getProjectByIndex(10)
      ).to.be.revertedWith("DicoFactory: index out of bounds");
    });

    it("Should track creator projects correctly", async function () {
      const creatorProjects = await dicoFactory.getProjectsByCreator(creator.address);
      expect(creatorProjects.length).to.equal(3);

      const nonCreatorProjects = await dicoFactory.getProjectsByCreator(addr1.address);
      expect(nonCreatorProjects.length).to.equal(0);
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow owner to pause and unpause", async function () {
      await dicoFactory.pause();
      expect(await dicoFactory.paused()).to.be.true;

      await dicoFactory.unpause();
      expect(await dicoFactory.paused()).to.be.false;
    });

    it("Should not allow non-owner to pause", async function () {
      await expect(
        dicoFactory.connect(creator).pause()
      ).to.be.revertedWithCustomError(dicoFactory, "OwnableUnauthorizedAccount");
    });
  });

  describe("Receive Function", function () {
    it("Should accept ETH transfers", async function () {
      const amount = ethers.parseEther("1");
      
      await expect(
        creator.sendTransaction({
          to: await dicoFactory.getAddress(),
          value: amount
        })
      ).to.not.be.reverted;

      const balance = await ethers.provider.getBalance(await dicoFactory.getAddress());
      expect(balance).to.equal(amount);
    });
  });
});