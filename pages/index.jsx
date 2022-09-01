import axios from 'axios'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import CollectionGallery from '../components/collections/gallery'
import NftGallery from '../components/nfts/gallery'
import {Sidebar, Tabs} from 'flowbite-react'
import {BiFilter} from 'react-icons/bi'

export default function Home() {
  const [featured, setfeatured] = useState([])
  const [collections, setCollections] = useState([])
  const [collectionId, setCollectionId] = useState('')
  const [nfts, setNfts] = useState([])
  const [status, setStatus] = useState('')
  const [item, setItem] = useState('')
  const [price, setPrice] = useState('')
  const [categories, setCategories] = useState('')
  const [chain, setChain] = useState('')
  const API_URL = process.env.API_URL
  const [limit, setLimit] = useState(10)
  useEffect(()=>{
    // const getfeatured = async ()=>{
    //   const res = await axios.get(`${API_URL}/collections/featured`)
    //   setfeatured(res.data.data)
    // }
    // const getFavourite = async ()=>{
    //   const res = await axios.get(`${API_URL}/collections/list`)
    //   setCollections(res.data.data)
    // }
    const getMostViewNfts = async ()=>{
      const res = await axios.get(`${API_URL}/collections/list?status=${status}&item=${item}&price=${price}&categories=${categories}&chain=${chain}&limit=${limit}`)
      setNfts(res.data.data)
    }
    getMostViewNfts()
    // getfeatured()
    // getFavourite()
  },[categories, chain, price, item, status, limit])

  const changeLimit=()=> setLimit(limit+10)

  return (
    <div className={styles.container}>
      <Head>
        <title>Kob Startup Project</title>
        <meta name="description" content="Kob Startup Project" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className="p-5 text-center text-5 xl">
          Welcome to Kob Startup Project
        </h1>
        <hr className='p-5'/>
        {/* {nfts.length >0 && 
          <NftGallery nfts={nfts} name="most viewed" />
        }
        {featured.length >0 && 
          <CollectionGallery collections={featured} name="featured" />
        }
        {favourite.length >0 && 
          <CollectionGallery collections={favourite} name="favourite" />
        } */}
        <div className="w-full flex ">
          <Sidebar aria-label="Sidebar with multi-level dropdown example " className="p-5 bg-gray-500">
            <Sidebar.Items>
              <Sidebar.ItemGroup>
                <Sidebar.Item
                  icon={BiFilter}
                >
                  Filter
                </Sidebar.Item>
                <Sidebar.Collapse
                  label="Status"
                >
                  <Sidebar.Item className='h-100'>
                    <div className='h-12'>
                      <Tabs.Group
                        aria-label="Pills"
                        style="pills"
                      >
                        <Tabs.Item title="New" onClick={()=>alert('af')}/>
                        <Tabs.Item title="Auction"/>
                      </Tabs.Group>
                    </div>
                    
                  </Sidebar.Item>
                </Sidebar.Collapse>
                <Sidebar.Collapse
                  label="All Items"
                >
                  <Sidebar.Item>
                    <div className='h-12'>
                      <Tabs.Group
                        aria-label="Pills"
                        style="pills"
                      >
                        <Tabs.Item title="Single"/>
                        <Tabs.Item title="Bundle"/>
                      </Tabs.Group>
                    </div>
                  </Sidebar.Item>
                </Sidebar.Collapse>
                <Sidebar.Collapse
                  label="Price"
                >
                  <Sidebar.Item>
                  <input 
                    className="shadow appearance-none border w-full rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none   focus:shadow-outline" 
                    id="name" 
                    name='name'
                    type="text"
                    placeholder="$USD"
                    value={price}
                    onChange={(e)=>setPrice(e.target.value)}
                    />
                  </Sidebar.Item>
                </Sidebar.Collapse>
                <Sidebar.Collapse
                  label="Categories"
                >
                  <Sidebar.Item onClick={()=>setCategories('Dog')} active={categories === 'Dog'} className="cursor-pointer">
                    Dog
                  </Sidebar.Item>
                  <Sidebar.Item onClick={()=>setCategories('Computer')} active={categories === 'Computer'} className="cursor-pointer">
                    Computer
                  </Sidebar.Item>
                  <Sidebar.Item onClick={()=>setCategories('Hotel')} active={categories === 'Hotel'} className="cursor-pointer">
                    Hotel
                  </Sidebar.Item>
                  <Sidebar.Item onClick={()=>setCategories('pool')} active={categories === 'pool'} className="cursor-pointer">
                    Swimming pool
                  </Sidebar.Item>
                </Sidebar.Collapse>
                <Sidebar.Collapse
                  label="Collections"
                >
                  {
                    collections && collections.map((collection)=>(
                      <Sidebar.Item key={collection.collectionId} onClick={()=>setCollectionId(collection.collectionId)} className="cursor-pointer" active={collectionId === collection.collectionId}>
                        <span>
                          {collection.name}
                        </span>
                      </Sidebar.Item>    
                    ))
                  }
                  
                </Sidebar.Collapse>
                <Sidebar.Collapse
                  label="Chain"
                >
                  <Sidebar.Item onClick={()=>setChain('polygon')} active={chain === 'polygon'}>
                    Polygon
                  </Sidebar.Item>
                </Sidebar.Collapse>
              </Sidebar.ItemGroup>
            </Sidebar.Items>
          </Sidebar>
          {nfts.length >0 && 
            <NftGallery nfts={nfts} name="most viewed" limit={limit} changeLimit={changeLimit}/>
          }
        </div>
        
      </main>

    </div>
  )
}
