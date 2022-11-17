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
import Footer from '../components/footer';

const CustomAvatar = ({ address,ensImage, size })=>{
  const [img, setImg] = useState()
  const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL

  useEffect(()=>{
      const getUser = async () =>{
          const res = await axios.get(`${REACT_APP_BACKEND_URL}/users/${address}`)
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
  const ALCHEMY_KEY = process.env.REACT_APP_ALCHEMY_KEY
  const { chains, provider } = configureChains(
    [chain.polygonMumbai],
    [
      alchemyProvider({ alchemyId: ALCHEMY_KEY }),
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
        <div style={{minHeight: "100vh", display: "flex", flexDirection:"column", justifyContent: "space-between"}}>
          <Navbar/>
          <Component {...pageProps} />  
          <Footer/>
        </div>
      </RainbowKitProvider>
    </WagmiConfig >
  )
}

export default MyApp
