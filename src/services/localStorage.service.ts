import KeyValuePairList from "../models/key-value-pairs.interface";

export default class LocalStorageService{
  constructor() {
  }

  getData(key: string = 'userData'): any {
    const localData = localStorage.getItem(key) ?? '';
    if (localData === '') return false;
    try {
      return JSON.parse(localData);
    } catch (e) {
      return localData;
    }
  }

  saveData(key: string = 'userData', data: any): void {
    const d = typeof data === 'string' ? data : JSON.stringify(data);
    localStorage.setItem(key, d);
  }

  clearData(): void {
    localStorage.clear();
  }
};