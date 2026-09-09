/* EchoBound vMetaModel2027 — authoritative backend. Same-origin when Node serves the game; localhost during local development. */
window.ECHOBOUND_CONFIG={
  apiBase:(location.hostname==='localhost'||location.hostname==='127.0.0.1')?'http://localhost:8787':'',
  wsUrl:'',
  build:'vMetaModel2027-DELUXE-AUTHORITY'
};
