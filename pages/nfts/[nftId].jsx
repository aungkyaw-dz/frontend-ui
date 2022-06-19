import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
const Aung = () => {
  const router = useRouter()
  const {nftId} = router.query
  useEffect(()=>{
    localStorage.setItem('nftId',nftId)
    router.push('/nfts/detail')
  },[])
  return(
    <div>
      
    </div>
  )

}
export default Aung