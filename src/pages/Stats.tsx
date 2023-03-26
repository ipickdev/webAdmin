import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../services/api.service";
import Chart from 'chart.js/auto';
import {format, addDays} from 'date-fns';
import Button from "@mui/material/Button/Button";
import KeyValuePairList from "../models/key-value-pairs.interface";

/**
 * The stats page is the home page which contains graphs and reports that can be filtered and downloaded into csv
 */
export const Stats = () => {
  const nav = useNavigate();
  const api = new ApiService();
  const [startDate, setStart] = useState<string>(new Date().toISOString().substring(0, 10));
  const [endDate, setEnd] = useState<string>(new Date().toISOString().substring(0, 10));
  const [reg, setReg] = useState<KeyValuePairList[]>([]);
  const [books, setBooks] = useState<KeyValuePairList[]>([]);
  const [regNow, setRegNow] = useState<KeyValuePairList[]>([]);
  const [booksNow, setBooksNow] = useState<KeyValuePairList[]>([]);
  // const [booksPerStatus, setBooksPerStatus] = useState([]);
  const [chart, setChart] = useState<Chart>();
  const [chart2, setChart2] = useState<Chart>();
  const [chart3, setChart3] = useState<any>();
  const [group, setGroup] = useState<any>([]);
  const [group2, setGroup2] = useState<any>([]);
  const [group3, setGroup3] = useState<any>([]);
  const bookingFee = 30;

  // formats a string and returns a date in the yyyy-mm-dd format. if s is false, a new date is added
  const d = (date: string, s = true) => {
    let dt = new Date(date);
    if (s) {
      return format(dt, 'yyyy-MM-dd');
    }
    return format(addDays(dt, 1), 'yyyy-MM-dd');
  }

  // initializes the line graph for the Rides stat
  const init = async () => {
    const canvasEl = document.createElement('canvas');
    canvasEl.id = 'dimensions1';
    const canvasContainer = document.getElementById('canvasContainer1');
    if (canvasContainer) {
      canvasContainer.innerHTML = '';
      canvasContainer.appendChild(canvasEl);
    }
    if (chart) {
      chart.destroy();
    }
    let delayed: boolean;
    let ch = new Chart(
      canvasEl,
      {
        type: 'line',
        options: {
          responsive: true,
          animation: {
            onComplete: () => {
              delayed = true;
            },
            delay: (context) => {
              let delay = 0;
              if (context.type === 'data' && context.mode === 'default' && !delayed) {
                delay = context.dataIndex * 300 + context.datasetIndex * 100;
              }
              return delay;
            },
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: false
            }
          },
        },
        data: {
          labels: Object.keys(group).map(key=> key),
          datasets: [
            {
              label: 'Rides',
              data: Object.values(group).map((row: any) => row.length),
            }
          ],
          
        }
      }
    );
    setChart(ch);
  }

  // initializes the bar graph for the Registrants stat
  const init2 = async () => {
    const canvasEl = document.createElement('canvas');
    canvasEl.id = 'dimensions2';
    const canvasContainer = document.getElementById('canvasContainer2');
    if (canvasContainer) {
      canvasContainer.innerHTML = '';
      canvasContainer.appendChild(canvasEl);
    }
    if (chart2) {
      chart2.destroy();
    }
    let delayed: boolean;
    let ch = new Chart(
      canvasEl,
      {
        type: 'bar',
        options: {
          responsive: true,
          animation: {
            onComplete: () => {
              delayed = true;
            },
            delay: (context) => {
              let delay = 0;
              if (context.type === 'data' && context.mode === 'default' && !delayed) {
                delay = context.dataIndex * 300 + context.datasetIndex * 100;
              }
              return delay;
            },
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: false
            }
          },
        },
        data: {
          labels: Object.keys(group2).map(key=> key),
          datasets: [
            {
              label: 'Registrants',
              data: Object.values(group2).map((row: any) => row.length),
            }
          ],
          
        }
      }
    );
    setChart2(ch);
  }

  // initializes the pie chart for the Ride per status stat
  const init3 = async () => {
    const canvasEl = document.createElement('canvas');
    canvasEl.id = 'dimensions3';
    const canvasContainer = document.getElementById('canvasContainer3');
    if (canvasContainer) {
      canvasContainer.innerHTML = '';
      canvasContainer.appendChild(canvasEl);
    }
    if (chart3) {
      chart3.destroy();
    }
    let delayed: boolean;
    let ch = new Chart(
      canvasEl,
      {
        type: 'pie',
        options: {
          responsive: true,
          animation: {
            onComplete: () => {
              delayed = true;
            },
            delay: (context) => {
              let delay = 0;
              if (context.type === 'data' && context.mode === 'default' && !delayed) {
                delay = context.dataIndex * 300 + context.datasetIndex * 100;
              }
              return delay;
            },
          },
          plugins: {
            legend: {
              display: true
            },
            tooltip: {
              enabled: true
            }
          },
        },
        data: {
          labels: Object.keys(group3).map(key=> key),
          datasets: [{
            label: 'Total Bookings',
            data: Object.values(group3).map((row: any) => row.length),
          }],
        }
      }
    );
    setChart3(ch);
  }

  // fetches the booking data from the server. Start and end dates can be supplied to filter data.
  const fetchBookings = async () => {
    const data = await api.get('ride-hail/web/dailyrequests', { startDate: d(startDate), endDate: d(endDate, false) });
    const f1 = startDate ? data.filter((dx: any) => new Date(dx.updatedAt) >= new Date(d(startDate))) : data;
    const f2 = endDate ? f1.filter((f: any) => new Date(f.updatedAt) <= new Date(d(endDate, false))) : f1;
    setBooks(f2.sort((a: { updatedAt: string | number | Date; },b: { updatedAt: string | number | Date; }) => new Date(a.updatedAt).getTime()-new Date(b.updatedAt).getTime()));
    setBooksNow(f2.filter((r: any) => d(r?.timestamp) === d(new Date().toDateString())));
    
    // data is grouped by date
    const grp = f2.reduce((grps: any, h: any) => {
                        const date = h.updatedAt.substring(0,10);
                        if (!grps[date]) {
                          grps[date] = [];
                        }
                        grps[date].push(h);
                        return grps;
                      }, {});
    setGroup(grp);

    // data is grouped by status
    const grpP = f2.reduce((grps: any, h: any) => {
      const s = h.status.substring(0,10);
      if (!grps[s]) {
        grps[s] = [];
      }
      grps[s].push(h);
      return grps;
    }, {});
    setGroup3(grpP);
  }

  // fetches the registration data from the server. Start and end dates can be supplied to filter data.
  const fetchRegs = async () => {
    const data = await api.get('ride-hail/web/dailyregistrants', { startDate: d(startDate), endDate: d(endDate, false) });
    const f1 = startDate ? data.filter((dx: any) => new Date(dx.createdAt) >= new Date(d(startDate))) : data;
    const f2 = endDate ? f1.filter((f: any) => new Date(f.createdAt) <= new Date(d(endDate, false))) : f1;
    setReg(f2.sort((a: { createdAt: string | number | Date; },b: { createdAt: string | number | Date; }) => new Date(a.createdAt).getTime()-new Date(b.createdAt).getTime()));
    setRegNow(f2.filter((r: any) => d(r?.createdAt) === d(new Date().toDateString())));
    
    // data is grouped by date
    const grp = f2.reduce((grps: any, h: any) => {
                        const date = h.createdAt.substring(0,10);
                        if (!grps[date]) {
                          grps[date] = [];
                        }
                        grps[date].push(h);
                        return grps;
                      }, {});
    setGroup2(grp);
  }

  // initializes bookings and registrations
  const fetchData = async () => {
    await fetchBookings();
    await fetchRegs();
    await Promise.resolve({
      books,
      reg
    });
  }

  // navigates to the home page if user is not logged
  useEffect(() => {
    if (localStorage.logged === 'false') {
      nav('/');
    }
    fetchData();
    return ()=>{}
  }, []);

  // refreshes the data whenever the startDate and endDate variables are updated
  useEffect(() => {
    fetchData();
    return ()=>{}
  }, [startDate, endDate])

  // refreshes the Rides graph when the data changes
  useEffect(() => {
    if(group?.length < 1) return;
    init();
    return ()=>{}
  }, [group])

  // refreshes the Rides per Status graph when the data changes
  useEffect(() => {
    if(group3?.length < 1) return;
    init3();
    return ()=>{}
  }, [group3])

  // refreshes the Registrants graph when the data changes
  useEffect(() => {
    if(group2?.length < 1) return;
    init2();
    return ()=>{}
  }, [group2])

  // computes the travel fare for the current dataset
  const computeTravelFare = (): number => {
    let acc = books.map(b=>b.travelFare ?? 0).reduce((a: number, b: number) => a + b, 0);
    return acc;
  }

  // computes the booking fees for the current dataset
  const computeBookingFees = (): number => {
    let acc = books.map(b=>b.computations?.serviceFee ?? bookingFee).reduce((a: number, b: number) => a + b, 0);
    return acc;
  }
  
  // builds the CSV file for download
  const prepareCSV = () => {
    const columnDelimiter = ',';
    const lineDelimiter = '\n';
  
    let result = '' + lineDelimiter;
    result += `Date Period:,${format(new Date(startDate), 'yyyy-MM-dd')} - ${format(new Date(endDate), 'yyyy-MM-dd')}` + lineDelimiter;
    result += lineDelimiter;
    result += `Total Registrants:,${reg.length}` + lineDelimiter;
    result += `Total Bookings:,${books.length}` + lineDelimiter;
    result += lineDelimiter;
    Object.entries(group3).forEach((b: any, i: number) => {
      result += b[0].toUpperCase() + columnDelimiter + b[1].length + lineDelimiter;
    });
    result += lineDelimiter;
    result += `Total Fare Amount:,${computeTravelFare()}` + lineDelimiter;
    result += `Total Booking Fees:,${computeBookingFees()}` + lineDelimiter;
    result += lineDelimiter;
    return result;
  }

  // initializes the handler for downloading the stats as csv
  const downloadCSV = () => {
    const link = document.createElement('a');
    let csv = prepareCSV();
    if (csv == null) return;

    const filename = `report-${format(new Date(startDate), 'yyyy-MM-dd')}_${format(new Date(endDate), 'yyyy-MM-dd')}.csv`;

    if (!csv.match(/^data:text\/csv/i)) {
      csv = `data:text/csv;charset=utf-8,${csv}`;
    }

    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', filename);
    link.click();
  }

  return (
    <section className="stats page">
    <span className="counts today">
      <div className="statComponent">
        <span>
          <div className="graphic">
            <img src="/assets/regist.png" alt="" />
          </div>
          <span className="texts">
            <label htmlFor="driverCount">Registrants Today</label>
            <input type="text" id="driverCount" value={regNow?.length ?? 0} readOnly/>
          </span>
        </span>
      </div>
      <div className="statComponent">
        <span>
          <div className="graphic">
            <img src="/assets/rides.png" alt="" />
          </div>
          <span className="texts">
            <label htmlFor="rideCount">Rides Today</label>
            <input type="text" id="rideCount" value={booksNow?.length ?? 0} readOnly/>
          </span>
        </span>
      </div>
    </span>
      <span className="controls">
        <input type="date" value={startDate} onChange={(e)=>setStart(e.target.value)} placeholder="Start" max={endDate}/>
        <input type="date" value={endDate} onChange={(e)=>setEnd(e.target.value)} placeholder="End" min={startDate}/>
        <Button variant="contained" color="success" style={{color:'#fff'}} onClick={downloadCSV}>Download Report</Button>
      </span>
      <span className="counts">
        <div className="statComponent">
          <span>
            <div className="graphic">
              <img src="/assets/regist.png" alt="" />
            </div>
            <span className="texts">
              <label htmlFor="driverCount">Registrants</label>
              <input type="text" id="driverCount" value={reg?.length ?? 0} readOnly/>
            </span>
          </span>
        </div>
        <div className="statComponent">
          <span>
            <div className="graphic">
              <img src="/assets/rides.png" alt="" />
            </div>
            <span className="texts">
              <label htmlFor="rideCount">Rides</label>
              <input type="text" id="rideCount" value={books?.length ?? 0} readOnly/>
            </span>
          </span>
        </div>
        <div className="statComponent">
          <span>
            <div className="graphic">
              <img src="/assets/regist.png" alt="" />
            </div>
            <span className="texts">
              <label htmlFor="driverCount">Total Fare Amount</label>
              <input type="text" id="driverCount" value={computeTravelFare() ?? 0} readOnly/>
            </span>
          </span>
        </div>
        <div className="statComponent">
          <span>
            <div className="graphic">
              <img src="/assets/rides.png" alt="" />
            </div>
            <span className="texts">
              <label htmlFor="rideCount">Total Booking Fees</label>
              <input type="text" id="rideCount" value={computeBookingFees() ?? 0} readOnly/>
            </span>
          </span>
        </div>
      </span>
      <br/>
      <h1>Rides</h1>
      {books.length > 0 ? <div style={{width: "600px"}} id="canvasContainer1"></div> 
      :
      <p>No rides for this period.</p>
      }
      <h1>Rides Per Status</h1>
      {books.length > 0 ? <div style={{width: "600px"}} id="canvasContainer3"></div> 
      :
      <p>No rides for this period.</p>
      }
      <h1>Registrants</h1>
      {reg.length > 0 ? <div style={{width: "600px"}} id="canvasContainer2"></div>
      :
      <p>No registrations for this period.</p>
    }
      
    </section>
  )
}