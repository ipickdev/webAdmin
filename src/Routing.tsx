import { Routes, Route } from 'react-router-dom';
import { EditDriver } from './pages/EditDriver';
import { EditRider } from './pages/EditRider';
import { Home } from './pages/Home';
import { NewDriver } from './pages/NewDriver';
import { NewRider } from './pages/NewRider';
import { Registrants } from './pages/Registrants';
import { RideHistory } from './pages/RideHistory';
import { Riders } from './pages/Riders';
import { Stats } from './pages/Stats';

const Routing = ({ logged, setLogged }: {logged: boolean, setLogged: any, }) => {
  return (         
    <Routes>
      <Route path='/' element={<Home logged={logged} setLogged={setLogged} />} />
      <Route path='/reg' element={<Registrants />} />
      <Route path='/rid' element={<Riders />} />
      <Route path='/rides' element={<RideHistory />} />
      <Route path='/stats' element={<Stats />} />
      <Route path='/newdriver' element={<NewDriver />} />
      <Route path='/editdriver/:id' element={<EditDriver />} />
      <Route path='/newrider' element={<NewRider />} />
      <Route path='/editrider/:id' element={<EditRider />} />
    </Routes>
  );
}
export default Routing;