const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("DicoVesting", function () {
  let DicoToken;
  let DicoVesting;
  let token;
  let vesting;
  let owner;
  let beneficiary1;
  let beneficiary2;
  let beneficiary3;
  let addrs;

  const VESTING_DURATION = 365 * 24 * 60 * 60; // 1 year
  const CLIFF_DURATION = 90 * 24 * 60 * 60; // 90 days
  let cliffTime;
  let vestingAmount;

  beforeEach(async function () {
    [owner, beneficiary1, beneficiary2, beneficiary3, ...addrs] = await ethers.getSigners();

    // Deploy test token
    DicoToken = await ethers.getContractFactory("DicoToken");
    token = await DicoToken.deploy(owner.address);
    await token.waitForDeployment();

    // Calculate cliff time
    const currentTime = await time.latest();
    cliffTime = currentTime + CLIFF_DURATION;

    // Deploy vesting contract
    DicoVesting = await ethers.getContractFactory("DicoVesting");
    vesting = await DicoVesting.deploy(
      await token.getAddress(),
      cliffTime,
      VESTING_DURATION
    );
    await vesting.waitForDeployment();

    vestingAmount = ethers.parseEther("1000");
  });

  describe("Deployment", function () {
    it("Should set correct parameters", async function () {
      expect(await vesting.token()).to.equal(await token.getAddress());
      expect(await vesting.cliffTime()).to.equal(cliffTime);
      expect(await vesting.vestingDuration()).to.equal(VESTING_DURATION);
      expect(await vesting.vestingStart()).to.equal(cliffTime);
      expect(await vesting.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero statistics", async function () {
      expect(await vesting.totalTokensVested()).to.equal(0);
      expect(await vesting.totalTokensClaimed()).to.equal(0);
      expect(await vesting.getBeneficiaryCount()).to.equal(0);
    });

    it("Should revert with invalid constructor parameters", async function () {
      const currentTime = await time.latest();

      // Invalid token address
      await expect(
        DicoVesting.deploy(ethers.ZeroAddress, cliffTime, VESTING_DURATION)
      ).to.be.revertedWith("DicoVesting: invalid token address");

      // Cliff time in the past
      await expect(
        DicoVesting.deploy(await token.getAddress(), currentTime - 1, VESTING_DURATION)
      ).to.be.revertedWith("DicoVesting: cliff time must be in the future");

      // Zero vesting duration
      await expect(
        DicoVesting.deploy(await token.getAddress(), cliffTime, 0)
      ).to.be.revertedWith("DicoVesting: vesting duration must be greater than 0");
    });
  });

  describe("Creating Vesting Schedules", function () {
    beforeEach(async function () {
      // Transfer tokens to vesting contract
      await token.transfer(await vesting.getAddress(), ethers.parseEther("10000"));
    });

    it("Should create a vesting schedule", async function () {
      await expect(vesting.createVestingSchedule(beneficiary1.address, vestingAmount))
        .to.emit(vesting, "VestingScheduleCreated")
        .withArgs(beneficiary1.address, vestingAmount);

      const schedule = await vesting.getVestingSchedule(beneficiary1.address);
      expect(schedule.totalAmount).to.equal(vestingAmount);
      expect(schedule.claimedAmount).to.equal(0);
      expect(schedule.isActive).to.be.true;

      expect(await vesting.totalTokensVested()).to.equal(vestingAmount);
      expect(await vesting.getBeneficiaryCount()).to.equal(1);
    });

    it("Should create multiple vesting schedules", async function () {
      const beneficiaries = [beneficiary1.address, beneficiary2.address, beneficiary3.address];
      const amounts = [ethers.parseEther("1000"), ethers.parseEther("2000"), ethers.parseEther("1500")];

      await vesting.createVestingSchedules(beneficiaries, amounts);

      expect(await vesting.getBeneficiaryCount()).to.equal(3);
      expect(await vesting.totalTokensVested()).to.equal(ethers.parseEther("4500"));

      const retrievedBeneficiaries = await vesting.getBeneficiaries();
      expect(retrievedBeneficiaries).to.deep.equal(beneficiaries);
    });

    it("Should revert with invalid parameters", async function () {
      // Zero address
      await expect(
        vesting.createVestingSchedule(ethers.ZeroAddress, vestingAmount)
      ).to.be.revertedWith("DicoVesting: invalid beneficiary address");

      // Zero amount
      await expect(
        vesting.createVestingSchedule(beneficiary1.address, 0)
      ).to.be.revertedWith("DicoVesting: amount must be greater than 0");

      // Duplicate schedule
      await vesting.createVestingSchedule(beneficiary1.address, vestingAmount);
      await expect(
        vesting.createVestingSchedule(beneficiary1.address, vestingAmount)
      ).to.be.revertedWith("DicoVesting: vesting schedule already exists");
    });

    it("Should revert batch creation with mismatched arrays", async function () {
      const beneficiaries = [beneficiary1.address, beneficiary2.address];
      const amounts = [ethers.parseEther("1000")]; // Different length

      await expect(
        vesting.createVestingSchedules(beneficiaries, amounts)
      ).to.be.revertedWith("DicoVesting: arrays length mismatch");

      // Empty arrays
      await expect(
        vesting.createVestingSchedules([], [])
      ).to.be.revertedWith("DicoVesting: empty arrays");
    });

    it("Should not allow non-owner to create schedules", async function () {
      await expect(
        vesting.connect(beneficiary1).createVestingSchedule(beneficiary2.address, vestingAmount)
      ).to.be.revertedWithCustomError(vesting, "OwnableUnauthorizedAccount");
    });
  });

  describe("Token Claiming", function () {
    beforeEach(async function () {
      // Transfer tokens and create vesting schedule
      await token.transfer(await vesting.getAddress(), ethers.parseEther("10000"));
      await vesting.createVestingSchedule(beneficiary1.address, vestingAmount);
    });

    it("Should not allow claiming before cliff", async function () {
      expect(await vesting.getClaimableAmount(beneficiary1.address)).to.equal(0);
      expect(await vesting.getVestedAmount(beneficiary1.address)).to.equal(0);

      await expect(
        vesting.connect(beneficiary1).claimTokens()
      ).to.be.revertedWith("DicoVesting: no tokens available to claim");
    });

    it("Should allow claiming after cliff", async function () {
      // Fast forward to after cliff
      await time.increaseTo(cliffTime + 1);

      const claimableAmount = await vesting.getClaimableAmount(beneficiary1.address);
      expect(claimableAmount).to.be.greaterThan(0);

      const balanceBefore = await token.balanceOf(beneficiary1.address);

      await expect(vesting.connect(beneficiary1).claimTokens())
        .to.emit(vesting, "TokensClaimed")
        .withArgs(beneficiary1.address, claimableAmount);

      const balanceAfter = await token.balanceOf(beneficiary1.address);
      expect(balanceAfter).to.equal(balanceBefore + claimableAmount);

      // Update statistics
      expect(await vesting.totalTokensClaimed()).to.equal(claimableAmount);

      // Update schedule
      const schedule = await vesting.getVestingSchedule(beneficiary1.address);
      expect(schedule.claimedAmount).to.equal(claimableAmount);
    });

    it("Should handle linear vesting correctly", async function () {
      // Fast forward to middle of vesting period
      const halfVestingTime = cliffTime + (VESTING_DURATION / 2);
      await time.increaseTo(halfVestingTime);

      const vestedAmount = await vesting.getVestedAmount(beneficiary1.address);
      const expectedVested = vestingAmount / 2n; // Should be approximately half

      // Allow for small rounding differences
      const tolerance = ethers.parseEther("10"); // 10 token tolerance
      expect(vestedAmount).to.be.closeTo(expectedVested, tolerance);
    });

    it("Should allow claiming full amount after vesting ends", async function () {
      // Fast forward to after vesting period ends
      await time.increaseTo(cliffTime + VESTING_DURATION + 1);

      const claimableAmount = await vesting.getClaimableAmount(beneficiary1.address);
      expect(claimableAmount).to.equal(vestingAmount);

      await vesting.connect(beneficiary1).claimTokens();

      const schedule = await vesting.getVestingSchedule(beneficiary1.address);
      expect(schedule.claimedAmount).to.equal(vestingAmount);

      // No more tokens to claim
      expect(await vesting.getClaimableAmount(beneficiary1.address)).to.equal(0);
    });

    it("Should handle multiple partial claims", async function () {
      // First claim after cliff
      await time.increaseTo(cliffTime + (VESTING_DURATION / 4));
      const firstClaimable = await vesting.getClaimableAmount(beneficiary1.address);
      await vesting.connect(beneficiary1).claimTokens();

      // Second claim later
      await time.increaseTo(cliffTime + (VESTING_DURATION / 2));
      const secondClaimable = await vesting.getClaimableAmount(beneficiary1.address);
      expect(secondClaimable).to.be.greaterThan(0);
      await vesting.connect(beneficiary1).claimTokens();

      const schedule = await vesting.getVestingSchedule(beneficiary1.address);
      expect(schedule.claimedAmount).to.equal(firstClaimable + secondClaimable);
    });

    it("Should allow anyone to claim for a beneficiary", async function () {
      await time.increaseTo(cliffTime + 1);

      const claimableAmount = await vesting.getClaimableAmount(beneficiary1.address);
      
      // Different account claims for beneficiary
      await expect(vesting.connect(beneficiary2).claimTokens(beneficiary1.address))
        .to.emit(vesting, "TokensClaimed")
        .withArgs(beneficiary1.address, claimableAmount);

      // Tokens go to the beneficiary, not the caller
      expect(await token.balanceOf(beneficiary1.address)).to.equal(claimableAmount);
      expect(await token.balanceOf(beneficiary2.address)).to.equal(0);
    });

    it("Should revert claiming for non-existent schedule", async function () {
      await expect(
        vesting.connect(beneficiary2).claimTokens()
      ).to.be.revertedWith("DicoVesting: no active vesting schedule");
    });
  });

  describe("Vesting Schedule Management", function () {
    beforeEach(async function () {
      await token.transfer(await vesting.getAddress(), ethers.parseEther("10000"));
      await vesting.createVestingSchedule(beneficiary1.address, vestingAmount);
    });

    it("Should allow owner to revoke vesting", async function () {
      const unclaimedAmount = vestingAmount; // No claims yet

      await expect(vesting.revokeVesting(beneficiary1.address))
        .to.emit(vesting, "VestingRevoked")
        .withArgs(beneficiary1.address, unclaimedAmount);

      const schedule = await vesting.getVestingSchedule(beneficiary1.address);
      expect(schedule.isActive).to.be.false;

      expect(await vesting.totalTokensVested()).to.equal(0);

      // Should not be able to claim after revocation
      await time.increaseTo(cliffTime + 1);
      await expect(
        vesting.connect(beneficiary1).claimTokens()
      ).to.be.revertedWith("DicoVesting: no active vesting schedule");
    });

    it("Should handle revocation after partial claims", async function () {
      // Make a partial claim first
      await time.increaseTo(cliffTime + (VESTING_DURATION / 4));
      const claimedAmount = await vesting.getClaimableAmount(beneficiary1.address);
      await vesting.connect(beneficiary1).claimTokens();

      // Revoke
      const unclaimedAmount = vestingAmount - claimedAmount;
      await expect(vesting.revokeVesting(beneficiary1.address))
        .to.emit(vesting, "VestingRevoked")
        .withArgs(beneficiary1.address, unclaimedAmount);

      expect(await vesting.totalTokensVested()).to.equal(0);
    });

    it("Should not allow revoking non-active schedule", async function () {
      await vesting.revokeVesting(beneficiary1.address);

      await expect(
        vesting.revokeVesting(beneficiary1.address)
      ).to.be.revertedWith("DicoVesting: vesting schedule not active");
    });

    it("Should not allow non-owner to revoke", async function () {
      await expect(
        vesting.connect(beneficiary1).revokeVesting(beneficiary2.address)
      ).to.be.revertedWithCustomError(vesting, "OwnableUnauthorizedAccount");
    });
  });

  describe("Information Functions", function () {
    beforeEach(async function () {
      await token.transfer(await vesting.getAddress(), ethers.parseEther("10000"));
      await vesting.createVestingSchedule(beneficiary1.address, vestingAmount);
    });

    it("Should return correct vesting information", async function () {
      // Before cliff
      let info = await vesting.getVestingInfo(beneficiary1.address);
      expect(info.totalTokens).to.equal(vestingAmount);
      expect(info.claimedTokens).to.equal(0);
      expect(info.claimableTokens).to.equal(0);
      expect(info.nextUnlockTime).to.equal(cliffTime);

      // After cliff, during vesting
      await time.increaseTo(cliffTime + (VESTING_DURATION / 2));
      info = await vesting.getVestingInfo(beneficiary1.address);
      expect(info.claimableTokens).to.be.greaterThan(0);
      expect(info.nextUnlockTime).to.be.greaterThan(0);

      // After vesting ends
      await time.increaseTo(cliffTime + VESTING_DURATION + 1);
      info = await vesting.getVestingInfo(beneficiary1.address);
      expect(info.claimableTokens).to.equal(vestingAmount);
      expect(info.nextUnlockTime).to.equal(0); // Fully vested
    });

    it("Should return correct vesting statistics", async function () {
      // Add more beneficiaries
      await vesting.createVestingSchedule(beneficiary2.address, ethers.parseEther("2000"));

      const totalVested = vestingAmount + ethers.parseEther("2000");
      expect(await vesting.totalTokensVested()).to.equal(totalVested);

      // After some claims
      await time.increaseTo(cliffTime + 1);
      const claimable1 = await vesting.getClaimableAmount(beneficiary1.address);
      await vesting.connect(beneficiary1).claimTokens();

      const stats = await vesting.getVestingStats();
      expect(stats.totalVested).to.equal(totalVested);
      expect(stats.totalClaimed).to.equal(claimable1);
      expect(stats.totalClaimable).to.be.greaterThan(0);
    });

    it("Should return correct status indicators", async function () {
      // Before cliff
      expect(await vesting.isCliffPassed()).to.be.false;
      expect(await vesting.isVestingEnded()).to.be.false;
      expect(await vesting.getVestingProgress()).to.equal(0);

      // After cliff
      await time.increaseTo(cliffTime + 1);
      expect(await vesting.isCliffPassed()).to.be.true;
      expect(await vesting.isVestingEnded()).to.be.false;
      expect(await vesting.getVestingProgress()).to.be.greaterThan(0);

      // After vesting ends
      await time.increaseTo(cliffTime + VESTING_DURATION + 1);
      expect(await vesting.isVestingEnded()).to.be.true;
      expect(await vesting.getVestingProgress()).to.equal(100);
    });
  });

  describe("Emergency Functions", function () {
    beforeEach(async function () {
      await token.transfer(await vesting.getAddress(), ethers.parseEther("10000"));
      await vesting.createVestingSchedule(beneficiary1.address, vestingAmount);
    });

    it("Should allow emergency withdrawal after vesting + 1 year", async function () {
      // Fast forward to way past vesting completion
      await time.increaseTo(cliffTime + VESTING_DURATION + 365 * 24 * 60 * 60 + 1);

      const contractBalance = await token.balanceOf(await vesting.getAddress());
      const ownerBalanceBefore = await token.balanceOf(owner.address);

      await vesting.emergencyWithdraw(owner.address);

      const ownerBalanceAfter = await token.balanceOf(owner.address);
      expect(ownerBalanceAfter).to.equal(ownerBalanceBefore + contractBalance);
    });

    it("Should not allow emergency withdrawal too early", async function () {
      await expect(
        vesting.emergencyWithdraw(owner.address)
      ).to.be.revertedWith("DicoVesting: vesting not complete");
    });

    it("Should not allow non-owner emergency withdrawal", async function () {
      await time.increaseTo(cliffTime + VESTING_DURATION + 365 * 24 * 60 * 60 + 1);

      await expect(
        vesting.connect(beneficiary1).emergencyWithdraw(owner.address)
      ).to.be.revertedWithCustomError(vesting, "OwnableUnauthorizedAccount");
    });

    it("Should not allow emergency withdrawal to zero address", async function () {
      await time.increaseTo(cliffTime + VESTING_DURATION + 365 * 24 * 60 * 60 + 1);

      await expect(
        vesting.emergencyWithdraw(ethers.ZeroAddress)
      ).to.be.revertedWith("DicoVesting: invalid recipient");
    });
  });

  describe("Edge Cases", function () {
    beforeEach(async function () {
      await token.transfer(await vesting.getAddress(), ethers.parseEther("10000"));
    });

    it("Should handle vesting with very small amounts", async function () {
      const smallAmount = 1; // 1 wei
      await vesting.createVestingSchedule(beneficiary1.address, smallAmount);

      await time.increaseTo(cliffTime + 1);
      const claimable = await vesting.getClaimableAmount(beneficiary1.address);
      expect(claimable).to.be.greaterThanOrEqual(0);
    });

    it("Should handle multiple beneficiaries claiming simultaneously", async function () {
      const beneficiaries = [beneficiary1.address, beneficiary2.address, beneficiary3.address];
      const amounts = [ethers.parseEther("1000"), ethers.parseEther("2000"), ethers.parseEther("1500")];

      await vesting.createVestingSchedules(beneficiaries, amounts);
      await time.increaseTo(cliffTime + (VESTING_DURATION / 2));

      // All claim at the same time
      const promises = beneficiaries.map((_, i) => 
        vesting.connect([beneficiary1, beneficiary2, beneficiary3][i]).claimTokens()
      );

      await Promise.all(promises);

      // Verify all received their tokens
      for (let i = 0; i < beneficiaries.length; i++) {
        const balance = await token.balanceOf(beneficiaries[i]);
        expect(balance).to.be.greaterThan(0);
      }
    });
  });
});