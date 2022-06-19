import Head from 'next/head'
import { Field, useFormik } from 'formik';
import * as yup from 'yup';
import { useEffect, useState } from 'react';
import { CreateMetaData } from '../../../utils/pinata';
import { useAccount, useSendTransaction, useConnect } from 'wagmi';
import axios from 'axios';
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");

const contractABI = require('../../../UrbanTechNFT.json')

const SingleCreate = () => {

  const [img, setImg] = useState()
  const [imgUrl, setImgUrl] = useState()
  const [metaData, setMetaData] = useState(null)
  const [nftId, setNftId] = useState(null)
  const { data: account } = useAccount()
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const API_URL = process.env.API_URL;
  const web3 = createAlchemyWeb3(API_URL);
  useEffect(()=>{
    window.contract = new web3.eth.Contract(contractABI.abi, contractAddress);//loadContract();

  },[])

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
      sendTransaction()
    }
  }

  useEffect(()=>{
    if(metaData && !txData){
      sendTransaction()
    }
  },[metaData])

  useEffect(()=>{
    const createNft = async() =>{
      if(txData && metaData){
        const updateData = {
          tokenUri: metaData,
          txid: txData.hash,
          status: "MINTED",
        }
        console.log(updateData)
        const nftRes = await axios.post(`${API_URL}/nfts/update/${nftId}`, updateData)
        if(nftRes){
          alert("complete")
          setMetaData(null)
        }
      }
    }
    createNft()
  },[txData])

  const formik = useFormik({
    initialValues: {
      title: '',
      link: '',
      description: '',
      price: 0,
      collectionName: '',
      collectionDesc: ''
    },
    onSubmit: async (values) => {
      console.log("ddd")

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
    },
    validationSchema: yup.object({
      title: yup.string().trim().required('Name is required'),
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
        <title>Create New NFT</title>
        <meta name="description" content="create a new nft" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className='text-4xl font-bold p-5'>Create single item</h1>
      <p className='text-lg p-5 w-2/5'>
        Image, Video, Audio, or 3D Model. File types supported: JPG, PNG, GIF,
        SVG, MP4, WEBM, MP3, WAV, OGG, GLB, GLTF. Max size: 100 MB
      </p>
      <div className="w-1/3 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        onDragEnter={(e) => handleDragEnter(e)}
        onDragOver={(e) => handleDragOver(e)}
        onDragLeave={(e) => handleDragLeave(e)}
        onDrop={(e) => handleDrop(e)}
       >
        {imgUrl && <img src={imgUrl} alt='preview'/>}
        <input
            id="fileSelect"
            type="file"
            multiple
            onChange={(e)=> uploadImg(e)}
          />
      </div>
      <form className="w-1/3 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={formik.handleSubmit}>
        <div className="mb-4 ">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            NFT Name
          </label>
          <input className="shadow appearance-none border w-full rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none   focus:shadow-outline" 
            id="title" 
            name='title'
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="nft title"/>
        </div>
        <div className="mb-4 ">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
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
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
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
        <div className="mb-4 ">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
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
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Description
          </label>
          <input className="shadow appearance-none border w-full rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none   focus:shadow-outline" 
            id="description" 
            name='description'
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="description"/>
        </div>
        <div className="mb-4 ">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
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
        <div className="flex items-center justify-start">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
            Create New NFT
          </button>
        </div>
      </form>
    </div>
  )
}

export default SingleCreate