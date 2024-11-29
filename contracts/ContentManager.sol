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

   receive() external payable {
        (bool s,) = payable(admin).call{value: msg.value}("");
        require(s);
    }


    function addContent(uint price, string memory CID) public {
        
        require (contents[CID].creator == address(0), "Content is already on the platform!");
        
        contents[CID] = Content({
            creator: msg.sender,
            price: price,
            usageCount: 0,
            CID: CID
        });

        emit ContentAdded(msg.sender, CID);
    }

    function removeContent(string memory CID) public OnlyExistentContent(CID) OnlyCreator(contents[CID].creator) {

       delete contents[CID]; 

       emit ContentRemoved(msg.sender, CID);
    }

    function getContent(string memory CID) public view OnlyExistentContent(CID) returns (address creator, uint price, uint usageCount) {

        Content memory content = contents[CID];

        return (content.creator, content.price, content.usageCount);
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

        return (platformFee);
    }

    function setPlatformFee(uint newPlatformFee) external onlyOwner {

        uint oldFee = platformFee;

        platformFee = newPlatformFee;

        emit PlatformFeeChanged(oldFee, newPlatformFee);
    }

}