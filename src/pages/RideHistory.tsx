import { Button, ButtonGroup } from "@mui/material";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import KeyValuePairList from "../models/key-value-pairs.interface";
import ApiService from "../services/api.service";
import LocalStorageService from "../services/localStorage.service";

/**
 * The ride history page displays all the completed bookings in the ipick app
 */
export const RideHistory = () => {
  const [bookings, setBookings] = useState<KeyValuePairList[]>([]);
  const apiService = new ApiService();
  const local = new LocalStorageService();
  const [drivers, setDrivers] = useState(local.getData('drivers') ?? []);
  const [riders, setRiders] = useState(local.getData('riders') ?? []);
  const [cols,setCols] = useState<KeyValuePairList[]>([]);
  const nav = useNavigate();
  const [filteredRides, setfilteredRides] = useState<KeyValuePairList[]>([]);
  const [startDate, setStart] = useState('');
  const [endDate, setEnd] = useState(new Date().toISOString().substring(0, 10));
  const [filterm, setFilterm] = useState('');
  
  // builds the CSV file for download
  const convertArrayOfObjectsToCSV = (array: any[]) => {
    let result: any;
  
    const columnDelimiter = ',';
    const lineDelimiter = '\n';
    const keys = ['riderId', 'rider', 'rider_number', 'driverId', 'driver', 'driver_number', '_id', 'computations', 'destination', 'origin', 'travelFare', 'status', 'timestamp', 'riderRating', 'driverRating'];
  
    result = '';
    result += keys.map(k=>translations(k)).join(columnDelimiter);
    result += lineDelimiter;
  
    array.forEach(item => {
      let ctr = 0;
      keys.forEach(key => {
        if (ctr > 0) result += columnDelimiter;
        const val = ipv(key, item[key], true);
  
        result += '"'+(val ?? '')+'"';
        // eslint-disable-next-line no-plusplus
        ctr++;
      });
      result += lineDelimiter;
    });
  
    return result;
  }

  // initializes the handler for downloading the stats as csv
const downloadCSV = (array: any[]) => {
  console.log(array);
	const link = document.createElement('a');
	let csv = convertArrayOfObjectsToCSV(array);
	if (csv == null) return;

	const filename = 'bookings.csv';

	if (!csv.match(/^data:text\/csv/i)) {
		csv = `data:text/csv;charset=utf-8,${csv}`;
	}

	link.setAttribute('href', encodeURI(csv));
	link.setAttribute('download', filename);
	link.click();
}

// eslint-disable-next-line react/prop-types
const Export = ({ onExport }: {onExport: any}) => <Button onClick={(e: any) => onExport(e.target.value)}>Export</Button>;
const actionsMemo = useMemo(() => <Export onExport={() => downloadCSV(filteredRides)} />, [filteredRides]);

  // formats labels for the datatable
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
      case 'timestamp': translated = 'BOOKING DATE';
        break;
      case 'driverrating': translated = 'DRIVER RATING';
        break;
      case 'riderrating': translated = 'RIDER RATING';
        break;
      default: translated = key.toUpperCase().replace('_',' ');
    }
    return translated;
  }

  // formats data for the datatable
  const ipv = (key: string, val: any, forDl = false): any => {
    let tv;
    switch(key.toLowerCase()) {
      case 'origin':
      case 'destination': tv = val?.name ?? '';
      break;
      case 'driverrating': tv = forDl ? JSON.stringify(val).replaceAll('"','`') : val && val.length > 0 ? <div>
        <p>Car: {val?.[0]?.rating}</p>
        <p>Comments: {val?.[0]?.comments}</p>
        <hr/>
        <p>Service: {val?.[1]?.rating}</p>
        <p>Comments: {val?.[1]?.comments}</p>
        </div> : <p>Not rated</p>
        break;
      case 'riderrating': tv = forDl ? JSON.stringify(val).replaceAll('"','`') : val?.rating ? <div>
        <p>Rating: {val.rating}</p>
        <p>Comments: {val?.comments}</p>
      </div>: <p>Not rated</p>
        break;
      case 'computations': tv = forDl ? JSON.stringify(val) : <div style={{whiteSpace:'normal'}}>{val ? Object.entries(val).map(v=>v.join(' - ')).join(', ') : ''}</div>;
        break;
      case 'travelfare': tv = parseFloat(val);
        break;
      case 'updatedat':
      case 'timestamp': tv = format(new Date(val), 'yyyy-MM-dd HH:mm:ss');
        break;
      case 'driver_number':
      case 'rider_number': tv = val ? `+63${val?.slice(-10)}` : '';
        break;
      default: tv = val?.toString();
    }
    return tv;
  }

  // fetch rider data from the server or load from local storage if available
  const fetchRiders = async () => {  
    const rid = await apiService.get('ride-hail/web/riders');
    local.saveData('riders', rid);
    setRiders(rid);
  }

  // fetch driver data from the server or load from local storage if available
  const fetchDrivers = async () => {  
    const rid = await apiService.get('ride-hail/web/drivers');
    local.saveData('drivers', rid);
    setDrivers(rid);
  }

  // fetch booking data from the server
  const fetchBookings = async () => {
    const drv = await apiService.get('ride-hail/web/rides',{status:'finished,cancelled'});
    if (riders?.length < 1) {
      await fetchRiders();
      await fetchDrivers();
    }
    
    // assign rider and driver data to the booking dataset
    let initFilter = drv.map((b: KeyValuePairList) => {
      const rider = riders.find((r: KeyValuePairList) => r.id === b.riderId);
      const driver = drivers.find((d: KeyValuePairList) => d.id === b.driverId);
      let dt: KeyValuePairList = {};
      dt.riderId = rider?.id ?? '';
      dt.rider = rider?.name ?? '';
      dt.rider_number = rider?.mobnum ?? '';
      dt.driverId = driver?.id ?? '';
      dt.driver = driver?.name ?? '';
      dt.driver_number = driver?.mobnum ?? '';
      dt.driverRating = b?.driverRating ?? {};
      dt.riderRating = b?.riderRating ?? {};
      return {...dt, ...b};
    }).sort((a: KeyValuePairList, b: KeyValuePairList) => new Date(b.timestamp).getTime()-new Date(a.timestamp).getTime());
    setBookings(initFilter);
    setfilteredRides(initFilter);
    // assign column data and settings for usage in the datatable plugin
    const columns = Object.keys(initFilter?.[initFilter.length-1]).map(k => ({ name: translations(k), selector: (row:KeyValuePairList)=>ipv(k, row?.[k]), omit: k === '_id', compact: ['timestamp', 'travelFare', 'status'].includes(k), sortable: ['riderId','destination', 'origin', 'driverId', 'timestamp', 'travelFare', 'status'].includes(k), grow: (['origin','destination', 'computations'].includes(k) ? 3 : ['riderRating', 'driverRating'].includes(k) ? 2 : 1), wrap: ['origin','destination'].includes(k)
    }));
    setCols(columns);
  }

  // fetch the booking data on page load
  useEffect(() => {
    fetchBookings();
    return ()=>{};
  }, [])

  // navigate to the login page if the user is not logged
  useEffect(() => {
    if (localStorage.logged === 'false') {
      nav('/');
    }
    return ()=>{}
  }, []);

  // refreshes the data using the filter variables for filter term, startdate and enddate
  const filter = () => {
    if (filterm === '') {
      const startFilt = startDate ? bookings.filter(f => new Date(f.timestamp) >= new Date(startDate)) : bookings;
      const endFilt = endDate ? startFilt.filter(f => new Date(f.timestamp) <= new Date(endDate)) : startFilt;
      setfilteredRides(endFilt);
      return;
    }
    const filtered = bookings?.filter(rid => {
      return (
        rid.destination?.name?.toLowerCase().includes(filterm.toLowerCase()) || 
        rid.driverId?.toLowerCase()?.includes(filterm.toLowerCase()) || 
        rid.origin?.name?.toLowerCase().includes(filterm.toLowerCase()) || 
        rid.riderId?.toLowerCase().includes(filterm.toLowerCase()) || 
        rid.travelFare?.toString().toLowerCase().includes(filterm.toLowerCase()) || 
        rid.rider?.toString().toLowerCase().includes(filterm.toLowerCase()) || 
        rid.driver?.toString().toLowerCase().includes(filterm.toLowerCase()) || 
        rid.rider_number?.toString().toLowerCase().includes(filterm.toLowerCase()) || 
        rid.status?.toString().toLowerCase().includes(filterm.toLowerCase()) || 
        rid.driver_number?.toString().toLowerCase().includes(filterm.toLowerCase())
      );
    });
    const startFilt = startDate ? filtered.filter(f => new Date(f.timestamp) >= new Date(startDate)) : filtered;
    const endFilt = endDate ? startFilt.filter(f => new Date(f.timestamp) <= new Date(endDate)) : startFilt;
    setfilteredRides(endFilt);
  }

  // calls the function for refreshing the data whenever the filter term, startdate, or enddate changes
  useEffect(() => {
    filter();
    return () => {};
  }, [startDate, endDate, filterm])

  return (
    <section className="reg page">
      <h1>Ride History</h1>
    <span className="controls">
      <input type="text" value={filterm} onChange={(e)=>setFilterm(e.target.value)} placeholder="Search Term"/>
      <input type="date" value={startDate} onChange={(e)=>setStart(e.target.value)} placeholder="Start"/>
      <input type="date" value={endDate} onChange={(e)=>setEnd(e.target.value)} placeholder="End"/>
    </span>
      {
      filteredRides && <DataTable
        columns={cols}
        data={filteredRides}
        fixedHeaderScrollHeight="300px"
        pagination
        responsive
        subHeaderWrap
        dense
        striped
        highlightOnHover
        defaultSortFieldId={6}
        defaultSortAsc={false}
        actions={actionsMemo}
        paginationRowsPerPageOptions={[10,25,50,100]}
        />
      }
    </section>
  )
}