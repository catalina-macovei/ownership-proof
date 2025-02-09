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

    event ContentAdded(address indexed creator, string indexed CID);
    event ContentIsAvailableChanged(address indexed creator, string indexed CID);
    event ContentPriceChanged(string indexed CID, uint oldPrice, uint newPrice);
    event ContentTitleChanged(string indexed CID, string oldTitle, string newTitle);
    event ContentUsageCountChanged(string indexed CID, uint oldUsageCount, uint newUsageCount);
    event PlatformFeeChanged(uint oldFee, uint newFee);

    struct Content {
        address creator;
        uint price;
        uint usageCount;
        string CID;
        string title;
        bool isAvailable;
    }

    mapping(string => Content) private contents;
    string[] private contentCIDs;

    uint private platformFee;
    address private admin;

    constructor(address initialOwner, uint initialPlatformFee) Ownable(initialOwner) {
        platformFee = initialPlatformFee;
        admin = initialOwner;
    }

    function addContent(uint price, string memory CID, string memory title) public payable {
        require(contents[CID].creator == address(0) && !contents[CID].isAvailable, "Content is already on the platform!");
        require(msg.value == platformFee, "You must pay the platform fee to upload content");

        (bool success, ) = payable(admin).call{value: msg.value}("");
        require(success, "Failed to transfer platform fee");

        if (contents[CID].creator == address(0)) {
            contentCIDs.push(CID);
        }

        contents[CID] = Content({
            creator: msg.sender,
            price: price,
            usageCount: 0,
            CID: CID,
            title: title,
            isAvailable: true
        });

        emit ContentAdded(msg.sender, CID);
    }

    function setUnavailableContent(string memory CID) public OnlyExistentContent(CID) OnlyCreator(contents[CID].creator) {
        contents[CID].isAvailable = false;

        emit ContentIsAvailableChanged(msg.sender, CID);
    }

    function getContent(string memory CID) public view OnlyExistentContent(CID) returns (address creator, uint price, uint usageCount, string memory title, bool isAvailable) {
        Content memory content = contents[CID];
        return (content.creator, content.price, content.usageCount, content.title, content.isAvailable);
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

    function setTitle(string memory CID, string memory newTitle) external OnlyExistentContent(CID) OnlyCreator(contents[CID].creator) {
        string memory oldTitle = contents[CID].title;
        contents[CID].title = newTitle;
        emit ContentTitleChanged(CID, oldTitle, newTitle);
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
