import axios from 'axios'
import { useRef, useEffect, useState } from 'react'
import Head from "next/head";
import { Button, Dropdown, Modal } from 'flowbite-react';
import { useAccount, useSendTransaction, useWaitForTransaction, useConnect, useDisconnect } from 'wagmi';
import { MarketPlaceABI, LeafABI } from '../../utils/abi';
// import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
// import dynamic from 'next/dynamic';

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");

const contractABI = MarketPlaceABI
const LeafContractABI = LeafABI
const API_URL = process.env.API_URL

const Approve = ({collectionAddress, collectionId}) =>{
  const web3 = createAlchemyWeb3(API_URL);
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
            const updateCollection = async ()=>{
                const resData = await axios.post(`${API_URL}/collections/update/${collectionId}`, {approved: 1})
            }
            updateCollection()
            console.log('Success', data)
          },
          })
  const {data: wait} = useWaitForTransaction({
    hash: txData?.hash,
    onSuccess(data) {
      window.location.reload()
      console.log('Success', data)
    },
  })
  
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
  console.log(isConnecting)
  const [collection, setCollection] = useState(null);
  const [toAddress, setToAddress]= useState("")
  const [contract, setContact]= useState(false)
  const [collectionId, setCollectionId] = useState(null)
  const [image, setImage] = useState(null)
  const [pdf, setPdf] = useState(null)
  const [word, setword] = useState(null)
  const [video, setVideo] = useState(null)
  const [transactionData, setTranscationData] = useState(null)
  const [price, setPrice] = useState(0.001)
  const [show, setShow]= useState(false)
  const [show1, setShow1]= useState(false)
  const [method, setMethod] =useState()
  const [status, setStatus]=useState("")
  const [message, setMessage]=useState("")

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

  const contractAddress = process.env.MARKET_ADDRESS;
  const API_URL = process.env.API_URL;
  const web3 = createAlchemyWeb3(API_URL);
  
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
      value: method === "buy" ? `0x${(collection.price*1000000000000000000).toString(16)}`:`0x${(0).toString(16)}`,
      'data': transactionData
  };

  const { data: txData, isSuccess, sendTransaction } =
          useSendTransaction({
          request: transactionParameters,
          onError(error) {
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
              if(method==="add"){
                const resData = await axios.post(`${API_URL}/collections/update/${collectionId}`, 
                {
                  listed: 1, 
                  price: price,
                  txid: txData?.hash
                })
              }
              if(method==="buy"){
                const resData = await axios.post(`${API_URL}/collections/update/${collectionId}`, 
                { approved: false, 
                  listed: false,
                  owner: data?.address
                })
              }
            }
            updateCollection()
            console.log('Success', res)
          },
          })
          
  const {data:wait} = useWaitForTransaction({
    hash: txData?.hash
  })


  useEffect(()=>{
    if(wait){
      const updateCollection = async ()=>{
        const logs = wait?.logs
        if(method==="add"){
          const marketId = web3.utils.toNumber(logs[logs.length-2]?.topics[1])
          const resData = await axios.post(`${API_URL}/collections/update/${collectionId}`, 
                {marketId: marketId}
                )
          if(!resData.data.error){
            setStatus('complete')
            setMessage('Successfully listed to marketplace')
          }
        }
        if(method==="buy"){
          setStatus('complete')
          setMessage('Yay, successfully bought')
        }
      }
      updateCollection()
    }
  },[wait])

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
    if(method==="add"){
      setTranscationData(window.contract.methods.createMarketItem(collection?.address , 1 , (price*1000000000000000000)).encodeABI())
    }
    if(method==='buy'){
      setTranscationData(window.contract.methods.createMarketSale(collection?.address , collection?.marketId ).encodeABI())
    }
  },[method,price])

  const addMarket = () =>{
    setShow(true)
    setMethod("add")
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
      setMethod("buy")
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
    window.location.reload()
  }

  const ImageInput = useRef(null)
  const pdfInput = useRef(null)
  const wordInput = useRef(null)
  const videoInput = useRef(null)
  
  const uploadMp4 =  (e) => {
    if(e.target.files && e.target.files[0]){
      var filesize = ((e.target.files[0].size/1024)/1024).toFixed(4)
      if(filesize<25){
        setVideo(e.target.files[0])
      }else{
        alert('excess max size')
      }
      
    }
  }
  const uploadPdf =  (e) => {
    if(e.target.files && e.target.files[0]){
      var filesize = ((e.target.files[0].size/1024)/1024).toFixed(4)
      if(filesize<25){
        setPdf(e.target.files[0])
      }else{
        alert('excess max size')
      }
      
    }
  }

  const uploadWord =  (e) => {
    if(e.target.files && e.target.files[0]){
      var filesize = ((e.target.files[0].size/1024)/1024).toFixed(4)
      if(filesize<25){
        setWord(e.target.files[0])
      }else{
        alert('excess max size')
      }
      
    }
  }

  
  const docs = [
    { uri: word },
  ]

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
        <div className='md:w-2/3  h-96 flex items-center'>
          <div className="  border-2  p-2 m-auto rounded-md shadow-md">
            <div className='flex justify-center'>
            <img
              className='w-96'
              src={image}
              alt={collection.nfts[0]?.name}
            />  
          </div>
          </div>
          
          
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
            <div className='w-fit text-center mr-5'>
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
            <h6 className='text-lg font-medium text-gray-700 border-2 p-2 w-60 text-center'>{shortText(collection.address)}</h6>
          </div>
          <div className='flex justify-around p-2 hidden'>
            <h6 className='text-lg text-gray-700 font-bold p-2  w-48'>Token-ID</h6>
            <h6 className='text-lg font-medium text-gray-700 border-2 p-2  w-60 text-center'>{collection.nfts[0]?.tokenId}</h6>
          </div>
          {
            (collection.Owner?.walletAddress === data?.address && collection.approved && !collection.listed) &&
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
                        <div className=" p-5 mb-4 ">
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                            Price
                          </label>
                          <input id="price" className='className="shadow appearance-none border w-full rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none   focus:shadow-outline"' value={price} onChange={(e)=>{setPrice(e.target.value)}}/>
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
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ): (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
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
                        !message && (
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
            (collection.Owner?.walletAddress === data?.address && !collection.approved) &&
            (
              <div className='flex justify-end p-5'>
                <Approve collectionAddress={collection?.address} collectionId={collection?.collectionId}/>
              </div>
            )
          }

          

          {
            (collection.Owner?.walletAddress != data?.address && collection.listed) &&
            (
              <div className='flex justify-end p-5'>
                <Button onClick={buyItem}>Buy</Button>
                <Modal
                    show={show1}
                    position="center"
                    onClose={onClose}
                    size="sm"
                    popup={false}
                  >
                    <Modal.Header>
                      Confirmation to buy
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
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ): (
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ))
                            }
                            <p className='text-sm font-medium text-gray-700 p-5 pt-2 w-100 text-center'>{message}</p>
                          </div>
                        )
                      }
                      
                    </Modal.Body>
                    <Modal.Footer className="justify-around">
                      {
                        !message && (
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
            )
          }

        </div>
        </div>
        <div className='flex justify-around'>
            <div className='pdf p-5 w-1/2'>
              {pdf?(
                  <div className='p-5 m-auto rounded-md shadow-md'>
                    <h1 className='text-lg text-gray-700  p-5 font-bold'>PFD File</h1>

                    <iframe title={pdf.name} src={pdf} width="100%" height="500" allow="autoplay"></iframe>
                  </div>
                ):(
                  <div className="hidden bg-white shadow-md rounded p-5 m-2 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/50"
                    onClick={()=>wordInput.current.click()}
                  >
                    <input
                        id="word"
                        type="file"
                        accept='.txt'
                        onChange={(e)=> uploadWord(e)}
                        className="hidden"
                        ref={wordInput}
                      />
                    <label htmlFor="word">{pdf?.name||"Upload PDF"}</label>
                  </div>
                )
              }
              
            </div>
            <div className='word p-5 w-1/2'>
              {
                word?
                (
                  <div className='p-5 m-auto rounded-md shadow-md'>
                    <h1 className='text-lg text-gray-700  p-5 font-bold'>Text File</h1>
                    <iframe title={word.name} src={`https://docs.google.com/gview?url=${word}&embedded=true`} width="100%" height="500" allowfullscreen webkitallowfullscreen>
                    </iframe>
                  </div>
                ):(
                  <div className="hidden bg-white shadow-md rounded p-5 m-2 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/50"
                    onClick={()=>wordInput.current.click()}
                  >
                    <input
                        id="word"
                        type="file"
                        accept='.txt'
                        onChange={(e)=> uploadWord(e)}
                        className="hidden"
                        ref={wordInput}
                      />
                    <label htmlFor="word">{pdf?.name||"Upload Text"}</label>
                  </div>
                )
              }
            </div>
          </div>
          {
            video ? (video?.split('.').pop() === "mp4" ?(
              <div className='p-5 w-full'>
                <h1 className='text-lg text-gray-700 p-5 font-bold'>Video File</h1>
                <video controls  width="100%" height="500">
                  <source src={video} />
                </video>
              </div>
            ):(
              <div className='p-5 w-full'>
                <h1 className='text-lg text-gray-700 p-5 font-bold'>Audio File</h1>
                <audio controls  width="100">
                  <source src={video} />
                </audio>
              </div>
            )
            ):
            (
              <div className="hidden bg-white shadow-md rounded p-5 m-2 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/50"
                onClick={()=>videoInput.current.click()}
                >
                <input
                    id="mp4"
                    type="file"
                    accept='.mp4, .mp3'
                    onChange={(e)=> uploadMp4(e)}
                    className="hidden"
                    ref={videoInput}
                  />
                <label htmlFor="mp4">{video?.name||"Upload Mp3/Mp4"}</label>
              </div>
            )
          }
          
      </div>
      )}
    </div>
  )
}

export default NftDetail