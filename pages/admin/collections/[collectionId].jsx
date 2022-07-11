import axios from 'axios'
import Route, { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from "next/head";
import Link from 'next/link';
import { Field, useFormik } from 'formik';

const CollectionDetail = () => {
  const router = useRouter()
  const { collectionId } = router.query
  const API_URL = process.env.API_URL

  const [collection, setCollection] = useState(null);
  const [logo, setLogo] = useState(null)
  const [logoUrl, setLogoUrl] = useState(null)
  const [banner, setBanner] = useState(null)
  const [bannerUrl, setBannerUrl] = useState(null)
  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      featured: false,
      favourite: false
    },
    onSubmit: async (values) => {
      let formData = new FormData();
      console.log(values)
      if(logo){
        formData.append("logo", logo);
      }
      if(banner){
        formData.append("banner", banner);
      }
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("favourite", values.favourite);
      formData.append("featured", values.featured);
      try{

        const collectionRes = await axios.post(`${API_URL}/collections/update/${collection.collectionId}`, 
                                      formData, 
                                      {headers: {
                                        'Content-Type': `multipart/form-data;`,
                                      }}
                                    )
        if(collectionRes){
          const collectionId = collectionRes.data.data.collectionId
          router.push(`/collections/${collectionId}`)
        }
      } catch (err){
        console.log(err)
        alert("Cannot Update")
      }
      
    },
  });

  useEffect(()=>{
    const getCollection = async () => {
      try{
        if(collectionId){
          const res = await axios.get(`${API_URL}/collections/${collectionId}`)
          setCollection(res.data.data)
          formik.setValues(res.data.data)
          setBannerUrl(res.data.data.banner)
          setLogoUrl(res.data.data.logo)
        }
      }
      catch(err) {
        console.log(err)
      }
   }
    getCollection()
  },[collectionId])

  const uploadLogo =  (e) => {
    if(e.target.files && e.target.files[0]){
      setLogo(e.target.files[0])
      setLogoUrl(URL.createObjectURL(e.target.files[0]))
    }
  }

  const uploadBanner =  (e) => {
    if(e.target.files && e.target.files[0]){
      setBanner(e.target.files[0])
      setBannerUrl(URL.createObjectURL(e.target.files[0]))
    }
  }

  const handleDragEnter = (e, name) => {
    e.preventDefault();
    e.stopPropagation();
  }
  const handleDragOver = (e, name) => {
    e.preventDefault();
    e.stopPropagation();
    
  }
  const handleDragLeave = (e, name) => {
    e.preventDefault();
    e.stopPropagation();
    
  }
  const handleDrop = (e, name) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(e)
    let files = [...e.dataTransfer.files];
    console.log(files)
    if(name==="logo"){
      setLogo(files[0])
      setLogoUrl(URL.createObjectURL(files[0]))
    }else{
      setBanner(files[0])
      setBannerUrl(URL.createObjectURL(files[0]))
    }
    
  }

  useEffect(()=>{
    const token = localStorage.getItem('jwtToken')
    if(!token){
      window.location.href = '/admin/login'
    }
  },[])

  return(
    <div className="container mx-auto">
      <Head>
        <title>{collection?.name}</title>
        <meta name="description" content="Collection Detail" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {collection && 
      <form className="w-1/3 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={formik.handleSubmit}>
        <h1>Update {collection.name}</h1>
        <div className="mb-4 ">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Name
          </label>
          <input className="shadow appearance-none border w-full rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none   focus:shadow-outline" 
            id="name" 
            name='name'
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="nft name"/>
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
        <div className="w-full bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          onDragEnter={(e) => handleDragEnter(e,"logo")}
          onDragOver={(e) => handleDragOver(e,"logo")}
          onDragLeave={(e) => handleDragLeave(e,"logo")}
          onDrop={(e) => handleDrop(e,"logo")}
        >
          {logoUrl && <img src={logoUrl} alt='preview'/>}
          <input
              id="fileSelect"
              type="file"
              multiple
              onChange={(e)=> uploadLogo(e)}
            />
        </div>
        <div className="w-full bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          onDragEnter={(e) => handleDragEnter(e,"banner")}
          onDragOver={(e) => handleDragOver(e,"banner")}
          onDragLeave={(e) => handleDragLeave(e,"banner")}
          onDrop={(e) => handleDrop(e,"banner")}
        >
          {bannerUrl && <img src={bannerUrl} alt='preview'/>}
          <input
              id="fileSelect"
              type="file"
              multiple
              onChange={(e)=> uploadBanner(e)}
            />
        </div>
        <label className="md:w-2/3 block text-gray-500 font-bold">
          <input className="mr-2 leading-tight" type="checkbox"
            id="featured" 
            name='featured'
            checked={formik.values.featured}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            />
          <span className="text-sm">
            Featured
          </span>
        </label>
        <label className="md:w-2/3 block text-gray-500 font-bold">
          <input className="mr-2 leading-tight" type="checkbox"
            id="favourite" 
            name='favourite'
            checked={formik.values.favourite}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            />
          <span className="text-sm">
            Favourite
          </span>
        </label>
        <div className="flex items-center justify-start">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
            Update Collection 
          </button>
        </div>
      </form>
      }
    </div>
  )
}

export default CollectionDetail