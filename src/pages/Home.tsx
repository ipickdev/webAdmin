import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../services/api.service";
import LocalStorageService from "../services/localStorage.service";
import './Page.scss';
import { Stats } from "./Stats";

/**
 * The home page displays the login page if the user is not logged. If logged, the stats page is called here instead.
 */
export const Home = ({ logged, setLogged }: { logged: boolean, setLogged: any }) => {
  const nav = useNavigate();
  const local = new LocalStorageService();

  // handles the login process
  const processSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const object: any = {};
    formData.forEach((value, key) => {
      object[key] = value;
    });
    const apiService = new ApiService();
    
    try {
      const res = await apiService.post('ride-hail/web/login', {}, object); // send the data to the server
      local.saveData('cred',btoa(JSON.stringify(object)))
      setLogged(res);
    } catch (e) {
      alert('Invalid login!');
    }
  }

  // reset any variables if the user is not logged
  useEffect(() => {
    if (localStorage.logged === 'false') {
      localStorage.removeItem('cred');
      nav('/');
    }
    return ()=>{}
  }, []);
  return (
    <section className="home page">
      { !logged &&
      <div style={{display:'block', margin:'5em auto'}}>
        <img src="/assets/ipick.png" alt="" style={{backgroundColor:'#fff', padding:'1rem', borderRadius:'4px', border: '1rem solid var(--secondary-color)'}}/>
        <form onSubmit={processSubmit}>
          <div className="item">
            <input type="text" name="username" title="username" placeholder="Username" />
          </div>
          <div className="item">
            <input type="password" name="password" title="password" placeholder="**********"/>
          </div>
          <div className="item">
            <input type="submit" value="Login" />
          </div>
        </form>
      </div>
      }
      {logged && 
        <Stats></Stats>
      }
    </section>
  )
}