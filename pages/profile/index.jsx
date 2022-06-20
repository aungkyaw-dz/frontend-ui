import Head from "next/head";
import axios from "axios";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useFormik } from 'formik';
const Profile = () => {
    
  const [img, setImg] = useState()
  const [imgUrl, setImgUrl] = useState()
  const {data: account} = useAccount()
  const API_URL = process.env.API_URL

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
    },
    onSubmit: async (values) => {
      let formData = new FormData();
      console.log(values)
      if(img){
        formData.append("profileImage", img);
      }
      formData.append("username", values.username);
      if(values.email){
        console.log(values.email)
        formData.append("email", values.email);
      }
      try{
        const userRes = await axios.post(`http://localhost:3001/users/edit/${account.address}`, 
                                      formData, 
                                      {headers: {
                                        'Content-Type': `multipart/form-data;`,
                                      }}
                                    )
        if(userRes){
          const name = userRes.data.data.name
          console.log(userRes)
          // router.push(`/collections/${name}`)
        }
      } catch (err){
        console.log(err)
        alert("Cannot Update")
      }
    },
  });

  useEffect(()=>{
    const getUser = async () =>{
        const res = await axios.get(`${API_URL}/users/${account.address}`)
        console.log(res)
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
    console.log(e)
    let files = [...e.dataTransfer.files];
    console.log(files)
    setImg(files[0])
    setImgUrl(URL.createObjectURL(files[0]))
  }
  console.log("data")
  return(
    <div className="container mx-auto">
      <Head>
        <title>My Profile</title>
        <meta name="description" content="My Profile" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className='text-4xl font-bold p-5'>My Prifile</h1>
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