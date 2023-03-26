import { useSearchParams } from 'react-router-dom';
/**
 * The imageviewer page displays image from the amazon bucket when accessed from the ipick web admin page
 */
export const ImageViewer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const url = searchParams.get("url") ?? '';
  console.log(url);

  return (
    <section style={{position: 'fixed', top: 0, left: 0, height:'100%', width: '100%', padding:0, zIndex:3, backgroundColor: '#333'}} className="page image-viewer">
      <img src={url} alt="" style={{display:'block', height:'auto', width:'300px', margin:'auto'}}/>
    </section>
  )
};