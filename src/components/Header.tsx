import { Avatar, Button, Icon, Menu, MenuItem } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import './Header.scss';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LocalStorageService from '../services/localStorage.service';

export const Header = ({setLogged}: {setLogged:any}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [loc, setLoc] = useState(useLocation());
  const open = Boolean(anchorEl);
  const lsrv = new LocalStorageService();
  const nav = useNavigate();
  const handleClick = (e: any) => {
    setAnchorEl(e.target);
  };
  const handleClose = (lnk: string) => {
    setAnchorEl(null);
    if (lnk) nav(lnk);
    else {
      lsrv.saveData('logged',false);
      setLogged(false);
      nav('/');
    }
  };
 return (
  <>
    <div className="header">
      <a onClick={handleClick}>
        <MenuIcon color='primary'/>
      </a>
      <a href='/'>
        <img src='assets/ipick.png'/>
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
      <MenuItem onClick={()=>handleClose('reg')}>Drivers</MenuItem>
      <MenuItem onClick={()=>handleClose('rid')}>Riders</MenuItem>
      <MenuItem onClick={()=>handleClose('rides')}>Ride History</MenuItem>
      <MenuItem onClick={()=>handleClose('stats')}>Stats</MenuItem>
      <MenuItem onClick={()=>handleClose('')}>Logout</MenuItem>
    </Menu>
  </>
 )
};