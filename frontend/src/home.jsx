import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './home.css'
import Web3 from 'web3'
import abi from './abi.json'
import { QRCodeCanvas } from "qrcode.react";

function Home() {
  const [account, setAccount] = useState('');
  const [farmerName, setFarmerName] = useState();
  const [newFarmerName, setNewFarmerName] = useState();
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [cropName, setCropName] = useState('');
  const [prevCrop, setPrevCrop] = useState();
  const [farmerCrops, setFarmerCrops] = useState([]);
  const [farmLocation, setFarmLocation] = useState('');

  const contractAddress = '0xE5Eb881e9D0d04AAa08E8BEab388Ffeddf6738b1';

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
    connectWallet();
  })

  const connectWallet = async () => {
    if (web3) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        getFarmerName(accounts[0]);
        await getFarmerCrops(accounts[0]);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getFarmerName = async (account) => {
    if (contract) {
      const name = await contract.methods.farmers(account).call();
      if (name) {
        setFarmerName(name);
      }
      else {
        console.log("Name not present");
      }
    }
  }

  const handleSignUp = async () => {
    if (contract && newFarmerName) {
      await contract.methods.SignUp(newFarmerName).send({ from: account });
      setFarmerName(newFarmerName);
    }
  }

  const handleCertCrop = async (cropName, farmLocation) => {
    if (contract && cropName && farmLocation) {
      try {
        await contract.methods.certifyCrop(cropName, farmLocation).send({ from: account })
          .once('receipt', (receipt) => {
            const event = receipt.events.CropCertified;
            const cropId = event.returnValues.cropId;
            const prevCrop = {
              cropHash: cropId,
              cropName: cropName,
              farmLocation: farmLocation,
              farmer: account,
            }   
            setPrevCrop(prevCrop);
          });

        await getFarmerCrops(account);

        setCropName('');
        setFarmLocation('');
      } catch (error) {
        console.error('Error certifying crop:', error);
      }
    }
  };

  const getFarmerCrops = async (account) => {
    if (contract) {
      const cropIds = await contract.methods.getFarmerCrops(account).call();
      const newCrops = await Promise.all(cropIds.map(async (cropId) => {
        const crop = await contract.methods.getCrop(cropId).call();
        return {
          cropHash: cropId,
          cropName: crop[0],
          farmLocation: crop[1],
          farmer: crop[2],
        };
      }))

      setFarmerCrops(newCrops);
    }
  };


  return (
    <div className="container">
      <div className="walletConnect">
        <h3>Connect Your Wallet</h3>
        <button onClick={connectWallet}>Connect Wallet</button>
        {account && <p>Connected Account: {account}</p>}
      </div>
      <div className="verifyProduce">
        <h3>Verify the Agricultural Produce</h3>
        {farmerName ? <p>Welcome, {farmerName}!</p> : <>
          <h4>Enter your Name: </h4>
          <input
              type="text"
              value={newFarmerName}
              onChange={(e) => setNewFarmerName(e.target.value)}
            />
            <button onClick={handleSignUp}>Sign Up</button>
        </>}
        <div className="cropName">
          <h4>Crop Name :</h4>
          <input type="text" name="cropName" id="cropName" onChange={(e) => setCropName(e.target.value)} value={cropName}/>
        </div>
        <div className="farmLocation">
          <h4>Farm Location :</h4>
          <input type="text" name="farmLocation" id="farmLocation" onChange={(e) => setFarmLocation(e.target.value)} value={farmLocation}/>
        </div>
        <button onClick={() => handleCertCrop(cropName, farmLocation)}>Verify</button>
      </div>

      {prevCrop && (
        <div className='prev-crop'>
          <h4>Last certified crop details:</h4>
          <p>
            <strong>Crop Name:</strong> {prevCrop.cropName}
          </p>
          <p>
            <strong>Farm Location:</strong> {prevCrop.farmLocation}
          </p>
          <p>
            <strong>Farmer:</strong> {prevCrop.farmer}
          </p>
          <div className="qrCode">
            <h4>QR Code for Crop ID: {prevCrop.cropHash}</h4>
            <QRCodeCanvas value={`https://localhost:5173/crops/${prevCrop.cropHash}`} />
            <p>Scan the QR code to view certification details.</p>
          </div>
        </div>
      )}

      <div className="farmerCrops">
          <h4>Your Certified Crops:</h4>
          <table>
            <thead>
              <tr>
                <th>Crop ID</th>
                <th>Crop Name</th>
                <th>Farm Location</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {farmerCrops.map((crop, index) => (
                <tr key={index}>
                  <td>{crop.cropHash}</td>
                  <td>{crop.cropName}</td>
                  <td>{crop.farmLocation}</td>
                  <td>
                    <Link to={`/crops/${crop.cropHash}`}>
                      <button>View More</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  )
}

export default Home
