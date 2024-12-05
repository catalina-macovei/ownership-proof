// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ContentManager.sol";

contract LicenceManager is Ownable {
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

    event LicenceIssued(
        address indexed user,
        string indexed CID,
        uint256 expiryDate
    );
    event LicenceRevoked(address indexed user, string indexed CID);
    event PaymentReceived(
        address indexed user,
        string indexed CID,
        uint256 amount
    );

    constructor(
        address initialOwner,
        address contentManagerAddress
    ) Ownable(initialOwner) {
        contentManager = ContentManager(contentManagerAddress);
    }

    modifier onlyValidContent(string memory CID) {
        (address creator, , ) = contentManager.getContent(CID);
        require(creator != address(0), "Content does not exist");
        _;
    }

    function issueLicence(
        address user,
        string memory CID,
        uint256 durationInDays
    ) external onlyValidContent(CID) {
        require(licencePayments[CID] > 0, "Licence not paid for");
        require(!licences[user][CID].isValid, "Licence already exists");

        uint256 issueDate = block.timestamp;
        uint256 expiryDate = issueDate + (durationInDays * 1 days); // Convert days to seconds

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

    // Check if the user already has a valid license
    Licence memory existingLicence = licences[msg.sender][CID];
    require(!existingLicence.isValid, "License already active");

    licencePayments[CID] = msg.value;

    (address creator, , ) = contentManager.getContent(CID);
    (bool success, ) = payable(creator).call{value: msg.value}("");
    require(success, "Payment failed");

    emit PaymentReceived(msg.sender, CID, msg.value);
    }


    function revokeLicence(address user, string memory CID) external onlyOwner {
        require(
            licences[user][CID].isValid,
            "Licence does not exist or already revoked"
        );

        licences[user][CID].isValid = false;

        emit LicenceRevoked(user, CID);
    }

    function verifyLicence(
        address user,
        string memory CID
    ) external view returns (bool) {
        Licence memory licence = licences[user][CID];
        return licence.isValid && licence.expiryDate > block.timestamp;
    }

    function getLicenceDetails(
        address user,
        string memory CID
    ) external view returns (Licence memory) {
        return licences[user][CID];
    }
}
