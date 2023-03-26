import { Alert, Button, Snackbar } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeid } from '../App';
import ApiService from '../services/api.service';
import './Page.scss';

/**
 * This is the page for creating a new rider
 */
export const NewRider = () => {
  const [snack, setSnack] = useState({
    open: false,
    msg: '',
    mode: 'error',
  });
  const nav = useNavigate();
  const apiService = new ApiService();

  // submit the form data to the server for creating a new rider
  const handleSub = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const object: any = {};
    formData.forEach((value, key) => {
      if (value === '') return;
      object[key] = value;
    });
    if (object.password !== object.conpass) {// passwords do not match
      setSnack({
        open: true,
        msg: 'Passwords do not match!',
        mode: 'error'
      });

      return;
    }
    const exst = await apiService.post('auth/dupCheck', {}, { mobnum: object.mobnum.slice(-10) });  // check for duplicate data
    if(exst?.error) {
      setSnack({
        open: true,
        msg: `${exst?.error} is already taken.`,
        mode: 'error'
      })

      return;
    }
    object.id = await getMeAnID();  // assign an id to this user
    object.disabled = false;
    delete object.conpass;
    const req = await apiService.post('auth/web/updateUser', {}, object); // send the data to the server
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
      nav('/rid');  // navigate to the riders page
    }
  }

  // generates an id for the user
  const getMeAnID = async () => {
    let id, testCollision;
    do {
      id = makeid(10);
      testCollision = await apiService.get(`auth/checkid/rider/${id}`);
    }while(testCollision);
    return id;
  }

  // close the prompt
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
          <input placeholder="Name" type="text" name='name' id="name" required maxLength={50}/>
        </span>
        <span className="item">
          <label htmlFor="mobnum"></label>
          <input placeholder='09xxxxxxxxx' type="number" name='mobnum' id="mobnum" max={639999999999} min={9000000000} required/>
        </span>
        <span className="item">
          <label htmlFor="password"></label>
          <input placeholder='********' type="password" name='password' id="password" minLength={8} required/>
        </span>
        <span className="item">
          <label htmlFor="conpass"></label>
          <input placeholder='********' type="password" name='conpass' id="conpass" minLength={8} required/>
        </span>
        <span className="item">
          <label htmlFor="email"></label>
          <input type="email" name='email' id="email" placeholder='email' maxLength={50}/>
        </span>
        <span className="item">
          <label htmlFor="address"></label>
          <textarea name='address' id="address" placeholder='Address' maxLength={100}></textarea>
        </span>
        <span className="item">
          <Button color='success' variant="contained" type='submit'>Create User</Button>
        </span>
        <input type="hidden" name="type" value="rider"/>
        <input type="hidden" name="disabled" value="false"/>
      </form>
    </section>
  )
}