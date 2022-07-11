import Head from 'next/head'
import { useEffect, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import axios from 'axios';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Login = () => {

  const { data, isError, isLoading } = useAccount()
  const { disconnect } = useDisconnect()
  const API_URL = process.env.API_URL

  useEffect(()=>{
    if(data){
      const getAdmin = async() => {
        const loginData = {
          walletAddress: data.address
        }
        try{
          const resData = await axios.post( `${API_URL}/admin/login`, loginData)
          if(resData){
            localStorage.setItem('jwtToken', resData.data.data.accessToken)
          }
        }catch (err){
          localStorage.removeItem('jwtToken')
          disconnect()
        }
      }
      getAdmin()
    }
  },[data])

  return(
    <div className="container mx-auto">
      <Head>
        <title>Admin Login</title>
        <meta name="description" content="Login with Admin Wallet" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        {!data && (
          <div className='container'>
            <div className='m-auto p-5'>
              <h1>Connect with Admin Wallet</h1>
              <ConnectButton className="shadow-md" accountStatus="avatar" showBalance={false}/>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login