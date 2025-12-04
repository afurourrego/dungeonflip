// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AventurerNFT
 * @dev ERC-721 NFT representing player adventurers with randomized stats
 * @notice Free minting (only gas fees) with stats: ATK (1-2), DEF (1-2), HP (4-6)
 * 
 * Built with AI assistance (GitHub Copilot + Claude) for Seedify Vibe Coins Hackathon
 */
contract AventurerNFT is ERC721, Ownable, Pausable {
    
    // ============================================
    // STATE VARIABLES
    // ============================================
    
    /// @notice Counter for NFT token IDs
    uint256 private _nextTokenId;
    
    /// @notice Struct to store adventurer stats
    struct Stats {
        uint8 atk;  // Attack: 1-2
        uint8 def;  // Defense: 1-2
        uint8 hp;   // Health Points: 4-6
        uint256 mintedAt; // Timestamp of minting
    }
    
    /// @notice Mapping from token ID to adventurer stats
    mapping(uint256 => Stats) private _tokenStats;
    
    /// @notice Base URI for token metadata
    string private _baseTokenURI;
    
    // ============================================
    // EVENTS
    // ============================================
    
    /// @notice Emitted when a new adventurer is minted
    event AventurerMinted(
        address indexed owner,
        uint256 indexed tokenId,
        uint8 atk,
        uint8 def,
        uint8 hp,
        uint256 timestamp
    );
    
    /// @notice Emitted when base URI is updated
    event BaseURIUpdated(string newBaseURI);
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    /**
     * @dev Initializes the ERC-721 contract with name and symbol
     */
    constructor() ERC721("DungeonFlip Aventurer", "DFAV") Ownable(msg.sender) {
        _nextTokenId = 1; // Start token IDs from 1
    }
    
    // ============================================
    // EXTERNAL FUNCTIONS
    // ============================================
    
    /**
     * @notice Mint a new adventurer NFT with randomized stats
     * @dev Free minting (only gas fees). Stats are pseudo-randomly generated
     * @return tokenId The ID of the newly minted NFT
     */
    function mintAventurer() external whenNotPaused returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
        // Generate pseudo-random stats
        Stats memory stats = _generateStats(tokenId, msg.sender);
        
        // Store stats
        _tokenStats[tokenId] = stats;
        
        // Mint NFT to caller
        _safeMint(msg.sender, tokenId);
        
        // Emit event
        emit AventurerMinted(
            msg.sender,
            tokenId,
            stats.atk,
            stats.def,
            stats.hp,
            block.timestamp
        );
        
        return tokenId;
    }
    
    /**
     * @notice Get the stats of an adventurer
     * @param tokenId The ID of the NFT
     * @return stats The adventurer's stats
     */
    function getAventurerStats(uint256 tokenId) external view returns (Stats memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _tokenStats[tokenId];
    }
    
    /**
     * @notice Get the total number of minted adventurers
     * @return The total supply of NFTs
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    /**
     * @notice Check if an address owns a specific token
     * @param owner The address to check
     * @param tokenId The token ID to check
     * @return True if the address owns the token
     */
    function isOwnerOf(address owner, uint256 tokenId) external view returns (bool) {
        return _ownerOf(tokenId) == owner;
    }
    
    // ============================================
    // OWNER FUNCTIONS
    // ============================================
    
    /**
     * @notice Pause minting (emergency use)
     * @dev Only callable by contract owner
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause minting
     * @dev Only callable by contract owner
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Set the base URI for token metadata
     * @dev Only callable by contract owner
     * @param baseURI The new base URI (e.g., "ipfs://..." or "https://...")
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        emit BaseURIUpdated(baseURI);
    }
    
    // ============================================
    // INTERNAL FUNCTIONS
    // ============================================
    
    /**
     * @dev Generate pseudo-random stats for an adventurer
     * @notice Uses block.timestamp, block.prevrandao, tokenId, and sender address
     * @param tokenId The token ID being minted
     * @param minter The address minting the token
     * @return stats The generated stats
     */
    function _generateStats(uint256 tokenId, address minter) private view returns (Stats memory) {
        // Create pseudo-random seed
        uint256 seed = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    tokenId,
                    minter,
                    _nextTokenId
                )
            )
        );
        
        // Generate ATK: 1-2
        uint8 atk = uint8((seed % 2) + 1);
        
        // Generate DEF: 1-2
        uint8 def = uint8(((seed >> 8) % 2) + 1);
        
        // Generate HP: 4-6
        uint8 hp = uint8(((seed >> 16) % 3) + 4);
        
        return Stats({
            atk: atk,
            def: def,
            hp: hp,
            mintedAt: block.timestamp
        });
    }
    
    /**
     * @dev Override to return custom base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Override tokenURI to provide metadata
     * @param tokenId The token ID
     * @return The token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        string memory baseURI = _baseURI();
        
        // If no base URI is set, return empty string
        if (bytes(baseURI).length == 0) {
            return "";
        }
        
        // Return baseURI + tokenId (e.g., "ipfs://abc/1")
        return string(abi.encodePacked(baseURI, _toString(tokenId)));
    }
    
    /**
     * @dev Convert uint256 to string
     * @param value The number to convert
     * @return The string representation
     */
    function _toString(uint256 value) private pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
