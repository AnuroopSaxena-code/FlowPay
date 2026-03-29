import PocketBase from 'pocketbase';

// VITE_PB_URL must be the full URL (e.g., https://yourbase.pockethost.io)
const PB_URL = import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090';
const pb = new PocketBase(PB_URL);

export default pb;
