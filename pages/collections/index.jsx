import { useEffect, useState } from "react"
import Head from "next/head";
import axios from "axios";
import Link from 'next/link'
import { useFormik } from "formik";

const Collection = () => {
  const [collections, setCollections] = useState([]);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(10);
  const API_URL = process.env.API_URL

  useEffect(()=>{
    const getCollections = async () => {
      const res = await axios.get(`${API_URL}/collections/list`, {params: {name: query.name, limit: limit}})
      setCollections(res.data.data)
    }
    getCollections()
  },[query, limit])

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    onSubmit: async (values) => {
      setQuery(values)
    },
  });


  return(
    <div className="container mx-auto">
      <Head>
        <title>Collections</title>
        <meta name="description" content="List of Nfts" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className='text-4xl font-bold p-5'>EXPLORE COLLECTIONS</h1>
      <form className="w-1/2 flex px-8 " onSubmit={formik.handleSubmit}>
        <input className="shadow appearance-none border w-full rounded  py-2 px-3 mr-5 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              id="name" 
              name='name'
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Search By Name"/>

        <div className="flex items-center justify-start">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
            Search
          </button>
        </div>
      </form>
      <div className="container grid md:md:grid-cols-3 gap-4">
        {
          collections && collections?.map((collection)=>(
            <div key={collection?.collectionId}>
            <Link key={collection?.collectionId} className="group relative border-2 border-slate-400 p-2 rounded-md  w-100" href={`collections/${collection.collectionId}`}>
              <div className="group relative border-2 border-slate-400 p-2 rounded-md shadow-md cursor-pointer overflow-hidden overflow-hidden">
              <div className="flex">
                <div className="w-32 h-32 p-5">
                  {collection.logo ? 
                  <img
                    src={collection.logo}
                    alt={collection.name}
                    className="w-full h-full object-center object-cover "
                  />:
                  <div className="w-full h-full bg-zinc-600"></div>
                  }
                </div>
                <div>
                <h3 className="text-2xl text-gray-700  p-2">
                  {collection.name}
                </h3>
                <h3 className="text-lg text-gray-500  p-2">
                  {collection.description}
                </h3>
                </div>
              </div>
              <div className="flex justify-between">
                <div className="w-20 text-center">
                  <h1 className="text-lg font-bold">{collection.nfts.length}</h1>
                  <span className="text-lg font-medium text-gray-700">NFTs</span>
                </div>
                <div className="w-20 text-center">
                  <h1 className="text-lg font-bold">{collection.Creator?.username||"admin"}</h1>
                  <span className="text-lg font-medium text-gray-700">Creator</span>
                </div>
                <div className="w-20 text-center">
                  <h1 className="text-lg font-bold">{collection.Creator?.username||"admin"}</h1>
                  <span className="text-lg font-medium text-gray-700">Owner</span>
                </div>
              </div>
              <div className="relative w-40 h-40 m-auto">
                {collection.nfts.length > 1 && 
                  <div className="absolute text-5xl font-bold top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">+{collection.nfts.length-1}</div>
                  }
                <img
                  src={collection.nfts[0]?.logo}
                  alt={collection.nfts[0]?.name}
                  className="object-center object-cover"
                />
                
              </div>
              </div>
            </Link>
            </div>
          ))
        }
      </div>
      <div>
        <button onClick={()=>{setLimit(limit+10)}}>load more</button>
      </div>
    </div>
  )

}

export default Collection