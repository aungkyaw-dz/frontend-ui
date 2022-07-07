import Head from 'next/head'
import { useEffect, useState } from 'react'
import Link from 'next/link'
export default function Gallery({collections, name}) {
  return (
      <div className="collection-gallery">
        <h1 className='text-4xl font-bold p-5'>{name.toUpperCase()} COLLECTIONS</h1>
        <div className="container grid grid-cols-3 gap-4">
        {
          collections && collections?.map((collection)=>(
            <div key={collection?.collectionId}>
            <Link key={collection?.collectionId} className="group relative border-2 border-slate-400 p-2 rounded-md" href={`collections/${collection.collectionId}`}>
              <div className="group relative border-2 border-slate-400 p-2 rounded-md shadow-md cursor-pointer">
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
              <div className="relative w-40 m-auto h-40">
                {collection.nfts.length > 1 && 
                  <div className="absolute text-5xl font-bold top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">+{collection.nfts.length-1}</div>
                  }
                <img
                  src={collection.nfts[0]?.logo}
                  alt={collection.nfts[0]?.name}
                  className="w-full h-full object-center object-cover"
                />
                
              </div>
              </div>
            </Link>
            </div>
          ))
        }
      </div>
      <div className='w-full text-right w-full'>
        
        <Link className="text-right w-full group relative border-2 border-slate-400 p-2 rounded-md" href={`collections/${name}`}>
          Explore More
        </Link>
      </div>
      <hr className='m-5'/>
      </div>

  )
}
