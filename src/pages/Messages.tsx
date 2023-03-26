import { Button, ButtonGroup } from "@mui/material";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import KeyValuePairList from "../models/key-value-pairs.interface";
import ApiService from "../services/api.service";
import LocalStorageService from "../services/localStorage.service";

/**
 * The messages page displays messages from the users of ipick
 */
export const Messages = () => {
  const [msgs, setMsgs] = useState<KeyValuePairList[]>([]);
  const [filteredMsgs, setFilteredMsgs] = useState<KeyValuePairList[]>([]);
  const [startDate, setStart] = useState('');
  const [endDate, setEnd] = useState(new Date().toISOString().substring(0, 10));
  const [filterm, setFilterm] = useState('');
  const apiService = new ApiService();
  const local = new LocalStorageService();
  const [drivers, setDrivers] = useState(local.getData('drivers') ?? []);
  const [riders, setRiders] = useState(local.getData('riders') ?? []);
  const [cols,setCols] = useState<KeyValuePairList[]>([]);
  const [selectedRowData, setSelectedRows] = useState<KeyValuePairList[]>([]);
  const nav = useNavigate();
  
  // builds the CSV file for download
  const convertArrayOfObjectsToCSV = (array: any[]) => {
    let result: any;
  
    const columnDelimiter = ',';
    const lineDelimiter = '\n';
    const keys = Object.keys(array[0]);
  
    result = '';
    result += keys.map(k=>translations(k)).join(columnDelimiter);
    result += lineDelimiter;
  
    array.forEach(item => {
      let ctr = 0;
      keys.forEach(key => {
        if (ctr > 0) result += columnDelimiter;
        const val = ipv(key, item[key]);
  
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

	const filename = 'feedback.csv';

	if (!csv.match(/^data:text\/csv/i)) {
		csv = `data:text/csv;charset=utf-8,${csv}`;
	}

	link.setAttribute('href', encodeURI(csv));
	link.setAttribute('download', filename);
	link.click();
}

// eslint-disable-next-line react/prop-types
const Export = ({ onExport }: {onExport: any}) => <Button onClick={(e: any) => onExport(e.target.value)}>Export</Button>;
const actionsMemo = useMemo(() => <Export onExport={() => downloadCSV(filteredMsgs)} />, [filteredMsgs]);

  // formats labels for the datatable
  const translations = (key:string): string => {
    let translated;
    switch (key.toLowerCase()) {
      case 'mobnum': translated = 'MOBILE NO';
        break;
      case 'updatedat': translated = 'DATE SENT';
        break;
      case 'msg': translated = 'MESSAGE';
        break;
      case 'type': translated = 'USER TYPE';
        break;
      default: translated = key.toUpperCase();
    }
    return translated;
  }

  // formats data for the datatable
  const ipv = (key: string, val: string): any => {
    let tv;
    switch(key.toLowerCase()) {
      case 'mobnum': tv = val ? `+63${val?.slice(-10)}` : '';
        break;
      case 'updatedat':
      case 'createdat': tv = format(new Date(val), 'yyyy-MM-dd HH:mm:ss');
        break;
      case 'photo': tv = val; // <img src={val} style={{maxHeight:'150px', maxWidth:'150px'}} />;
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

  // fetch messaging data from the server
  const fetchMsgs = async () => {
    const msgs = await apiService.get('ride-hail/web/messages');
    if (riders?.length < 1) {
      await fetchRiders();
      await fetchDrivers();
    }
    // assign rider and driver data to the messages dataset
    const initFilter = msgs.map((m: KeyValuePairList) => {
      let type = 'rider';
      let usr = riders.find((r: KeyValuePairList) => r.id === m.id);
      if (!usr) {
        usr = drivers.find((d: KeyValuePairList) => d.id === m.id);
        type = 'driver';
      }
      const id = m._id;
      const sender = usr?.name;
      const mobnum = usr?.mobnum;
      delete m.id;
      delete m._id;
      return {id, sender, mobnum, ...m, type};
    });
    setMsgs(initFilter);
    setFilteredMsgs(initFilter);
    // assign column data and settings for usage in the datatable plugin
    const columns = Object.keys(initFilter?.[0]).map(k => ({ name: translations(k), selector: (row:KeyValuePairList)=>ipv(k, row?.[k]), omit: ['createdAt'].includes(k), compact: true, sortable: k !== 'photo',
    }));
    setCols(columns);
  }

  // fetch the messages data on page load
  useEffect(() => {
    fetchMsgs();
    return ()=>{};
  }, [])

  const handleSelect = ({ selectedRows }: {selectedRows: KeyValuePairList[]}) => {
    setSelectedRows(selectedRows);
  }

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
      const startFilt = startDate ? msgs.filter(f => new Date(f.updatedAt) >= new Date(startDate)) : msgs;
      const endFilt = endDate ? startFilt.filter(f => new Date(f.updatedAt) <= new Date(endDate)) : startFilt;
      setFilteredMsgs(endFilt);
      return;
    }
    const filtered = msgs?.filter(rid => {
      return (rid.id.toLowerCase().includes(filterm.toLowerCase()) || rid.msg.toLowerCase().includes(filterm.toLowerCase()) || rid.type.toLowerCase().includes(filterm.toLowerCase()) || rid?.sender?.toLowerCase().includes(filterm.toLowerCase()));
    });
    const startFilt = startDate ? filtered.filter(f => new Date(f.updatedAt) >= new Date(startDate)) : filtered;
    const endFilt = endDate ? startFilt.filter(f => new Date(f.updatedAt) <= new Date(endDate)) : startFilt;
    setFilteredMsgs(endFilt);
  }

  // calls the function for refreshing the data whenever the filter term, startdate, or enddate changes
  useEffect(() => {
    filter();
    return () => {};
  }, [startDate, endDate, filterm])

  return (
    <section className="reg page" style={{padding: '1rem'}}>
      <span className="controls">
        <input type="text" value={filterm} onChange={(e)=>setFilterm(e.target.value)} placeholder="Search Term"/>
        <input type="date" value={startDate} onChange={(e)=>setStart(e.target.value)} placeholder="Start"/>
        <input type="date" value={endDate} onChange={(e)=>setEnd(e.target.value)} placeholder="End"/>
      </span>
      {
      msgs && <DataTable
        columns={cols}
        data={filteredMsgs}
        fixedHeaderScrollHeight="300px"
        pagination
        responsive
        subHeaderWrap
        striped
        highlightOnHover
        defaultSortFieldId={1}
        onSelectedRowsChange={handleSelect}
        actions={actionsMemo}
        paginationRowsPerPageOptions={[10,25,50,100]}
        />
      }
    </section>
  )
}