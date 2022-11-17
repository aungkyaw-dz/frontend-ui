import Head from "next/head";
import axios from "axios";
import { useAccount, useConnect } from "wagmi";
import { useEffect, useState } from "react";
import { useFormik } from 'formik';
const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Profile = () => {
    
  const [img, setImg] = useState()
  const [imgUrl, setImgUrl] = useState()
  const {data: account} = useAccount()
  const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL
  const { connect, connectors, activeConnector, isConnecting} = useConnect()
  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
    },
    onSubmit: async (values) => {
      let formData = new FormData();
      if(img){
        formData.append("profileImage", img);
      }
      formData.append("username", values.username);
      if(values.email){
        formData.append("email", values.email);
      }
      try{
        const userRes = await axios.post(`${REACT_APP_BACKEND_URL}/users/edit/${account.address}`, 
                                      formData, 
                                      {headers: {
                                        'Content-Type': `multipart/form-data;`,
                                      }}
                                    )
        if(userRes){
          const name = userRes.data.data.name
          // router.push(`/collections/${name}`)
        }
        alert('Update success')
      } catch (err){
        alert("Cannot Update")
      }
    },
  });

  useEffect(()=>{
    const getUser = async () =>{
        const res = await axios.get(`${REACT_APP_BACKEND_URL}/users/${account.address}`)
        if(res){
          formik.setValues(res.data.data)
          setImgUrl(res.data.data?.profileImage)
        }
    }
    if(account){
      getUser()
      }
  },[account])

 

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
    let files = [...e.dataTransfer.files];
    setImg(files[0])
    setImgUrl(URL.createObjectURL(files[0]))
  }

  return(
    <div className="container mx-auto">
      <Head>
        <title>My Profile</title>
        <meta name="description" content="My Profile" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className='text-4xl font-bold p-5'>My Profile</h1>
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
            User Name
          </label>
          <input className="shadow appearance-none border w-full rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none   focus:shadow-outline" 
            id="username" 
            name='username'
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="user name"/>
        </div>
        <div className="mb-4 ">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            E-mail
          </label>
          <input className="shadow appearance-none border w-full rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none   focus:shadow-outline" 
            id="email" 
            name='email'
            value={formik.values.email || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="E-mail"/>
        </div>
        <div className="mb-4 ">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            WalletAddress
          </label>
          <input className="shadow appearance-none border w-full rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none   focus:shadow-outline" 
            id="address" 
            name='address'
            value={account?.address || ""}
            disabled/>
        </div>
        <div className="flex items-center justify-start">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
            Update Profile
          </button>
        </div>
      </form>
    </div>
  )
}

export default Profile