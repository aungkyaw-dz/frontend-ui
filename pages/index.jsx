import axios from 'axios'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import CollectionGallery from '../components/collections/gallery'
import NftGallery from '../components/nfts/gallery'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [favourite, setFavourite] = useState([])
  const [nfts, setNfts] = useState([])
  const API_URL = process.env.API_URL
  useEffect(()=>{
    const getFeatured = async ()=>{
      const res = await axios.get(`${API_URL}/collections/featured`)
      setFeatured(res.data.data)
    }
    const getFavourite = async ()=>{
      const res = await axios.get(`${API_URL}/collections/favourite`)
      setFavourite(res.data.data)
    }
    const getMostViewNfts = async ()=>{
      const res = await axios.get(`${API_URL}/nfts/list?sortBy=viewed&status=MINTED`)
      setNfts(res.data.data)
    }
    getMostViewNfts()
    getFeatured()
    getFavourite()
  },[])
  console.log(favourite)
  console.log(featured)
  return (
    <div className={styles.container}>
      <Head>
        <title>Kob Startup Project</title>
        <meta name="description" content="Kob Startup Project" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Kob Startup Project
        </h1>
        {nfts.length >0 && 
          <NftGallery nfts={nfts} name="most viewed" />
        }
        {featured.length >0 && 
          <CollectionGallery collections={featured} name="featured" />
        }
        {favourite.length >0 && 
          <CollectionGallery collections={favourite} name="favourite" />
        }
      </main>

    </div>
  )
}
