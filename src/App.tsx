import { useEffect, useState } from 'react'
import './App.scss'
import Routing from './Routing'
import LocalStorageService from './services/localStorage.service';
import { Header } from './components/Header';

/**
 * 
 * @param length - length of the id to be generated
 * @returns - an alphanumeric string 
 */
export const makeid = (length: number) => {
  let result           = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * 
 * @param f - string url filename to be replaced
 * @param baseOnly - if true, return only the base filename
 * @returns - the complete url string path of the file relative to the bucket container 
 */
export const buildPhotoPath = (f: string, baseOnly = false) => {
  if (!f) return null;
  const hostString = `https://${import.meta.env.VITE_AWS_PUBLIC_BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/`;
  const baseFname = f.replace(hostString, '');
  if (baseOnly) return baseFname;
  return `${hostString}${baseFname}`;
}

function App() {
  const lsrv = new LocalStorageService();
  const [logged, setLogged] = useState(lsrv.getData('logged'));

  useEffect(() => {
    lsrv.saveData('logged', logged);
    return ()=>{}
  }, [logged]);

  return (
    <div className='root'>
      <div className="App">
        {logged && <Header setLogged={setLogged} />}
        <Routing logged={logged} setLogged={setLogged}/>      
      </div>
    </div>
  )
}

export default App
