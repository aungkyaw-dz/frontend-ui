import Head from 'next/head'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAccount, useDisconnect } from 'wagmi';
import axios from 'axios';
import DefaultImage from '../../../asset/images/default.png' 
import Image from 'next/image';
import LinkTo from '../../../components/linkto';

const Collections = () => {
  const router = useRouter()
  useEffect(()=>{
    const token = localStorage.getItem('jwtToken')
    if(!token){
      router.push('/admin/login')
    }
  },[])
  const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL
  console.log(DefaultImage)
  const [collections, setCollections] = useState(null);
  useEffect(()=>{
    const getCollections = async () => {
      const res = await axios.get(`${REACT_APP_BACKEND_URL}/collections/list`)
      setCollections(res.data.data)
    }
    getCollections()
  },[])
  console.log(collections)
  return(
    <div className="container mx-auto">
      <Head>
        <title>Collection Lists</title>
        <meta name="description" content="Login with Admin Wallet" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
      <table className="table-auto">
        <thead>
          <tr>
            <th className='w-52'>logo</th>
            <th className='w-52'>banner</th>
            <th className='w-52'>Name</th>
            <th className='w-52'>Description</th>
            <th className='w-52'>Creator</th>
            <th></th>
          </tr>
        </thead>
        <tbody className='text-center'>
          {collections && collections.map((collection)=>(
            <tr key={collection.collectionId}>
              <td className='p-1'><Image src={collection.logo||DefaultImage} width={300} height={300} alt={collection.name}/></td>
              <td className='p-1'><Image src={collection.banner||DefaultImage} width={300} height={300} alt={collection.name}/></td>
              <td>{collection.name}</td>
              <td>{collection.description}</td>
              <td>{collection.Creator?.username}</td>
              <td><LinkTo  href={`collections/${collection.collectionId}`}><button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>Update</button></LinkTo></td>
            </tr>
          ))}
          
        </tbody>
      </table>

      </div>
    </div>
  )
}

export default Collections