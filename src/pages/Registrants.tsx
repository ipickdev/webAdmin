import { Button, ButtonGroup } from "@mui/material";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import KeyValuePairList from "../models/key-value-pairs.interface";
import ApiService from "../services/api.service";

export const Registrants = () => {
  const [drivers, setDrivers] = useState<KeyValuePairList[]>([]);
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

  const ipv = (key: string, val: string): any => {
    let tv;
    switch(key.toLowerCase()) {
      case 'mobnum': tv = `+63${val.slice(-10)}`;
        break;
      case 'updatedat':
      case 'createdat': tv = new Date(val).toISOString().substring(0,10);
        break;
      case 'photo': tv = <img src={val} style={{maxHeight:'150px', maxWidth:'150px'}} />;
        break;
      default: tv = val?.toString();
    }
    return tv;
  }

  const fetchDrivers = async () => {
    const drv = await apiService.get('ride-hail/web/drivers');
    setDrivers(drv);
    const columns = Object.keys(drv?.[0]).map(k => ({ name: translations(k), selector: (row:KeyValuePairList)=>ipv(k, row?.[k]), omit: k === '_id', maxWidth: '10%', compact: ['disabled','plateNum', 'createdAt', 'updatedAt'].includes(k), sortable: k !== 'photo',
    }));
    setCols(columns);
  }

  useEffect(() => {
    fetchDrivers();
    return ()=>{};
  }, [])

  const handleSelect = ({ selectedRows }: {selectedRows: KeyValuePairList[]}) => {
    setSelectedRows(selectedRows);
  }

  const handleEdit = () => {
    nav(`/editdriver/${selectedRowData?.[0]?.id}`);
  }

  const handleDelete = async (bool = true) => {
    const req = await apiService.post('auth/updateDriver', {}, {id: selectedRowData?.[0]?.id, disabled: bool });
    location.reload();
  }

  useEffect(() => {
    if (localStorage.logged === 'false') {
      nav('/');
    }
    return ()=>{}
  }, []);
  return (
    <section className="reg page">
      {
      drivers && <DataTable
        columns={cols}
        data={drivers}
        fixedHeaderScrollHeight="300px"
        pagination
        responsive
        subHeaderWrap
        dense
        striped
        highlightOnHover
        selectableRows
        selectableRowsSingle
        defaultSortFieldId={1}
        onSelectedRowsChange={handleSelect}
        />
      }
      <span className="controls" style={{backgroundColor:"#fff", display:'block', width:'calc(100% - 20px)', textAlign:'right', padding:'5px 10px'}}>
        <ButtonGroup>
          { selectedRowData.length > 0 && <>
          <Button variant="contained" color="info" onClick={handleEdit}>Edit</Button>
          <Button variant="contained" color={selectedRowData[0].disabled ? "info" : "error"} onClick={()=>handleDelete(!selectedRowData[0].disabled)}>{selectedRowData[0].disabled ? 'Enable' : 'Disable'}</Button>
          </>
          }
          <Button variant="contained" color="success" href="/newdriver">New</Button>
        </ButtonGroup>
      </span>
    </section>
  )
}