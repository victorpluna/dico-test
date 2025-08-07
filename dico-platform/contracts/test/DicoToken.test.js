const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DicoToken", function () {
  let DicoToken;
  let dicoToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  const INITIAL_SUPPLY = ethers.parseEther("100000000"); // 100M tokens
  const MAX_SUPPLY = ethers.parseEther("1000000000"); // 1B tokens

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    
    DicoToken = await ethers.getContractFactory("DicoToken");
    dicoToken = await DicoToken.deploy(owner.address);
    await dicoToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await dicoToken.owner()).to.equal(owner.address);
    });

    it("Should assign the initial supply to the owner", async function () {
      expect(await dicoToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });

    it("Should set correct token details", async function () {
      expect(await dicoToken.name()).to.equal("Dico Token");
      expect(await dicoToken.symbol()).to.equal("DICO");
      expect(await dicoToken.totalSupply()).to.equal(INITIAL_SUPPLY);
      expect(await dicoToken.totalMinted()).to.equal(INITIAL_SUPPLY);
    });

    it("Should have correct max supply", async function () {
      expect(await dicoToken.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
    });

    it("Should not be paused initially", async function () {
      expect(await dicoToken.paused()).to.be.false;
    });

    it("Should not have finished minting initially", async function () {
      expect(await dicoToken.mintingFinished()).to.be.false;
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      await dicoToken.mint(addr1.address, mintAmount);
      
      expect(await dicoToken.balanceOf(addr1.address)).to.equal(mintAmount);
      expect(await dicoToken.totalMinted()).to.equal(INITIAL_SUPPLY + mintAmount);
    });

    it("Should not allow minting beyond max supply", async function () {
      const excessAmount = MAX_SUPPLY - INITIAL_SUPPLY + ethers.parseEther("1");
      
      await expect(
        dicoToken.mint(addr1.address, excessAmount)
      ).to.be.revertedWith("DicoToken: exceeds max supply");
    });

    it("Should not allow non-owner to mint", async function () {
      const mintAmount = ethers.parseEther("1000");
      
      await expect(
        dicoToken.connect(addr1).mint(addr2.address, mintAmount)
      ).to.be.revertedWithCustomError(dicoToken, "OwnableUnauthorizedAccount");
    });

    it("Should not allow minting to zero address", async function () {
      const mintAmount = ethers.parseEther("1000");
      
      await expect(
        dicoToken.mint(ethers.ZeroAddress, mintAmount)
      ).to.be.revertedWith("DicoToken: mint to zero address");
    });

    it("Should not allow minting after minting is finished", async function () {
      await dicoToken.finishMinting();
      
      const mintAmount = ethers.parseEther("1000");
      await expect(
        dicoToken.mint(addr1.address, mintAmount)
      ).to.be.revertedWith("DicoToken: minting is finished");
    });

    it("Should emit MintingFinished event", async function () {
      await expect(dicoToken.finishMinting())
        .to.emit(dicoToken, "MintingFinished");
    });

    it("Should return correct remaining mintable amount", async function () {
      expect(await dicoToken.remainingMintable()).to.equal(MAX_SUPPLY - INITIAL_SUPPLY);
      
      const mintAmount = ethers.parseEther("1000");
      await dicoToken.mint(addr1.address, mintAmount);
      
      expect(await dicoToken.remainingMintable()).to.equal(MAX_SUPPLY - INITIAL_SUPPLY - mintAmount);
    });

    it("Should return zero remaining mintable after finishing minting", async function () {
      await dicoToken.finishMinting();
      expect(await dicoToken.remainingMintable()).to.equal(0);
    });
  });

  describe("Vesting Contracts", function () {
    it("Should allow owner to add vesting contract", async function () {
      await expect(dicoToken.addVestingContract(addr1.address))
        .to.emit(dicoToken, "VestingContractAdded")
        .withArgs(addr1.address);
      
      expect(await dicoToken.isVestingContract(addr1.address)).to.be.true;
    });

    it("Should not allow adding zero address as vesting contract", async function () {
      await expect(
        dicoToken.addVestingContract(ethers.ZeroAddress)
      ).to.be.revertedWith("DicoToken: zero address");
    });

    it("Should not allow adding same vesting contract twice", async function () {
      await dicoToken.addVestingContract(addr1.address);
      
      await expect(
        dicoToken.addVestingContract(addr1.address)
      ).to.be.revertedWith("DicoToken: already added");
    });

    it("Should allow owner to remove vesting contract", async function () {
      await dicoToken.addVestingContract(addr1.address);
      
      await expect(dicoToken.removeVestingContract(addr1.address))
        .to.emit(dicoToken, "VestingContractRemoved")
        .withArgs(addr1.address);
      
      expect(await dicoToken.isVestingContract(addr1.address)).to.be.false;
    });

    it("Should not allow removing non-vesting contract", async function () {
      await expect(
        dicoToken.removeVestingContract(addr1.address)
      ).to.be.revertedWith("DicoToken: not a vesting contract");
    });

    it("Should not allow non-owner to manage vesting contracts", async function () {
      await expect(
        dicoToken.connect(addr1).addVestingContract(addr2.address)
      ).to.be.revertedWithCustomError(dicoToken, "OwnableUnauthorizedAccount");
      
      await dicoToken.addVestingContract(addr2.address);
      
      await expect(
        dicoToken.connect(addr1).removeVestingContract(addr2.address)
      ).to.be.revertedWithCustomError(dicoToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow owner to pause and unpause", async function () {
      await dicoToken.pause();
      expect(await dicoToken.paused()).to.be.true;
      
      await dicoToken.unpause();
      expect(await dicoToken.paused()).to.be.false;
    });

    it("Should not allow transfers when paused", async function () {
      await dicoToken.transfer(addr1.address, ethers.parseEther("1000"));
      
      await dicoToken.pause();
      
      await expect(
        dicoToken.connect(addr1).transfer(addr2.address, ethers.parseEther("500"))
      ).to.be.revertedWith("DicoToken: token transfer while paused");
    });

    it("Should not allow non-owner to pause", async function () {
      await expect(
        dicoToken.connect(addr1).pause()
      ).to.be.revertedWithCustomError(dicoToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Batch Transfer", function () {
    beforeEach(async function () {
      // Give owner some tokens to transfer
      await dicoToken.mint(owner.address, ethers.parseEther("10000"));
    });

    it("Should allow batch transfers", async function () {
      const recipients = [addr1.address, addr2.address];
      const amounts = [ethers.parseEther("100"), ethers.parseEther("200")];
      
      await dicoToken.batchTransfer(recipients, amounts);
      
      expect(await dicoToken.balanceOf(addr1.address)).to.equal(amounts[0]);
      expect(await dicoToken.balanceOf(addr2.address)).to.equal(amounts[1]);
    });

    it("Should revert if arrays have different lengths", async function () {
      const recipients = [addr1.address];
      const amounts = [ethers.parseEther("100"), ethers.parseEther("200")];
      
      await expect(
        dicoToken.batchTransfer(recipients, amounts)
      ).to.be.revertedWith("DicoToken: arrays length mismatch");
    });

    it("Should revert if arrays are empty", async function () {
      await expect(
        dicoToken.batchTransfer([], [])
      ).to.be.revertedWith("DicoToken: empty arrays");
    });

    it("Should revert if too many recipients", async function () {
      const recipients = new Array(201).fill(addr1.address);
      const amounts = new Array(201).fill(ethers.parseEther("1"));
      
      await expect(
        dicoToken.batchTransfer(recipients, amounts)
      ).to.be.revertedWith("DicoToken: too many recipients");
    });

    it("Should revert if zero address in recipients", async function () {
      const recipients = [ethers.ZeroAddress];
      const amounts = [ethers.parseEther("100")];
      
      await expect(
        dicoToken.batchTransfer(recipients, amounts)
      ).to.be.revertedWith("DicoToken: transfer to zero address");
    });

    it("Should revert if zero amount", async function () {
      const recipients = [addr1.address];
      const amounts = [0];
      
      await expect(
        dicoToken.batchTransfer(recipients, amounts)
      ).to.be.revertedWith("DicoToken: transfer amount must be greater than zero");
    });

    it("Should not work when paused", async function () {
      await dicoToken.pause();
      
      const recipients = [addr1.address];
      const amounts = [ethers.parseEther("100")];
      
      await expect(
        dicoToken.batchTransfer(recipients, amounts)
      ).to.be.revertedWith("DicoToken: token transfer while paused");
    });
  });

  describe("Token Recovery", function () {
    it("Should allow owner to recover other tokens", async function () {
      // Deploy another token for testing
      const TestToken = await ethers.getContractFactory("DicoToken");
      const testToken = await TestToken.deploy(owner.address);
      await testToken.waitForDeployment();
      
      // Send some test tokens to the DicoToken contract
      const amount = ethers.parseEther("1000");
      await testToken.transfer(await dicoToken.getAddress(), amount);
      
      // Recover the tokens
      await expect(dicoToken.recoverTokens(await testToken.getAddress(), amount))
        .to.emit(dicoToken, "TokensRecovered")
        .withArgs(await testToken.getAddress(), amount);
      
      expect(await testToken.balanceOf(owner.address)).to.equal(
        INITIAL_SUPPLY // Initial supply of test token
      );
    });

    it("Should not allow recovering DICO tokens", async function () {
      await expect(
        dicoToken.recoverTokens(await dicoToken.getAddress(), ethers.parseEther("100"))
      ).to.be.revertedWith("DicoToken: cannot recover DICO tokens");
    });

    it("Should not allow non-owner to recover tokens", async function () {
      await expect(
        dicoToken.connect(addr1).recoverTokens(addr2.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(dicoToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("ERC20 Permit", function () {
    it("Should have correct domain separator", async function () {
      const domain = await dicoToken.DOMAIN_SEPARATOR();
      expect(domain).to.not.equal(ethers.ZeroHash);
    });

    it("Should handle nonces correctly", async function () {
      expect(await dicoToken.nonces(owner.address)).to.equal(0);
      expect(await dicoToken.nonces(addr1.address)).to.equal(0);
    });
  });
});