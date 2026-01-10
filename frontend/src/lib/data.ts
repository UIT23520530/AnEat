import { stores } from './placeholder-data';

// API-like functions
export async function getStores() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return stores;
}

export async function getStoreById(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return stores.find((store) => store.id === id);
}
