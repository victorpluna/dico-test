// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./DicoVesting.sol";
import "./DicoFactory.sol";
import "./DicoToken.sol";

/**
 * @title DicoProject
 * @dev Individual ICO project contract for the Dico Platform
 */
contract DicoProject is ERC20, ReentrancyGuard, Ownable, Pausable {
    DicoFactory public immutable factory;
    DicoToken public immutable dicoToken;
    
    // Project parameters
    struct ProjectParams {
        string name;
        string symbol;
        address creator;
        uint256 totalSupply;
        uint256 targetAmount;
        uint256 duration;
        uint256 tokenPrice;
        uint256 vestingDuration;
        uint256 vestingCliff;
        string description;
        address factory;
        address dicoToken;
    }
    
    // Project state
    address public immutable creator;
    uint256 public immutable targetAmount;
    uint256 public immutable tokenPrice;
    uint256 public immutable startTime;
    uint256 public immutable endTime;
    uint256 public immutable vestingDuration;
    uint256 public immutable vestingCliff;
    string public description;
    
    // Investment tracking
    mapping(address => uint256) public investments;
    mapping(address => uint256) public tokensPurchased;
    mapping(address => bool) public hasClaimed;
    address[] public investors;
    
    uint256 public totalRaised;
    uint256 public totalTokensSold;
    uint256 public investorCount;
    
    // Vesting contract
    DicoVesting public vestingContract;
    
    // Investment limits
    uint256 public constant MIN_INVESTMENT = 0.01 ether;
    uint256 public constant MAX_INVESTMENT = 100 ether;
    
    // Project status
    enum ProjectStatus {
        Active,
        Successful,
        Failed,
        Cancelled
    }
    
    ProjectStatus public status;
    bool public fundsWithdrawn;
    bool public vestingInitialized;

    // Events
    event InvestmentMade(address indexed investor, uint256 amount, uint256 tokens);
    event TokensClaimed(address indexed investor, uint256 amount);
    event FundsWithdrawn(address indexed creator, uint256 amount);
    event ProjectFinalized(ProjectStatus status, uint256 totalRaised);
    event VestingInitialized(address indexed vestingContract);
    event RefundClaimed(address indexed investor, uint256 amount);

    // Modifiers
    modifier onlyCreator() {
        require(msg.sender == creator, "DicoProject: caller is not the creator");
        _;
    }

    modifier onlyActive() {
        require(status == ProjectStatus.Active, "DicoProject: project not active");
        require(block.timestamp <= endTime, "DicoProject: project ended");
        _;
    }

    modifier onlyAfterEnd() {
        require(block.timestamp > endTime, "DicoProject: project still active");
        _;
    }

    /**
     * @dev Constructor
     * @param params Project parameters struct
     */
    constructor(ProjectParams memory params) 
        ERC20(params.name, params.symbol) 
        Ownable(params.creator)
    {
        require(params.creator != address(0), "DicoProject: invalid creator");
        require(params.totalSupply > 0, "DicoProject: invalid supply");
        require(params.targetAmount > 0, "DicoProject: invalid target");
        require(params.tokenPrice > 0, "DicoProject: invalid price");
        require(params.duration > 0, "DicoProject: invalid duration");

        factory = DicoFactory(params.factory);
        dicoToken = DicoToken(params.dicoToken);
        creator = params.creator;
        targetAmount = params.targetAmount;
        tokenPrice = params.tokenPrice;
        startTime = block.timestamp;
        endTime = block.timestamp + params.duration;
        vestingDuration = params.vestingDuration;
        vestingCliff = params.vestingCliff;
        description = params.description;
        status = ProjectStatus.Active;

        // Mint total supply to this contract
        _mint(address(this), params.totalSupply);
    }

    /**
     * @dev Allows users to invest in the project
     */
    function invest() external payable nonReentrant onlyActive whenNotPaused {
        require(msg.value >= MIN_INVESTMENT, "DicoProject: investment too small");
        require(msg.value <= MAX_INVESTMENT, "DicoProject: investment too large");
        require(totalRaised + msg.value <= targetAmount, "DicoProject: target exceeded");

        uint256 tokenAmount = (msg.value * 10**18) / tokenPrice;
        require(tokenAmount > 0, "DicoProject: invalid token amount");
        require(totalTokensSold + tokenAmount <= totalSupply(), "DicoProject: not enough tokens");

        // Track investment
        if (investments[msg.sender] == 0) {
            investors.push(msg.sender);
            investorCount++;
        }
        
        investments[msg.sender] += msg.value;
        tokensPurchased[msg.sender] += tokenAmount;
        totalRaised += msg.value;
        totalTokensSold += tokenAmount;

        // Record in factory
        factory.recordFundsRaised(msg.value);

        emit InvestmentMade(msg.sender, msg.value, tokenAmount);

        // Check if target reached
        if (totalRaised >= targetAmount) {
            _finalizeProject(ProjectStatus.Successful);
        }
    }

    /**
     * @dev Finalizes the project after the ICO period ends
     */
    function finalizeProject() external onlyAfterEnd {
        require(status == ProjectStatus.Active, "DicoProject: already finalized");
        
        if (totalRaised >= targetAmount * 30 / 100) { // 30% minimum success threshold
            _finalizeProject(ProjectStatus.Successful);
        } else {
            _finalizeProject(ProjectStatus.Failed);
        }
    }

    /**
     * @dev Internal function to finalize project
     * @param newStatus New status for the project
     */
    function _finalizeProject(ProjectStatus newStatus) internal {
        status = newStatus;
        factory.updateProjectStatus(DicoFactory.ProjectStatus(uint8(newStatus)));
        
        emit ProjectFinalized(newStatus, totalRaised);

        if (newStatus == ProjectStatus.Successful) {
            _initializeVesting();
        }
    }

    /**
     * @dev Initializes vesting contract for successful projects
     */
    function _initializeVesting() internal {
        require(!vestingInitialized, "DicoProject: vesting already initialized");
        
        vestingContract = new DicoVesting(
            address(this),
            block.timestamp + vestingCliff,
            vestingDuration
        );
        
        vestingInitialized = true;
        
        // Transfer tokens to vesting contract
        uint256 tokensForVesting = totalTokensSold;
        _transfer(address(this), address(vestingContract), tokensForVesting);
        
        emit VestingInitialized(address(vestingContract));
    }

    /**
     * @dev Allows creator to withdraw funds after successful completion
     */
    function withdrawFunds() external onlyCreator nonReentrant {
        require(status == ProjectStatus.Successful, "DicoProject: project not successful");
        require(!fundsWithdrawn, "DicoProject: funds already withdrawn");

        fundsWithdrawn = true;
        
        // Calculate platform fee
        uint256 platformFee = (totalRaised * factory.platformFeePercentage()) / 10000;
        uint256 creatorAmount = totalRaised - platformFee;
        
        // Record fee collection
        if (platformFee > 0) {
            factory.recordFeesCollected(platformFee);
            payable(factory.feeRecipient()).transfer(platformFee);
        }
        
        // Transfer remaining funds to creator
        payable(creator).transfer(creatorAmount);
        
        emit FundsWithdrawn(creator, creatorAmount);
    }

    /**
     * @dev Allows investors to claim refunds for failed projects
     */
    function claimRefund() external nonReentrant {
        require(status == ProjectStatus.Failed, "DicoProject: project not failed");
        require(investments[msg.sender] > 0, "DicoProject: no investment found");
        require(!hasClaimed[msg.sender], "DicoProject: already claimed");

        uint256 refundAmount = investments[msg.sender];
        hasClaimed[msg.sender] = true;
        
        payable(msg.sender).transfer(refundAmount);
        
        emit RefundClaimed(msg.sender, refundAmount);
    }

    /**
     * @dev Allows investors to claim their vested tokens
     */
    function claimTokens() external nonReentrant {
        require(status == ProjectStatus.Successful, "DicoProject: project not successful");
        require(vestingInitialized, "DicoProject: vesting not initialized");
        require(tokensPurchased[msg.sender] > 0, "DicoProject: no tokens purchased");

        uint256 claimableAmount = vestingContract.getClaimableAmount(msg.sender);
        require(claimableAmount > 0, "DicoProject: no tokens to claim");

        vestingContract.claimTokens(msg.sender);
        
        emit TokensClaimed(msg.sender, claimableAmount);
    }

    /**
     * @dev Cancels the project (only creator, only during active phase)
     */
    function cancelProject() external onlyCreator {
        require(status == ProjectStatus.Active, "DicoProject: project not active");
        require(block.timestamp <= endTime, "DicoProject: project ended");
        
        _finalizeProject(ProjectStatus.Cancelled);
    }

    /**
     * @dev Pauses the project (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the project (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Returns project information
     */
    function getProjectInfo() external view returns (
        address projectCreator,
        uint256 target,
        uint256 raised,
        uint256 price,
        uint256 start,
        uint256 end,
        ProjectStatus projectStatus,
        uint256 investorCount_,
        bool isVestingInitialized
    ) {
        return (
            creator,
            targetAmount,
            totalRaised,
            tokenPrice,
            startTime,
            endTime,
            status,
            investorCount,
            vestingInitialized
        );
    }

    /**
     * @dev Returns investment information for a specific address
     * @param investor Address of the investor
     */
    function getInvestmentInfo(address investor) external view returns (
        uint256 investmentAmount,
        uint256 tokens,
        bool claimed,
        uint256 claimableTokens
    ) {
        uint256 claimable = 0;
        if (vestingInitialized && status == ProjectStatus.Successful) {
            claimable = vestingContract.getClaimableAmount(investor);
        }
        
        return (
            investments[investor],
            tokensPurchased[investor],
            hasClaimed[investor],
            claimable
        );
    }

    /**
     * @dev Returns all investors
     */
    function getInvestors() external view returns (address[] memory) {
        return investors;
    }

    /**
     * @dev Returns project progress percentage (0-100)
     */
    function getProgress() external view returns (uint256) {
        if (targetAmount == 0) return 0;
        return (totalRaised * 100) / targetAmount;
    }

    /**
     * @dev Returns time remaining in seconds
     */
    function getTimeRemaining() external view returns (uint256) {
        if (block.timestamp >= endTime) return 0;
        return endTime - block.timestamp;
    }

    /**
     * @dev Returns whether the project is currently active
     */
    function isActive() external view returns (bool) {
        return status == ProjectStatus.Active && block.timestamp <= endTime;
    }

    /**
     * @dev Returns vesting information for an investor
     * @param investor Address of the investor
     */
    function getVestingInfo(address investor) external view returns (
        uint256 totalTokens,
        uint256 claimedTokens,
        uint256 claimableTokens,
        uint256 nextUnlockTime
    ) {
        if (!vestingInitialized) {
            return (0, 0, 0, 0);
        }
        
        return vestingContract.getVestingInfo(investor);
    }

    /**
     * @dev Emergency function to recover stuck tokens (only owner)
     * @param token Address of the token to recover
     * @param amount Amount to recover
     */
    function emergencyTokenRecovery(address token, uint256 amount) external onlyOwner {
        require(token != address(this), "DicoProject: cannot recover project tokens");
        IERC20(token).transfer(owner(), amount);
    }

    /**
     * @dev Allows the contract to receive ETH
     */
    receive() external payable {
        if (msg.value > 0) {
            invest();
        }
    }
}