import axios from 'axios'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import Gallery from '../components/collections/gallery'
export default function Home() {
  const [featured, setFeatured] = useState(null)
  const [favourite, setFavourite] = useState(null)
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
    getFeatured()
    getFavourite()
  },[])
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
          <Gallery collections={featured} name="featured" />
        }
        {favourite && 
          <Gallery collections={favourite} name="favourite" />
        }
      </main>

    </div>
  )
}
