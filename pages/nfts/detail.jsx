import axios from 'axios'
import { useRef, useEffect, useState } from 'react'
import Head from "next/head";
import { Button, Dropdown, Modal } from 'flowbite-react';
import { useAccount, useSendTransaction, useContractRead, useConnect, useDisconnect } from 'wagmi';
import { MarketPlaceABI, LeafABI } from '../../utils/abi';
import { BigNumber } from 'ethers';
// import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
// import dynamic from 'next/dynamic';

import { BiLinkExternal } from "react-icons/bi";
import { Alchemy, AlchemySubscription, Network } from 'alchemy-sdk';
import MarketList from '../../components/nfts/marketList';

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");

const contractABI = MarketPlaceABI
const LeafContractABI = LeafABI
const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const REACT_APP_ALCHEMY_URL = process.env.REACT_APP_ALCHEMY_URL;

const Approve = ({collectionAddress, collectionId, setApproved}) =>{


  const web3 = createAlchemyWeb3(REACT_APP_ALCHEMY_URL);
  const contract = new web3.eth.Contract(LeafContractABI.abi, collectionAddress);
  const marketAddress = process.env.MARKET_ADDRESS;
  const { data } = useAccount()
  const { connect, connectors, activeConnector } = useConnect()

  const transactionParameters = {
      to: collectionAddress,
      from: data?.address,
      'data': contract.methods.setApprovalForAll(marketAddress, true).encodeABI(),
      gasPrice: 35000000000,
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
            onSuccess(data) {
              const waitRes = async() =>{
                const wait  = await data.wait()
                if(wait){
                  window.location.reload()
                }
              }
              waitRes()
            },
          })
  



  const { data:readData, isError, isLoading } = useContractRead(
    {
      addressOrName: collectionAddress,
      contractInterface: LeafContractABI.abi
    },
    'isApprovedForAll',
    {
      args: [data.address, marketAddress],
      onSuccess(data) {
        setApproved(data)
      },
    }
    )
  
  const approve = ()=>{
    if(!activeConnector){
      connect(connectors[5])
    }
    sendTransaction()
  }
  return(
    <Button onClick={approve}>Approve</Button>
  )
}

