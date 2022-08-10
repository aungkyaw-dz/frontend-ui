import axios from 'axios'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from "next/head";
import Link from 'next/link';
import { Button, Dropdown } from 'flowbite-react';
import { useAccount, useSendTransaction } from 'wagmi';
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");

const contractABI = require('../../UrbanTechNFT.json')
const API_URL = process.env.API_URL

const NftDetail = () => {
  const [collection, setCollection] = useState(null);
  const [toAddress, setToAddress]= useState("")
  const { data } = useAccount()
  const [contract, setContact]= useState(false)
  const [collectionId, setCollectionId] = useState(null)
  const [image, setImage] = useState(null)
  const [pdf, setPdf] = useState(null)
  const [word, setword] = useState(null)
  const [video, setVideo] = useState(null)

  
  useEffect(()=>{
    setCollectionId(localStorage.getItem('nftId'))
  })
  useEffect(()=>{
    const getNft = async () => {
      try{
        if(collectionId){
          const res = await axios.get(`${API_URL}/collections/${collectionId}`)
          setCollection(res.data.data)
          const nfts = res.data.data.nfts
          await nfts.map((nft)=>{
            if(nft.fileType == 'image'){
              setImage(nft.file)
            }
            if(nft.fileType == 'application'){
              setPdf(nft.file)
            }
            if(nft.fileType == 'text'){
              setword(nft.file)
            }
            if(nft.fileType == 'video'){
              setVideo(nft.file)
            }
          })
        }
      }
      catch(err) {
        console.log(err)
      }
   }
    getNft()
  },[collectionId])
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const API_URL = process.env.API_URL;
  const web3 = createAlchemyWeb3(API_URL);
  console.log(image)
                console.log(pdf)
                console.log(word)
  useEffect(()=>{
    window.contract = new web3.eth.Contract(contractABI.abi, contractAddress);//loadContract();
    // const receipt = await web3.eth.getTransactionReceipt({hash: txData.hash})
    setContact(true)
  },[])
  // useEffect(()=>{
  //   const updateTokenId = async()=>{
  //     if(nft && collection.nfts[0]?.tokenId === 0){
  //       const requestData = {
  //           "jsonrpc":"2.0",
  //           "method":"eth_getTransactionReceipt",
  //           "params":[collection.nfts[0]?.txid],
  //           "id":0
  //       }
  //       const receipt = await axios.post("https://polygon-mumbai.g.alchemy.com/v2/frVV_vKK1_Pf-JkOiqzzn3L9Z9RSKNh1", requestData)
  //       const tokenId = web3.utils.hexToNumber(receipt.data.result?.logs[0].topics[3])
  //       const updateData = {
  //         tokenId: tokenId
  //       }
  //       const nftRes = await axios.post(`${API_URL}/nfts/update/${nftId}`, updateData)
  //       setNft(nftRes.data.data)
  //     }
  //   }
  //   updateTokenId()
  // },[nft])
  const transactionParameters = {
      to: contractAddress,
      from: data?.address,
      'data': toAddress? window.contract.methods.safeTransferFrom(data.address, toAddress, nft?.tokenId).encodeABI(): ""
  };
  const { data: txData, isSuccess, sendTransaction } =
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
          
  const transferNft = async () =>{
    if(data){
      sendTransaction()
      const userAddress = data.address
      if(userAddress== collection.nfts[0]?.Owner.walletAddress){
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
  const [more, setMore] = useState(false)
  const descriptionText = (value) => {
    if(!more){
      return value.slice(0, 100) + "...."
    }else{
      return value
    }
  }

  const shortText = (value)=>{
    return value.slice(0, 4) + "...." + value.slice(-4)
  }

  return(
    <div className="container mx-auto">
       <Head>
        <title>{collection?.name}</title>
        <meta name="description" content="Collection Detail" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {collection && (

      <div className='md:flex justify-evenly items-start'>
        <div className='md:w-2/3 '>
          <div className="w-96 h-100  border-2  p-2 m-auto rounded-md shadow-md">
            <img
              src={image}
              alt={collection.nfts[0]?.name}
            />  
          </div>
          <div className='w-full hidden'>
            <audio controls className='m-auto'>
              <source src="horse.ogg" type="audio/ogg"/>
              <source src="horse.mp3" type="audio/mpeg"/>
            </audio>
          </div>
          <div className='flex justify-around'>
          <div className='pdf p-5 w-1/2'>
            <h1 className='text-lg text-gray-700 font-bold'>PFD File</h1>
            <div className='p-2 m-auto rounded-md shadow-md'>
              <iframe title={pdf.name} src={pdf} width="100%" height="480" allow="autoplay"></iframe>
            </div>
          </div>
          <div className='word p-5 w-1/2'>
            <h1 className='text-lg text-gray-700 font-bold'>Text File</h1>
            <div className='p-2 m-auto rounded-md shadow-md'>
            <object data={word} width="100%" height="200">
              Not supported
            </object>
          </div>
          </div>
          </div>
        </div>
        <div className='md:w-1/3 p-2 relative '>
          <div className='flex w-full justify-between pb-5 '>
            <div className='w-96 text-center m-auto'>
              <h1 className='text-7xl text-gray-700'>{collection.nfts[0]?.name}</h1>
              {collection.description.length > 100 ? (
                <div>
                  <h5 className='text-xl text-gray-700'>{descriptionText(collection.description)}</h5>
                  {more === false ? <p className='cursor-pointer text-sky-400/100' onClick={()=>setMore(true)}>read more!</p> :<p className='cursor-pointer text-sky-400/100' onClick={()=>setMore(false)}>show less</p>}
                </div>
              ): (
                <h5 className='text-xl text-gray-700'>{collection.description}</h5>
              )}
              </div>
            <div className='absolute right-0'>
            {/* {data?.address === collection?.Owner?.walletAddress && 
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
            } */}
            </div>
          </div>
        {/* <div className='grid md:grid-cols-2 gap-4 mt-10 w-1/2'>
          <h6 className='text-lg text-gray-500 font-bold'>NFT Type:</h6>
          <h6 className='text-lg text-gray-500'>{collection.nfts[0]?.nftType}</h6>
          <h6 className='text-lg text-gray-500 font-bold'>Owner:</h6>
          <h6 className='text-lg text-gray-500'>{collection.nfts[0]?.Owner?.username||collection.nfts[0]?.owner}</h6>
          <h6 className='text-lg text-gray-500 font-bold'>Creator:</h6>
          <h6 className='text-lg text-gray-500'>{collection.nfts[0]?.Creator?.username||collection.nfts[0]?.creator}</h6>
          {collection.nfts[0]?.nftType != "FREE" && 
            <>
              <h6 className='text-lg text-gray-500 font-bold'>Price:</h6>
              <h6 className='text-lg text-gray-500'>{collection.nfts[0]?.price}</h6>
            </>
          }
          <h6 className='text-lg text-gray-500 font-bold'>Total Viewed:</h6>
          <h6 className='text-lg text-gray-500'>{collection.nfts[0]?.viewed}</h6>
        </div> */}
          <div className='flex justify-around'>
            <h6 className='text-lg text-gray-700 font-bold p-2'>Minted Date</h6>
            <h6 className='text-lg font-medium text-gray-700 border-2 p-2 w-100'>{collection.nfts[0]?.createdAt}</h6>
          </div>
          <div className='flex p-5 justify-around'>
            <div className='w-fit text-center mr-5'>
              <h6 className='text-lg text-gray-700 font-bold'>Owner</h6>
              <h6 className='text-lg font-medium'>{collection.nfts[0]?.Owner?.username}</h6>
            </div>
            <div className='w-fit text-center ml-5'>
              <h6 className='text-lg text-gray-700 font-bold'>Network</h6>
              <h6 className='text-lg font-medium'>{collection.nfts[0]?.chain}</h6>
            </div>
          </div>
          <div className='flex justify-around p-2'>
            <h6 className='text-lg text-gray-700 font-bold p-2 w-48'>Contract Address</h6>
            <h6 className='text-lg font-medium text-gray-700 border-2 p-2 w-60 text-center'>{shortText(collection.address)}</h6>
          </div>
          <div className='flex justify-around p-2 hidden'>
            <h6 className='text-lg text-gray-700 font-bold p-2  w-48'>Token-ID</h6>
            <h6 className='text-lg font-medium text-gray-700 border-2 p-2  w-60 text-center'>{collection.nfts[0]?.tokenId}</h6>
          </div>
            
        </div>
      </div>
      )}
    </div>
  )
}

export default NftDetail