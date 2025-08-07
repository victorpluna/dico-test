// Contract ABIs for the Dico Platform contracts
// These ABIs are essential interfaces for frontend integration

export const DICO_TOKEN_ABI = [
  // ERC20 Standard functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  
  // DicoToken specific functions
  "function MAX_SUPPLY() view returns (uint256)",
  "function totalMinted() view returns (uint256)",
  "function mintingFinished() view returns (bool)",
  "function remainingMintable() view returns (uint256)",
  "function isVestingContract(address) view returns (bool)",
  "function paused() view returns (bool)",
  "function owner() view returns (address)",
  
  // Admin functions (owner only)
  "function mint(address to, uint256 amount)",
  "function finishMinting()",
  "function addVestingContract(address vestingContract)",
  "function removeVestingContract(address vestingContract)",
  "function pause()",
  "function unpause()",
  "function batchTransfer(address[] recipients, uint256[] amounts)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event VestingContractAdded(address indexed vestingContract)",
  "event MintingFinished()",
] as const

export const DICO_FACTORY_ABI = [
  // View functions
  "function dicoToken() view returns (address)",
  "function platformFeePercentage() view returns (uint256)",
  "function projectCreationFee() view returns (uint256)",
  "function feeRecipient() view returns (address)",
  "function totalProjectsCreated() view returns (uint256)",
  "function totalFundsRaised() view returns (uint256)",
  "function totalFeesCollected() view returns (uint256)",
  "function isValidProject(address) view returns (bool)",
  "function getProjectCount() view returns (uint256)",
  "function getProjectByIndex(uint256 index) view returns (address)",
  "function getProjectsByCreator(address creator) view returns (address[])",
  "function getProjectsPaginated(uint256 offset, uint256 limit) view returns (address[])",
  "function paused() view returns (bool)",
  
  // Project info
  "function projectInfo(address) view returns (tuple(address creator, address projectContract, string name, string symbol, uint256 createdAt, uint256 targetAmount, uint256 duration, bool isVerified, uint8 status))",
  
  // Statistics
  "function getPlatformStats() view returns (uint256 projectsCreated, uint256 fundsRaised, uint256 feesCollected, uint256 currentFeePercentage)",
  
  // Main functions
  "function createProject(string name, string symbol, uint256 totalSupply, uint256 targetAmount, uint256 duration, uint256 tokenPrice, uint256 vestingDuration, uint256 vestingCliff, string description) payable",
  
  // Admin functions
  "function verifyProject(address projectContract)",
  "function setPlatformFeePercentage(uint256 newFeePercentage)",
  "function setProjectCreationFee(uint256 newCreationFee)",
  "function setFeeRecipient(address newFeeRecipient)",
  "function withdrawFees()",
  "function pause()",
  "function unpause()",
  
  // Functions called by projects
  "function updateProjectStatus(uint8 newStatus)",
  "function recordFundsRaised(uint256 amount)",
  "function recordFeesCollected(uint256 amount)",
  
  // Events
  "event ProjectCreated(address indexed creator, address indexed projectContract, string name, string symbol, uint256 targetAmount, uint256 duration)",
  "event ProjectStatusUpdated(address indexed projectContract, uint8 oldStatus, uint8 newStatus)",
  "event ProjectVerified(address indexed projectContract)",
  "event PlatformFeeUpdated(uint256 oldFee, uint256 newFee)",
  "event FeesWithdrawn(address indexed recipient, uint256 amount)",
] as const

