// Arrival loader of the home pages (cantia.ch, accounting.cantia.ch,
// partners.cantia.ch, and their /de and /it): the logo and a thin copper
// line on the page background. It stays until the page is rendered (<html
// class="hydrated">) and, when the page has a hero video (data-hero-media),
// until the videos can play (class "media-ready", components/site/HeroDevices),
// 0.8 s at least, then fades out onto the playing videos. Plain HTML, CSS
// and script in the static page, so it shows before any JavaScript bundle
// has loaded. Never on app.cantia.ch or on inner pages.
const HTML = `<div id="cantia-splash" aria-hidden="true"><img src="/logo-splash.png" alt="" width="190" height="35" /><span><i></i></span></div>
<style>#cantia-splash{position:fixed;inset:0;z-index:2147483646;background:#f6f4ef;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;transition:opacity .45s ease}#cantia-splash img{width:190px;height:auto;animation:cs-in .5s ease both}#cantia-splash span{position:relative;width:120px;height:2px;background:#e2dfd4;overflow:hidden;border-radius:2px;animation:cs-in .5s .15s ease both}#cantia-splash i{position:absolute;left:0;top:0;height:100%;width:40%;background:#a65d36;border-radius:2px;animation:cs-bar 1.1s ease-in-out infinite}#cantia-splash.out{opacity:0;pointer-events:none}html.has-splash body::before{content:none!important}@keyframes cs-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}@keyframes cs-bar{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}@media (prefers-reduced-motion:reduce){#cantia-splash img,#cantia-splash span{animation:none}#cantia-splash i{animation:none;width:100%}}</style>
<script>(function(){var s=document.getElementById('cantia-splash'),d=document.documentElement;if(!s)return;var p=location.pathname.replace(/\\/+$/,'')||'/';if(/^app\\./.test(location.hostname)||!{'/':1,'/de':1,'/it':1}[p]){s.parentNode.removeChild(s);return}d.classList.add('has-splash');var t0=Date.now(),hydAt=0,gone=false,iv;function out(){if(gone)return;gone=true;clearInterval(iv);setTimeout(function(){s.className='out';setTimeout(function(){if(s.parentNode)s.parentNode.removeChild(s);d.classList.remove('has-splash')},460)},Math.max(0,800-(Date.now()-t0)))}function check(){if(!d.classList.contains('hydrated'))return;if(!hydAt)hydAt=Date.now();if(!document.querySelector('[data-hero-media]')||d.classList.contains('media-ready')||Date.now()-hydAt>3500)out()}new MutationObserver(check).observe(d,{attributes:true,attributeFilter:['class']});iv=setInterval(check,200);setTimeout(out,15000)})();</script>`;

export function Splash() {
  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
