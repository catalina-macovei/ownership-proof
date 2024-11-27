// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

contract ContentManager is Ownable {


    modifier OnlyCreator (address creator){
        require (msg.sender == creator, "Action allowed only for the creator of the content!");
        _;
    } 

    modifier OnlyExistentContent (string memory CID) {
        require (contents[CID].creator != address(0), "Content not found!");
        _;
    }


    event ContentAdded(address creator, string CID);

    event ContentRemoved(address creator, string CID);

    event ContentPriceChanged(string CID, uint oldPrice, uint newPrice);

    event ContentUsageCountChanged(string CID, uint oldUsageCount, uint newUsageCount);

    event PlatformFeeChanged(uint oldFee, uint newFee);

    event FeePaid(address payer, uint amount);


    struct Content{
        address creator;
        uint price;
        uint usageCount;
        string CID;
    }

    mapping (string => Content) contents;

    uint platformFee;

    address admin;


   constructor(address initialOwner, uint initialPlatformFee) Ownable(initialOwner) {
        platformFee = initialPlatformFee;
        admin = initialOwner;
   }


    function addContent(uint price, string memory CID) public {
        
        require (contents[CID].creator == address(0), "Content is already on the platform!");
        require (address(msg.sender).balance >= platformFee, "Insufficient funds to add content!");

        // (bool paid, ) = ;
        // require(paid, "Failed to pay platform fee");
        
        emit FeePaid(msg.sender, platformFee);
        
        contents[CID] = Content({
            creator: msg.sender,
            price: price,
            usageCount: 0,
            CID: CID
        });

        emit ContentAdded(msg.sender, CID);
    }

    function removeContent(string memory CID) public OnlyCreator(contents[CID].creator) OnlyExistentContent(CID) {

       delete contents[CID]; 

       emit ContentRemoved(msg.sender, CID);
    }

    function getContent(string memory CID) external view OnlyExistentContent(CID) returns (address creator, uint price, uint usageCount) {

        Content memory content = contents[CID];

        return (content.creator, content.price, content.usageCount);
    }

    function setPrice(string memory CID, uint newPrice) external OnlyCreator(contents[CID].creator) OnlyExistentContent(CID) {

        require(newPrice >= 0, "Price cannot be negative!");

        uint oldPrice = contents[CID].price;

        contents[CID].price = newPrice;

        emit ContentPriceChanged(CID, oldPrice, newPrice);
    }

    function increaseUsageCountBy(string memory CID, uint noUsages) external OnlyExistentContent(CID) {

        require(noUsages >= 0, "UsageCount cannot be decreased!");

        uint oldUsageCount = contents[CID].usageCount;

        contents[CID].usageCount += noUsages;

        emit ContentUsageCountChanged(CID, oldUsageCount, contents[CID].usageCount);
    }

    function setPlatformFee(uint newPlatformFee) external onlyOwner {

        require(newPlatformFee >= 0, "Platform fee cannot be negative");

        uint oldFee = platformFee;

        platformFee = newPlatformFee;

        emit PlatformFeeChanged(oldFee, newPlatformFee);
    }

}