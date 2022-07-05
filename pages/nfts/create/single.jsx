import Head from 'next/head'
import { Field, useFormik } from 'formik';
import * as yup from 'yup';
import { useEffect, useState } from 'react';
import { CreateMetaData } from '../../../utils/pinata';
import { useAccount, useSendTransaction, useConnect, useWaitForTransaction } from 'wagmi';
import axios from 'axios';
import { Dropdown } from 'flowbite-react';
import Link from 'next/link';
import DefaultImage from '../../../asset/images/default.png'

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");

const contractABI = require('../../../UrbanTechNFT.json')

const SingleCreate = () => {
  const [img, setImg] = useState()
  const [imgUrl, setImgUrl] = useState(DefaultImage.src)
  const [metaData, setMetaData] = useState(null)
  const [nftId, setNftId] = useState(null)
  const { data: account } = useAccount()
  const [status, setStatus] = useState(null)
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const API_URL = process.env.API_URL;
  const web3 = createAlchemyWeb3(API_URL);
  const [collections, setCollections] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(()=>{
    window.contract = new web3.eth.Contract(contractABI.abi, contractAddress);//loadContract();
    const getCollections = async () => {
      const resData =await axios.get(`${API_URL}/collections/my-collections/${account?.address}`)
      if(resData){
        setCollections(resData.data.data)
      }
    } 
    getCollections()
  },[account])

  const transactionParameters = {
      to: contractAddress,
      from: account?.address,
      'data': metaData? window.contract.methods.mint(metaData).encodeABI(): ""
  };
  const { data: txData, sendTransaction } =
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

  const mintNft = () =>{
    if(metaData){
      try{
        sendTransaction()
      }catch(err){
        console.log(err)
        setStatus("Error")
      }
    }
  }

  useEffect(()=>{
    if(metaData && !txData){
      try{
        setStatus("Minting")
        sendTransaction()
      }catch(err){
        console.log(err)
        setStatus("Error")
      }
    }
  },[metaData])

  useEffect(()=>{
    const createNft = async() =>{
      try{
        if(txData && metaData){
          const updateData = {
            tokenUri: metaData,
            txid: txData.hash,
            status: "MINTED",
          }
          const nftRes = await axios.post(`${API_URL}/nfts/update/${nftId}`, updateData)
          if(nftRes){
            setStatus(null)
            setMetaData(null)
            setReady(true)
            window.location.href = `/nfts/${nftRes.data.data.nftId}`
          }
        }
      }catch(err){
        setStatus("Error")
        console.log(err)
      }
    }
    createNft()
  },[txData])
  const formik = useFormik({
    initialValues: {
      name: '',
      link: '',
      description: '',
      price: 0,
      type: '',
      collectionId: "",
      collectionName: '',
      collectionDesc: ''
    },
    onSubmit: async (values) => {
      try{

        setStatus("Creating MetaData")
        if(account){
          values.creator = account.address
          values.owner = account.address
          const formData = new FormData()
          for ( var key in values ) {
            formData.append(key, values[key]);
          }
          formData.append("logo", img)
          const nftRes = await axios.post(`${API_URL}/nfts/create`, formData)
          setNftId(nftRes.data.data.nftId)
          const resData = await CreateMetaData(img, values)
          if(resData.success){
            setMetaData(resData.url)
          }
        }else{
          alert("Please Connect Wallet")
        }
      }catch(err){
        setStatus("Error")
      }
    },
    validationSchema: yup.object({
      name: yup.string().trim().required('Name is required'),
      price: yup.number().required('Name is required'),
    }),
  });

  const uploadImg =  (e) => {
    if(e.target.files && e.target.files[0]){
      setImg(e.target.files[0])
      setImgUrl(URL.createObjectURL(e.target.files[0]))
    }
  }

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  }
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
  }
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
  }
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(e)
    let files = [...e.dataTransfer.files];
    console.log(files)
    setImg(files[0])
    setImgUrl(URL.createObjectURL(files[0]))
  }


  return(
    <div className="container mx-auto">
      <Head>
        <title>Create A New NFT</title>
        <meta name="description" content="create a new nft" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className='text-4xl font-bold p-5'>Create single item</h1>
      <p className='text-lg p-5 lg:w-2/5'>
        Image, Video, Audio, or 3D Model. File types supported: JPG, PNG, GIF,
        SVG, MP4, WEBM, MP3, WAV, OGG, GLB, GLTF. Max size: 100 MB
      </p>
      <div className="lg:w-1/3 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 "
        onDragEnter={(e) => handleDragEnter(e)}
        onDragOver={(e) => handleDragOver(e)}
        onDragLeave={(e) => handleDragLeave(e)}
        onDrop={(e) => handleDrop(e)}
       >
        <div className='p-1 m-2'>
          {imgUrl && <img src={imgUrl} alt='preview'/>}
        </div>

        <input
            id="fileSelect"
            type="file"
            onChange={(e)=> uploadImg(e)}
          />
      </div>
      <form className="lg:w-1/3 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={formik.handleSubmit}>
        <div className="mb-4 ">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            NFT Name
          </label>
          <input className="shadow appearance-none border w-full rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none   focus:shadow-outline" 
            id="name" 
            name='name'
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="NFT Name"/>
        </div>

        <div className="mb-4 ">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="link">
            External Link
          </label>
          <input className="shadow appearance-none border w-full rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none   focus:shadow-outline" 
            id="link" 
            name='link'
            value={formik.values.link}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="external link"/>
        </div>
        <div className="mb-4 ">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>
          <textarea class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            id="description" 
            name='description'
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            rows="4"  
            placeholder="NFT Description"></textarea>
        </div>
        <div className="mb-4 ">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="collectionId">
            Sell Type
          </label>
          <select 
            id="type" 
            name="type" 
            value={formik.values.type} 
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="shadow appearance-none border w-full rounded ">
              <option value="" disabled>Sell Type</option>
              <option value="sale">SALE</option>
          </select>
        </div>
        <div className="mb-4 ">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
            Price
          </label>
          <input className="shadow appearance-none border w-full rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none   focus:shadow-outline" 
            id="price"
            type="number" 
            name='price'
            value={formik.values.price}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="nft name"/>
        </div>
        <div className="mb-4 ">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="collectionId">
            Collections
          </label>
          <select 
            id="collectionId" 
            name="collectionId" 
            value={formik.values.collectionId} 
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="shadow appearance-none border w-full rounded ">
            <option value="" disabled>Collection List</option>

            {collections?.map((collection)=>(
              <option value={collection.collectionId} key={collection.collectionId}>{collection.name}</option>
            )
            )}
              <option value="create">Create New Collection</option>
          </select>
        </div>
        {formik.values.collectionId == "create" && 
          <>
          <div className="mb-4 ">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="collectionName">
              Collection Name
            </label>
            <input className="shadow appearance-none border w-full rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none   focus:shadow-outline" 
              id="collectionName" 
              name='collectionName'
              value={formik.values.collectionName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Collection name"/>
          </div>
          <div className="mb-4 ">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="collectionDesc">
              Collection Description
            </label>
            <input className="shadow appearance-none border w-full rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none   focus:shadow-outline" 
              id="collectionDesc" 
              name='collectionDesc'
              value={formik.values.collectionDesc}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Collection Description"/>
          </div>
          </>
        }
        <div className="flex items-center justify-start">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
            Create New NFT
          </button>
          
        </div>
        <div className='text-left'>
          {status && (<div>{status}</div>)}
          {ready && (
            <div className='underline p-2 text-blue-600 hover:text-blue-800 visited:text-purple-600'>
              <Link  href={`/nfts/${nftId}`}>Please check your nft on here</Link>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

export default SingleCreate