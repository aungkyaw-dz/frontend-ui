import { useEffect, useState } from "react"
import Head from "next/head";
import axios from "axios";

const NftLists = () => {
  const [nfts, setNfts] = useState('');
  const API_URL = process.env.API_URL

  useEffect(()=>{
    const getNfts = async () => {
      const res = await axios.get(`${API_URL}/nfts/list`)
      setNfts(res.data.data)
    }
    getNfts()
  },[])

  return(
    <div className="container mx-auto">
      <Head>
        <title>List of Nfts</title>
        <meta name="description" content="List of Nfts" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className='text-4xl font-bold p-5'>List of Nfts</h1>
      <div className="container grid grid-cols-4 gap-4">
        {
          nfts && nfts?.map((nft)=>(
            <div key={nft?.nftId} className="group relative border-2 border-slate-400 p-2 rounded-md" >
              <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none">
                <img
                  src={nft.logo}
                  alt={nft.name}
                  className="w-full h-full object-center object-cover "
                />
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700  p-2">
                    {nft.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 p-2">{nft.description}</p>
                </div>
                <p className="text-sm font-medium text-gray-900 ">{nft.price}</p>
              </div>
              <a href={nft.href} className="text-sm font-sm text-gray-900 border-2 rounded-full p-2">
                Buy Now
              </a>
            </div>
          ))
        }
      </div>
    </div>
  )

}

export default NftLists