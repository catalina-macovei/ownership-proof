// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";
import "./ContentManager.sol";

contract LicenceManager {
    ContentManager public contentManager;

    struct Licence {
        uint256 issueDate;
        uint256 expiryDate;
        string CID;
        address userId;
        bool isValid;
    }

    mapping(address => mapping(string => Licence)) public licences;
    mapping(string => uint256) public licencePayments;

    event LicenceIssued(address user, string CID, uint256 expiryDate);
    event LicenceRevoked(address user, string CID);
    event PaymentReceived(address user, string CID, uint256 amount);

    constructor(address contentManagerAddress) {
        contentManager = ContentManager(contentManagerAddress);
    }

    // verifica daca contentul exista dupa cid
    modifier onlyValidContent(string memory CID) {
        (address creator,,) = contentManager.getContent(CID);
        require(creator != address(0), "Content does not exist");
        _;
    }

    // verifica daca licenta exista deja, e platita -> se creeaza 
    function issueLicence(address user, string memory CID, uint256 duration) external onlyValidContent(CID) {
        require(licencePayments[CID] > 0, "Licence not paid for");
        require(!licences[user][CID].isValid, "Licence already exists");

        uint256 issueDate = block.timestamp;
        uint256 expiryDate = issueDate + duration;

        licences[user][CID] = Licence({
            issueDate: issueDate,
            expiryDate: expiryDate,
            CID: CID,
            userId: user,
            isValid: true
        });

        contentManager.increaseUsageCount(CID);
        delete licencePayments[CID];

        emit LicenceIssued(user, CID, expiryDate);
    }

    // plata pentru licenta
    function pay(string memory CID) external payable onlyValidContent(CID) {
        (, uint256 price, ) = contentManager.getContent(CID);
        require(msg.value >= price, "Insufficient payment");

        // verifica daca userul deja are o licenta activa
        Licence memory existingLicence = licences[msg.sender][CID];
        require(!existingLicence.isValid, "License already active");

        licencePayments[CID] = msg.value;

        (address creator, , ) = contentManager.getContent(CID);
        (bool success, ) = payable(creator).call{value: msg.value}("");
        require(success, "Payment failed");

        emit PaymentReceived(msg.sender, CID, msg.value);
    }

    // daca exista, atunci se revoca
    function revokeLicence(string memory CID) external {
        require(licences[msg.sender][CID].isValid, "Licence does not exist or already revoked");
        require(licences[msg.sender][CID].userId == msg.sender, "Only licence holder can revoke");
        
        licences[msg.sender][CID].isValid = false;
        
        emit LicenceRevoked(msg.sender, CID);
    }

    // verifica daca licenta este valida
    function verifyLicence(address user, string memory CID) external view returns (bool) {
        Licence memory licence = licences[user][CID];
        return licence.isValid;
    }

    // returneaza detaliile licentei
    function getLicenceDetails(address user, string memory CID) external view returns (Licence memory) {
        return licences[user][CID];
    }
}
