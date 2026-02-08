const https = require('https');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://chaturbatemodels-lives.vercel.app';
const API_URL = 'https://chaturbate.com/affiliates/api/onlinerooms/?format=json&wm=XhJGW&limit=500';
const OUT = path.join(__dirname, 'public');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

function mkdirp(p) { fs.mkdirSync(p, { recursive: true }); }

function css() {
  return `
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0d0d0d;--card:#1a1a2e;--accent:#e94560;--text:#eee;--muted:#999;--border:#2a2a3e}
body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
.container{max-width:1280px;margin:0 auto;padding:0 16px}
header{background:#111;border-bottom:1px solid var(--border);padding:12px 0;position:sticky;top:0;z-index:100}
header .container{display:flex;align-items:center;justify-content:space-between}
.logo{font-size:1.4rem;font-weight:700;color:#fff}
.logo span{color:var(--accent)}
nav a{color:#ccc;margin-left:20px;font-weight:500}nav a:hover{color:#fff}
.hamburger{display:none;background:none;border:none;color:#fff;font-size:1.5rem;cursor:pointer}
@media(max-width:768px){
  .hamburger{display:block}
  nav{display:none;position:absolute;top:100%;left:0;right:0;background:#111;padding:16px;flex-direction:column}
  nav.open{display:flex}
  nav a{margin:8px 0;display:block}
}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;padding:20px 0}
.card{background:var(--card);border-radius:10px;overflow:hidden;transition:transform .2s}
.card:hover{transform:translateY(-4px)}
.card img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}
.card-body{padding:10px}
.card-body h3{font-size:.95rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.card-body .meta{font-size:.8rem;color:var(--muted);margin-top:4px}
.card-body .viewers{color:var(--accent);font-weight:600}
.tag{display:inline-block;background:#2a2a3e;color:#ccc;padding:2px 10px;border-radius:12px;font-size:.78rem;margin:2px}
.tag:hover{background:var(--accent);color:#fff}
h1{font-size:1.8rem;margin:24px 0 12px}
h2{font-size:1.3rem;margin:20px 0 10px}
.desc{color:var(--muted);max-width:800px;margin:16px 0;line-height:1.8}
.btn{display:inline-block;background:var(--accent);color:#fff;padding:12px 32px;border-radius:6px;border:none;cursor:pointer;font-size:1rem;margin:20px auto;text-align:center}
.btn:hover{background:#c73a52;text-decoration:none}
#load-more-wrap{text-align:center}
footer{background:#111;border-top:1px solid var(--border);padding:24px 0;margin-top:40px;text-align:center;color:var(--muted);font-size:.85rem}
.model-page{display:grid;grid-template-columns:1fr 360px;gap:24px;padding:20px 0}
.model-page .stream{width:100%}
.model-page iframe{width:100%;aspect-ratio:16/9;border:none;border-radius:8px}
.model-page .sidebar{background:var(--card);border-radius:10px;padding:16px}
.model-page .sidebar dt{color:var(--muted);font-size:.8rem;margin-top:10px}
.model-page .sidebar dd{font-weight:600}
@media(max-width:900px){.model-page{grid-template-columns:1fr}}
.pagination{display:flex;gap:8px;flex-wrap:wrap;padding:16px 0}
.pagination a,.pagination span{padding:6px 14px;border-radius:4px;background:var(--card)}
.pagination span{background:var(--accent);color:#fff}
.tags-list{display:flex;flex-wrap:wrap;gap:8px;padding:20px 0}
.tags-list a{font-size:.9rem;padding:6px 16px}
`;
}

function nav() {
  return `<header><div class="container">
<a href="/" class="logo">Chaturbate<span>Models</span></a>
<button class="hamburger" onclick="document.querySelector('nav').classList.toggle('open')" aria-label="Menu">☰</button>
<nav><a href="/">Home</a><a href="/tags/">Tags</a></nav>
</div></header>`;
}

function footer() {
  return `<footer><div class="container">&copy; ${new Date().getFullYear()} ChaturbateModels. All rights reserved. 18+ only.</div></footer>`;
}

function page(title, description, canonical, body, schema = '') {
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ChaturbateModels">
<style>${css()}</style>
${schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : ''}
</head><body>${nav()}${body}${footer()}</body></html>`;
}

function modelCard(m) {
  return `<a href="/model/${m.username}/" class="card">
<img src="${m.image_url_360x270}" alt="${m.username}" loading="lazy" width="360" height="270">
<div class="card-body"><h3>${m.username}</h3>
<div class="meta"><span class="viewers">👁 ${m.num_users}</span> · ${m.age || '?'}y · ${m.location || 'Unknown'}</div>
</div></a>`;
}

function genDesc(m) {
  const subj = m.room_subject ? m.room_subject.replace(/"/g, '&quot;').slice(0, 100) : 'live show';
  return `${m.username} is a ${m.age || ''}${m.age ? ' year old ' : ''}live cam model from ${m.location || 'an undisclosed location'} currently streaming on Chaturbate. Their current show: "${subj}". Watch ${m.username}'s live stream and interact in real-time with ${m.num_users} other viewers.`;
}

