// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ContentManager is Ownable {
    modifier OnlyCreator(address creator) {
        require(msg.sender == creator, "Action allowed only for the creator of the content!");
        _;
    }

    modifier OnlyExistentContent(string memory CID) {
        require(contents[CID].creator != address(0), "Content not found!");
        _;
    }

    event ContentAdded(address creator, string CID);
    event ContentRemoved(address creator, string CID);
    event ContentPriceChanged(string CID, uint oldPrice, uint newPrice);
    event ContentUsageCountChanged(string CID, uint oldUsageCount, uint newUsageCount);
    event PlatformFeeChanged(uint oldFee, uint newFee);

    struct Content {
        address creator;
        uint price;
        uint usageCount;
        string CID;
    }

    mapping(string => Content) private contents;
    string[] private contentCIDs; // Array to keep track of all CIDs

    uint private platformFee;
    address private admin;

    constructor(address initialOwner, uint initialPlatformFee) Ownable(initialOwner) {
        platformFee = initialPlatformFee;
        admin = initialOwner;
    }

    function addContent(uint price, string memory CID) public payable {
        require(contents[CID].creator == address(0), "Content is already on the platform!");
        require(msg.value == platformFee, "You must pay the platform fee to upload content");

        // Transfer platform fee to admin
        (bool success, ) = payable(admin).call{value: msg.value}("");
        require(success, "Failed to transfer platform fee");

        // Add content to mapping and list
        contents[CID] = Content({
            creator: msg.sender,
            price: price,
            usageCount: 0,
            CID: CID
        });
        contentCIDs.push(CID); // Store CID in the list

        emit ContentAdded(msg.sender, CID);
    }

    function removeContent(string memory CID) public OnlyExistentContent(CID) OnlyCreator(contents[CID].creator) {
        // Remove content from mapping
        delete contents[CID];

        // Remove CID from the list
        for (uint i = 0; i < contentCIDs.length; i++) {
            if (keccak256(abi.encodePacked(contentCIDs[i])) == keccak256(abi.encodePacked(CID))) {
                contentCIDs[i] = contentCIDs[contentCIDs.length - 1];
                contentCIDs.pop();
                break;
            }
        }

        emit ContentRemoved(msg.sender, CID);
    }

    function getContent(string memory CID) public view OnlyExistentContent(CID) returns (address creator, uint price, uint usageCount) {
        Content memory content = contents[CID];
        return (content.creator, content.price, content.usageCount);
    }

    function getAllContentCIDs() public view returns (string[] memory) {
        return contentCIDs;
    }

    function getAllContentDetails() public view returns (Content[] memory) {
        Content[] memory allContents = new Content[](contentCIDs.length);
        for (uint i = 0; i < contentCIDs.length; i++) {
            allContents[i] = contents[contentCIDs[i]];
        }
        return allContents;
    }

    function setPrice(string memory CID, uint newPrice) external OnlyExistentContent(CID) OnlyCreator(contents[CID].creator) {
        uint oldPrice = contents[CID].price;
        contents[CID].price = newPrice;
        emit ContentPriceChanged(CID, oldPrice, newPrice);
    }

    function increaseUsageCount(string memory CID) external OnlyExistentContent(CID) {
        uint oldUsageCount = contents[CID].usageCount;
        contents[CID].usageCount += 1;
        emit ContentUsageCountChanged(CID, oldUsageCount, contents[CID].usageCount);
    }

    function getPlatformFee() public view returns (uint fee) {
        return platformFee;
    }

    function setPlatformFee(uint newPlatformFee) external onlyOwner {
        uint oldFee = platformFee;
        platformFee = newPlatformFee;
        emit PlatformFeeChanged(oldFee, newPlatformFee);
    }
}
