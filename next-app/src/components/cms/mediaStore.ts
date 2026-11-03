// Files uploaded in the content editor, kept in this browser (IndexedDB: localStorage is too small
// for video) under the path they will have once a dev applies the draft (public/media/uploads/).
// Storage can be unavailable (private windows, blocked site data): every call then fails softly.

const DB = "cms-mock";
const STORE = "media";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const request = work(db.transaction(STORE, mode).objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}

/** Every stored upload by path; empty when storage is unavailable. */
export async function loadUploads(): Promise<Record<string, Blob>> {
  try {
    const [keys, blobs] = await Promise.all([run("readonly", (s) => s.getAllKeys()), run("readonly", (s) => s.getAll())]);
    return Object.fromEntries(keys.map((k, i) => [String(k), blobs[i] as Blob]));
  } catch {
    return {};
  }
}

/** Stores an upload; false when storage is unavailable (it then lasts only until the page closes). */
export async function saveUpload(path: string, blob: Blob) {
  try {
    await run("readwrite", (s) => s.put(blob, path));
    return true;
  } catch {
    return false;
  }
}

export async function clearUploads() {
  try {
    await run("readwrite", (s) => s.clear());
  } catch {}
}

/** The file's bytes as base64, for the downloaded draft file. */
export function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).replace(/^data:[^,]*,/, ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
