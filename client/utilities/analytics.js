export function analytics() {
  let uuid = localStorage.getItem('uuid');
  
  if (!uuid) {
    const dt = new Date().getTime();
    uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (dt + Math.random()*16)%16 | 0;
      dt = Math.floor(dt/16);
      return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    
    localStorage.setItem('uuid', uuid);
  }
  
  fetch(`https://www.google-analytics.com/mp/collect?measurement_id=G-ZZGL9C0M2J&api_secret=tq8kk9XoRFWR0hyNXvMNbQ`, {
    method: 'POST',
    body: JSON.stringify({
      client_id: uuid,
      events: [{
        name: 'page_view',
        params: {
          page_title: 'Home',
          page_location: '/',
          engagement_time_msec: '1',
        },
      }],
    }),
  });
}
