// Binary demo files belong in IndexedDB, never quota-limited localStorage.
export async function localStore<T>(key: string, value?: T): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('dinevista-demo', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('data');
    request.onerror = () => reject(new Error('Browser storage unavailable. Allow site storage and retry.'));
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction('data', value === undefined ? 'readonly' : 'readwrite');
      const operation = value === undefined ? transaction.objectStore('data').get(key) : transaction.objectStore('data').put(value, key);
      transaction.oncomplete = () => { db.close(); resolve(value === undefined ? operation.result : value); };
      transaction.onabort = transaction.onerror = () => { db.close(); reject(new Error('Could not save: browser storage is full or blocked. Free space and retry.')); };
    };
  });
}
