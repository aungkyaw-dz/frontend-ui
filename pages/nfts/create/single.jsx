import Head from 'next/head'
import { Field, useFormik } from 'formik';
import * as yup from 'yup';
import { useEffect, useState, useRef } from 'react';
import { CreateMetaData } from '../../../utils/pinata';
import { useAccount, useSendTransaction, useWaitForTransaction, useConnect } from 'wagmi';
import axios from 'axios';
import { Modal } from 'flowbite-react';
import DefaultImage from '../../../asset/images/default.png'
import CreatableSelect from 'react-select/creatable';

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");

// const contractABI = require('../../../UrbanTechNFT.json')
import { contractABI } from '../../../utils/abi';

const SingleCreate = () => {
  const [img, setImg] = useState()
  const [imgUrl, setImgUrl] = useState(DefaultImage.src)
  const [mp4, setMp4] = useState()
  const [mp3, setMp3] = useState()
  const [pdf, setPdf] = useState()
  const [word, setWord] = useState()
  const [zip, setZip] = useState()
  const [collections, setCollections] = useState(null)
  const [collectionId, setCollectionId] = useState(null)
  const [metaData, setMetaData]= useState()
  const [ready, setReady] = useState(false)
  const [categories, setCategories] = useState([])
  const [status, setStatus] = useState(null)
  const [message, setMsg] = useState('')
  const [show, setShow]= useState(false)
  const [filesChecked, setFilesChecked] = useState(false)
  const { data: account } = useAccount()
  const { connect, connectors, activeConnector, isConnecting } = useConnect()

  const contractAddress = process.env.CONTRACT_ADDRESS;
  const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const REACT_APP_ALCHEMY_URL = process.env.REACT_APP_ALCHEMY_URL;
  const web3 = createAlchemyWeb3(REACT_APP_ALCHEMY_URL);


  useEffect(()=>{
    window.contract = new web3.eth.Contract(contractABI.abi, contractAddress);//loadContract();
    const getCollections = async () => {
      const resData =await axios.get(`${REACT_APP_BACKEND_URL}/collections/my-collections/${account?.address}`)
      if(resData){
        setCollections(resData.data.data)
      }
    } 
    getCollections()
    if(account && !activeConnector){
      connect(connectors[5])
    }
  },[account])

  const re = /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/gm
  const formik = useFormik({
    initialValues: {
      name: '',
      quantity: 1,
      description: '',
      price: 0,
      type: '',
      collectionId: 'create',
      collectionName: '',
      collectionDesc: '',
      facebook: '',
      discord: '',
    },
    onSubmit: async (values) => {
      try{
        if(filesChecked){
          setStatus("creating")
          setMsg("Creating MetaData")
          if(account){
            values.creator = account.address
            values.owner = account.address

            const formData = new FormData()
            for ( var key in values ) {
              formData.append(key, values[key]);
            }
            formData.append("files", img)
            formData.append("files", mp3)
            formData.append("files", mp4)
            formData.append("files", pdf)
            formData.append("files", word)
            formData.append("files", zip)
            for (let i = 0; i < categories.length; i++){
              formData.append("categories", categories[i].value)
            }
            setShow(true)
            setStatus('create')
            setMsg("Creating the metadata")
            let nftRes = await axios.post(`${REACT_APP_BACKEND_URL}/nfts/create`, formData)
            if(nftRes){
              setMetaData(nftRes.data.mintData)
              setCollectionId(nftRes.data.collection.collectionId)
              setStatus('mint')
              setMsg("MetaData created. Plase confim in your wallet")
            }
          }else{
            alert("Please Connect Wallet")
          }
        }else{
          alert("Please Input Image File First")
        }
      }catch(err){
        setStatus("error")
        setMsg("Error occuring, please reaload the page and try agin")
      }
    },
    validationSchema: yup.object({
      name: yup.string().trim().required('Name is required'),
      description: yup.string().trim().required('Description is required'),
      // collectionName: yup.string().trim().required('Collection Name is required'),
      // collectionDesc: yup.string().trim().required('Collection description is required'),
      facebook: yup.string().trim().matches(re, 'URL is not valid'),
      discord: yup.string().trim().matches(re, 'URL is not valid'),
    }),
  });

  useEffect(()=>{
    if(img){
      setFilesChecked(true)
    }
  },[img])


  const transactionParameters = {
    to: contractAddress,
    from: account?.address,
    'data': metaData? window.contract.methods.deployERC1155(
      formik.values.collectionName, 
      [
        metaData?.image?.tokenUri||"",
        metaData?.pdf?.tokenUri||"", 
        metaData?.audio?.tokenUri||"", 
        metaData?.text?.tokenUri||"", 
        metaData?.video?.tokenUri|| "", 
        metaData?.zip?.tokenUri|| "" 
      ], 
      [
        0,1,2,3,4,5
      ], 
      [
        formik.values.quantity,
        formik.values.quantity, 
        formik.values.quantity, 
        formik.values.quantity,
        formik.values.quantity,
        formik.values.quantity
      ]
      ).encodeABI(): ""
  };

  const { data: txData, sendTransaction } =
          useSendTransaction({
          request: transactionParameters,
          onError(error) {
            setStatus('error')
            setMsg("Error occuring, please reaload the page and try agin")
            console.log(error)
            // window.location.reload(false)
            if(error.code == "INSUFFICIENT_FUNDS"){
              alert("Sorry, your wallet has insufficient funds. Please fund your wallet via Binance")
            }
            if(error.includes("insufficient")){
              alert("Sorry, your wallet has insufficient funds. Please fund your wallet via Binance")
            }
            },
          })

  const { data: wait } = useWaitForTransaction({
    hash: txData?.hash,
  })
  useEffect(()=>{
    if(metaData && !txData){
      try{
        if(!activeConnector){
          connect(connectors[5])
        }
        setTimeout(()=>{
          setStatus("Minting")
          setMsg("Please wait until transcation is complete")
          sendTransaction()
        }, 5000);
      }catch(err){
        console.log(err)
        setStatus("Error")
      }
    }
  },[metaData])
  
  useEffect(()=>{
    const updateTokenId = () =>{
      const tokenId = web3.utils.hexToNumber(wait?.logs[1].topics[2])
      if(wait){
        const updateData = {
          address : wait?.logs[1].address
        }
        const updateCollection = async() => {
          const resData = await axios.post(`${REACT_APP_BACKEND_URL}/collections/update/${collectionId}`, updateData)
          if(!resData.error){
            setStatus('complete')
            setMsg('Transcation is Complete')
            window.location.href = `/nfts/${collectionId}`
          }
        }
        updateCollection()
      }
    }
    updateTokenId()
  },[wait])

  const ImageInput = useRef(null)
  const pdfInput = useRef(null)
  const wordInput = useRef(null)
  const videoInput = useRef(null)
  const audioInput = useRef(null)
  const zipInput = useRef(null)

  const uploadImg =  (e) => {
    if(e.target.files && e.target.files[0]){
      console.log(e.target.files[0])
      const fileExt = e.target.files[0].type?.split('/')[1]
      if(['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fileExt)){
        var filesize = ((e.target.files[0].size/1024)/1024).toFixed(4)
        if(filesize<25){
          setImg(e.target.files[0])
          setImgUrl(URL.createObjectURL(e.target.files[0]))
        }else{
          alert('Excess max size')
        }
      }else{
        alert("Invalid file format")
      }
    }
  }
  const uploadMp3 =  (e) => {
    if(e.target.files && e.target.files[0]){
      const fileExt = e.target.files[0].type?.split('/')[0]
      console.log(fileExt)
      if(['audio'].includes(fileExt)){
        var filesize = ((e.target.files[0].size/1024)/1024).toFixed(4)
        if(filesize<25){
          setMp3(e.target.files[0])
        }else{
          alert('excess max size')
        }
      }else{
        alert("Invalid file format")
      }
      
    }
  }
  const uploadMp4 =  (e) => {
    if(e.target.files && e.target.files[0]){
      const fileExt = e.target.files[0].type?.split('/')[0]
      if(['video'].includes(fileExt)){
        var filesize = ((e.target.files[0].size/1024)/1024).toFixed(4)
        if(filesize<25){
          setMp4(e.target.files[0])
        }else{
          alert('excess max size')
        }
      }else{
        alert("Invalid file format")
      }
    }
  }
  const uploadPdf =  (e) => {
    if(e.target.files && e.target.files[0]){
      const fileExt = e.target.files[0].type?.split('/')[1]
      if(['pdf'].includes(fileExt)){
        var filesize = ((e.target.files[0].size/1024)/1024).toFixed(4)
        if(filesize<25){
          setPdf(e.target.files[0])
        }else{
          alert('excess max size')
        }
      }else{
        alert("Invalid file format")
      }
      }
  }

  const uploadWord =  (e) => {
    if(e.target.files && e.target.files[0]){
      const fileExt = e.target.files[0].name?.split('.').pop()
      if(['txt',  'doc', 'docx'].includes(fileExt)){
        var filesize = ((e.target.files[0].size/1024)/1024).toFixed(4)
        if(filesize<25){
          setWord(e.target.files[0])
        }else{
          alert('excess max size')
        }
      }else{
        alert("Invalid file format")
      }
    }
  }

  const uploadZip =  (e) => {
    if(e.target.files && e.target.files[0]){
      const fileExt = e.target.files[0].name?.split('.').pop()
      if(['zip'].includes(fileExt)){
        var filesize = ((e.target.files[0].size/1024)/1024).toFixed(4)
        if(filesize<25){
          setZip(e.target.files[0])
        }else{
          alert('excess max size')
        }
      }else{
        alert("Invalid file format")
      }
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
    let files = [...e.dataTransfer.files];
    setImg(files[0])
    setImgUrl(URL.createObjectURL(files[0]))
  }

  const handleChange = (newValue, actionMeta) => {
    setCategories(newValue);
  };

  const onClose = () => setShow(false)
  
  const options = [
    { value: '', label: 'create categories', isDisabled: true },
    { value: 'Dog', label: 'Dog'},
    { value: 'Computer', label: 'Computer'},
    { value: 'Hotel', label: 'Hotel'},
    { value: 'Swimming pool', label: 'Swimming pool'},
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
        SVG, MP4, Mp4, PDF, TXT, DOC. Max size: 25 MB
      </p>
      <div className='lg:w-1/2 grid grid-cols-3 gap-4 text-center justify-center items-center'>
        <div className="bg-white shadow-md rounded col-span-2 overflow-hidden pb-5 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/50"
          onDragEnter={(e) => handleDragEnter(e)}
          onDragOver={(e) => handleDragOver(e)}
          onDragLeave={(e) => handleDragLeave(e)}
          onDrop={(e) => handleDrop(e)}
          // onClick={()=>ImageInput.current.click()}
        >
          <div className='p-1 m-2'>
            {imgUrl && <img src={imgUrl} alt='preview' className='h-48 w-auto m-auto mb-5' onClick={()=>ImageInput.current.click()}/>}
          </div>

          <input
              id="img"
              type="file"
              accept='.jpg, .jpeg, .png, .gif, .svg'
              onChange={(e)=> uploadImg(e)}
              className="hidden"
              ref={ImageInput}
            />
          <label htmlFor="img"  className='p-5 h-96 cursor-pointer'>Upload Image</label>
        </div>
        <div className='bg-white col-span1'>
          <div className="bg-white shadow-md rounded p-5 m-2 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/50"
            onDragEnter={(e) => handleDragEnter(e)}
            onDragOver={(e) => handleDragOver(e)}
            onDragLeave={(e) => handleDragLeave(e)}
            onDrop={(e) => handleDrop(e)}
            // onClick={()=>pdfInput.current.click()}
          >
            <input
                id="pdf"
                type="file"
                accept='.pdf'
                onChange={(e)=> uploadPdf(e)}
                className="hidden"
                ref={pdfInput}
              />
            <label htmlFor="pdf">{pdf?.name||"Upload PDF"}</label>
          </div>
          <div className="bg-white shadow-md rounded p-5 m-2 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/50"
            onDragEnter={(e) => handleDragEnter(e)}
            onDragOver={(e) => handleDragOver(e)}
            onDragLeave={(e) => handleDragLeave(e)}
            onDrop={(e) => handleDrop(e)}
            // onClick={()=>wordInput.current.click()}
          >
            <input
                id="word"
                type="file"
                accept='.txt, .doc, .docx'
                onChange={(e)=> uploadWord(e)}
                className="hidden"
                ref={wordInput}
              />
            <label htmlFor="word">{word?.name||"Upload Text"}</label>
          </div>
          <div className="bg-white shadow-md rounded p-5 m-2 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/50"
            onDragEnter={(e) => handleDragEnter(e)}
            onDragOver={(e) => handleDragOver(e)}
            onDragLeave={(e) => handleDragLeave(e)}
            onDrop={(e) => handleDrop(e)}
            // onClick={()=>audioInput.current.click()}
          >
            <input
                id="mp3"
                type="file"
                accept='.mp3'
                onChange={(e)=> uploadMp3(e)}
                className="hidden"
                ref={audioInput}
              />
            <label htmlFor="mp3">{mp3?.name||"Upload Mp3"}</label>
          </div>
          <div className="bg-white shadow-md rounded p-5 m-2 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/50"
            onDragEnter={(e) => handleDragEnter(e)}
            onDragOver={(e) => handleDragOver(e)}
            onDragLeave={(e) => handleDragLeave(e)}
            onDrop={(e) => handleDrop(e)}
            // onClick={()=>videoInput.current.click()}
            >
            <input
                id="mp4"
                type="file"
                accept='.mp4'
                onChange={(e)=> uploadMp4(e)}
                className="hidden"
                ref={videoInput}
              />
            <label htmlFor="mp4">{mp4?.name||"Upload Mp4"}</label>
          </div>
          <div className="bg-white shadow-md rounded p-5 m-2 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/50"
            onDragEnter={(e) => handleDragEnter(e)}
            onDragOver={(e) => handleDragOver(e)}
            onDragLeave={(e) => handleDragLeave(e)}
            onDrop={(e) => handleDrop(e)}
            // onClick={()=>zipInput.current.click()}
            >
            <input
                id="zip"
                type="file"
                accept='.zip'
                onChange={(e)=> uploadZip(e)}
                className="hidden"
                ref={zipInput}
              />
            <label htmlFor="zip">{zip?.name||"Upload ZIP"}</label>
          </div>
        
        </div>
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
            <p className='block text-red-700 text-sm mb-2'>{formik.errors.name}</p>
        </div>

        <div className="mb-4 ">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="link">
            Number to Mint
          </label>
          <input className="shadow appearance-none border w-full rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none   focus:shadow-outline" 
            id="quantity" 
            name='quantity'
            value={formik.values.quantity}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            />
        </div>
        <div className="mb-4 ">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>
          <textarea className="block p-2.5 w-full text-sm text-gray-900 bg-gray-500-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-500-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            id="description" 
            name='description'
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            rows="4"  
            placeholder="NFT Description"></textarea>
            <p className='block text-red-700 text-sm mb-2'>{formik.errors.description}</p>
        </div>
        <div className="mb-4 ">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            FaceBook
          </label>
          <input className="block p-2.5 w-full text-sm text-gray-900 bg-gray-500-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-500-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            id="facebook" 
            name='facebook'
            value={formik.values.facebook}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Facebook"/>
            <p className='block text-red-700 text-sm mb-2'>{formik.errors.facebook}</p>
        </div>
        <div className="mb-4 ">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Dsicord
          </label>
          <input className="block p-2.5 w-full text-sm text-gray-900 bg-gray-500-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-500-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            id="discord" 
            name='discord'
            value={formik.values.discord}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Discord"></input>
            <p className='block text-red-700 text-sm mb-2'>{formik.errors.discord}</p>
        </div>
        <div className="mb-4 hidden">
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
        <div className="mb-4 hidden">
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
        <div className="mb-4 hidden">
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
        <div className="mb-4" style={{display: 'none'}}>
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
            <p className='block text-red-700 text-sm mb-2'>{formik.errors.collectionName}</p>
        </div>
        <div className="mb-4 " style={{display: 'none'}}>
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
            <p className='block text-red-700 text-sm mb-2'>{formik.errors.collectionDesc}</p>
        </div>
        <div className="flex items-center justify-start">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
            Create New NFT
          </button>
          
        </div>

        {/* <div className='text-left'>
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
              <LinkTo  href={`/nfts/${nftId}`}>Please check your nft on here</LinkTo>
            </div>
          )}
        </div> */}
      </form>
      <div>
        
      </div>
      {message && (
        <Modal
            show={show}
            position="center"
            onClose={onClose}
            size="sm"
          >
            <Modal.Header>
              Minting Process
            </Modal.Header>
            <Modal.Body>
              {
                message && (
                  <div>
                    { status === 'error' ?
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    :
                    (status === "complete" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ): (
                      
                      <svg role="status" className="w-8 h-8 m-auto text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                      </svg>
                    ))
                    }
                    <p className='text-sm font-medium text-gray-700 p-5 pt-2 w-100 text-center'>{message}</p>
                  </div>
                )
              }
            </Modal.Body>
        </Modal>
      )}
    </div>
  )
}

export default SingleCreate