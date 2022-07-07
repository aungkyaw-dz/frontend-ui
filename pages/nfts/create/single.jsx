import Head from 'next/head'
import { Field, useFormik } from 'formik';
import * as yup from 'yup';
import { useEffect, useState } from 'react';
import { CreateMetaData } from '../../../utils/pinata';
import { useAccount, useSendTransaction, useWaitForTransaction } from 'wagmi';
import axios from 'axios';
import { Dropdown } from 'flowbite-react';
import Link from 'next/link';
import DefaultImage from '../../../asset/images/default.png'
import CreatableSelect from 'react-select/creatable';
import { useRouter } from 'next/router';

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
  const [categories, setCategories] = useState([])
  const router = useRouter()

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
            console.log(error)
            setStatus('Error')
            window.location.reload(false)
            if(error.code == "INSUFFICIENT_FUNDS"){
              alert("Sorry, your wallet has insufficient funds. Please fund your wallet via Binance")
            }
            if(error.includes("insufficient")){
              alert("Sorry, your wallet has insufficient funds. Please fund your wallet via Binance")
            }
            },
          })
  
    const { data: wait, isError, isLoading } = useWaitForTransaction({
      hash: txData?.hash,
    })
  
    

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
    const updateTokenId = () =>{
      const tokenId = web3.utils.hexToNumber(wait?.logs[0].topics[3])
      const updateData = {
        tokenId: tokenId,
        txid: txData?.hash,
        status: "MINTED"
      }
      if(wait){
        const updateNft = async() => {
          const resData = await axios.post(`${API_URL}/nfts/update/${nftId}`, updateData)
          if(!resData.error){
            setStatus('complete')
            window.location.href = `/nfts/${nftId}`
          }
        }
        updateNft()
      }
    }
    updateTokenId()
  },[wait])
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
          for (let i = 0; i < categories.length; i++){
            formData.append("categories", categories[i].value)
          }
          let nftRes = await axios.post(`${API_URL}/nfts/create`, formData)
          setNftId(nftRes.data.data.nftId)
          const resData = await CreateMetaData(img, values)
          if(resData.success){
            setMetaData(resData.url)
            const updateData = {
              tokenUri: resData.url,
            }
            nftRes = await axios.post(`${API_URL}/nfts/update/${nftRes.data.data.nftId}`, updateData)
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

  const handleChange = (newValue, actionMeta) => {
    setCategories(newValue);
  };
  const options = [
    { value: '', label: 'create categories', isDisabled: true },
  ]

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
        SVG. Max size: 100 MB
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
          <textarea className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
            Categories
          </label>
          <CreatableSelect
            id="categories" 
            instanceId="categories"
            isClearable
            onChange={handleChange}
            options={options}
            isMulti
          />
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
          {status && (
            <div>
              {status}
              <svg role="status" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
              </svg>
            </div>
            )}
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