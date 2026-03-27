import { openDB, type DBSchema, type IDBPDatabase } from "idb";

interface LocagriOfflineDB extends DBSchema {
  drafts: {
    key: string;
    value: {
      id: string;
      data: Record<string, unknown>;
      updatedAt: number;
    };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      action: string;
      payload: Record<string, unknown>;
      createdAt: number;
      retries: number;
    };
    indexes: { by_createdAt: number };
  };
  refCache: {
    key: string;
    value: {
      id: string;
      type: string;
      data: unknown;
      cachedAt: number;
    };
    indexes: { by_type: string };
  };
}

const DB_NAME = "locagri-pay-offline";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<LocagriOfflineDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<LocagriOfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Drafts store (wizard data)
        if (!db.objectStoreNames.contains("drafts")) {
          db.createObjectStore("drafts", { keyPath: "id" });
        }

        // Sync queue (pending mutations)
        if (!db.objectStoreNames.contains("syncQueue")) {
          const syncStore = db.createObjectStore("syncQueue", { keyPath: "id" });
          syncStore.createIndex("by_createdAt", "createdAt");
        }

        // Reference data cache (suppliers, campaigns)
        if (!db.objectStoreNames.contains("refCache")) {
          const refStore = db.createObjectStore("refCache", { keyPath: "id" });
          refStore.createIndex("by_type", "type");
        }
      },
    });
  }
  return dbPromise;
}

// ─── Draft operations ───

export async function saveDraft(id: string, data: Record<string, unknown>) {
  const db = await getDB();
  await db.put("drafts", { id, data, updatedAt: Date.now() });
}

export async function getDraft(id: string) {
  const db = await getDB();
  return await db.get("drafts", id);
}

export async function deleteDraft(id: string) {
  const db = await getDB();
  await db.delete("drafts", id);
}

export async function getAllDrafts() {
  const db = await getDB();
  return await db.getAll("drafts");
}

// ─── Sync queue operations ───

export async function addToSyncQueue(action: string, payload: Record<string, unknown>) {
  const db = await getDB();
  const id = `sync-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await db.put("syncQueue", {
    id,
    action,
    payload,
    createdAt: Date.now(),
    retries: 0,
  });
  return id;
}

export async function getSyncQueue() {
  const db = await getDB();
  return await db.getAllFromIndex("syncQueue", "by_createdAt");
}

export async function removeSyncItem(id: string) {
  const db = await getDB();
  await db.delete("syncQueue", id);
}

export async function incrementRetry(id: string) {
  const db = await getDB();
  const item = await db.get("syncQueue", id);
  if (item) {
    item.retries++;
    await db.put("syncQueue", item);
  }
}

export async function getSyncQueueCount() {
  const db = await getDB();
  return await db.count("syncQueue");
}

// ─── Reference cache operations ───

export async function cacheRef(type: string, id: string, data: unknown) {
  const db = await getDB();
  await db.put("refCache", { id: `${type}:${id}`, type, data, cachedAt: Date.now() });
}

export async function getCachedRef(type: string, id: string) {
  const db = await getDB();
  return await db.get("refCache", `${type}:${id}`);
}

export async function getCachedRefsByType(type: string) {
  const db = await getDB();
  return await db.getAllFromIndex("refCache", "by_type", type);
}

export async function clearCache() {
  const db = await getDB();
  await db.clear("refCache");
}
