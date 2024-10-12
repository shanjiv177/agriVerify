import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Web3 from "web3";
import abi from "./abi.json";
import { QRCodeCanvas } from "qrcode.react";

function Crop() {
  const { cropHash } = useParams();
  const [cropDetails, setCropDetails] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);

  const contractAddress = "0xE5Eb881e9D0d04AAa08E8BEab388Ffeddf6738b1";

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      const contractInstance = new web3Instance.eth.Contract(abi.abi, contractAddress);
      setContract(contractInstance);
    } else {
      console.error('No Ethereum provider detected');
    }
  }, []);

  useEffect(() => {
    if (contract) {
      fetchCropDetails(cropHash);
    }
  })

  const fetchCropDetails = async (cropHash) => {
    try {
      const crop = await contract.methods.getCrop(cropHash).call();
      setCropDetails(crop);
    } catch (error) {
      console.error("Error fetching crop details:", error);
    }
  };

  return (
    <>
      {cropDetails ? (
        <div className="cropQR">
          <h2>Crop Certification Details</h2>
          <p>
            <strong>Crop ID:</strong> {cropHash}
          </p>
          <p>
            <strong>Crop Name:</strong> {cropDetails.cropName}
          </p>
          <p>
            <strong>Farm Location:</strong> {cropDetails.farmLocation}
          </p>
          <p>
            <strong>Farmer:</strong> {cropDetails.farmer}
          </p>
          <div className="qrCode">
            <h4>QR Code for Crop ID: {cropHash}</h4>
            <QRCodeCanvas value={cropHash} />
            <p>Scan the QR code to view certification details.</p>
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
}

export default Crop;
