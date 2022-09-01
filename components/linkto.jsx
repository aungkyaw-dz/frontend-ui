
const LinkTo = ({href, className, key, children})=>{

  const redirectTo = () =>{
    window.location.href = href
  }
  return(
    <div className={`cursor-pointer ${className}`} key={key} onClick={redirectTo}>
      {children}
    </div>
  )

}
export default LinkTo