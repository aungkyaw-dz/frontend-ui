import axios from 'axios'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from "next/head";
import Link from 'next/link';
import { useAccount } from 'wagmi';

const CollectionDetail = () => {
  const {data:account}= useAccount()
  const [collections, setCollections] = useState(null);
  const API_URL = process.env.API_URL
  useEffect(()=>{
    const getCollection = async () => {
      try{
        if(account){
          const res = await axios.get(`${API_URL}/collections/my-collections/${account.address}`)
          setCollections(res.data.data)
        }
      }
      catch(err) {
        console.log(err)
      }
   }
    getCollection()
  },[account])
  
  return(
    <div className="container mx-auto">
      <Head>
        <title>My Collections</title>
        <meta name="description" content="List of Nfts" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className='text-4xl font-bold p-5'>My Collections</h1>
      <div className="container grid grid-cols-3 gap-4">
        {
          collections && collections?.map((collection)=>(
            <Link key={collection?.collectionId} className="group relative border-2 border-slate-400 p-2 rounded-md" href={`/collections/${collection.collectionId}`}>
              <div className="group relative border-2 border-slate-400 p-2 rounded-md shadow-md cursor-pointer">
              <div className="flex">
                <div className="w-32 h-32 p-5">
                  {collection.logo ? 
                  <img
                    src={collection.logo}
                    alt={collection.name}
                    className="w-full h-full object-center object-cover "
                  />:
                  <div className="w-full h-full background-gray"></div>
                  }
                </div>
                <div>
                <h3 className="text-5xl text-gray-700  p-2">
                  {collection.name}
                </h3>
                <h3 className="text-lg text-gray-500  p-2">
                  {collection.description}
                </h3>
                </div>
              </div>
              <div className="flex justify-between p-5">
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
          ))
        }
      </div>
    </div>
  )
}

export default CollectionDetail