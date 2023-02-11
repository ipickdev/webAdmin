import { Alert, Button, Snackbar } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import KeyValuePairList from '../models/key-value-pairs.interface';
import ApiService from '../services/api.service';
import './Page.scss';
export const EditRider = () => {
  const params = useParams();
  const id = params.id;
  const [data, setData] = useState<KeyValuePairList>({});
  const [snack, setSnack] = useState({
    open: false,
    msg: '',
    mode: 'error',
  });
  const nav = useNavigate();
  const apiService = new ApiService();
  const handleSub = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const object: any = {};
    formData.forEach((value, key) => {
      if (value === '') return;
      object[key] = value;
    });
    const exst = await apiService.post('auth/dupCheck', {}, { mobnum: object.mobnum.slice(-10) });
    if(exst?.error && data?.mobnum.slice(-10) !== object.mobnum.slice(-10)) {
      setSnack({
        open: true,
        msg: `${exst?.error} is already taken.`,
        mode: 'error'
      })

      return;
    }
    const req = await apiService.post('auth/updateUser', {}, object);
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
      nav('/rid');
    }
  }

  useEffect(() => {
    const fetchDriverData = async () => {
      const dt = await apiService.get(`auth/rider/${id}`);
      setData(dt);
      console.log(data, id, params);
    }
    fetchDriverData();
    return ()=>{};
  }, [])

  const handleClose = () => {
    setSnack({...snack, open: false});
  }

  useEffect(() => {
    if (localStorage.logged === 'false') {
      nav('/');
    }
    return ()=>{}
  }, []);

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
        {/* <span className="item">
          <label htmlFor="conpass"></label>
          <input placeholder='********' type="password" name='conpass' id="conpass" minLength={8} required/>
        </span> */}
        <span className="item">
          <label htmlFor="email"></label>
          <input type="email" name='email' id="email" placeholder='email' maxLength={50} defaultValue={data?.email}/>
        </span>
        <span className="item">
          <label htmlFor="address"></label>
          <textarea name='address' id="address" placeholder='Address' maxLength={100} defaultValue={data?.address}></textarea>
        </span>
        <span className="item">
          <Button color='success' variant="contained" type='submit'>Update User</Button>
        </span>
        <input type="hidden" name="id" defaultValue={data?.id}/>
        <input type="hidden" name="disabled" defaultValue={data?.disabled}/>
      </form>
    </section>
  )
}