async function build() {
  console.log('Fetching API data...');
  const raw = await fetch(API_URL);
  const data = JSON.parse(raw);
  const models = data.results || data;
  console.log(`Got ${models.length} models`);

  // Collect tags
  const tagMap = {};
  models.forEach(m => {
    (m.tags || []).forEach(t => {
      if (!tagMap[t]) tagMap[t] = [];
      tagMap[t].push(m);
    });
  });
  const allTags = Object.keys(tagMap).sort();

  // Clean output
  fs.rmSync(OUT, { recursive: true, force: true });
  mkdirp(OUT);

  // === HOME ===
  const first40 = models.slice(0, 40);
  const homeSchema = {"@context":"https://schema.org","@type":"WebSite","name":"ChaturbateModels","url":SITE_URL,"description":"Best Chaturbate models streaming live"};
  const homeItemList = {"@context":"https://schema.org","@type":"ItemList","itemListElement":first40.map((m,i)=>({"@type":"ListItem","position":i+1,"url":`${SITE_URL}/model/${m.username}/`,"name":m.username}))};

  const homeBody = `<main class="container">
<h1>Best Chaturbate Models Online</h1>
<div class="grid" id="models-grid">${first40.map(modelCard).join('')}</div>
<div id="load-more-wrap"><button class="btn" id="load-more">Load More Models</button></div>
<div class="desc">
<h2>About Chaturbate Live Cams</h2>
<p>Chaturbate is one of the world's most popular adult live video chat platforms, connecting millions of viewers with talented performers from around the globe. Whether you're looking for interactive shows, private performances, or simply want to chat, Chaturbate offers an unmatched variety of live adult entertainment available 24/7.</p>
<p>Our site curates the best currently online Chaturbate models, making it easy to discover new performers, browse by tags, and find exactly the type of show you're looking for. Every model page features a live stream embed so you can start watching instantly without leaving the site.</p>
<p>From amateurs to professional cam models, Chaturbate hosts thousands of live streams at any given moment. Use our tag system to filter by interests, or simply browse the grid above to find someone who catches your eye. All streams are live and updated in real-time.</p>
</div></main>
<script>
document.getElementById('load-more').addEventListener('click', async function(){
  this.textContent='Loading...';
  try{
    const r=await fetch('https://chaturbate.com/affiliates/api/onlinerooms/?format=json&wm=XhJGW&limit=500');
    const d=await r.json();
    const models=d.results||d;
    const grid=document.getElementById('models-grid');
    const existing=new Set([...grid.querySelectorAll('.card')].map(c=>c.href.split('/model/')[1]?.replace('/','') ));
    let added=0;
    models.forEach(m=>{
      if(existing.has(m.username))return;
      const a=document.createElement('a');a.href='/model/'+m.username+'/';a.className='card';
      a.innerHTML='<img src="'+m.image_url_360x270+'" alt="'+m.username+'" loading="lazy" width="360" height="270"><div class="card-body"><h3>'+m.username+'</h3><div class="meta"><span class="viewers">👁 '+m.num_users+'</span> · '+(m.age||'?')+'y · '+(m.location||'Unknown')+'</div></div>';
      grid.appendChild(a);added++;
    });
    this.textContent=added?'Loaded '+added+' more':'All models loaded';
  }catch(e){this.textContent='Error loading';}
});
</script>`;

  fs.writeFileSync(path.join(OUT, 'index.html'), page(
    'Best Chaturbate Models Online - Live Cam Shows',
    'Discover the best Chaturbate models streaming live right now. Browse hundreds of cam performers, filter by tags, and watch free live shows.',
    SITE_URL + '/',
    homeBody,
    [homeSchema, homeItemList]
  ));

  // === MODEL PAGES ===
  console.log('Generating model pages...');
  models.forEach(m => {
    const dir = path.join(OUT, 'model', m.username);
    mkdirp(dir);
    const desc = genDesc(m);
    const tagsHtml = (m.tags || []).map(t => `<a href="/tag/${encodeURIComponent(t)}/" class="tag">${t}</a>`).join(' ');
    const schema = {"@context":"https://schema.org","@type":"Person","name":m.username,"url":`${SITE_URL}/model/${m.username}/`,"image":m.image_url_360x270};
    
    const body = `<main class="container">
<h1>${m.username}'s Live Cam</h1>
<div class="model-page">
<div class="stream">
<iframe src="${m.iframe_embed_revshare}" allowfullscreen></iframe>
<p class="desc" style="margin-top:12px">${m.room_subject || ''}</p>
<p class="desc">${desc}</p>
<div style="margin:12px 0">${tagsHtml}</div>
</div>
<div class="sidebar"><dl>
<dt>Username</dt><dd>${m.username}</dd>
<dt>Age</dt><dd>${m.age || 'N/A'}</dd>
<dt>Location</dt><dd>${m.location || 'Unknown'}</dd>
<dt>Current Viewers</dt><dd>${m.num_users}</dd>
<dt>Followers</dt><dd>${m.num_followers?.toLocaleString() || 'N/A'}</dd>
<dt>Languages</dt><dd>${m.spoken_languages || 'English'}</dd>
<dt>Tags</dt><dd>${tagsHtml || 'None'}</dd>
</dl></div>
</div></main>`;

    fs.writeFileSync(path.join(dir, 'index.html'), page(
      `${m.username} Live Cam - Watch Free Chaturbate Stream`,
      desc.slice(0, 160),
      `${SITE_URL}/model/${m.username}/`,
      body,
      schema
    ));
  });

  // === TAG PAGES ===
  console.log('Generating tag pages...');
  const PER_PAGE = 40;
  allTags.forEach(tag => {
    const tagModels = tagMap[tag];
    const pages = Math.ceil(tagModels.length / PER_PAGE);
    for (let p = 0; p < pages; p++) {
      const dir = p === 0 ? path.join(OUT, 'tag', tag) : path.join(OUT, 'tag', tag, 'page', String(p + 1));
      mkdirp(dir);
      const slice = tagModels.slice(p * PER_PAGE, (p + 1) * PER_PAGE);
      
      let pagination = '<div class="pagination">';
      for (let i = 0; i < pages; i++) {
        const href = i === 0 ? `/tag/${encodeURIComponent(tag)}/` : `/tag/${encodeURIComponent(tag)}/page/${i + 1}/`;
        pagination += i === p ? `<span>${i + 1}</span>` : `<a href="${href}">${i + 1}</a>`;
      }
      pagination += '</div>';

      const body = `<main class="container">
<h1>Chaturbate Models Tagged "${tag}"</h1>
<p class="desc">${tagModels.length} models found with tag "${tag}". Browse live cam performers below.</p>
<div class="grid">${slice.map(modelCard).join('')}</div>
${pages > 1 ? pagination : ''}
</main>`;
      const canon = p === 0 ? `${SITE_URL}/tag/${encodeURIComponent(tag)}/` : `${SITE_URL}/tag/${encodeURIComponent(tag)}/page/${p + 1}/`;
      fs.writeFileSync(path.join(dir, 'index.html'), page(
        `${tag} Chaturbate Models - Live Cam Shows`,
        `Watch ${tagModels.length} live Chaturbate models tagged with "${tag}". Free live cam streams updated in real-time.`,
        canon,
        body
      ));
    }
  });

  // === TAGS LIST ===
  console.log('Generating tags list...');
  mkdirp(path.join(OUT, 'tags'));
  const tagsBody = `<main class="container">
<h1>All Chaturbate Tags</h1>
<p class="desc">Browse all ${allTags.length} tags to find your preferred type of live cam show.</p>
<div class="tags-list">${allTags.map(t => `<a href="/tag/${encodeURIComponent(t)}/" class="tag">${t} (${tagMap[t].length})</a>`).join('')}</div>
</main>`;
  fs.writeFileSync(path.join(OUT, 'tags', 'index.html'), page(
    'All Chaturbate Tags - Browse by Category',
    `Browse all ${allTags.length} Chaturbate tags and categories. Find live cam models by interest, body type, and more.`,
    `${SITE_URL}/tags/`,
    tagsBody
  ));

  // === SITEMAP ===
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  sitemap += `<url><loc>${SITE_URL}/</loc><priority>1.0</priority></url>\n`;
  sitemap += `<url><loc>${SITE_URL}/tags/</loc><priority>0.8</priority></url>\n`;
  models.forEach(m => { sitemap += `<url><loc>${SITE_URL}/model/${m.username}/</loc><priority>0.7</priority></url>\n`; });
  allTags.forEach(t => { sitemap += `<url><loc>${SITE_URL}/tag/${encodeURIComponent(t)}/</loc><priority>0.6</priority></url>\n`; });
  sitemap += `</urlset>`;
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap);

  // === ROBOTS ===
  fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);

  console.log(`Done! Generated ${models.length} model pages, ${allTags.length} tag pages.`);
}

build().catch(e => { console.error(e); process.exit(1); });
