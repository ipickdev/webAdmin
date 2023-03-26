import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Icon, Menu, MenuItem } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import './Header.scss';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LocalStorageService from '../services/localStorage.service';

/**
 * This is the header component which contains user related items
 */
export const Header = ({setLogged, }: {setLogged:any, }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [loc, setLoc] = useState(useLocation());
  const [dialogData, setDialogData] = useState({content:'', title:''})
  const [openDia, setOpenDia] = useState(false);
  const open = Boolean(anchorEl);
  const lsrv = new LocalStorageService();
  const nav = useNavigate();
  const handleClick = (e: any) => {
    setAnchorEl(e.target);
  };
  

  // handles logout
  const handleClose = (lnk: string) => {
    setAnchorEl(null);
    if (lnk) nav(lnk);
    else {
      setDialogData({title: 'Are you sure you want to logout?', content:''});
      setOpenDia(true);
    }
  };
  // close the dialog
  const closeDia = (t = false) => {
    if (t) {
      lsrv.clearData();
      setLogged(false);
      nav('/');
    }
    setOpenDia(false);
  }
 return (
  <>
    <Dialog
      open={openDia}
      onClose={()=>closeDia(false)}
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
        <Button variant='outlined' color='info' onClick={()=>closeDia(false)}>Cancel</Button>
        <Button variant="contained" color="success" style={{color:'#fff'}}  onClick={()=>closeDia(true)} autoFocus>
          Ok
        </Button>
      </DialogActions>
    </Dialog>
    <div className="header">
      <a onClick={handleClick}>
        <MenuIcon color='primary'/>
      </a>
      <a href='/'>
        <img src='/assets/ipick.png'/>
      </a>
    </div>
    <Menu
      id="basic-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      MenuListProps={{
        'aria-labelledby': 'basic-button',
      }}
    >
    {/* Links here */}
    <MenuItem onClick={()=>handleClose('home')}>Home</MenuItem>
      <MenuItem onClick={()=>handleClose('reg')}>Drivers</MenuItem>
      <MenuItem onClick={()=>handleClose('rid')}>Riders</MenuItem>
      <MenuItem onClick={()=>handleClose('rides')}>Ride History</MenuItem>
      <MenuItem onClick={()=>handleClose('config')}>Config</MenuItem>
      <MenuItem onClick={()=>handleClose('msg')}>Messages</MenuItem>
      <MenuItem onClick={()=>handleClose('')}>Logout</MenuItem>
    </Menu>
  </>
 )
};