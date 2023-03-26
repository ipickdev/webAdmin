import { Button } from "@mui/material";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { buildPhotoPath } from "../App";
import KeyValuePairList from "../models/key-value-pairs.interface";
import ApiService from "../services/api.service";
import LocalStorageService from "../services/localStorage.service";

/**
 * The rider page displays all the riders of the ipick app
 */
export const Riders = () => {
  const [riders, setRiders] = useState<KeyValuePairList[]>([]);
  const [filteredRiders, setFilteredRiders] = useState<KeyValuePairList[]>([]);
  const [startDate, setStart] = useState('');
  const [endDate, setEnd] = useState(new Date().toISOString().substring(0, 10));
  const [filterm, setFilterm] = useState('');
  const apiService = new ApiService();
  const local = new LocalStorageService();
  const [cols,setCols] = useState<any[]>([]);
  const [selectedRowData, setSelectedRows] = useState<KeyValuePairList[]>([]);
  const nav = useNavigate();
  
  // builds the CSV file for download
  const convertArrayOfObjectsToCSV = (array: any[]) => {
    let result: any;
  
    const columnDelimiter = ',';
    const lineDelimiter = '\n';
    const keys = ['id', 'name', 'mobnum', 'address', 'email', 'photo', 'createdAt', 'updatedAt'];
  
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
  const downloadCSV = (arr: any[]) => {
    const array = arr.map(a=>{ delete a._id; return a});
    const link = document.createElement('a');
    let csv = convertArrayOfObjectsToCSV(array);
    if (csv == null) return;

    const filename = 'riders.csv';

    if (!csv.match(/^data:text\/csv/i)) {
      csv = `data:text/csv;charset=utf-8,${csv}`;
    }

    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', filename);
    link.click();
  }

// eslint-disable-next-line react/prop-types
const Export = ({ onExport }: {onExport: any}) => <Button onClick={(e: any) => onExport(e.target.value)}>Export</Button>;
const actionsMemo = useMemo(() => <><Button variant="contained" color="success" style={{color:'#fff'}} href="/newrider">New</Button><Export onExport={() => downloadCSV(filteredRiders)} /></>, [filteredRiders]);

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
      default: translated = key.toUpperCase();
    }
    return translated;
  }

  // formats data for the datatable
  const ipv = (key: string, val: string, forDl = false): any => {
    const openExt = (lnk: string) => {
      window.open(`/image?url=${lnk}`);
      return;
    }
    let tv;
    switch(key.toLowerCase()) {
      case 'mobnum': tv = val ? `+63${val?.slice(-10)}` : '';
        break;
      case 'updatedat':
      case 'createdat': tv = format(new Date(val), 'yyyy-MM-dd HH:mm:ss');
        break;
      case 'photo':
        const hasPhoto = buildPhotoPath(val) ?? false;
        tv = hasPhoto && !forDl ? <a onClick={()=>openExt(hasPhoto)}>view</a> : hasPhoto; 
        break;
      default: tv = val?.toString().trim();
    }
    return tv;
  }

  // fetch rider data from the server
  const fetchRiders = async () => {
    const rid = await apiService.get('ride-hail/web/riders');
    local.saveData('riders', rid);
    setRiders(rid);
    // assign column data and settings for usage in the datatable plugin
    const columns = await Promise.all(Object.keys(rid?.[0]).map(async (k) => ({ id: k, name: translations(k), selector: (row:KeyValuePairList)=>ipv(k, row?.[k]), omit: k === '_id', compact: ['disabled','plateNum', 'createdAt', 'updatedAt'].includes(k), sortable: k !== 'photo',
    })));
    setCols(columns);
    return Promise.resolve(rid);
  }

  // get rider data on page load
  useEffect(() => {
    fetchRiders().then((r) => {   
      setFilteredRiders(r.sort((a: KeyValuePairList, b: KeyValuePairList) => new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()));
    });
    return ()=>{};
  }, [])

  // set selected data
  const handleSelect = (selectedRows: any) => {
    setSelectedRows(selectedRows);
    handleEdit(selectedRows);
  }

  // navigate to the rider page on row click
  const handleEdit = (selectedRow: KeyValuePairList) => {
    nav(`/editrider/${selectedRow?.id}`);
  }

  // navigates to the login page when the user is not logged
  useEffect(() => {
    if (localStorage.logged === 'false') {
      nav('/');
    }
    return ()=>{}
  }, []);

  // refreshes the data using the filter variables for filter term, startdate and enddate
  const filter = () => {
    if (filterm === '') {
      const startFilt = startDate ? riders.filter(f => new Date(f.createdAt) >= new Date(startDate)) : riders;
      const endFilt = endDate ? startFilt.filter(f => new Date(f.createdAt) <= new Date(endDate)) : startFilt;
      setFilteredRiders(endFilt);
      return;
    }
    const filtered = riders?.filter(rid => {
      return (rid.id.toLowerCase().includes(filterm.toLowerCase()) || rid.email.toLowerCase().includes(filterm.toLowerCase()) || rid.mobnum.toLowerCase().includes(filterm.toLowerCase()) || rid.name.toLowerCase().includes(filterm.toLowerCase()) || rid.address.toLowerCase().includes(filterm.toLowerCase()));
    });
    const startFilt = startDate ? filtered.filter(f => new Date(f.createdAt) >= new Date(startDate)) : filtered;
    const endFilt = endDate ? startFilt.filter(f => new Date(f.createdAt) <= new Date(endDate)) : startFilt;
    setFilteredRiders(endFilt);
  }

  // calls the function for refreshing the data whenever the filter term, startdate, or enddate changes
  useEffect(() => {
    filter();
    return () => {};
  }, [startDate, endDate, filterm])

  return (
    <section className="reg page">
      <h1>Riders</h1>
      <span className="controls">
        <input type="text" value={filterm} onChange={(e)=>setFilterm(e.target.value)} placeholder="Search Term"/>
        <input type="date" value={startDate} onChange={(e)=>setStart(e.target.value)} placeholder="Start"/>
        <input type="date" value={endDate} onChange={(e)=>setEnd(e.target.value)} placeholder="End"/>
      </span>
      <span className="controls" style={{backgroundColor:"#fff", display:'block', width:'calc(100% - 20px)', textAlign:'right', padding:'5px 10px'}}>
      </span>
      {
      filteredRiders && <DataTable
        columns={cols}
        data={filteredRiders}
        fixedHeaderScrollHeight="300px"
        pagination
        responsive={true}
        subHeaderWrap
        dense
        striped
        highlightOnHover
        onRowClicked={handleSelect}
        paginationRowsPerPageOptions={[10,25,50,100]}
        defaultSortFieldId="createdAt"
        defaultSortAsc={false}
        actions={actionsMemo}
        />
      }
    </section>
  )
}