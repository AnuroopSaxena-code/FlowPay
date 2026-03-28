import PocketBase from 'pocketbase';

// Replace the URL below with your actual PocketBase server URL
// By default, PocketBase local server runs on http://127.0.0.1:8090
const pb = new PocketBase('http://127.0.0.1:8090');

export default pb;
