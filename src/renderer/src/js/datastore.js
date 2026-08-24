const api = globalThis.api;

const db = {
  get(key) {
    return {
      write: () => api?.dbGet(key),
    };
  },
  set(key, value) {
    return {
      write: () => api?.dbSet(key, value),
    };
  },
};

export default db;
