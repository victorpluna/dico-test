// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./DicoProject.sol";
import "./DicoToken.sol";

/**
 * @title DicoFactory
 * @dev Factory contract for creating and managing ICO projects on the Dico Platform
 */
contract DicoFactory is Ownable, Pausable, ReentrancyGuard {
    DicoToken public immutable dicoToken;
    
    // Platform fee configuration
    uint256 public platformFeePercentage = 250; // 2.5% in basis points
    address public feeRecipient;
    
    // Project creation requirements
    uint256 public projectCreationFee = 1 ether; // Fee in ETH to create a project
    uint256 public minimumProjectDuration = 7 days;
    uint256 public maximumProjectDuration = 180 days;
    
    // Project tracking
    address[] public projects;
    mapping(address => bool) public isValidProject;
    mapping(address => ProjectInfo) public projectInfo;
    mapping(address => address[]) public creatorProjects;
    
    // Statistics
    uint256 public totalProjectsCreated;
    uint256 public totalFundsRaised;
    uint256 public totalFeesCollected;

    struct ProjectInfo {
        address creator;
        address projectContract;
        string name;
        string symbol;
        uint256 createdAt;
        uint256 targetAmount;
        uint256 duration;
        bool isVerified;
        ProjectStatus status;
    }

    enum ProjectStatus {
        Active,
        Successful,
        Failed,
        Cancelled
    }

    // Events
    event ProjectCreated(
        address indexed creator,
        address indexed projectContract,
        string name,
        string symbol,
        uint256 targetAmount,
        uint256 duration
    );
    
    event ProjectStatusUpdated(
        address indexed projectContract,
        ProjectStatus oldStatus,
        ProjectStatus newStatus
    );
    
    event ProjectVerified(address indexed projectContract);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event ProjectCreationFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    event FeesWithdrawn(address indexed recipient, uint256 amount);

    /**
     * @dev Constructor
     * @param _dicoToken Address of the DICO token contract
     * @param _feeRecipient Address to receive platform fees
     * @param initialOwner Address that will own the factory contract
     */
    constructor(
        address _dicoToken,
        address _feeRecipient,
        address initialOwner
    ) Ownable(initialOwner) {
        require(_dicoToken != address(0), "DicoFactory: invalid token address");
        require(_feeRecipient != address(0), "DicoFactory: invalid fee recipient");
        
        dicoToken = DicoToken(_dicoToken);
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Creates a new ICO project contract
     * @param name Name of the project token
     * @param symbol Symbol of the project token
     * @param totalSupply Total supply of project tokens
     * @param targetAmount Target funding amount in ETH
     * @param duration ICO duration in seconds
     * @param tokenPrice Price per token in ETH (in wei)
     * @param vestingDuration Vesting duration for tokens in seconds
     * @param vestingCliff Cliff period before vesting starts
     * @param description Project description
     */
    function createProject(
        string calldata name,
        string calldata symbol,
        uint256 totalSupply,
        uint256 targetAmount,
        uint256 duration,
        uint256 tokenPrice,
        uint256 vestingDuration,
        uint256 vestingCliff,
        string calldata description
    ) external payable whenNotPaused nonReentrant {
        require(msg.value >= projectCreationFee, "DicoFactory: insufficient creation fee");
        require(bytes(name).length > 0 && bytes(symbol).length > 0, "DicoFactory: invalid name or symbol");
        require(totalSupply > 0, "DicoFactory: invalid total supply");
        require(targetAmount > 0, "DicoFactory: invalid target amount");
        require(
            duration >= minimumProjectDuration && duration <= maximumProjectDuration,
            "DicoFactory: invalid duration"
        );
        require(tokenPrice > 0, "DicoFactory: invalid token price");
        require(vestingDuration > 0, "DicoFactory: invalid vesting duration");

        // Create new project contract
        DicoProject newProject = new DicoProject(
            DicoProject.ProjectParams({
                name: name,
                symbol: symbol,
                creator: msg.sender,
                totalSupply: totalSupply,
                targetAmount: targetAmount,
                duration: duration,
                tokenPrice: tokenPrice,
                vestingDuration: vestingDuration,
                vestingCliff: vestingCliff,
                description: description,
                factory: address(this),
                dicoToken: address(dicoToken)
            })
        );

        address projectAddress = address(newProject);

        // Update tracking
        projects.push(projectAddress);
        isValidProject[projectAddress] = true;
        creatorProjects[msg.sender].push(projectAddress);
        
        projectInfo[projectAddress] = ProjectInfo({
            creator: msg.sender,
            projectContract: projectAddress,
            name: name,
            symbol: symbol,
            createdAt: block.timestamp,
            targetAmount: targetAmount,
            duration: duration,
            isVerified: false,
            status: ProjectStatus.Active
        });

        totalProjectsCreated++;

        // Handle excess ETH
        uint256 excess = msg.value - projectCreationFee;
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }

        emit ProjectCreated(
            msg.sender,
            projectAddress,
            name,
            symbol,
            targetAmount,
            duration
        );
    }

    /**
     * @dev Updates the status of a project (can only be called by the project contract)
     * @param newStatus New status for the project
     */
    function updateProjectStatus(ProjectStatus newStatus) external {
        require(isValidProject[msg.sender], "DicoFactory: caller is not a valid project");
        
        ProjectInfo storage project = projectInfo[msg.sender];
        ProjectStatus oldStatus = project.status;
        project.status = newStatus;

        emit ProjectStatusUpdated(msg.sender, oldStatus, newStatus);
    }

    /**
     * @dev Verifies a project (only owner can call this)
     * @param projectContract Address of the project contract to verify
     */
    function verifyProject(address projectContract) external onlyOwner {
        require(isValidProject[projectContract], "DicoFactory: invalid project");
        require(!projectInfo[projectContract].isVerified, "DicoFactory: already verified");
        
        projectInfo[projectContract].isVerified = true;
        emit ProjectVerified(projectContract);
    }

    /**
     * @dev Records funds raised by a project (called by project contracts)
     * @param amount Amount of funds raised
     */
    function recordFundsRaised(uint256 amount) external {
        require(isValidProject[msg.sender], "DicoFactory: caller is not a valid project");
        totalFundsRaised += amount;
    }

    /**
     * @dev Records fees collected by the platform (called by project contracts)
     * @param amount Amount of fees collected
     */
    function recordFeesCollected(uint256 amount) external {
        require(isValidProject[msg.sender], "DicoFactory: caller is not a valid project");
        totalFeesCollected += amount;
    }

    /**
     * @dev Sets the platform fee percentage (only owner)
     * @param newFeePercentage New fee percentage in basis points
     */
    function setPlatformFeePercentage(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 1000, "DicoFactory: fee too high"); // Max 10%
        
        uint256 oldFee = platformFeePercentage;
        platformFeePercentage = newFeePercentage;
        
        emit PlatformFeeUpdated(oldFee, newFeePercentage);
    }

    /**
     * @dev Sets the project creation fee (only owner)
     * @param newCreationFee New creation fee in ETH
     */
    function setProjectCreationFee(uint256 newCreationFee) external onlyOwner {
        uint256 oldFee = projectCreationFee;
        projectCreationFee = newCreationFee;
        
        emit ProjectCreationFeeUpdated(oldFee, newCreationFee);
    }

    /**
     * @dev Sets the fee recipient address (only owner)
     * @param newFeeRecipient New fee recipient address
     */
    function setFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "DicoFactory: invalid address");
        
        address oldRecipient = feeRecipient;
        feeRecipient = newFeeRecipient;
        
        emit FeeRecipientUpdated(oldRecipient, newFeeRecipient);
    }

    /**
     * @dev Withdraws accumulated fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "DicoFactory: no fees to withdraw");
        
        payable(feeRecipient).transfer(balance);
        emit FeesWithdrawn(feeRecipient, balance);
    }

    /**
     * @dev Pauses the factory (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the factory (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Returns all projects created by a specific creator
     * @param creator Address of the project creator
     */
    function getProjectsByCreator(address creator) external view returns (address[] memory) {
        return creatorProjects[creator];
    }

    /**
     * @dev Returns total number of projects created
     */
    function getProjectCount() external view returns (uint256) {
        return projects.length;
    }

    /**
     * @dev Returns project information by index
     * @param index Index of the project in the projects array
     */
    function getProjectByIndex(uint256 index) external view returns (address) {
        require(index < projects.length, "DicoFactory: index out of bounds");
        return projects[index];
    }

    /**
     * @dev Returns projects in a paginated manner
     * @param offset Starting index
     * @param limit Number of projects to return
     */
    function getProjectsPaginated(uint256 offset, uint256 limit) 
        external 
        view 
        returns (address[] memory) 
    {
        require(offset < projects.length, "DicoFactory: offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > projects.length) {
            end = projects.length;
        }
        
        address[] memory result = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = projects[i];
        }
        
        return result;
    }

    /**
     * @dev Returns platform statistics
     */
    function getPlatformStats() external view returns (
        uint256 projectsCreated,
        uint256 fundsRaised,
        uint256 feesCollected,
        uint256 currentFeePercentage
    ) {
        return (
            totalProjectsCreated,
            totalFundsRaised,
            totalFeesCollected,
            platformFeePercentage
        );
    }

    /**
     * @dev Allows the contract to receive ETH
     */
    receive() external payable {}
}