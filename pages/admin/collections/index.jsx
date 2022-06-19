import Head from 'next/head'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAccount, useDisconnect } from 'wagmi';
import axios from 'axios';
import Link from 'next/link';

const Collections = () => {
  // const router = useRouter()
  // useEffect(()=>{
  //   const token = localStorage.getItem('jwtToken')
  //   if(!token){
  //     router.push('/admin/login')
  //   }
  // },[])
  const API_URL = process.env.API_URL

  const [collections, setCollections] = useState(null);
  useEffect(()=>{
    const getCollections = async () => {
      const res = await axios.get(`${API_URL}/collections/list`)
      setCollections(res.data.data)
    }
    getCollections()
  },[])

  return(
    <div className="container mx-auto">
      <Head>
        <title>Collection Lists</title>
        <meta name="description" content="Login with Admin Wallet" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
      <table class="table-auto">
        <thead>
          <tr>
            <th className='w-20'>logo</th>
            <th className='w-20'>banner</th>
            <th className='w-20'>Name</th>
            <th className='w-20'>Description</th>
            <th className='w-20'>Creator</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {collections && collections.map((collection)=>(
            <tr>
              <td><img src={collection.logo} alt={collection.name}/></td>
              <td><img src={collection.banner} alt={collection.name}/></td>
              <td>{collection.name}</td>
              <td>{collection.description}</td>
              <td>{collection.Creator?.username}</td>
              <td><Link  href={`collections/${collection.name}`}>Update</Link></td>
            </tr>
          ))}
          
        </tbody>
      </table>

      </div>
    </div>
  )
}

export default Collections