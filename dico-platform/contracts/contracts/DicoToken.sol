// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title DicoToken
 * @dev The native token of the Dico Platform
 * @notice This token is used for platform governance, fee payments, and rewards
 */
contract DicoToken is ERC20, ERC20Burnable, ERC20Permit, Ownable, Pausable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100 million tokens
    
    // Token allocation percentages (basis points - 10000 = 100%)
    uint256 public constant TEAM_ALLOCATION = 2000; // 20%
    uint256 public constant ADVISORS_ALLOCATION = 500; // 5%
    uint256 public constant ECOSYSTEM_ALLOCATION = 3000; // 30%
    uint256 public constant PUBLIC_SALE_ALLOCATION = 2500; // 25%
    uint256 public constant LIQUIDITY_ALLOCATION = 1000; // 10%
    uint256 public constant TREASURY_ALLOCATION = 1000; // 10%

    // Vesting contracts
    mapping(address => bool) public vestingContracts;
    
    // Minting control
    uint256 public totalMinted;
    bool public mintingFinished;
    
    // Events
    event VestingContractAdded(address indexed vestingContract);
    event VestingContractRemoved(address indexed vestingContract);
    event MintingFinished();
    event TokensRecovered(address indexed token, uint256 amount);

    /**
     * @dev Constructor that gives the deployer the initial supply
     * @param initialOwner The address that will own the contract
     */
    constructor(address initialOwner) 
        ERC20("Dico Token", "DICO") 
        ERC20Permit("Dico Token")
        Ownable(initialOwner)
    {
        _mint(initialOwner, INITIAL_SUPPLY);
        totalMinted = INITIAL_SUPPLY;
    }

    /**
     * @dev Mints new tokens. Only owner can call this function
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(!mintingFinished, "DicoToken: minting is finished");
        require(totalMinted + amount <= MAX_SUPPLY, "DicoToken: exceeds max supply");
        require(to != address(0), "DicoToken: mint to zero address");

        _mint(to, amount);
        totalMinted += amount;
    }

    /**
     * @dev Finishes the minting process. Cannot be undone
     */
    function finishMinting() external onlyOwner {
        require(!mintingFinished, "DicoToken: minting already finished");
        mintingFinished = true;
        emit MintingFinished();
    }

    /**
     * @dev Adds a vesting contract address
     * @param vestingContract The address of the vesting contract
     */
    function addVestingContract(address vestingContract) external onlyOwner {
        require(vestingContract != address(0), "DicoToken: zero address");
        require(!vestingContracts[vestingContract], "DicoToken: already added");
        
        vestingContracts[vestingContract] = true;
        emit VestingContractAdded(vestingContract);
    }

    /**
     * @dev Removes a vesting contract address
     * @param vestingContract The address of the vesting contract to remove
     */
    function removeVestingContract(address vestingContract) external onlyOwner {
        require(vestingContracts[vestingContract], "DicoToken: not a vesting contract");
        
        vestingContracts[vestingContract] = false;
        emit VestingContractRemoved(vestingContract);
    }

    /**
     * @dev Pauses all token transfers. Only owner can call this function
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses all token transfers. Only owner can call this function
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Recovers any ERC20 tokens sent to this contract by mistake
     * @param token The address of the token to recover
     * @param amount The amount of tokens to recover
     */
    function recoverTokens(address token, uint256 amount) external onlyOwner {
        require(token != address(this), "DicoToken: cannot recover DICO tokens");
        require(token != address(0), "DicoToken: zero address");
        
        IERC20(token).transfer(owner(), amount);
        emit TokensRecovered(token, amount);
    }

    /**
     * @dev Returns the remaining tokens that can be minted
     */
    function remainingMintable() external view returns (uint256) {
        if (mintingFinished) {
            return 0;
        }
        return MAX_SUPPLY - totalMinted;
    }

    /**
     * @dev Override transfer to respect pause functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "DicoToken: token transfer while paused");
    }

    /**
     * @dev Batch transfer function for efficiency
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts corresponding to each recipient
     */
    function batchTransfer(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external whenNotPaused {
        require(recipients.length == amounts.length, "DicoToken: arrays length mismatch");
        require(recipients.length > 0, "DicoToken: empty arrays");
        require(recipients.length <= 200, "DicoToken: too many recipients");

        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "DicoToken: transfer to zero address");
            require(amounts[i] > 0, "DicoToken: transfer amount must be greater than zero");
            _transfer(msg.sender, recipients[i], amounts[i]);
        }
    }

    /**
     * @dev Returns true if the account is a vesting contract
     * @param account The address to check
     */
    function isVestingContract(address account) external view returns (bool) {
        return vestingContracts[account];
    }
}