import { Button, ButtonGroup } from "@mui/material";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import KeyValuePairList from "../models/key-value-pairs.interface";
import ApiService from "../services/api.service";

export const RideHistory = () => {
  const [bookings, setBookings] = useState<KeyValuePairList[]>([]);
  const apiService = new ApiService();
  const [cols,setCols] = useState<KeyValuePairList[]>([]);
  const [selectedRowData, setSelectedRows] = useState<KeyValuePairList[]>([]);
  const nav = useNavigate();

  const translations = (key:string): string => {
    let translated;
    switch (key.toLowerCase()) {
      case 'mobnum': translated = 'MOBILE NO';
        break;
      case 'platenum': translated = 'PLATE NO';
        break;
      case 'createdat': translated = 'REG DATE';
        break;
      case 'updatedat': translated = 'UPDATED';
        break;
      default: translated = key.toUpperCase();
    }
    return translated;
  }

  const ipv = (key: string, val: any): any => {
    let tv;
    switch(key.toLowerCase()) {
      case 'riderid': tv = <Button href={`/editrider/${val}`}color="success" variant="contained">{val}</Button>;
        break;
      case 'driverid': tv = <Button href={`/editdriver/${val}`}variant="contained">{val}</Button>
        break;
      case 'origin':
      case 'destination': tv = val.name;
      break;
      case 'photo': tv = <img src={val} style={{maxHeight:'150px', maxWidth:'150px'}} />;
        break;
      default: tv = val?.toString();
    }
    return tv;
  }

  const fetchBookings = async () => {
    const drv = await apiService.get('ride-hail/web/rides',{status:'finished'});
    setBookings(drv);
    const columns = Object.keys(drv?.[0]).map(k => ({ name: translations(k), selector: (row:KeyValuePairList)=>ipv(k, row?.[k]), omit: k === '_id', compact: ['timestamp', 'travelFare', 'status'].includes(k), sortable: true, grow: (['origin','destination'].includes(k) ? 3 : 1), wrap: ['origin','destination'].includes(k)
    }));
    setCols(columns);
  }

  useEffect(() => {
    fetchBookings();
    return ()=>{};
  }, [])

  useEffect(() => {
    if (localStorage.logged === 'false') {
      nav('/');
    }
    return ()=>{}
  }, []);

  return (
    <section className="reg page">
      {
      bookings && <DataTable
        columns={cols}
        data={bookings}
        fixedHeaderScrollHeight="300px"
        pagination
        responsive
        subHeaderWrap
        dense
        striped
        highlightOnHover
        defaultSortFieldId={1}
        />
      }
    </section>
  )
}