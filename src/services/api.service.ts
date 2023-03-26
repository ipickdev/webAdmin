import KeyValuePairList from "../models/key-value-pairs.interface";

export default class ApiService{
  protected apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  constructor() {
  }

  /* Performs get requests to the server */
  async get(url: string, params: KeyValuePairList = []): Promise<any>{
    const queryString = Object.keys(params).map(key => key + '=' + params[key]).join('&');
    const data = (await fetch(`${this.apiEndpoint}/${url}?${queryString}`)).json();
    return data;
  }

  /* Performs post requests to the server */
  async post(url: string, headers: KeyValuePairList = {}, body: KeyValuePairList = {}): Promise<any>{
    const data = (await fetch(`${this.apiEndpoint}/${url}`, 
      { method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      ...headers},
      body: JSON.stringify(body)
    })).json();
    return data;
  }

};