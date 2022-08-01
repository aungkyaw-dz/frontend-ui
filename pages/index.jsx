import axios from 'axios'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import CollectionGallery from '../components/collections/gallery'
import NftGallery from '../components/nfts/gallery'
import {Sidebar} from 'flowbite-react'
import {BiFilter} from 'react-icons/bi'

export default function Home() {
  const [featured, setfeatured] = useState([])
  const [favourite, setFavourite] = useState([])
  const [nfts, setNfts] = useState([])
  const [status, setStatus] = useState('')
  const [item, setItem] = useState('')
  const [price, setPrice] = useState('')
  const [categories, setCategories] = useState('')
  const [chain, setChain] = useState('')
  const API_URL = process.env.API_URL
  useEffect(()=>{
    const getfeatured = async ()=>{
      const res = await axios.get(`${API_URL}/collections/featured`)
      setfeatured(res.data.data)
    }
    const getFavourite = async ()=>{
      const res = await axios.get(`${API_URL}/collections/favourite`)
      setFavourite(res.data.data)
    }
    const getMostViewNfts = async ()=>{
      const res = await axios.get(`${API_URL}/nfts/list?status=${status}&item=${item}&price=${price}&categories=${categories}&chain=${chain}`)
      setNfts(res.data.data)
    }
    getMostViewNfts()
    getfeatured()
    getFavourite()
  },[categories, chain, price, item, status])
  console.log(categories)
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
        <div className="w-fit flex ">
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
                  <Sidebar.Item>
                    <div  className='flex justify-between'>
                      <button className="focus:outline-none text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-900 ">New</button>
                      <button className="focus:outline-none text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-900">Auction</button>
                    </div>
                  </Sidebar.Item>
                </Sidebar.Collapse>
                <Sidebar.Collapse
                  label="All Items"
                >
                  <Sidebar.Item>
                    <div  className='flex justify-between'>
                      <button className="focus:outline-none text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-900 w-100">Single</button>
                      <button className="focus:outline-none text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-900 w-100">Bundle</button>
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
                    placeholder="$USD"
                    />
                    <button type='submit'  className="focus:outline-none text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-900 m-2">Apply</button>
                  </Sidebar.Item>
                </Sidebar.Collapse>
                <Sidebar.Collapse
                  label="Categories"
                >
                  <Sidebar.Item onClick={()=>setCategories('test')} className="cursor-pointer">
                    Illusrations
                  </Sidebar.Item>
                </Sidebar.Collapse>
                <Sidebar.Collapse
                  label="Chain"
                >
                  <Sidebar.Item onClick={()=>setChain('polygon')}>
                    Polygon
                  </Sidebar.Item>
                </Sidebar.Collapse>
              </Sidebar.ItemGroup>
            </Sidebar.Items>
          </Sidebar>
          {nfts.length >0 && 
            <NftGallery nfts={nfts} name="most viewed" />
          }
        </div>
        
      </main>

    </div>
  )
}
