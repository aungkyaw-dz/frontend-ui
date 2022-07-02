import { pinFileToIPFS, pinJSONToIPFS } from "./pinata";
import axios from "axios";
import { useAccount, useSendTransaction, useConnect  } from 'wagmi';
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const contractABI = require('../UrbanTechNFT.json')
const contractAddress = process.env.CONTRACT_ADDRESS;
const API_URL = process.env.API_URL;

export const SingleMint = async (file, data) => {
  try{

    const createData = {
      name: data.name,
      description: data.description,
      price: data.price,
      collectionName: data.collectionName,
      collectionDesc: data.collectionDesc,
      creator: data.creator,
      owner: data.owner
    } 
    
    const nftRes = await axios.post('http://localhost:3001/nfts/create', createData)
    let fileData = new FormData();
    fileData.append("file", file);
    const fileName = JSON.stringify({
      name: data.name,
    })
    fileData.append("pinataMetadata", fileName)
    const fileUploadRes = await pinFileToIPFS(fileData);
      if (!fileUploadRes.success) {
          return {
              success: false,
              status: "😢 Something went wrong while uploading your tokenURI.",
          }
      }
    const fileURI = fileUploadRes.pinataUrl
    const  metaData = new Object();
    metaData.name = data.name;
    metaData.image = fileURI
    metaData.description = data.description;
    metaData.link = data.description;
    metaData.price = data.price;
    const pinataResponse = await pinJSONToIPFS(metaData);
    if (!pinataResponse.success) {
        return {
            success: false,
            status: "😢 Something went wrong while uploading your tokenURI.",
        }
    }
    const tokenURI = pinataResponse.pinataUrl;
    
    const transactionParameters = {
        to: contractAddress,
        from: data.creator,
        'data': window.contract.methods.mint(tokenURI).encodeABI()
    };
    const { data: txData,  isIdle, isError, isLoading, isSuccess, sendTransaction } =
            useSendTransaction({
            request: transactionParameters,
            onError(error) {
                if(error.code == "INSUFFICIENT_FUNDS"){
                    alert("Sorry, your wallet has insufficient funds. Please fund your wallet via Binance")
                }
                if(error.includes("insufficient")){
                    alert("Sorry, your wallet has insufficient funds. Please fund your wallet via Binance")
                }
              },
            })
    sendTransaction()
    console.log(txData)
    const updateData = {
      tokenUri: tokenURI,
      logo: fileURI,
      banner: fileURI,
    }
    const updatedRes = await axios.post(`http://localhost:3001/nfts/update/${nftRes.data.data.nftId}`, updateData)
    alert("Minted Nft")
    return updatedRes
  }catch(err){
    return err
  }

  
}