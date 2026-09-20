export class IndexedDBWrapper {
  private dbName: string;
  private dbVersion: number;
  private storeNames: string[];

  constructor(dbName: string, dbVersion: number, storeNames: string[]) {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
    this.storeNames = storeNames;
  }

  private inMemoryFallback: Map<string, any[]> = new Map();

  private async openDB(): Promise<IDBDatabase | null> {
    if (typeof indexedDB === 'undefined') {
      return null;
    }
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.storeNames.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            // Using autoIncrement id for simple list-like stores (like logs/queues)
            db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
          }
        });
      };
    });
  }

  async get<T>(storeName: string, id: IDBValidKey): Promise<T | undefined> {
    const db = await this.openDB();
    if (!db) {
      const items = this.inMemoryFallback.get(storeName) || [];
      return items.find((i: any) => i.id === id);
    }
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.openDB();
    if (!db) {
      return (this.inMemoryFallback.get(storeName) || []) as T[];
    }
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async put<T>(storeName: string, item: T): Promise<IDBValidKey> {
    const db = await this.openDB();
    if (!db) {
      const items = this.inMemoryFallback.get(storeName) || [];
      const itemWithId = { id: Date.now(), ...(item as any) };
      items.push(itemWithId);
      this.inMemoryFallback.set(storeName, items);
      return itemWithId.id;
    }
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async putAll<T>(storeName: string, items: T[]): Promise<void> {
    const db = await this.openDB();
    if (!db) {
      this.inMemoryFallback.set(storeName, [...items]);
      return;
    }
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();

      // Clear existing records before putting new ones to replace the list
      store.clear().onsuccess = () => {
        items.forEach(item => store.put(item));
      };
    });
  }

  async delete(storeName: string, id: IDBValidKey): Promise<void> {
    const db = await this.openDB();
    if (!db) {
      const items = this.inMemoryFallback.get(storeName) || [];
      this.inMemoryFallback.set(storeName, items.filter((i: any) => i.id !== id));
      return;
    }
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(storeName: string): Promise<void> {
    const db = await this.openDB();
    if (!db) {
      this.inMemoryFallback.set(storeName, []);
      return;
    }
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}
