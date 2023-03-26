import { Alert, Button, Snackbar } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import KeyValuePairList from '../models/key-value-pairs.interface';
import ApiService from '../services/api.service';
import './Page.scss';

/**
 * This is the page for editing a driver's details
 */
export const EditDriver = () => {
  const params = useParams();
  const id = params.id;
  const [data, setData] = useState<KeyValuePairList>({});
  const [dis, setDis] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    msg: '',
    mode: 'error',
  });
  const nav = useNavigate();
  const apiService = new ApiService();
  
  // submit the form data to the server for editing a driver
  const handleSub = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const object: any = {};
    formData.forEach((value, key) => {
      if (value === '') return;
      object[key] = value;
    });
    object.disabled = dis;
    const exst = await apiService.post('auth/dupCheck', {}, { mobnum: object.mobnum.slice(-10) });  // check for duplicate data
    if(exst?.error && data?.mobnum.slice(-10) !== object.mobnum.slice(-10)) {
      setSnack({
        open: true,
        msg: `${exst?.error} is already taken.`,
        mode: 'error'
      })

      return;
    }
    const req = await apiService.post('auth/web/updateDriver', {}, object); // send the data to the server
    if (req?.error) {
      setSnack({
        open: true,
        msg: 'Something went wrong. Please try again later!',
        mode: 'error'
      })
    } else {
      setSnack({
        msg: 'Account created!',
        open: true,
        mode: 'success'
      })
      nav('/reg'); // navigate to the drivers page
    }
  }

  // loads the driver's current data 
  useEffect(() => {
    const fetchDriverData = async () => {
      const dt = await apiService.get(`auth/driver/${id}`);
      setData(dt);
      setDis(dt.disabled);
      console.log(data, id, params);
    }
    fetchDriverData();
    return ()=>{};
  }, [])

  const handleClose = () => {
    setSnack({...snack, open: false});
  }

  // navigate to the login page if the user is not logged
  useEffect(() => {
    if (localStorage.logged === 'false') {
      nav('/');
    }
    return ()=>{}
  }, []);

  // set disabled
  const setDisData = (e: any) =>{
    setDis(e.checked);
  }

  return (
    <section className="page new-driver">
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        message={snack.msg}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={handleClose}
      >
        {
        snack.mode === 'error' ?
        <Alert severity="error">{snack.msg}</Alert> 
        :
        <Alert severity="success">{snack.msg}</Alert>
        }
      </Snackbar>
      <form onSubmit={handleSub}>
        <span className="item">
          <label htmlFor="name"></label>
          <input placeholder="Name" type="text" name='name' id="name" required maxLength={50} defaultValue={data?.name}/>
        </span>
        <span className="item">
          <label htmlFor="mobnum"></label>
          <input placeholder='09xxxxxxxxx' type="number" name='mobnum' id="mobnum" max={639999999999} min={9000000000} defaultValue={data?.mobnum} required/>
        </span>
        <span className="item">
          <label htmlFor="password"></label>
          <input placeholder='********' type="password" name='password' id="password" minLength={8}/>
        </span>
        <span className="item">
          <label htmlFor="plateNum"></label>
          <input type="text" name='plateNum' id="plateNum" placeholder='ABC123' required maxLength={10} defaultValue={data?.plateNum}/>
        </span>
        <span className="item">
          <label htmlFor="email"></label>
          <input type="email" name='email' id="email" placeholder='email' maxLength={50} defaultValue={data?.email}/>
        </span>
        <span className="item">
          <label htmlFor="address"></label>
          <textarea name='address' id="address" placeholder='Address' maxLength={100} defaultValue={data?.address}></textarea>
        </span>
        <span className="item">
          <label htmlFor="disabled" style={{display: 'inline-block', verticalAlign:'middle', padding:'0 0.5rem'}}>Disabled</label>
          <input style={{display: 'inline-block', verticalAlign:'middle', width:'auto', padding:'0 1rem'}} type="checkbox" name="disabled" id="disabled" checked={dis} onChange={(e)=>setDisData(e.target)}/>
        </span>
        <span className="item">
          <Button color='success' variant="contained" type='submit'>Update User</Button>
        </span>
        <input type="hidden" name="id" defaultValue={data?.id}/>
      </form>
    </section>
  )
}