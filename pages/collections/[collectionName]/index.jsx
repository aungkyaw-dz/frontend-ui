import axios from 'axios'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from "next/head";
import Link from 'next/link';

const CollectionDetail = () => {
  const router = useRouter()
  const { collectionName } = router.query
  const API_URL = process.env.API_URL

  const [collection, setCollection] = useState(null);

  useEffect(()=>{
    const getCollection = async () => {
      try{
        if(collectionName){
          const res = await axios.get(`${API_URL}/collections/${collectionName}`)
          console.log(res)
          setCollection(res.data.data)
        }
      }
      catch(err) {
        console.log(err)
      }
   }
    getCollection()
  },[collectionName])
  console.log(collection)
  return(
    <div className="container mx-auto">
      <Head>
        <title>{collection?.name}</title>
        <meta name="description" content="Collection Detail" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {collection && 
      <div className="">
        <div className="relative ...">
          <div className='h-96 overflow-hidden flex items-center'>
          {collection.logo?   
              <div className='w-full'>
                <img className='w-9/12 m-auto' src={collection.banner} alt={collection.name}/>
              </div>:
              <div className='w-full h-full bg-zinc-600'>
              </div>
              }
              </div>
          <div className="absolute bottom-0 left-0 ...">
            <div className='w-full h-full'>
              {collection.logo && 
                <img className='w-9/12 m-auto' src={collection.logo} alt={collection.name}/>
              }
            </div>
          </div>
        </div>
        <div className='flex justify-between mt-10'>
          <div className='p-5'>
            <h1 className='text-6xl text-gray-700'>{collection.name}</h1>
            <h1 className='text-3xl text-gray-500 '>{collection.description}</h1>
          </div>
          <div className='p-5'>
            <Link href={`/collections/${collection.name}/edit`} className='text-3xl text-gray-500'>EDIT</Link>
          </div>
        </div>
        <div className="flex justify-between p-5">
          <div className="w-20 text-center">
            <h1 className="text-lg font-bold">{collection.nfts.length}</h1>
            <span className="text-lg font-medium text-gray-700">NFTs</span>
          </div>
          <div className="w-20 text-center">
            <h1 className="text-lg font-bold">{collection.Creator.username||"admin"}</h1>
            <span className="text-lg font-medium text-gray-700">Creator</span>
          </div>
          <div className="w-20 text-center">
            <h1 className="text-lg font-bold">{collection.Creator.username||"admin"}</h1>
            <span className="text-lg font-medium text-gray-700">Owner</span>
          </div>
        </div>
        <div className="p-10">
          <h1 className='text-3xl text-gray-500'>NFTs</h1>
          <div className='container grid grid-cols-4 gap-4 p-5'>
            {collection.nfts && collection.nfts.map((nft)=>(
              <Link key={nft?.nftId} className="group relative border-2 border-slate-400 p-2 rounded-md" href={`/nfts/${nft.nftId}`}>
                <div className='group relative border-2 border-slate-400 p-2 rounded-md shadow-md cursor-pointer'>
                  <div className="w-full">
                    <img
                      src={nft.logo}
                      alt={nft.name}
                    />
                  </div>
                  <h3 className="text-5xl text-gray-700  p-2">
                    {nft.title}
                  </h3>
                  <h3 className="text-lg text-gray-500  p-2">
                    {nft.description}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      }
    </div>
  )
}

export default CollectionDetail