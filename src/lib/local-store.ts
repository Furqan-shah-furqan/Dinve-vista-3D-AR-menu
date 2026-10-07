// Binary demo files belong in IndexedDB, never quota-limited localStorage.
export async function localStore<T>(key: string, value?: T): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    let blocked = false;
    const request = indexedDB.open('dinevista-demo', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('data');
    request.onerror = () => reject(new Error('Browser storage unavailable. Allow site storage and retry.'));
    request.onblocked = () => { blocked = true; reject(new Error('Close other DineVista tabs and retry the upload.')); };
    request.onsuccess = () => {
      const db = request.result;
      if (blocked) { db.close(); return; }
      try {
      const transaction = db.transaction('data', value === undefined ? 'readonly' : 'readwrite');
      const operation = value === undefined ? transaction.objectStore('data').get(key) : transaction.objectStore('data').put(value, key);
      transaction.oncomplete = () => { db.close(); resolve(value === undefined ? operation.result : value); };
      transaction.onabort = transaction.onerror = () => { db.close(); reject(new Error('Could not save: browser storage is full or blocked. Free space and retry.')); };
      } catch (error) {
        db.close();
        reject(new Error(error instanceof Error ? `Could not save file: ${error.message}` : 'Could not save file. Allow browser storage and retry.'));
      }
    };
  });
}
