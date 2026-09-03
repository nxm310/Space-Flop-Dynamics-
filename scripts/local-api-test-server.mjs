import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3001;
const API_BASE = 'https://api.star-citizen.wiki/api';

// Cache memory
let cachedBlueprints = [];
let cachedCommodities = [];
let isFetching = false;
let fetchProgress = { current: 0, total: 0, status: 'idle' };

// Map Wiki item type to application BlueprintCategory
function mapItemTypeToCategory(type, subType = '') {
  const t = (type || '').toLowerCase();
  const st = (subType || '').toLowerCase();
  
  if (t.includes('armor') || st.includes('armor')) return 'armure';
  if (t.includes('weaponpersonal') || st.includes('personal') || t.includes('attachment') || t.includes('magazine')) return 'arme';
  if (t.includes('medical') || t.includes('consumable') || t.includes('food') || t.includes('drink')) return 'medical';
  if (t.includes('gadget') || t.includes('tool') || t.includes('mining') || t.includes('multitool')) return 'utilitaire';
  if (t.includes('weapongun') || t.includes('turret') || t.includes('missile') || t.includes('torpedo') || t.includes('shield') || t.includes('quantum') || t.includes('cooler') || t.includes('powerplant')) return 'vaisseau';
  if (t.includes('commodity') || t.includes('raw') || t.includes('refined')) return 'ressource';
  
  return 'autre';
}

// Convert Wiki API Blueprint to Space-Flop App Blueprint format
function transformWikiBlueprint(item) {
  const output = item.output || {};
  const ingredients = (item.ingredients || []).map(ing => {
    // If quantity_scu is null, it's counted in units (gem or item)
    const isSCU = ing.quantity_scu !== null && ing.quantity_scu !== undefined;
    const qty = isSCU ? Number(ing.quantity_scu) : Number(ing.quantity || 1);
    
    return {
      resourceId: (ing.name || 'mineral').toLowerCase().replace(/[^a-z0-9]/g, '_'),
      resourceName: ing.name || 'Minerai inconnu',
      quantitySCU: isSCU ? qty : qty, // in units or SCU
      kind: ing.kind || 'resource'
    };
  });

  const category = mapItemTypeToCategory(output.type, output.sub_type);
  const craftTimeSeconds = item.craft_time_seconds || 600;

  return {
    id: `wiki_${item.uuid}`,
    wikiKey: item.key,
    name: item.output_name || output.name || 'Blueprint Inconnu',
    category,
    typeLabel: output.type_label || output.type || 'Composant',
    subtype: output.subtype || output.sub_type || undefined,
    grade: output.grade || undefined,
    craftTimeSeconds,
    craftTimeMinutes: Number((craftTimeSeconds / 60).toFixed(1)),
    marketEstimatedAUEC: 10000,
    description: `Blueprint officiel Star Citizen (${item.game_version || '4.10.0-LIVE'}). ${item.unlocking_missions_count ? `${item.unlocking_missions_count} mission(s) de déblocage.` : ''}`,
    ingredients,
    isAvailableByDefault: item.is_available_by_default || false,
    dismantleReturns: item.dismantle_returns || [],
    wikiUrl: item.web_url,
    itemUuid: item.output_item_uuid || output.uuid,
    isCustom: false
  };
}

// Convert Wiki API Commodity to Space-Flop App MineralInfo format
function transformWikiCommodity(com) {
  let group = 'Mineral';
  if (com.commodity_groups?.includes('Vice') || com.commodity_groups?.includes('Organic')) group = 'Composite';
  else if (com.has_fps_mineables || com.name?.toLowerCase().includes('hadanite') || com.name?.toLowerCase().includes('dolivine') || com.name?.toLowerCase().includes('athanor')) group = 'Gem';
  else if (com.has_salvage || com.name?.toLowerCase().includes('scrap') || com.name?.toLowerCase().includes('recycled')) group = 'Salvage';
  else if (com.name?.toLowerCase().includes('gas') || com.name?.toLowerCase().includes('fuel')) group = 'Gas';

  return {
    id: (com.slug || com.key || com.name).toLowerCase().replace(/[^a-z0-9]/g, '_'),
    name: com.name,
    displayName: com.display_name || com.name,
    group,
    density: com.density_g_per_cc || 2.5,
    basePriceAUEC: 50,
    rawPriceAUEC: 25,
    isMineable: com.is_mineable || com.has_ship_mineables || com.has_fps_mineables || false,
    isShipMineable: com.has_ship_mineables || false,
    isFpsMineable: com.has_fps_mineables || group === 'Gem',
    description: com.description || undefined,
    rarity: com.tier ? (com.tier > 2 ? 'Exotic' : 'Rare') : 'Common',
    boxSizesSCU: com.box_sizes_scu || [],
    wikiUrl: com.web_url
  };
}

