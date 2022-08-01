import Head from 'next/head'
import { useEffect, useState } from 'react'
import Link from 'next/link'
export default function Gallery({nfts, name}) {
  return (
      <div className="nft-gallery">
        {/* <h1 className='text-4xl font-bold p-5'>{name.toUpperCase()} NFTs</h1> */}
        <div className="container grid lg:grid-cols-3  gap-4">
        {
          nfts && nfts?.map((nft)=>(
            <div key={nft?.nftId}>
            <Link key={nft?.nftId} className="group relative border-2 border-slate-400 p-2 rounded-md" href={`nfts/${nft.nftId}`}>
              <div className="group relative border-2 border-slate-400 p-5 rounded-md shadow-md cursor-pointer overflow-hidden">
              <div className="w-full h-60 overflow-hidden">
                {nft.logo ? 
                  <div className="w-full h-full object-center object-cover "
                  >
                    {
                      nft?.fileType === 'image' && (
                      <img
                        src={nft.logo}
                        alt={nft.name}
                      />  
                      )
                    }
                    {
                      nft?.fileType === 'video' && (
                        <video controls width="auto">
                          <source src={nft.logo}
                                  type="video/mp4"/>
                        </video>  
                      )
                    }
                  </div>:
                  <div className="w-full h-full bg-gray-500"></div>
                }
              </div>
              <div className='p-5'>
                <h1 className="text-lg font-bold">Name</h1>
                <p className="text-lg font-medium text-gray-700 border-2 p-2 w-100">{nft.name}</p>
                <h1 className="text-lg font-bold mt-3">Description</h1>
                <p className="text-lg font-medium text-gray-700 border-2 p-2 w-100 h-24 overflow-auto">{nft.description}</p>
                <h1 className="text-lg font-bold mt-3">Owner</h1>
                <p className="text-lg font-medium text-gray-700 border-2 p-2 w-100">{nft.Owner?.username}</p>
                <h1 className="text-lg font-bold mt-3">Minted Date</h1>
                <p className="text-lg font-medium text-gray-700 border-2 p-2 w-100">{nft.createdAt}</p>
              </div>
              <div className='flex justify-between p-5'>
                <div className='flex  justify-around w-36'>
                  <h1 className="text-lg font-bold">Price</h1>
                  <p className="text-lg font-medium text-gray-700 ">{nft.price} ETH</p>
                </div>
                <button className='rounded-full bg-red-500 w-24'>Buy</button>
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
