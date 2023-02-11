import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.scss'
import Routing from './Routing'
import LocalStorageService from './services/localStorage.service';
import { Header } from './components/Header';

export const makeid = (length: number) => {
  let result           = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function App() {
  const lsrv = new LocalStorageService();
  const [logged, setLogged] = useState(lsrv.getData('logged'));

  useEffect(() => {
    lsrv.saveData('logged', logged);
    return ()=>{}
  }, [logged]);

  return (
    <div className="App">
      {logged && <Header setLogged={setLogged} />}
      <Routing logged={logged} setLogged={setLogged}/>
    </div>
  )
}

export default App
