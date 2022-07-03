import axios from 'axios'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import CollectionGallery from '../components/collections/gallery'
import NftGallery from '../components/nfts/gallery'

export default function Home() {
  const [featured, setFeatured] = useState(null)
  const [favourite, setFavourite] = useState(null)
  const [nfts, setNfts] = useState(null)
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
      const res = await axios.get(`${API_URL}/nfts/list?sortBy=viewed`)
      setNfts(res.data.data)
    }
    getMostViewNfts()
    getFeatured()
    getFavourite()
  },[])
  console.log(nfts)
  return (
    <div className={styles.container}>
      <Head>
        <title>The Urban Tech</title>
        <meta name="description" content="The Urban Tech" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to The Urban Tech
        </h1>
        {featured && 
          <NftGallery nfts={nfts} name="most viewed" />
        }
        {featured && 
          <CollectionGallery collections={featured} name="featured" />
        }
        {favourite && 
          <CollectionGallery collections={favourite} name="favourite" />
        }
      </main>

    </div>
  )
}
