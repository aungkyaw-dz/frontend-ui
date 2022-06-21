import axios from 'axios'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from "next/head";
import Link from 'next/link';
import { Dropdown } from 'flowbite-react';
import { useAccount, useSendTransaction } from 'wagmi';
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");

const contractABI = require('../../UrbanTechNFT.json')
const API_URL = process.env.API_URL

const NftDetail = () => {
  const [nft, setNft] = useState(null);
  const [toAddress, setToAddress]= useState("")
  const { data } = useAccount()
  const [contract, setContact]= useState(false)
  const [nftId, setNftId] = useState(null)
  
  useEffect(()=>{
    setNftId(localStorage.getItem('nftId'))
  })
  useEffect(()=>{
    const getNft = async () => {
      try{
        if(nftId){
          const res = await axios.get(`${API_URL}/nfts/${nftId}`)
          setNft(res.data.data)
        }
      }
      catch(err) {
        console.log(err)
      }
   }
    getNft()
  },[nftId])

  const contractAddress = process.env.CONTRACT_ADDRESS;
  const API_URL = process.env.API_URL;
  const web3 = createAlchemyWeb3(API_URL);
  useEffect(()=>{
    window.contract = new web3.eth.Contract(contractABI.abi, contractAddress);//loadContract();
    // const receipt = await web3.eth.getTransactionReceipt({hash: txData.hash})
    setContact(true)
  },[])
  useEffect(()=>{
    const updateTokenId = async()=>{
      console.log(nft?.tokenId)
      if(nft && nft.tokenId === 0){
        const requestData = {
            "jsonrpc":"2.0",
            "method":"eth_getTransactionReceipt",
            "params":[nft.txid],
            "id":0
        }
        const receipt = await axios.post("https://polygon-mumbai.g.alchemy.com/v2/frVV_vKK1_Pf-JkOiqzzn3L9Z9RSKNh1", requestData)
        const tokenId = web3.utils.hexToNumber(receipt.data.result?.logs[0].topics[3])
        console.log(receipt)
        const updateData = {
          tokenId: tokenId
        }
        const nftRes = await axios.post(`${API_URL}/nfts/update/${nftId}`, updateData)
        console.log(nftRes.data.data)
        setNft(nftRes.data.data)
      }
    }
    updateTokenId()
  },[nft])
  const transactionParameters = {
      to: contractAddress,
      from: data?.address,
      'data': toAddress? window.contract.methods.safeTransferFrom(data.address, toAddress, nft?.tokenId).encodeABI(): ""
  };
  const { data: txData, isSuccess, sendTransaction } =
          useSendTransaction({
          request: transactionParameters,
          onError(error) {
            console.log(transactionParameters)
              if(error.code == "INSUFFICIENT_FUNDS"){
                  alert("Sorry, your wallet has insufficient funds. Please fund your wallet via Binance")
              }
              if(error.includes("insufficient")){
                  alert("Sorry, your wallet has insufficient funds. Please fund your wallet via Binance")
              }
            },
          })
  const transferNft = async () =>{
    if(data){
      sendTransaction()
      const userAddress = data.address
      if(userAddress== nft.Owner.walletAddress){
        const updateData = {
          user: userAddress,
          transferTo: toAddress
        }
        const res = await axios.post(`${API_URL}/nfts/transfer/${nftId}`, updateData)
        if(res){
          alert("transfer Complete")
        }
      }

    }else{
      alert("please Connect Wallet")
    }
  }
  useEffect(()=>{
    if(isSuccess){
      console.log('NFT Transfer Complete')
    }
  },[isSuccess])

  useEffect(()=>{
    if(nft){
      const a = async () =>{
        console.log(nft.txid)
      }
      a()
    }
  },[nft])

  return(
    <div className="container mx-auto">
       <Head>
        <title>{nft?.name}</title>
        <meta name="description" content="Collection Detail" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {nft && (

      <div className='flex'>
        <div className='group relative border-2 border-slate-400 p-2 rounded-md shadow-md cursor-pointer'>
          <div className="w-full">
            <img
              src={nft.logo}
              alt={nft.name}
            />
          </div>
        </div>
        <div className='w-full p-10'>
        <div className='flex w-full justify-between'>
          <div>
            <h1 className='text-7xl text-gray-700'>{nft.title}</h1>
            <p className='mt-10'>description</p>
            <h5 className='text-3xl text-gray-700'>{nft.description}</h5>
          </div>
          <div>
          {data?.address === nft?.Owner?.walletAddress && 
            <Dropdown label="Transfer NFT">
              <Dropdown.Header>
              <input className="shadow appearance-none border w-full rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none   focus:shadow-outline" 
              id="name" 
              name='name'
              value={toAddress}
              onChange={(e)=>setToAddress(e.target.value)}
              onBlur={(e)=>setToAddress(e.target.value)}
              placeholder="address"/>
              <button className='' onClick={transferNft}>Transer</button>
              </Dropdown.Header>
            </Dropdown>
          }
          </div>
        </div>
        <div className='grid grid-cols-2 gap-4 mt-10 w-1/2'>
          <h6 className='text-lg text-gray-500 font-bold'>NFT Type:</h6>
          <h6 className='text-lg text-gray-500'>{nft.nftType}</h6>
          <h6 className='text-lg text-gray-500 font-bold'>Owner:</h6>
          <h6 className='text-lg text-gray-500'>{nft.Owner?.username||nft.owner}</h6>
          <h6 className='text-lg text-gray-500 font-bold'>Creator:</h6>
          <h6 className='text-lg text-gray-500'>{nft.Creator?.username||nft.creator}</h6>
          {nft.nftType != "FREE" && 
            <>
              <h6 className='text-lg text-gray-500 font-bold'>Price:</h6>
              <h6 className='text-lg text-gray-500'>{nft.price}</h6>
            </>
          }
          <h6 className='text-lg text-gray-500 font-bold'>Total Viewed:</h6>
          <h6 className='text-lg text-gray-500'>{nft.viewed}</h6>
        </div>
        </div>
      </div>
      )}
    </div>
  )
}

export default NftDetail