import '../styles/globals.css'
import Navbar from '../components/navbar'
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  chain,
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { useEffect, useState } from 'react';
import axios from 'axios';

const CustomAvatar = ({ address,ensImage, size })=>{
  const [img, setImg] = useState()
  const API_URL = process.env.API_URL

  useEffect(()=>{
      const getUser = async () =>{
          const res = await axios.get(`${API_URL}/users/${address}`)
          if(res){
            setImg(res.data.data?.profileImage)
          }
      }
      if(address){
        getUser()
      }
  },[address])
  return (
    img  ? 
      <img src={img} width={size} height={size} style={{ borderRadius: 999 }} />
      :
      <>🤠</>
    
  )
}


function MyApp({ Component, pageProps }) {

  const { chains, provider } = configureChains(
    [chain.mainnet, chain.polygonMumbai],
    [
      alchemyProvider({ alchemyId: "frVV_vKK1_Pf-JkOiqzzn3L9Z9RSKNh1" }),
    ]
  );
  
  const { connectors } = getDefaultWallets({
    appName: 'My RainbowKit App',
    chains
  });
  
  const wagmiClient = createClient({
    autoConnect: true,
    chains,
    connectors,
    provider
  })

 
  
  return (
    <WagmiConfig  client={wagmiClient}>
      <RainbowKitProvider avatar={CustomAvatar}  chains={chains} coolMode>
        <Navbar/>
      </RainbowKitProvider>
    </WagmiConfig >
  )
}

export default MyApp
