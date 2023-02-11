import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../services/api.service";
import './Page.scss';

export const Home = ({ logged, setLogged }: { logged: boolean, setLogged: any }) => {
  const nav = useNavigate();
  const processSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const object: any = {};
    formData.forEach((value, key) => {
      object[key] = value;
    });
    console.log(e.target, formData);
    const apiService = new ApiService();
    
    try {
      const res = await apiService.post('ride-hail/web/login', {}, object);
      setLogged(res);
    } catch (e) {
      alert('Invalid login!');
    }
  }

  useEffect(() => {
    if (localStorage.logged === 'false') {
      nav('/');
    }
    return ()=>{}
  }, []);
  return (
    <section className="home page">
      { !logged &&
      <div>
        <form onSubmit={processSubmit}>
          <div className="item">
            <input type="text" name="username" title="username" placeholder="username" />
          </div>
          <div className="item">
            <input type="password" name="password" title="password" />
          </div>
          <div className="item">
            <input type="submit" value="Login" />
          </div>
        </form>
      </div>
      }
      {logged && 
      <div>
        Home Page
      </div>
      }
    </section>
  )
}