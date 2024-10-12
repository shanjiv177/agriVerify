// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// Uncomment this line to use console.log
import "hardhat/console.sol";

// Contract to certify Crops
contract CertCrop {
    uint public certifiedCrops = 0;

    struct Farmer {
        string name;
    }

    struct Crop {
        string cropName;
        string farmLoc;
        address farmer;
    }

    mapping(address => Farmer) public farmers;

    mapping(address => bytes32[]) public cropList;

    mapping(bytes32 => Crop) public cropDetails;

    event CropCertified(
        bytes32 indexed cropId,
        string cropName,
        string farmLoc,
        address indexed farmer
    );

    function SignUp(string memory _name) public {
        farmers[msg.sender] = Farmer(_name);
    }

    function certifyCrop(
        string memory _cropName,
        string memory _farmLoc
    ) public {
        require(bytes(_cropName).length > 0, "Crop name is required");
        require(bytes(_farmLoc).length > 0, "Farm location is required");
        require(
            bytes(farmers[msg.sender].name).length > 0,
            "Farmer not registered"
        );

        bytes32 cropId = keccak256(
            abi.encodePacked(_cropName, _farmLoc, msg.sender, block.timestamp)
        );
        cropDetails[cropId] = Crop(_cropName, _farmLoc, msg.sender);
        cropList[msg.sender].push(cropId);

        emit CropCertified(cropId, _cropName, _farmLoc, msg.sender);
        certifiedCrops++;
    }

    function getCrop(
        bytes32 cropId
    ) public view returns (string memory, string memory, address) {
        Crop memory crop = cropDetails[cropId];
        return (crop.cropName, crop.farmLoc, crop.farmer);
    }

    function getFarmerCrops(
        address farmer
    ) public view returns (bytes32[] memory) {
        return cropList[farmer];
    }
}
