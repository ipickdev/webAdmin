import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar } from "@mui/material";
import { useEffect, useState } from "react";
import ApiService from "../services/api.service";
import LocalStorageService from "../services/localStorage.service";

/**
 * This is the page for for configuring the web admin's password
 */
export const Config = () => {
  const [pass, setPass] = useState('');
  const [mypass, setMyPass] = useState('');
  const [curr, setCurr] = useState('');
  const [con, setCon] = useState('');
  const [open, setOpen] = useState(false);
  const api = new ApiService();
  const local = new LocalStorageService();
  const [dialogData, setDialogData] = useState({content:'', title:''})
  const [openDia, setOpenDia] = useState(false);

  // set credentials on load
  useEffect(() => {
    const cred = JSON.parse(atob(local.getData('cred')));
    setMyPass(cred?.password);
  }, []);

  // submit the form for changing the admin password
  const sub = () => {
    if (mypass !== curr) {
      setDialogData({title:'Invalid Password', content:''});
      setOpenDia(true);
      return ;
    }
    api.post('ride-hail/web/config/update', {}, {username: 'ipickadmin', password: pass}).then((d) => {
      setOpen(true);
    }).catch(console.warn)
    return ;
  };

  const handleClose = () => {
    setOpen(false);
    return;
  }
  return (
    <section className="config page">
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      message="Update successful"
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    />
    <Dialog
      open={openDia}
      onClose={()=>setOpenDia(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {dialogData.title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {dialogData.content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' color='info' onClick={()=>setOpenDia(false)}>Ok</Button>
      </DialogActions>
    </Dialog>
      <div className="pane" style={{width: '300px', display:'table', margin: '0 auto', padding: '1rem', boxShadow:'var(--soft-border2)', borderRadius:'4px'}}>
        <h2>Change Password</h2>
        <form action="">
          <div style={{padding: '1rem'}}>
            <label style={{textAlign: 'left', width: '100%', display:'block'}} htmlFor="curr">Enter Current Password</label> 
            <input type="password" placeholder="********" value={curr} id="curr" onChange={(e)=>setCurr(e.target.value)} minLength={8} required/>
          </div>
          <div style={{padding: '1rem'}}>
            <label style={{textAlign: 'left', width: '100%', display:'block'}} htmlFor="pass">Enter Password</label> 
            <input type="password" placeholder="********" value={pass} id="pass" onChange={(e)=>setPass(e.target.value)} minLength={8} required/>
          </div>
          <div style={{padding: '1rem'}}>
            <label style={{textAlign: 'left', width: '100%', display:'block'}} htmlFor="con">Confirm Password</label>
            <input type="password" placeholder="********" value={con} id="con" onChange={(e)=>setCon(e.target.value)} minLength={8} required/>
          </div>
          <div>
            <Button variant="contained" color="success" type="button" onClick={sub} disabled={con === '' || pass === '' || con !== pass || pass.length < 8}>Update Password</Button>
          </div>
        </form>
      </div>
    </section>
  );
}