/**
 * Local check-in pictures waiting for a confirmed upload.
 */
const databaseName = 'ferropoly-check-in-pictures';
const storeName = 'pending';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName, {keyPath: 'id', autoIncrement: true});
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function useStore(mode, action) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const request = action(transaction.objectStore(storeName));
    transaction.oncomplete = () => {
      database.close();
      resolve(request.result);
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

function savePendingPicture(picture) {
  return useStore('readwrite', store => store.add(picture));
}

function listPendingPictures() {
  return useStore('readonly', store => store.getAll());
}

function removePendingPicture(id) {
  return useStore('readwrite', store => store.delete(id));
}

export {savePendingPicture, listPendingPictures, removePendingPicture};