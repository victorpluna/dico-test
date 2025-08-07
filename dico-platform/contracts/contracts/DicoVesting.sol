// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DicoVesting
 * @dev Vesting contract for ICO project tokens with linear vesting schedule
 */
contract DicoVesting is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    uint256 public immutable cliffTime;
    uint256 public immutable vestingDuration;
    uint256 public immutable vestingStart;

    // Vesting information for each beneficiary
    struct VestingSchedule {
        uint256 totalAmount;
        uint256 claimedAmount;
        bool isActive;
    }

    mapping(address => VestingSchedule) public vestingSchedules;
    address[] public beneficiaries;
    
    uint256 public totalTokensVested;
    uint256 public totalTokensClaimed;

    // Events
    event VestingScheduleCreated(address indexed beneficiary, uint256 amount);
    event TokensClaimed(address indexed beneficiary, uint256 amount);
    event VestingRevoked(address indexed beneficiary, uint256 unclaimedAmount);

    /**
     * @dev Constructor
     * @param _token The ERC20 token to be vested
     * @param _cliffTime Timestamp when the cliff period ends
     * @param _vestingDuration Duration of the vesting period in seconds
     */
    constructor(
        address _token,
        uint256 _cliffTime,
        uint256 _vestingDuration
    ) Ownable(msg.sender) {
        require(_token != address(0), "DicoVesting: invalid token address");
        require(_cliffTime > block.timestamp, "DicoVesting: cliff time must be in the future");
        require(_vestingDuration > 0, "DicoVesting: vesting duration must be greater than 0");

        token = IERC20(_token);
        cliffTime = _cliffTime;
        vestingDuration = _vestingDuration;
        vestingStart = _cliffTime; // Vesting starts after cliff
    }

    /**
     * @dev Creates a vesting schedule for a beneficiary
     * @param beneficiary Address of the beneficiary
     * @param amount Total amount of tokens to be vested
     */
    function createVestingSchedule(address beneficiary, uint256 amount) external onlyOwner {
        require(beneficiary != address(0), "DicoVesting: invalid beneficiary address");
        require(amount > 0, "DicoVesting: amount must be greater than 0");
        require(!vestingSchedules[beneficiary].isActive, "DicoVesting: vesting schedule already exists");

        vestingSchedules[beneficiary] = VestingSchedule({
            totalAmount: amount,
            claimedAmount: 0,
            isActive: true
        });

        beneficiaries.push(beneficiary);
        totalTokensVested += amount;

        emit VestingScheduleCreated(beneficiary, amount);
    }

    /**
     * @dev Creates vesting schedules for multiple beneficiaries
     * @param _beneficiaries Array of beneficiary addresses
     * @param amounts Array of vesting amounts corresponding to each beneficiary
     */
    function createVestingSchedules(
        address[] calldata _beneficiaries,
        uint256[] calldata amounts
    ) external onlyOwner {
        require(_beneficiaries.length == amounts.length, "DicoVesting: arrays length mismatch");
        require(_beneficiaries.length > 0, "DicoVesting: empty arrays");

        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            createVestingSchedule(_beneficiaries[i], amounts[i]);
        }
    }

    /**
     * @dev Claims vested tokens for the caller
     */
    function claimTokens() external nonReentrant {
        _claimTokens(msg.sender);
    }

    /**
     * @dev Claims vested tokens for a specific beneficiary (can be called by anyone)
     * @param beneficiary Address of the beneficiary
     */
    function claimTokens(address beneficiary) external nonReentrant {
        _claimTokens(beneficiary);
    }

    /**
     * @dev Internal function to handle token claims
     * @param beneficiary Address of the beneficiary
     */
    function _claimTokens(address beneficiary) internal {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        require(schedule.isActive, "DicoVesting: no active vesting schedule");

        uint256 claimableAmount = getClaimableAmount(beneficiary);
        require(claimableAmount > 0, "DicoVesting: no tokens available to claim");

        schedule.claimedAmount += claimableAmount;
        totalTokensClaimed += claimableAmount;

        token.safeTransfer(beneficiary, claimableAmount);

        emit TokensClaimed(beneficiary, claimableAmount);
    }

    /**
     * @dev Revokes a vesting schedule (only owner)
     * @param beneficiary Address of the beneficiary whose vesting is to be revoked
     */
    function revokeVesting(address beneficiary) external onlyOwner {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        require(schedule.isActive, "DicoVesting: vesting schedule not active");

        uint256 unclaimedAmount = schedule.totalAmount - schedule.claimedAmount;
        schedule.isActive = false;
        totalTokensVested -= unclaimedAmount;

        emit VestingRevoked(beneficiary, unclaimedAmount);
    }

    /**
     * @dev Returns the amount of tokens that can be claimed by a beneficiary
     * @param beneficiary Address of the beneficiary
     * @return claimableAmount Amount of tokens that can be claimed
     */
    function getClaimableAmount(address beneficiary) public view returns (uint256) {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        
        if (!schedule.isActive || block.timestamp < cliffTime) {
            return 0;
        }

        uint256 vestedAmount = getVestedAmount(beneficiary);
        return vestedAmount - schedule.claimedAmount;
    }

    /**
     * @dev Returns the total amount of tokens vested for a beneficiary at current time
     * @param beneficiary Address of the beneficiary
     * @return vestedAmount Total amount of tokens vested
     */
    function getVestedAmount(address beneficiary) public view returns (uint256) {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        
        if (!schedule.isActive || block.timestamp < cliffTime) {
            return 0;
        }

        // If vesting period has ended, return full amount
        if (block.timestamp >= vestingStart + vestingDuration) {
            return schedule.totalAmount;
        }

        // Calculate linear vesting
        uint256 timeSinceStart = block.timestamp - vestingStart;
        return (schedule.totalAmount * timeSinceStart) / vestingDuration;
    }

    /**
     * @dev Returns comprehensive vesting information for a beneficiary
     * @param beneficiary Address of the beneficiary
     * @return totalTokens Total tokens in the vesting schedule
     * @return claimedTokens Amount of tokens already claimed
     * @return claimableTokens Amount of tokens that can be claimed now
     * @return nextUnlockTime Timestamp of next token unlock (0 if fully vested)
     */
    function getVestingInfo(address beneficiary) external view returns (
        uint256 totalTokens,
        uint256 claimedTokens,
        uint256 claimableTokens,
        uint256 nextUnlockTime
    ) {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        
        totalTokens = schedule.totalAmount;
        claimedTokens = schedule.claimedAmount;
        claimableTokens = getClaimableAmount(beneficiary);
        
        // Calculate next unlock time
        if (block.timestamp < cliffTime) {
            nextUnlockTime = cliffTime;
        } else if (block.timestamp >= vestingStart + vestingDuration) {
            nextUnlockTime = 0; // Fully vested
        } else {
            // Next unlock is in 1 day (daily linear vesting)
            nextUnlockTime = block.timestamp + 1 days;
        }
    }

    /**
     * @dev Returns the vesting schedule for a beneficiary
     * @param beneficiary Address of the beneficiary
     * @return totalAmount Total amount of tokens in the vesting schedule
     * @return claimedAmount Amount of tokens already claimed
     * @return isActive Whether the vesting schedule is active
     */
    function getVestingSchedule(address beneficiary) external view returns (
        uint256 totalAmount,
        uint256 claimedAmount,
        bool isActive
    ) {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        return (schedule.totalAmount, schedule.claimedAmount, schedule.isActive);
    }

    /**
     * @dev Returns the list of all beneficiaries
     * @return Array of beneficiary addresses
     */
    function getBeneficiaries() external view returns (address[] memory) {
        return beneficiaries;
    }

    /**
     * @dev Returns the total number of beneficiaries
     * @return Number of beneficiaries
     */
    function getBeneficiaryCount() external view returns (uint256) {
        return beneficiaries.length;
    }

    /**
     * @dev Returns vesting statistics
     * @return totalVested Total amount of tokens vested across all schedules
     * @return totalClaimed Total amount of tokens claimed across all schedules
     * @return totalClaimable Total amount of tokens that can be claimed now across all schedules
     */
    function getVestingStats() external view returns (
        uint256 totalVested,
        uint256 totalClaimed,
        uint256 totalClaimable
    ) {
        totalVested = totalTokensVested;
        totalClaimed = totalTokensClaimed;
        
        // Calculate total claimable
        uint256 claimable = 0;
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            claimable += getClaimableAmount(beneficiaries[i]);
        }
        totalClaimable = claimable;
    }

    /**
     * @dev Returns whether the cliff period has passed
     * @return True if cliff period has passed
     */
    function isCliffPassed() external view returns (bool) {
        return block.timestamp >= cliffTime;
    }

    /**
     * @dev Returns whether the vesting period has ended
     * @return True if vesting period has ended
     */
    function isVestingEnded() external view returns (bool) {
        return block.timestamp >= vestingStart + vestingDuration;
    }

    /**
     * @dev Returns the percentage of vesting completed (0-100)
     * @return Percentage of vesting completed
     */
    function getVestingProgress() external view returns (uint256) {
        if (block.timestamp < cliffTime) {
            return 0;
        }
        
        if (block.timestamp >= vestingStart + vestingDuration) {
            return 100;
        }
        
        uint256 timeSinceStart = block.timestamp - vestingStart;
        return (timeSinceStart * 100) / vestingDuration;
    }

    /**
     * @dev Emergency function to withdraw any remaining tokens after all vesting is complete
     * @param recipient Address to receive the tokens
     */
    function emergencyWithdraw(address recipient) external onlyOwner {
        require(recipient != address(0), "DicoVesting: invalid recipient");
        require(block.timestamp >= vestingStart + vestingDuration + 365 days, "DicoVesting: vesting not complete");
        
        uint256 balance = token.balanceOf(address(this));
        if (balance > 0) {
            token.safeTransfer(recipient, balance);
        }
    }
}