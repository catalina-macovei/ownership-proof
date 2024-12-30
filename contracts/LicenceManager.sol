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
    mapping(address => string[]) private ownedLicencesCids;

    event LicenceIssued(address indexed user, string indexed CID, uint256 expiryDate);
    event LicenceRevoked(address indexed user, string indexed CID);
    event PaymentReceived(address indexed user, string indexed CID, uint256 amount);

    constructor(address contentManagerAddress) {
        contentManager = ContentManager(contentManagerAddress);
    }

    // Modifier to validate content existence
    modifier onlyValidContent(string memory CID) {
        (address creator, , , ,) = contentManager.getContent(CID);
        require(creator != address(0), "Content does not exist");
        _;
    }

    // Issue a new license
    function issueLicence(address user, string memory CID, uint256 duration) external onlyValidContent(CID) {
        require(licencePayments[CID] > 0, "Licence not paid for");
        require(!licences[user][CID].isValid, "Licence already exists");

        uint256 issueDate = block.timestamp;
        uint256 expiryDate = calculateExpiryDate(issueDate, duration);

        if (licences[user][CID].userId == address(0)) {
            ownedLicencesCids[user].push(CID);
        }

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

    // Pay for a license
    function pay(string memory CID) external payable onlyValidContent(CID) {
        (, uint256 price, , ,) = contentManager.getContent(CID);
        require(msg.value >= price, "Insufficient payment");

        Licence memory existingLicence = licences[msg.sender][CID];
        require(!existingLicence.isValid, "License already active");

        licencePayments[CID] = msg.value;

        (address creator, , , ,) = contentManager.getContent(CID);
        (bool success, ) = payable(creator).call{value: msg.value}("");
        require(success, "Payment failed");

        emit PaymentReceived(msg.sender, CID, msg.value);
    }

    // Revoke an existing license
    function revokeLicence(string memory CID) external {
        require(licences[msg.sender][CID].isValid, "Licence does not exist or already revoked");
        require(licences[msg.sender][CID].userId == msg.sender, "Only licence holder can revoke");

        licences[msg.sender][CID].isValid = false;

        emit LicenceRevoked(msg.sender, CID);
    }

    // Verify if a license is valid
    function verifyLicence(address user, string memory CID) external view returns (bool) {
        Licence memory licence = licences[user][CID];
        return licence.isValid;
    }

    // Get details of a specific license
    function getLicenceDetails(address user, string memory CID) external view returns (Licence memory) {
        return licences[user][CID];
    }

    // Get all licenses owned by a user
    function getLicencesForUser(address user) external view returns (Licence[] memory) {
        uint size = ownedLicencesCids[user].length;
        Licence[] memory ownedLicences = new Licence[](size);
        for (uint i = 0; i < size; i++) {
            ownedLicences[i] = licences[user][ownedLicencesCids[user][i]];
        }
        return ownedLicences;
    }

    function calculateExpiryDate(uint256 issueDate, uint256 duration) private pure returns (uint256 expiryDate) {
        expiryDate = issueDate + duration;
    }
}
