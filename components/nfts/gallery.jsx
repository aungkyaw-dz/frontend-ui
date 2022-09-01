import Head from 'next/head'
import { useEffect, useState } from 'react'
import { Button } from 'flowbite-react'
import LinkTo from '../linkto'

export default function Gallery({nfts, name, limit, changeLimit}) {
  const [image, setImage] = useState()
  return (
      <div className="nft-gallery w-full">
        {/* <h1 className='text-4xl font-bold p-5'>{name.toUpperCase()} NFTs</h1> */}
        <div className="container grid w-100 md:grid-cols-2 lg:grid-cols-3  gap-4">
        {
          nfts && nfts?.map((nft)=>(
            <div key={nft?.collectionId}>
            <LinkTo key={nft?.nftId} className="group relative  rounded-md" href={`nfts/${nft.collectionId}`}>
              <div className="group relative border-2 border-slate-400 p-2 rounded-md shadow-md cursor-pointer overflow-hidden">
              <div className="w-full h-60 overflow-hidden">
                {nft.logo ? 
                  <div className="w-full h-full object-center object-cover "
                  >
                    <img
                        src={nft.logo}
                        alt={nft.name}
                      />  
                  </div>:
                  <div className="w-full h-full bg-gray-500"></div>
                }
              </div>
              <div className='p-2'>
                <h1 className="text-lg font-bold">Name</h1>
                <p className="text-lg font-medium text-gray-700 border-2 p-2 w-100">{nft.name}</p>
                <h1 className="text-lg font-bold mt-3">Description</h1>
                <p className="text-lg font-medium text-gray-700 border-2 p-2 w-100 h-24 overflow-auto">{nft.description}</p>
                {/* <h1 className="text-lg font-bold mt-3">Owner</h1>
                <p className="text-lg font-medium text-gray-700 border-2 p-2 w-100">{nft.Owner?.username}</p>
                <h1 className="text-lg font-bold mt-3">Minted Date</h1>
                <p className="text-lg font-medium text-gray-700 border-2 p-2 w-100">{nft.createdAt}</p> */}
              </div>
              <div className='h-12'>

                {nft.listed &&
                (
                  <div className='flex items-center  justify-between w-full'>
                    <div className='flex items-center  justify-start w-full'>
                      <h1 className="text-lg font-bold p-2">Price</h1>
                      <p className="text-lg font-medium text-gray-700 p-2">{nft?.price} MATIC</p>
                    </div>
                    <Button >Buy</Button>
                  </div>
                )
                }
              </div>
              
              </div>
            </LinkTo>
            </div>
          ))
        }
      </div>
      <div className='w-full text-right w-full'>
        {nfts.length >= limit && (
          <Button onClick={changeLimit}>show More</Button>
        )}
        
      </div>
      <hr className='m-5'/>
      </div>

  )
}