const NftDetail = () => {

  const { data} = useAccount()
  const { connect, connectors, activeConnector, isConnecting} = useConnect()
  const [collection, setCollection] = useState(null);
  const [toAddress, setToAddress]= useState("")
  const [contract, setContact]= useState(false)
  const [collectionId, setCollectionId] = useState(null)
  const [image, setImage] = useState(null)
  const [pdf, setPdf] = useState(null)
  const [word, setword] = useState(null)
  const [video, setVideo] = useState(null)
  const [audio, setAudio] = useState(null)
  const [zip, setZip] = useState(null)
  const [transactionData, setTranscationData] = useState(null)
  const [price, setPrice] = useState(0.001)
  const [show, setShow]= useState(false)
  const [show1, setShow1]= useState(false)
  const [method, setMethod] =useState()
  const [status, setStatus]=useState("")
  const [message, setMessage]=useState("")
  const [listable, setListable] = useState(false)
  const [approved, setApproved] = useState(false)
  const [ids, setIds] = useState([])
  const [amounts, setAmounts] = useState([])

  const [qunatity, setQuantity] = useState({
    'image': 0,
    'pdf': 0,
    'word': 0,
    'mp3': 0,
    'mp4': 0,
    'zip': 0
  })
  const [total, setTotal] = useState(0)
  const [minQty, setMinQty] = useState(1)
  const [balances, setBalances] = useState([])
  const alchemyURL = process.env.REACT_APP_ALCHEMY_URL

  useEffect(()=>{
    setCollectionId(localStorage.getItem('nftId'))
  })
  useEffect(()=>{
    const getNft = async () => {
      try{
        if(collectionId){
          
          const res = await axios.get(`${REACT_APP_BACKEND_URL}/collections/${collectionId}`)
          const collectionData = res.data.data
          if(data?.address){
            const ownedNfts = (await axios.get(`${alchemyURL}/getNFTs?owner=${data?.address}&contractAddresses[]=${collectionData.address}&withTokenBalances=true`)).data.ownedNfts
            if(ownedNfts?.length >= collectionData?.nfts?.length){
              let qty = 1
              let balances = []
              const ids = []
              const amounts = []
              for(let i=0; i < ownedNfts?.length; i++){
                const tokenId = parseInt(ownedNfts[i]?.id?.tokenId, 16)
                const balance = Number(ownedNfts[i]?.balance)||0
                balances[tokenId] = balance
                ids.push(tokenId)
                amounts.push(balance)
                if(i === 0 ){
                  qty = balance
                }
                if(balance<qty){
                  qty= balance
                }
                if(qty === collectionData?.nfts[0]?.quantity){
                  setListable(true)
                }
                setMinQty(qty)
              }
              setIds(ids)
              setAmounts(amounts)
              setBalances(balances)
            }
          }

          setCollection(collectionData)
          const nfts = collectionData.nfts
          await nfts.map((nft)=>{
            if(nft.fileType == 'image'){
              setImage(nft.file)
            }
            if(nft.fileType == 'pdf'){
              setPdf(nft.file)
            }
            if(nft.fileType == 'text'){
              setword(nft.file)
            }
            if(nft.fileType == 'video'){
              setVideo(nft.file)
            }
            if(nft.fileType == 'audio'){
              setAudio(nft.file)
            }
            if(nft.fileType == 'zip'){
              setZip(nft.file)
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

  const contractAddress = process.env.MARKET_ADDRESS;
  const web3 = createAlchemyWeb3(REACT_APP_ALCHEMY_URL);
  useEffect(()=>{
    window.contract = new web3.eth.Contract(contractABI.abi, contractAddress);//loadContract();
    // const receipt = await web3.eth.getTransactionReceipt({hash: txData.hash})
    setContact(true)
    if(!activeConnector&& data?.address){
      connect(connectors[5])
    }
  },[])

  const transactionParameters = {
      to: contractAddress,
      from: data?.address,
      'data': transactionData
  };

  const { data: txData, isSuccess, sendTransaction } =
          useSendTransaction({
          request: transactionParameters,
          onError(error) {
            console.log(error)
              setStatus('error')
              setMessage("Error, Please try again after reload the page")
              if(error.code == "INSUFFICIENT_FUNDS"){
                  alert("Sorry, your wallet has insufficient funds. Please fund your wallet via Binance")
              }
              if(error.includes("insufficient")){
                  alert("Sorry, your wallet has insufficient funds. Please fund your wallet via Binance")
              }
              
            },
          onSuccess(res) {
            const updateCollection = async ()=>{
              setMessage("Please wait for the transaction to complete.")
              const wait = await res.wait()
              const logs = wait?.logs
              const marketId = web3.utils.toNumber(logs[logs.length-2]?.topics[1])

              const resListedData = await axios.post(`${REACT_APP_BACKEND_URL}/collections/add-list/${collectionId}`, 
                {
                  price: price,
                  walletAddress: data?.address,
                  marketId: marketId,
                  total: total
                })
              const resCollectionData = await axios.post(`${REACT_APP_BACKEND_URL}/collections/update/${collectionId}`, 
                {
                  listed: 1, 
                  price: price,
                  txid: txData?.hash
                })
              setStatus('complete')
              setMessage('Successfully listed')
            }
            updateCollection()
          },
          })
          

  const [more, setMore] = useState(false)
  const descriptionText = (value) => {
    if(!more){
      return value.slice(0, 100) + "...."
    }else{
      return value
    }
  }

  const shortText = (value)=>{
    return value?.slice(0, 4) + "...." + value?.slice(-4)
  }

  useEffect(()=>{
    // if(qunatity.image>0){
    //   ids.push(0)
    //   amounts.push(qunatity.image)
    // }
    // if(qunatity.pdf>0){
    //   ids.push(1)
    //   amounts.push(qunatity.pdf)
    // }
    // if(qunatity.word>0){
    //   ids.push(2)
    //   amounts.push(qunatity.word)
    // }
    // if(qunatity.mp3>0){
    //   ids.push(3)
    //   amounts.push(qunatity.mp3)
    // }
    // if(qunatity.mp4>0){
    //   ids.push(4)
    //   amounts.push(qunatity.mp4)
    // }
    // if(qunatity.zip>0){
    //   ids.push(5)
    //   amounts.push(qunatity.zip)
    // }

    if(method==="add"){
      setTranscationData(window.contract.methods.createMarketItem(collection?.address , ids , amounts , BigNumber.from((price*1000000000000000000).toString())).encodeABI())
    }
  },[method, price, qunatity])

  const addMarket = () =>{
    setShow(true)
    if(listable){
      setMethod("add")
    }
  }

  const confirm = () =>{
    if(!activeConnector){
      connect(connectors[5])
    }
    setStatus("wait")
    setMessage("Please confirm in wallet")
    sendTransaction()
  }

  const buyItem = ()=>{
    if(data?.address){
      setShow1(true)
    }
    else{
      alert("please connect wallet")
    }
    
  }

  const onClose = ()=> {
    setShow(false)
    setShow1(false)
    setStatus("")
    setMessage("")
    setMethod()
  }

  const plus = (key, max)=> {
    qunatity[key] =qunatity[key]<max ? qunatity[key]+1: qunatity[key]
    setTotal(total+1)
    setQuantity({
      ...qunatity,
    })
  }
  
  const minus = (key)=> {
    qunatity[key] =qunatity[key]>0 ? qunatity[key]-1: 0
    setTotal(total>0?total-1:total)
    setQuantity({
      ...qunatity,
    })
  }

  const blockChainExplore = process.env.REACT_APP_BLOCK_CHAIN_EXPLORE || "https://mumbai.polygonscan.com/"
  return(
    <div className="container mx-auto">
       <Head>
        <title>{collection?.name}</title>
        <meta name="description" content="Collection Detail" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {collection && (
      <div>
      <div className='md:flex justify-evenly items-start'>
        <div className='md:w-1/2 '>
          <div className=" h-96 border-2 w-auto flex justify-center items-center p-2 m-auto rounded-md shadow-md overflow-hidden">
            <div>
              <img
                className='w-96'
                src={image}
                alt={collection.nfts[0]?.name}
              />  
            </div>
          
          </div>
          {audio && (
            <div className='p-5 w-full'>
              <h1 className='text-lg text-gray-700 p-5 font-bold'>Audio File</h1>
              <audio controls  width="100" className='m-auto'>
                <source src={audio} />
              </audio>
            </div>
          )}
          
        </div>
        <div className='md:w-1/3 p-2 relative '>
          <div className='flex w-full justify-between pb-5 '>
            <div className='w-96 text-center m-auto'>
              <h1 className='text-7xl text-gray-700'>{collection.nfts[0]?.name}</h1>
              <div className="flex justify-around p-5">
                <Button className="w-48 text-center" disabled={!collection.facebook} pill={true} href={collection.facebook}>FaceBook</Button>
                <Button className="w-48 text-center" disabled={!collection.discord} pill={true} href={collection.discord}>Discord</Button>
              </div>
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
            <div className='w-fit text-center mr-5' style={{display: "none"}}>
              <h6 className='text-lg text-gray-700 font-bold'>Owner</h6>
              <h6 className='text-lg font-medium'>{collection?.Owner?.username}</h6>
            </div>
            <div className='w-fit text-center ml-5'>
              <h6 className='text-lg text-gray-700 font-bold'>Network</h6>
              <h6 className='text-lg font-medium'>{collection.nfts[0]?.chain}</h6>
            </div>
          </div>
          <div className='flex justify-around p-2'>
            <h6 className='text-lg text-gray-700 font-bold p-2 w-48'>Contract Address</h6>
            <h6 className='text-lg font-medium text-gray-700 border-2 p-2 w-60 flex justify-center items-center'>
              {shortText(collection.address)}<a href={`${blockChainExplore}/address/${collection.address}`} target="_blank"><BiLinkExternal/></a>
            </h6>
          </div>
          <div className='flex justify-around p-2 hidden'>
            <h6 className='text-lg text-gray-700 font-bold p-2  w-48'>Token-ID</h6>
            <h6 className='text-lg font-medium text-gray-700 border-2 p-2  w-60 text-center'>{collection.nfts[0]?.tokenId}</h6>
          </div>
          {collection.price > 0 && (
            <div className='flex justify-around p-2'>
              <h6 className='text-lg text-gray-700 font-bold p-2  w-48'>Price</h6>
              <h6 className='text-lg font-medium text-gray-700 border-2 p-2  w-60 text-center'>{collection.price} MATIC</h6>
            </div>
          )}

          {
            (collection?.Owner?.walletAddress == data?.address && !approved) &&
            (
              <div className='flex justify-end p-5'>
                <Approve collectionAddress={collection?.address} collectionId={collection?.collectionId} setApproved={setApproved}/>
              </div>
            )
          }
            
          {
            ( approved) &&
            (
              <div className='flex justify-end p-5'>
                <Button onClick={()=>addMarket()}>Add to Market</Button>
                <div className=''>

                  <Modal
                    show={show}
                    position="center"
                    onClose={onClose}
                    size="sm"
                    popup={false}
                  >
                    <Modal.Header>
                      Add to market
                    </Modal.Header>
                    <Modal.Body>
                      {
                        !status && (
                        <div>
                          <div style={{display: "none"}}>

                            <div className="p-2   flex w-100 justify-between items-center">
                              <p>Image ( {balances[0]||0} - owned )</p> 
                              <div className='flex w-100 justify-between items-center'>
                                <Button onClick={()=>minus('image')}>-</Button><p className='p-2'>{qunatity?.image}</p><Button onClick={()=>{plus('image', balances[0])}}>+</Button>
                              </div>
                            </div>
                            <div className="p-2   flex w-100 justify-between items-center">
                              <p>PDF ( {balances[1]||0} - owned )</p> 
                              <div className='flex w-100 justify-between items-center'>
                                <Button onClick={()=>minus('pdf')}>-</Button><p className='p-2'>{qunatity?.pdf}</p><Button onClick={()=>{plus('pdf', balances[2])}}>+</Button>
                              </div>
                            </div>
                            <div className="p-2   flex w-100 justify-between items-center">
                              <p>WORD/TEXT ( {balances[2]||0} - owned )</p> 
                              <div className='flex w-100 justify-between items-center'>
                                <Button onClick={()=>minus('word')}>-</Button><p className='p-2'>{qunatity?.word}</p><Button onClick={()=>{plus('word', balances[3])}}>+</Button>
                              </div>
                            </div>
                            <div className="p-2   flex w-100 justify-between items-center">
                              <p>MP3 ( {balances[3]||0} - owned )</p> 
                              <div className='flex w-100 justify-between items-center'>
                                <Button onClick={()=>minus('mp3')}>-</Button><p className='p-2'>{qunatity?.mp3}</p><Button onClick={()=>{plus('mp3', balances[3])}}>+</Button>
                              </div>
                            </div>
                            <div className="p-2   flex w-100 justify-between items-center">
                              <p>MP4 ( {balances[4]||0} - owned )</p> 
                              <div className='flex w-100 justify-between items-center'>
                                <Button onClick={()=>minus('mp4')}>-</Button><p className='p-2'>{qunatity?.mp4}</p><Button onClick={()=>{plus('mp4', balances[4])}}>+</Button>
                              </div>
                            </div>
                            <div className="p-2 flex w-100 justify-between items-center">
                              <p>Zip ( {balances[5]||0} - owned )</p> 
                              <div className='flex w-100 justify-between items-center'>
                                <Button onClick={()=>minus('zip')}>-</Button><p className='p-2'>{qunatity?.zip}</p><Button onClick={()=>{plus('zip', balances[5])}}>+</Button>
                              </div>
                            </div>
                          </div>
                          
                          {listable ? (
                            <div className=" p-5 mb-4 ">
                              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                              Total Price
                              </label>
                              <input id="price" className='className="shadow appearance-none border w-full rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none   focus:shadow-outline"' value={price} onChange={(e)=>{setPrice(e.target.value)}}/>
                            </div>
                          ):(
                            <p className='text-sm font-medium text-gray-700 p-5 pt-2 w-100 text-center'>
                              Cannot add to the market. Please make sure you owned all nfts from these collection
                            </p>
                          )
                            
                          }
                          
                        </div>
                        ) 
                      }
                      
                    </Modal.Body>
                    <Modal.Body>
                      {
                        message && (
                          <div>
                            { status === 'wait' ?
                            <svg role="status" className="w-8 h-8 m-auto text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                            </svg>:
                            (status === "complete" ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ): (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ))
                            
                            
                            }
                            <p className='text-sm font-medium text-gray-700 p-5 pt-2 w-100 text-center'>{message}</p>
                          </div>
                        )
                      }
                    </Modal.Body>
                    <Modal.Footer>
                    {
                        (!message && listable)  && (
                          <div className='w-full'>
                          <div className='flex justify-between w-100 grow  p-5'>
                            <Button 
                              onClick={confirm}
                            >
                              Confirm
                            </Button>
                            <Button
                              color="gray"
                              onClick={onClose}
                            >
                              Cancel
                            </Button>
                            </div>
                          </div>
                        )
                      }
                    </Modal.Footer>
                  </Modal>
                </div>
              </div>
            )
          }



          

          {
            (collection.listedItems.length> 0) &&
            (
              <div className='flex justify-end p-5'>
                <Button onClick={buyItem}>Buy</Button>
                <Modal
                    show={show1}
                    position="center"
                    onClose={onClose}
                    popup={false}
                    size="sm"

                  >
                    <Modal.Header>
                        Listed Items
                    </Modal.Header>
                    <Modal.Body>
                      {
                        message && (
                          <div>
                            { status === 'wait' ?
                            <svg role="status" className="w-8 h-8 m-auto text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                            </svg>:
                            (status === "complete" ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ): (
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ))
                            }
                            <p className='text-sm font-medium text-gray-700 p-5 pt-2 w-100 text-center'>{message}</p>
                          </div>
                        )
                      }
                      <MarketList lists={collection.listedItems} contractAddress={collection.address} collectionId={collection.collectionId}/>
                    </Modal.Body>
                  </Modal>
              </div>
            )
          }

        </div>
        </div>
        <div className='flex justify-around'>
            <div className='pdf p-5 w-1/2'>
              {pdf&&(
                  <div className='p-5 m-auto rounded-md shadow-md'>
                    <h1 className='text-lg text-gray-700  p-5 font-bold'>PFD File</h1>
                    <iframe title={pdf.name} src={`https://docs.google.com/gview?url=${pdf}&embedded=true`} width="100%" height="500" >
                    </iframe>
                  </div>
                )
              }
            </div>
            <div className='word p-5 w-1/2'>
              {
                word&&
                (
                  <div className='p-5 m-auto rounded-md shadow-md'>
                    <h1 className='text-lg text-gray-700  p-5 font-bold'>Text File</h1>
                    <iframe title={word.name} src={`https://docs.google.com/gview?url=${word}&embedded=true`} width="100%" height="500" >
                    </iframe>
                  </div>
                )
              }
            </div>
          </div>
          {
            video &&(
              <div className='p-5 w-full'>
                <h1 className='text-lg text-gray-700 p-5 font-bold'>Video File</h1>
                <video controls  width="500" height="500">
                  <source src={video} />
                </video>
              </div>
            )
          }
          {
            zip &&(
              <div className='p-5 w-full'>
                <h1 className='text-lg text-gray-700 p-5 font-bold'>ZIP File</h1>
                <Button href={zip}>Download Zip</Button>
              </div>
            )
          }
      </div>
      )}
    </div>
  )
}

export default NftDetail