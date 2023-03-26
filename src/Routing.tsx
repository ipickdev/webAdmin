import { Routes, Route } from 'react-router-dom';
import { Config } from './pages/Config';
import { EditDriver } from './pages/EditDriver';
import { EditRider } from './pages/EditRider';
import { Home } from './pages/Home';
import { ImageViewer } from './pages/ImageViewer';
import { Messages } from './pages/Messages';
import { NewDriver } from './pages/NewDriver';
import { NewRider } from './pages/NewRider';
import { Registrants } from './pages/Registrants';
import { RideHistory } from './pages/RideHistory';
import { Riders } from './pages/Riders';
import { Stats } from './pages/Stats';

/**
 * This contains all the routes available in the app and handles routing.
 */
const Routing = ({ logged, setLogged, }: {logged: boolean, setLogged: any, }) => {
  return (         
    <Routes>
      <Route path='/' element={<Home logged={logged} setLogged={setLogged} />} />
      <Route path='/home' element={<Home logged={logged} setLogged={setLogged} />} />
      <Route path='/reg' element={<Registrants />} />
      <Route path='/rid' element={<Riders />} />
      <Route path='/rides' element={<RideHistory />} />
      <Route path='/stats' element={<Stats />} />
      <Route path='/config' element={<Config />} />
      <Route path='/newdriver' element={<NewDriver />} />
      <Route path='/editdriver/:id' element={<EditDriver />} />
      <Route path='/newrider' element={<NewRider />} />
      <Route path='/msg' element={<Messages />} />
      <Route path='/editrider/:id' element={<EditRider />} />
      <Route path='/image' element={<ImageViewer />} />
    </Routes>
  );
}
export default Routing;