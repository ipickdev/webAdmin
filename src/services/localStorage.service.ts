export default class LocalStorageService{
  constructor() {
  }

  // gets a localStorage  variable by key
  getData(key: string = 'userData'): any {
    const localData = localStorage.getItem(key) ?? '';
    if (localData === '') return undefined;
    try {
      return JSON.parse(localData);
    } catch (e) {
      return localData;
    }
  }

  // saves a localStorage variable
  saveData(key: string = 'userData', data: any): void {
    const d = typeof data === 'string' ? data : JSON.stringify(data);
    localStorage.setItem(key, d);
  }

  // clears the localStorage
  clearData(): void {
    localStorage.clear();
  }
};