// Fetch all pages helper
async function fetchAllPages(endpoint, pageSize = 100, onProgress = () => {}) {
  let page = 1;
  let allData = [];
  let totalPages = 1;

  do {
    const url = `${API_BASE}/${endpoint}?page[size]=${pageSize}&page[number]=${page}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
    const json = await res.json();
    
    if (json.data && Array.isArray(json.data)) {
      allData.push(...json.data);
    }
    
    totalPages = json.meta?.last_page || 1;
    onProgress(page, totalPages, allData.length, json.meta?.total || allData.length);
    page++;
  } while (page <= totalPages);

  return allData;
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Route 1: Status & Info
  if (url.pathname === '/api/status') {
    try {
      const testRes = await fetch(`${API_BASE}/game-versions`);
      const testData = testRes.ok ? await testRes.json() : null;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'online',
        targetApi: API_BASE,
        liveVersions: testData?.data || [],
        cachedBlueprintsCount: cachedBlueprints.length,
        cachedCommoditiesCount: cachedCommodities.length,
        fetchProgress
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'error', message: err.message }));
    }
    return;
  }

  // Route 2: Preview Blueprints (live from wiki with query)
  if (url.pathname === '/api/preview-blueprints') {
    const query = url.searchParams.get('q') || '';
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    
    try {
      let targetUrl = `${API_BASE}/blueprints?page[size]=${limit}&page[number]=${page}`;
      if (query) targetUrl += `&filter[query]=${encodeURIComponent(query)}`;
      
      const response = await fetch(targetUrl);
      const data = await response.json();
      
      const transformed = (data.data || []).map(transformWikiBlueprint);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        meta: data.meta,
        rawCount: data.data?.length || 0,
        transformedSample: transformed,
        rawSample: data.data || []
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Route 3: Preview Commodities (live from wiki)
  if (url.pathname === '/api/preview-commodities') {
    const limit = parseInt(url.searchParams.get('limit') || '30', 10);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    try {
      const targetUrl = `${API_BASE}/commodities?page[size]=${limit}&page[number]=${page}`;
      const response = await fetch(targetUrl);
      const data = await response.json();
      const transformed = (data.data || []).map(transformWikiCommodity);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        meta: data.meta,
        transformed,
        raw: data.data || []
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Route 4: Sync All Blueprints & Commodities (full fetch)
  if (url.pathname === '/api/sync-all' && req.method === 'POST') {
    if (isFetching) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Sync already in progress', progress: fetchProgress }));
      return;
    }

    isFetching = true;
    res.writeHead(202, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Sync started' }));

    (async () => {
      try {
        fetchProgress.status = 'fetching_commodities';
        const rawCommodities = await fetchAllPages('commodities', 100, (p, total, current, totalItems) => {
          fetchProgress = { current, total: totalItems, page: p, totalPages: total, status: 'fetching_commodities' };
        });
        cachedCommodities = rawCommodities.map(transformWikiCommodity);

        fetchProgress.status = 'fetching_blueprints';
        const rawBlueprints = await fetchAllPages('blueprints', 100, (p, total, current, totalItems) => {
          fetchProgress = { current, total: totalItems, page: p, totalPages: total, status: 'fetching_blueprints' };
        });
        cachedBlueprints = rawBlueprints.map(transformWikiBlueprint);

        // Save local JSON files for testing inspection
        const outputDir = path.join(__dirname, '../src/data/wiki_cache');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
        
        fs.writeFileSync(path.join(outputDir, 'blueprints_extracted.json'), JSON.stringify(cachedBlueprints, null, 2));
        fs.writeFileSync(path.join(outputDir, 'commodities_extracted.json'), JSON.stringify(cachedCommodities, null, 2));

        fetchProgress = { status: 'completed', blueprintsCount: cachedBlueprints.length, commoditiesCount: cachedCommodities.length };
      } catch (err) {
        fetchProgress = { status: 'error', error: err.message };
      } finally {
        isFetching = false;
      }
    })();
    return;
  }

  // Route 5: Progress check
  if (url.pathname === '/api/progress') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ isFetching, progress: fetchProgress, cachedBlueprints: cachedBlueprints.length, cachedCommodities: cachedCommodities.length }));
    return;
  }

  // Route 6: Interactive Dashboard HTML UI
  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
<!DOCTYPE html>
<html lang="fr" class="dark">
<head>
  <meta charset="UTF-8">
  <title>Laboratoire Test API - Star Citizen Wiki</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #050811; color: #e2e8f0; font-family: ui-sans-serif, system-ui, sans-serif; }
    .neon-cyan { box-shadow: 0 0 15px rgba(6, 182, 212, 0.3); }
  </style>
</head>
<body class="p-6 max-w-7xl mx-auto space-y-6">
  
  <!-- Header -->
  <div class="flex items-center justify-between p-5 bg-[#0b1324] border border-cyan-900/50 rounded-2xl neon-cyan">
    <div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></span>
        <h1 class="text-xl font-mono font-bold text-cyan-400 uppercase tracking-wider">Serveur Local de Test API Star Citizen Wiki</h1>
      </div>
      <p class="text-xs font-mono text-slate-400 mt-1">Exploration & Validation des Blueprints et Commodities (1600+ plans disponibles sur 4.10 LIVE)</p>
    </div>
    <div class="flex items-center gap-3">
      <span id="statusBadge" class="px-3 py-1 rounded-lg bg-slate-800 text-xs font-mono text-slate-300 border border-slate-700">Connexion...</span>
      <button onclick="triggerSync()" id="syncBtn" class="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider transition-all">
        ⚡ Télécharger & Extraire Tout (1600+ plans)
      </button>
    </div>
  </div>

  <!-- Progress Bar -->
  <div id="progressBox" class="hidden p-4 bg-[#0b1324] border border-cyan-500/40 rounded-xl space-y-2">
    <div class="flex justify-between text-xs font-mono">
      <span id="progressText" class="text-cyan-300">Synchronisation en cours...</span>
      <span id="progressPercent" class="text-cyan-400 font-bold">0%</span>
    </div>
    <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
      <div id="progressBar" class="bg-cyan-400 h-full w-0 transition-all duration-300"></div>
    </div>
  </div>

  <!-- Tab Controls & Search -->
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
    <div class="flex gap-2">
      <button onclick="setTab('blueprints')" id="tabBp" class="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-mono text-xs uppercase font-bold">
        📜 Blueprints (<span id="bpCount">1606</span>)
      </button>
      <button onclick="setTab('commodities')" id="tabCom" class="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 font-mono text-xs uppercase">
        💎 Minerais & Commodités (<span id="comCount">206</span>)
      </button>
    </div>

    <div class="flex gap-2 w-full sm:w-96">
      <input type="text" id="searchInput" placeholder="Rechercher par nom (ex: Omnisky, Shotgun, Hadanite)..." class="w-full px-3 py-2 bg-[#090e18] border border-slate-700 focus:border-cyan-400 rounded-xl text-xs font-mono text-slate-100 outline-none" oninput="handleSearch()">
    </div>
  </div>

  <!-- Results View -->
  <div id="resultsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div class="col-span-full text-center py-12 text-slate-500 font-mono text-xs">Chargement des données...</div>
  </div>

  <!-- Detailed Inspector Modal / Side View -->
  <div id="modalInspector" class="fixed inset-0 bg-black/80 backdrop-blur-sm hidden flex items-center justify-center p-4 z-50">
    <div class="bg-[#0b1324] border border-cyan-500/50 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden">
      <div class="p-4 border-b border-slate-800 flex justify-between items-center">
        <h3 id="modalTitle" class="font-mono font-bold text-cyan-300 text-sm">Détail & Conversion</h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-100 font-mono">✕</button>
      </div>
      <div class="p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div>
          <h4 class="text-slate-400 font-bold mb-2">📥 Données Brutes API Wiki :</h4>
          <pre id="modalRaw" class="p-3 bg-black/60 rounded-xl text-[11px] text-amber-300 overflow-x-auto max-h-96"></pre>
        </div>
        <div>
          <h4 class="text-cyan-400 font-bold mb-2">🚀 Format Converti Space-Flop App :</h4>
          <pre id="modalConverted" class="p-3 bg-black/60 rounded-xl text-[11px] text-cyan-300 overflow-x-auto max-h-96"></pre>
        </div>
      </div>
    </div>
  </div>

  <script>
    let activeTab = 'blueprints';
    let currentData = [];

    async function checkStatus() {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        const badge = document.getElementById('statusBadge');
        if (data.status === 'online') {
          badge.textContent = '🟢 API Wiki Connectée (LIVE)';
          badge.className = 'px-3 py-1 rounded-lg bg-emerald-950 text-xs font-mono text-emerald-300 border border-emerald-800';
        }
      } catch(e) {
        document.getElementById('statusBadge').textContent = '🔴 Erreur Connexion';
      }
    }

    async function loadData(query = '') {
      const grid = document.getElementById('resultsGrid');
      grid.innerHTML = '<div class="col-span-full text-center py-12 text-slate-500 font-mono text-xs">Chargement...</div>';

      const endpoint = activeTab === 'blueprints' 
        ? '/api/preview-blueprints?limit=30&q=' + encodeURIComponent(query)
        : '/api/preview-commodities?limit=30';

      const res = await fetch(endpoint);
      const data = await res.json();
      currentData = activeTab === 'blueprints' ? (data.transformedSample || []) : (data.transformed || []);
      const rawData = activeTab === 'blueprints' ? (data.rawSample || []) : (data.raw || []);

      renderGrid(currentData, rawData);
    }

    function renderGrid(items, rawItems) {
      const grid = document.getElementById('resultsGrid');
      if (!items.length) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-slate-500 font-mono text-xs">Aucun résultat trouvé.</div>';
        return;
      }

      grid.innerHTML = items.map((item, idx) => {
        const raw = rawItems[idx] || {};
        if (activeTab === 'blueprints') {
          return \`
            <div class="p-4 bg-[#090e18] border border-slate-800 hover:border-cyan-500/50 rounded-xl space-y-3 cursor-pointer group transition-all" onclick='openInspector(\${idx})'>
              <div class="flex justify-between items-start">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">\${item.category}</span>
                <span class="text-[10px] font-mono text-slate-500">⏱️ \${item.craftTimeMinutes} min</span>
              </div>
              <div>
                <h4 class="font-bold text-slate-100 group-hover:text-cyan-300 text-sm">\${item.name}</h4>
                <p class="text-[10px] font-mono text-slate-500">\${item.typeLabel} \${item.grade ? '• Grade ' + item.grade : ''}</p>
              </div>
              <div class="pt-2 border-t border-slate-800/80 space-y-1">
                <span class="text-[10px] font-mono text-slate-400 font-bold block">Ingrédients requis (\${item.ingredients.length}) :</span>
                <div class="flex flex-wrap gap-1">
                  \${item.ingredients.map(ing => \`<span class="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-mono border border-slate-800">\${ing.quantitySCU} \${ing.resourceName}</span>\`).join('')}
                </div>
              </div>
            </div>
          \`;
        } else {
          return \`
            <div class="p-4 bg-[#090e18] border border-slate-800 hover:border-purple-500/50 rounded-xl space-y-3 cursor-pointer group transition-all" onclick='openInspector(\${idx})'>
              <div class="flex justify-between items-start">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800 uppercase">\${item.group}</span>
                <span class="text-[10px] font-mono text-cyan-400 font-bold">Densité: \${item.density} g/cm³</span>
              </div>
              <div>
                <h4 class="font-bold text-slate-100 group-hover:text-purple-300 text-sm">\${item.displayName || item.name}</h4>
                <p class="text-[10px] font-mono text-slate-500">ID: \${item.id}</p>
              </div>
              <div class="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                <span>\${item.isShipMineable ? '🚀 Minable Vaisseau' : ''} \${item.isFpsMineable ? '💎 Minable Sol/FPS' : ''}</span>
              </div>
            </div>
          \`;
        }
      }).join('');
    }

    let searchTimeout;
    function handleSearch() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        loadData(document.getElementById('searchInput').value);
      }, 300);
    }

    function setTab(tab) {
      activeTab = tab;
      document.getElementById('tabBp').className = tab === 'blueprints' 
        ? 'px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-mono text-xs uppercase font-bold'
        : 'px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 font-mono text-xs uppercase';
      document.getElementById('tabCom').className = tab === 'commodities'
        ? 'px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-400 text-purple-300 font-mono text-xs uppercase font-bold'
        : 'px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 font-mono text-xs uppercase';
      loadData();
    }

    async function triggerSync() {
      const btn = document.getElementById('syncBtn');
      btn.disabled = true;
      btn.textContent = '⏳ Téléchargement en cours...';
      document.getElementById('progressBox').classList.remove('hidden');

      await fetch('/api/sync-all', { method: 'POST' });
      
      const interval = setInterval(async () => {
        const res = await fetch('/api/progress');
        const prog = await res.json();
        
        if (prog.progress) {
          document.getElementById('progressText').textContent = 'Étape : ' + prog.progress.status + ' (' + (prog.progress.current || 0) + ' / ' + (prog.progress.total || 1600) + ')';
          const pct = prog.progress.total ? Math.round((prog.progress.current / prog.progress.total) * 100) : 50;
          document.getElementById('progressBar').style.width = pct + '%';
          document.getElementById('progressPercent').textContent = pct + '%';

          if (prog.progress.status === 'completed') {
            clearInterval(interval);
            btn.disabled = false;
            btn.textContent = '✅ Extraction Complète Réussie !';
            document.getElementById('progressText').textContent = 'Terminé ! ' + prog.cachedBlueprints + ' blueprints & ' + prog.cachedCommodities + ' commodités enregistrés dans src/data/wiki_cache/';
            loadData();
          }
        }
      }, 1000);
    }

    let lastRaw = [];
    async function openInspector(idx) {
      const item = currentData[idx];
      document.getElementById('modalTitle').textContent = 'Détail : ' + (item.name || item.displayName);
      document.getElementById('modalConverted').textContent = JSON.stringify(item, null, 2);
      
      // Fetch single raw item
      const endpoint = activeTab === 'blueprints'
        ? \`\${API_BASE}/blueprints/\${item.id.replace('wiki_', '')}\`
        : \`\${API_BASE}/commodities/\${item.id}\`;
      
      try {
        const r = await fetch(endpoint);
        const j = await r.json();
        document.getElementById('modalRaw').textContent = JSON.stringify(j.data || j, null, 2);
      } catch(e) {
        document.getElementById('modalRaw').textContent = '// Erreur de chargement brut';
      }
      
      document.getElementById('modalInspector').classList.remove('hidden');
    }

    function closeModal() {
      document.getElementById('modalInspector').classList.add('hidden');
    }

    checkStatus();
    loadData();
  </script>
</body>
</html>
    `);
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🚀 SERVEUR DE TEST API STAR CITIZEN WIKI PRÊT !`);
  console.log(`🌐 Accédez au tableau de bord local : http://localhost:${PORT}`);
  console.log(`🔒 Mode local uniquement - Aucune modification en production.`);
  console.log(`================================================================`);
});