export const DICO_PROJECT_ABI = [
  // ERC20 functions (inherited)
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  
  // Project parameters
  "function creator() view returns (address)",
  "function targetAmount() view returns (uint256)",
  "function tokenPrice() view returns (uint256)",
  "function startTime() view returns (uint256)",
  "function endTime() view returns (uint256)",
  "function vestingDuration() view returns (uint256)",
  "function vestingCliff() view returns (uint256)",
  "function description() view returns (string)",
  
  // Project state
  "function totalRaised() view returns (uint256)",
  "function totalTokensSold() view returns (uint256)",
  "function investorCount() view returns (uint256)",
  "function status() view returns (uint8)",
  "function fundsWithdrawn() view returns (bool)",
  "function vestingInitialized() view returns (bool)",
  "function vestingContract() view returns (address)",
  
  // Investment tracking
  "function investments(address) view returns (uint256)",
  "function tokensPurchased(address) view returns (uint256)",
  "function hasClaimed(address) view returns (bool)",
  
  // Investment limits
  "function MIN_INVESTMENT() view returns (uint256)",
  "function MAX_INVESTMENT() view returns (uint256)",
  
  // Main functions
  "function invest() payable",
  "function finalizeProject()",
  "function withdrawFunds()",
  "function claimRefund()",
  "function claimTokens()",
  "function cancelProject()",
  
  // Information functions
  "function getProjectInfo() view returns (tuple(address projectCreator, uint256 target, uint256 raised, uint256 price, uint256 start, uint256 end, uint8 projectStatus, uint256 investorCount_, bool isVestingInitialized))",
  "function getInvestmentInfo(address investor) view returns (tuple(uint256 investmentAmount, uint256 tokens, bool claimed, uint256 claimableTokens))",
  "function getInvestors() view returns (address[])",
  "function getProgress() view returns (uint256)",
  "function getTimeRemaining() view returns (uint256)",
  "function isActive() view returns (bool)",
  "function getVestingInfo(address investor) view returns (tuple(uint256 totalTokens, uint256 claimedTokens, uint256 claimableTokens, uint256 nextUnlockTime))",
  
  // Events
  "event InvestmentMade(address indexed investor, uint256 amount, uint256 tokens)",
  "event TokensClaimed(address indexed investor, uint256 amount)",
  "event FundsWithdrawn(address indexed creator, uint256 amount)",
  "event ProjectFinalized(uint8 status, uint256 totalRaised)",
  "event RefundClaimed(address indexed investor, uint256 amount)",
  "event VestingInitialized(address indexed vestingContract)",
] as const

export const DICO_VESTING_ABI = [
  // View functions
  "function token() view returns (address)",
  "function cliffTime() view returns (uint256)",
  "function vestingDuration() view returns (uint256)",
  "function vestingStart() view returns (uint256)",
  "function totalTokensVested() view returns (uint256)",
  "function totalTokensClaimed() view returns (uint256)",
  "function getBeneficiaryCount() view returns (uint256)",
  "function getBeneficiaries() view returns (address[])",
  
  // Vesting schedule functions
  "function vestingSchedules(address) view returns (tuple(uint256 totalAmount, uint256 claimedAmount, bool isActive))",
  "function getVestingSchedule(address beneficiary) view returns (tuple(uint256 totalAmount, uint256 claimedAmount, bool isActive))",
  "function getClaimableAmount(address beneficiary) view returns (uint256)",
  "function getVestedAmount(address beneficiary) view returns (uint256)",
  "function getVestingInfo(address beneficiary) view returns (tuple(uint256 totalTokens, uint256 claimedTokens, uint256 claimableTokens, uint256 nextUnlockTime))",
  
  // Status functions
  "function isCliffPassed() view returns (bool)",
  "function isVestingEnded() view returns (bool)",
  "function getVestingProgress() view returns (uint256)",
  "function getVestingStats() view returns (tuple(uint256 totalVested, uint256 totalClaimed, uint256 totalClaimable))",
  
  // Main functions
  "function claimTokens()",
  "function claimTokens(address beneficiary)",
  
  // Admin functions
  "function createVestingSchedule(address beneficiary, uint256 amount)",
  "function createVestingSchedules(address[] beneficiaries, uint256[] amounts)",
  "function revokeVesting(address beneficiary)",
  "function emergencyWithdraw(address recipient)",
  
  // Events
  "event VestingScheduleCreated(address indexed beneficiary, uint256 amount)",
  "event TokensClaimed(address indexed beneficiary, uint256 amount)",
  "event VestingRevoked(address indexed beneficiary, uint256 unclaimedAmount)",
] as const

// Type definitions for better TypeScript support
export type ProjectStatus = 0 | 1 | 2 | 3 // Active | Successful | Failed | Cancelled

export interface ProjectInfo {
  creator: string
  projectContract: string
  name: string
  symbol: string
  createdAt: bigint
  targetAmount: bigint
  duration: bigint
  isVerified: boolean
  status: ProjectStatus
}

export interface ProjectDetails {
  projectCreator: string
  target: bigint
  raised: bigint
  price: bigint
  start: bigint
  end: bigint
  projectStatus: ProjectStatus
  investorCount_: bigint
  isVestingInitialized: boolean
}

export interface InvestmentInfo {
  investmentAmount: bigint
  tokens: bigint
  claimed: boolean
  claimableTokens: bigint
}

export interface VestingInfo {
  totalTokens: bigint
  claimedTokens: bigint
  claimableTokens: bigint
  nextUnlockTime: bigint
}

export interface VestingSchedule {
  totalAmount: bigint
  claimedAmount: bigint
  isActive: boolean
}

export interface PlatformStats {
  projectsCreated: bigint
  fundsRaised: bigint
  feesCollected: bigint
  currentFeePercentage: bigint
}