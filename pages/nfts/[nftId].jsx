import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
const Aung = () => {
  const router = useRouter()
  const {nftId} = router.query
  console.log(nftId)
  useEffect(()=>{
    localStorage.setItem('nftId',nftId)
    if(nftId){
      router.push('/nfts/detail')
    }
  },[nftId])
  return(
    <div>
      
    </div>
  )

}
export default Aung