import Head from 'next/head'
import { useEffect, useState } from 'react'
import Link from 'next/link'
export default function Gallery({nfts, name}) {
  console.log(nfts)
  return (
      <div className="nft-gallery">
        <h1 className='text-4xl font-bold p-5'>{name.toUpperCase()} NFTs</h1>
        <div className="container grid grid-cols-3 gap-4">
        {
          nfts && nfts?.map((nft)=>(
            <div key={nft?.nftId}>
            <Link key={nft?.nftId} className="group relative border-2 border-slate-400 p-2 rounded-md" href={`nfts/${nft.nftId}`}>
              <div className="group relative border-2 border-slate-400 p-2 rounded-md shadow-md cursor-pointer">
              <div className="flex">
                <div className="w-32 p-5">
                  {nft.logo ? 
                  <img
                    src={nft.logo}
                    alt={nft.name}
                    className="w-full h-full object-center object-cover "
                  />:
                  <div className="w-full h-full background-gray"></div>
                  }
                </div>
                <div>
                <h3 className="text-5xl text-gray-700  p-2">
                  {nft.name}
                </h3>
                <h3 className="text-lg text-gray-500  p-2">
                  {nft.description}
                </h3>
                </div>
              </div>
              <div className="flex justify-between p-5">
                <div className="w-20 text-center">
                  <h1 className="text-lg font-bold">{nft.Creator?.username||"admin"}</h1>
                  <span className="text-lg font-medium text-gray-700">Creator</span>
                </div>
                <div className="w-20 text-center">
                  <h1 className="text-lg font-bold">{nft.Creator?.username||"admin"}</h1>
                  <span className="text-lg font-medium text-gray-700">Owner</span>
                </div>
              </div>
              </div>
            </Link>
            </div>
          ))
        }
      </div>
      {/* <div className='w-full text-right w-full'>
        
        <Link className="text-right w-full group relative border-2 border-slate-400 p-2 rounded-md" href={`nfts/${name}`}>
          Explore More
        </Link>
      </div> */}
      <hr className='m-5'/>
      </div>

  )
}
