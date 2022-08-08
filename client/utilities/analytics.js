export function analytics() {
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-ZZGL9C0M2J');

  const head = document.getElementsByTagName('head')[0];
  const scriptAnalytics = document.createElement('script');
  scriptAnalytics.src = 'https://www.googletagmanager.com/gtag/js?id=G-ZZGL9C0M2J';
  head.append(scriptAnalytics);
}
