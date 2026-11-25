/**
 * 太空偷窥局 (Space Peep Bureau - SPB)
 * Core Application Logic & SGP4 Dynamic Dossier Controller
 */

(function () {
  'use strict';

  // Global State
  const SPB_STATE = {
    currentCity: '北京',
    currentLat: 39.9042,
    currentLon: 116.4074,
    activeTab: 'past', // 'past' | 'future'
    pastFilter: 'all', // 'all' | 'clear' | 'hires'
    cities: [],
    satellites: [],
    pastPasses: [],
    futurePasses: [],
    weather: null,
    selectedPassForPoster: null
  };

  // DOM Elements
  const dom = {
    utcClock: document.getElementById('utc-clock'),
    localClock: document.getElementById('local-clock'),
    btnGpsLocate: document.getElementById('btn-gps-locate'),
    radarStatusText: document.getElementById('radar-status-text'),
    citySearchInput: document.getElementById('city-search-input'),
    btnSearchCity: document.getElementById('btn-search-city'),
    cityDropdown: document.getElementById('city-dropdown'),
    quickCityContainer: document.getElementById('quick-city-container'),
    hudCityName: document.getElementById('hud-city-name'),
    hudCoords: document.getElementById('hud-coords'),
    btnToggleManualCoord: document.getElementById('btn-toggle-manual-coord'),
    manualCoordDrawer: document.getElementById('manual-coord-drawer'),
    inputCustomLat: document.getElementById('input-custom-lat'),
    inputCustomLon: document.getElementById('input-custom-lon'),
    btnApplyCustomCoord: document.getElementById('btn-apply-custom-coord'),
    tabBtnPast: document.getElementById('tab-btn-past'),
    tabBtnFuture: document.getElementById('tab-btn-future'),
    tabPanelPast: document.getElementById('tab-panel-past'),
    tabPanelFuture: document.getElementById('tab-panel-future'),
    pastDossierCards: document.getElementById('past-dossier-cards'),
    futurePassesContainer: document.getElementById('future-passes-container'),
    futurePassesCountBadge: document.getElementById('future-passes-count-badge'),
    filterPastAll: document.getElementById('filter-past-all'),
    filterPastClear: document.getElementById('filter-past-clear'),
    filterPastHires: document.getElementById('filter-past-hires'),
    filterCountAll: document.getElementById('filter-count-all'),
    polarRadarArcs: document.getElementById('polar-radar-arcs'),
    btnSimulatePass: document.getElementById('btn-simulate-pass'),
    trackerCssPos: document.getElementById('tracker-css-pos'),
    trackerCssAlt: document.getElementById('tracker-css-alt'),
    trackerIssPos: document.getElementById('tracker-iss-pos'),
    trackerIssAlt: document.getElementById('tracker-iss-alt'),
    worldMapTracks: document.getElementById('world-map-tracks'),
    worldMapTarget: document.getElementById('world-map-target'),
    worldMapSats: document.getElementById('world-map-sats'),
    posterModal: document.getElementById('poster-modal'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    btnCancelPoster: document.getElementById('btn-cancel-poster'),
    btnExportDossierAll: document.getElementById('btn-export-dossier-all'),
    btnDownloadPoster: document.getElementById('btn-download-poster'),
    trackedSatCount: document.getElementById('tracked-sat-count')
  };

  // 1. Clock Updates
  function initClock() {
    function updateTimes() {
      const now = new Date();
      // UTC
      const utcHours = String(now.getUTCHours()).padStart(2, '0');
      const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
      const utcSeconds = String(now.getUTCSeconds()).padStart(2, '0');
      if (dom.utcClock) {
        dom.utcClock.textContent = `${utcHours}:${utcMinutes}:${utcSeconds} Z`;
      }

      // Local
      const localHours = String(now.getHours()).padStart(2, '0');
      const localMinutes = String(now.getMinutes()).padStart(2, '0');
      const localSeconds = String(now.getSeconds()).padStart(2, '0');
      if (dom.localClock) {
        dom.localClock.textContent = `${localHours}:${localMinutes}:${localSeconds}`;
      }
    }
    updateTimes();
    setInterval(updateTimes, 1000);
  }

  // 2. Tab Navigation
  function initTabs() {
    if (!dom.tabBtnPast || !dom.tabBtnFuture) return;

    dom.tabBtnPast.addEventListener('click', () => {
      switchTab('past');
    });

    dom.tabBtnFuture.addEventListener('click', () => {
      switchTab('future');
    });
  }

  function switchTab(targetTab) {
    SPB_STATE.activeTab = targetTab;
    if (targetTab === 'past') {
      dom.tabBtnPast.classList.add('active');
      dom.tabBtnPast.classList.remove('text-slate-400');
      dom.tabBtnFuture.classList.remove('active');
      dom.tabBtnFuture.classList.add('text-slate-400');

      dom.tabPanelPast.classList.remove('hidden');
      dom.tabPanelFuture.classList.add('hidden');
    } else {
      dom.tabBtnFuture.classList.add('active');
      dom.tabBtnFuture.classList.remove('text-slate-400');
      dom.tabBtnPast.classList.remove('active');
      dom.tabBtnPast.classList.add('text-slate-400');

      dom.tabPanelFuture.classList.remove('hidden');
      dom.tabPanelPast.classList.add('hidden');
    }
  }

  // 3. Data Loading: Cities & Satellites
  async function loadData() {
    // Load Cities
    try {
      const cityResp = await fetch('assets/data/cities.json');
      if (cityResp.ok) {
        SPB_STATE.cities = await cityResp.json();
      }
    } catch (e) {
      console.warn('Fallback to default cities:', e);
      SPB_STATE.cities = [
        { id: 'beijing', name: '北京', name_en: 'Beijing', lat: 39.9042, lon: 116.4074 },
        { id: 'shanghai', name: '上海', name_en: 'Shanghai', lat: 31.2304, lon: 121.4737 },
        { id: 'guangzhou', name: '广州', name_en: 'Guangzhou', lat: 23.1291, lon: 113.2644 },
        { id: 'shenzhen', name: '深圳', name_en: 'Shenzhen', lat: 22.5431, lon: 114.0579 },
        { id: 'chengdu', name: '成都', name_en: 'Chengdu', lat: 30.5728, lon: 104.0668 },
        { id: 'hangzhou', name: '杭州', name_en: 'Hangzhou', lat: 30.2741, lon: 120.1551 },
        { id: 'wuhan', name: '武汉', name_en: 'Wuhan', lat: 30.5928, lon: 114.3055 },
        { id: 'xian', name: '西安', name_en: "Xi'an", lat: 34.3416, lon: 108.9398 },
        { id: 'hongkong', name: '香港', name_en: 'Hong Kong', lat: 22.3193, lon: 114.1694 },
        { id: 'tokyo', name: '东京', name_en: 'Tokyo', lat: 35.6762, lon: 139.6503 }
      ];
    }
    renderQuickCityBadges();

    // Load Satellites TLE
    try {
      const satResp = await fetch('assets/data/satellites.json');
      if (satResp.ok) {
        SPB_STATE.satellites = await satResp.json();
        if (window.OrbitEngine) {
          window.OrbitEngine.init(SPB_STATE.satellites);
        }
      }
    } catch (e) {
      console.error('Failed to load satellites.json:', e);
    }

    // Trigger initial calculation
    calculateOrbitsForLocation();
  }

  function renderQuickCityBadges() {
    if (!dom.quickCityContainer || !SPB_STATE.cities.length) return;

    const topCities = SPB_STATE.cities.slice(0, 10);
    dom.quickCityContainer.innerHTML = '';

    topCities.forEach((city) => {
      const btn = document.createElement('button');
      btn.className = `px-2 py-0.5 rounded border transition-colors ${
        city.name === SPB_STATE.currentCity
          ? 'bg-cyan-400/20 text-cyan-300 border-cyan-400 font-bold'
          : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-cyan-400/40 hover:text-slate-200'
      }`;
      btn.textContent = city.name;
      btn.addEventListener('click', () => {
        setTargetLocation(city.name, city.lat, city.lon);
      });
      dom.quickCityContainer.appendChild(btn);
    });
  }

  function setTargetLocation(cityName, lat, lon) {
    SPB_STATE.currentCity = cityName;
    SPB_STATE.currentLat = parseFloat(lat);
    SPB_STATE.currentLon = parseFloat(lon);

    // Update HUD display
    if (dom.hudCityName) {
      dom.hudCityName.innerHTML = `<span>${cityName}</span>`;
    }
    if (dom.hudCoords) {
      const latDir = SPB_STATE.currentLat >= 0 ? '°N' : '°S';
      const lonDir = SPB_STATE.currentLon >= 0 ? '°E' : '°W';
      dom.hudCoords.textContent = `${Math.abs(SPB_STATE.currentLat).toFixed(4)}${latDir}, ${Math.abs(SPB_STATE.currentLon).toFixed(4)}${lonDir}`;
    }

    if (dom.inputCustomLat) dom.inputCustomLat.value = SPB_STATE.currentLat;
    if (dom.inputCustomLon) dom.inputCustomLon.value = SPB_STATE.currentLon;

    renderQuickCityBadges();

    // Update 2D tracker target marker
    updateWorldMapTracker();

    // Trigger recalculation
    calculateOrbitsForLocation();
  }

  // 4. SGP4 Orbits Calculation & UI Binding
  function calculateOrbitsForLocation() {
    if (!window.OrbitEngine || !SPB_STATE.satellites.length) return;

    if (dom.radarStatusText) {
      dom.radarStatusText.textContent = 'SGP4 SOLVING...';
      dom.radarStatusText.className = 'text-amber-400 font-semibold animate-pulse';
    }

    // Run SGP4 calculations asynchronously to keep UI buttery smooth
    setTimeout(() => {
      // 1. Calculate Past Recon Passes (Last 7 Days)
      SPB_STATE.pastPasses = window.OrbitEngine.computePastReconPasses(
        SPB_STATE.currentLat,
        SPB_STATE.currentLon,
        7,
        240 // swath threshold in km
      );

      // 2. Calculate Future Visible Station Passes (Next 3 Days)
      SPB_STATE.futurePasses = window.OrbitEngine.computeFutureVisiblePasses(
        SPB_STATE.currentLat,
        SPB_STATE.currentLon,
        3,
        12 // min elevation
      );

      // Update HUD Status
      if (dom.radarStatusText) {
        dom.radarStatusText.textContent = 'TARGET LOCKED';
        dom.radarStatusText.className = 'text-cyan-400 font-semibold';
        setTimeout(() => {
          if (dom.radarStatusText) {
            dom.radarStatusText.textContent = 'ONLINE (MONITORING)';
            dom.radarStatusText.className = 'text-emerald-400 font-semibold';
          }
        }, 1200);
      }

      // Render Tab Panels
      renderPastDossierCards();
      renderFuturePasses();
      renderPolarRadarArcs();
      updateWorldMapTracker();

      // 优化 2：并发拉取 Open-Meteo 真实云量与视宁度数据并无缝注入
      if (window.OrbitEngine.fetchWeatherForecast) {
        window.OrbitEngine.fetchWeatherForecast(SPB_STATE.currentLat, SPB_STATE.currentLon).then(w => {
          if (w) {
            SPB_STATE.weather = w;
            renderFuturePasses();
            if (window.lucide) lucide.createIcons();
          }
        });
      }

      if (window.lucide) lucide.createIcons();
    }, 50);
  }

  // Format date helper: "11月24日 10:48 (3天前)"
  function formatRelativeDate(date) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(Math.abs(diffMs) / (3600 * 1000));
    const diffDays = Math.floor(diffHours / 24);

    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    let relativeStr = '';
    if (diffMs > 0) {
      if (diffDays >= 1) relativeStr = `${diffDays}天前`;
      else if (diffHours >= 1) relativeStr = `${diffHours}小时前`;
      else relativeStr = `刚刚`;
    } else {
      if (diffDays >= 1) relativeStr = `${diffDays}天后`;
      else if (diffHours >= 1) relativeStr = `${diffHours}小时后`;
      else relativeStr = `即将过境`;
    }

    return `${month}月${day}日 ${hours}:${minutes} (${relativeStr})`;
  }

  // Render Past Recon Cards
  function renderPastDossierCards() {
    if (!dom.pastDossierCards) return;

    let passes = SPB_STATE.pastPasses;
    if (dom.filterCountAll) dom.filterCountAll.textContent = passes.length;

    // Apply Filter
    if (SPB_STATE.pastFilter === 'clear') {
      passes = passes.filter(p => p.cloudCoverPercent <= 20);
    } else if (SPB_STATE.pastFilter === 'hires') {
      passes = passes.filter(p => p.resolutionM <= 10);
    }

    if (!passes.length) {
      dom.pastDossierCards.innerHTML = `
        <div class="col-span-full dossier-card p-8 rounded text-center space-y-3 font-mono text-slate-400 border-dashed border-cyan-400/30">
          <i data-lucide="scan" class="w-8 h-8 mx-auto text-slate-500 animate-pulse"></i>
          <div class="text-sm text-cyan-300">当前过滤条件下过去 7 天未检索到直接重合光学快门</div>
          <p class="text-xs text-slate-500">建议切换至“全部底片”或扩大坐标视域范围。</p>
        </div>
      `;
      return;
    }

    dom.pastDossierCards.innerHTML = '';

    // Sample high-detail aerial textures
    const satelliteImages = [
      'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80'
    ];

    passes.forEach((pass, idx) => {
      const sat = pass.satellite;
      const previewImg = satelliteImages[idx % satelliteImages.length];

      // 优化 3：动态解析 NASA GIBS 该过境日期的真实卫星图切片
      const nasaTileUrl = window.OrbitEngine && window.OrbitEngine.getNasaGibsTileUrl
        ? window.OrbitEngine.getNasaGibsTileUrl(SPB_STATE.currentLat, SPB_STATE.currentLon, pass.closestTime)
        : previewImg;

      const card = document.createElement('article');
      card.className = 'dossier-card hud-corner p-5 rounded-lg space-y-4 border-cyan-400/20 group hover:border-cyan-400/60';

      const agencyBadge = sat.agency === 'ESA'
        ? '<span class="badge-tech font-mono text-[10px] px-2 py-0.5 rounded font-bold">ESA // OPTICAL</span>'
        : '<span class="badge-amber font-mono text-[10px] px-2 py-0.5 rounded font-bold">NASA/USGS // OLI</span>';

      const resolutionBadge = pass.resolutionM <= 10
        ? '<span class="text-xs font-mono text-red-400 border border-red-500/40 px-1.5 py-0.5 rounded bg-red-950/40 font-bold">10m 超高分</span>'
        : `<span class="text-xs font-mono text-cyan-400 border border-cyan-500/40 px-1.5 py-0.5 rounded bg-cyan-950/40">${pass.resolutionM}m 分辨率</span>`;

      const cloudColor = pass.cloudCoverPercent <= 15 ? 'text-emerald-400' : (pass.cloudCoverPercent <= 30 ? 'text-amber-300' : 'text-slate-400');

      card.innerHTML = `
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center space-x-2">
              ${agencyBadge}
              <span class="text-xs font-mono text-slate-500">NORAD #${sat.norad_id}</span>
            </div>
            <h3 class="text-lg font-bold text-white mt-1 group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              <span>${sat.name}</span>
            </h3>
          </div>
          ${resolutionBadge}
        </div>

        <!-- Satellite Viewfinder Preview Box (NASA GIBS True Overpass Imagery) -->
        <div class="relative h-44 rounded bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center">
          <img 
            src="${nasaTileUrl}" 
            alt="${sat.name} NASA GIBS Imagery" 
            onerror="this.onerror=null; this.src='${previewImg}';"
            class="w-full h-full object-cover opacity-75 filter contrast-125 brightness-95 group-hover:scale-105 transition-transform duration-700"
          >
          <!-- Reticle Overlay -->
          <div class="absolute inset-0 pointer-events-none border border-cyan-400/20 flex items-center justify-center">
            <div class="w-10 h-10 border border-cyan-400/60 rounded-full flex items-center justify-center">
              <div class="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
            </div>
            <div class="absolute top-2 left-2 text-[9px] font-mono text-cyan-400 bg-black/70 px-1 rounded">
              LAT: ${SPB_STATE.currentLat.toFixed(3)}°
            </div>
            <div class="absolute bottom-2 right-2 text-[9px] font-mono text-cyan-400 bg-black/70 px-1 rounded">
              ALT: ${pass.altitudeKm} KM
            </div>
          </div>
          <div class="absolute top-2 right-2 bg-red-600/90 text-white font-mono text-[10px] px-2 py-0.5 rounded font-bold tracking-wider flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            <span>NASA GIBS 真实过境底片</span>
          </div>
        </div>

        <!-- Specs Grid -->
        <div class="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300 bg-slate-950/60 p-3 rounded border border-slate-800/80">
          <div>
            <span class="text-slate-500 text-[10px] block">偷窥时刻 (PASS TIME)</span>
            <span class="text-cyan-300 font-bold">${formatRelativeDate(pass.closestTime)}</span>
          </div>
          <div>
            <span class="text-slate-500 text-[10px] block">星下点偏离 (OFFSET)</span>
            <span class="${pass.groundDistanceKm < 50 ? 'text-emerald-400' : 'text-slate-300'} font-bold">
              ${pass.groundDistanceKm} km (${pass.groundDistanceKm < 50 ? '极近盲区' : '成像边缘'})
            </span>
          </div>
          <div>
            <span class="text-slate-500 text-[10px] block">最高仰角 (ELEVATION)</span>
            <span class="text-white font-bold">${pass.elevationDeg}° (${pass.compass})</span>
          </div>
          <div>
            <span class="text-slate-500 text-[10px] block">当日云量评估</span>
            <span class="${cloudColor} font-semibold">${pass.cloudCoverPercent}% (${pass.cloudCoverPercent <= 15 ? '极清通透' : '局部云系'})</span>
          </div>
        </div>

        <!-- Card Actions -->
        <div class="pt-1 flex items-center gap-2">
          <button class="btn-card-poster-gen flex-1 py-2 px-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded font-mono text-xs font-semibold flex items-center justify-center space-x-1.5 transition">
            <i data-lucide="file-badge" class="w-3.5 h-3.5"></i>
            <span>生成单星档案海报</span>
          </button>
          <a href="https://worldview.earthdata.nasa.gov/?v=${SPB_STATE.currentLon - 1},${SPB_STATE.currentLat - 1},${SPB_STATE.currentLon + 1},${SPB_STATE.currentLat + 1}" target="_blank" class="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-xs font-mono transition" title="调取 NASA 开放波段数据">
            <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
          </a>
        </div>
      `;

      // Attach poster generator trigger
      const btnPoster = card.querySelector('.btn-card-poster-gen');
      btnPoster.addEventListener('click', () => {
        SPB_STATE.selectedPassForPoster = pass;
        openPosterModal();
      });

      dom.pastDossierCards.appendChild(card);
    });
  }

  // Render Future Station Passes
  function renderFuturePasses() {
    if (!dom.futurePassesContainer) return;

    const passes = SPB_STATE.futurePasses;
    if (dom.futurePassesCountBadge) {
      dom.futurePassesCountBadge.textContent = `未来 72 小时检测到 ${passes.length} 次夜间过境`;
    }

    if (!passes.length) {
      dom.futurePassesContainer.innerHTML = `
        <div class="dossier-card p-8 rounded text-center space-y-3 font-mono text-slate-400 border-dashed border-amber-400/30">
          <i data-lucide="moon" class="w-8 h-8 mx-auto text-amber-400 animate-pulse"></i>
          <div class="text-sm text-amber-300">未来 3 天夜间该坐标上空无满足肉眼可见条件的高仰角过境</div>
          <p class="text-xs text-slate-500">空间站轨道倾角周期变化，建议隔日再次刷新侦测或输入南部更低纬度哨点。</p>
        </div>
      `;
      return;
    }

    dom.futurePassesContainer.innerHTML = '';

    passes.forEach((pass) => {
      const sat = pass.satellite;
      const isCSS = sat.id === 'css';
      const isISS = sat.id === 'iss';

      const item = document.createElement('div');
      item.className = `dossier-card hud-corner p-4 rounded space-y-3 transition ${
        isCSS
          ? 'border-amber-400/50 hover:border-amber-400 bg-gradient-to-r from-amber-950/20 to-transparent'
          : (isISS ? 'border-cyan-400/40 hover:border-cyan-400' : 'border-slate-700 hover:border-slate-500')
      }`;

      const iconEmoji = isCSS ? '🇨🇳' : (isISS ? '🛰️' : '🔭');
      const badgeStyle = isCSS
        ? '<span class="badge-amber font-mono text-[10px] px-2 py-0.5 rounded font-bold">国家重器 · 极度明亮</span>'
        : (isISS ? '<span class="badge-tech font-mono text-[10px] px-2 py-0.5 rounded font-bold">全天最亮人造星</span>' : '<span class="bg-slate-800 text-slate-400 font-mono text-[10px] px-2 py-0.5 rounded">深空之眼</span>');

      const magColor = pass.magnitude <= 0 ? 'text-emerald-400' : (pass.magnitude <= 2 ? 'text-cyan-300' : 'text-slate-300');

      // Open-Meteo Weather forecast integration
      let weatherBadge = '';
      if (SPB_STATE.weather && SPB_STATE.weather.hourly && SPB_STATE.weather.hourly.time) {
        const passIsoHour = pass.rise.time.toISOString().slice(0, 13) + ':00';
        const hourIdx = SPB_STATE.weather.hourly.time.findIndex(t => t.startsWith(passIsoHour.slice(0, 13)));
        if (hourIdx !== -1) {
          const clouds = SPB_STATE.weather.hourly.cloud_cover[hourIdx];
          const cloudIcon = clouds <= 20 ? '✨' : (clouds <= 50 ? '⛅' : '☁️');
          const cloudColor = clouds <= 20 ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' : (clouds <= 50 ? 'text-amber-300 border-amber-500/40 bg-amber-950/40' : 'text-slate-400 border-slate-700 bg-slate-900/60');
          weatherBadge = `<span class="text-[10px] font-mono px-2 py-0.5 rounded border ${cloudColor} flex items-center gap-1" title="Open-Meteo 真实气象云量预报">
            <span>${cloudIcon} 云量 ${clouds}% (${clouds <= 20 ? '通透绝佳' : (clouds <= 50 ? '间歇可见' : '较多遮蔽')})</span>
          </span>`;
        }
      }

      item.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="text-lg">${iconEmoji}</span>
            <span class="font-bold text-base ${isCSS ? 'text-amber-300' : 'text-white'} font-sans">${sat.name}</span>
            ${badgeStyle}
          </div>
          <div class="font-mono text-xs text-right">
            <span class="${magColor} font-bold text-sm">${pass.magnitude > 0 ? '+' : ''}${pass.magnitude} 等</span>
            <span class="text-[10px] text-slate-500 block">视星等预估</span>
          </div>
        </div>

        <!-- Pass Trajectory Timeline -->
        <div class="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-950/70 p-3 rounded border border-slate-800">
          <div>
            <span class="text-slate-500 text-[10px] block">升起时刻 (RISE)</span>
            <span class="text-slate-200 font-bold">${formatRelativeDate(pass.rise.time)}</span>
            <span class="text-[10px] text-cyan-400 block">${pass.rise.compass} ${pass.rise.azimuth}° (仰角${pass.rise.elevation}°)</span>
          </div>
          <div class="border-x border-slate-800/80 px-2 text-center">
            <span class="text-slate-500 text-[10px] block">天顶最高 (MAX ELEV)</span>
            <span class="${isCSS ? 'text-amber-300' : 'text-cyan-300'} font-bold text-sm">${pass.max.elevation}° (${pass.max.elevation > 60 ? '直逼正天顶' : '高仰角'})</span>
            <span class="text-[10px] text-slate-400 block">${pass.max.compass} ${pass.max.azimuth}°</span>
          </div>
          <div class="text-right">
            <span class="text-slate-500 text-[10px] block">降落隐没 (SET)</span>
            <span class="text-slate-200 font-bold">${String(pass.set.time.getHours()).padStart(2, '0')}:${String(pass.set.time.getMinutes()).padStart(2, '0')}:${String(pass.set.time.getSeconds()).padStart(2, '0')}</span>
            <span class="text-[10px] text-cyan-400 block">${pass.set.compass} ${pass.set.azimuth}° 没入地影</span>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 pt-1 gap-2">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-emerald-400 flex items-center">
              <i data-lucide="eye" class="w-3.5 h-3.5 mr-1"></i> ${pass.visibilityGrade} · 视持续 ${pass.durationFormatted}
            </span>
            ${weatherBadge}
          </div>
          <div class="flex items-center gap-2">
            <button class="btn-export-ics text-xs text-amber-300 hover:text-amber-200 border border-amber-400/40 hover:border-amber-400 bg-amber-950/30 px-2 py-0.5 rounded flex items-center transition" title="下载 .ics 日历文件，支持 iOS/Android/Mac 一键写入系统日程">
              <i data-lucide="calendar" class="w-3.5 h-3.5 mr-1"></i>
              <span>⏰ 写入手机日历</span>
            </button>
            <button class="btn-focus-radar-arc text-xs text-cyan-400 hover:text-cyan-300 hover:underline flex items-center transition">
              <span>天顶投影光轨</span>
              <i data-lucide="crosshair" class="w-3.5 h-3.5 ml-1"></i>
            </button>
          </div>
        </div>
      `;

      // ICS Calendar Export
      const btnIcs = item.querySelector('.btn-export-ics');
      if (btnIcs) {
        btnIcs.addEventListener('click', () => {
          if (!window.OrbitEngine || !window.OrbitEngine.generateIcsContent) return;
          const icsContent = window.OrbitEngine.generateIcsContent(pass, SPB_STATE.currentCity, SPB_STATE.currentLat, SPB_STATE.currentLon);
          const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `太空偷窥局_${pass.satellite.name}_${SPB_STATE.currentCity}_过境提醒.ics`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 2000);
        });
      }

      // Focus radar arc on click
      const btnFocus = item.querySelector('.btn-focus-radar-arc');
      if (btnFocus) {
        btnFocus.addEventListener('click', () => {
          simulatePassTransit(pass);
          const radarBox = document.getElementById('polar-radar-svg');
          if (radarBox) radarBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      }

      dom.futurePassesContainer.appendChild(item);
    });
  }

  // Render Dynamic Polar Radar Arcs on SVG
  function renderPolarRadarArcs(activePass = null) {
    if (!dom.polarRadarArcs) return;

    dom.polarRadarArcs.innerHTML = '';
    const passes = SPB_STATE.futurePasses.slice(0, 4); // Take top 4 passes

    if (!passes.length) return;

    const CENTER_X = 150;
    const CENTER_Y = 150;
    const RADIUS_HORIZON = 140; // 0 deg elevation radius

    passes.forEach((pass, index) => {
      const isCSS = pass.satellite.id === 'css';
      const isFocused = activePass && activePass.satellite.id === pass.satellite.id;
      const color = isCSS ? '#ffb800' : (index % 2 === 0 ? '#00ffc8' : '#00c0ff');

      const points = pass.allPoints || [];
      if (points.length < 2) return;

      const svgCoords = points.map((p) => {
        const r = RADIUS_HORIZON * (90 - p.elevation) / 90.0;
        const angleRad = (p.azimuth - 90) * (Math.PI / 180);
        return {
          x: Math.round(CENTER_X + r * Math.cos(angleRad)),
          y: Math.round(CENTER_Y + r * Math.sin(angleRad))
        };
      });

      let d = `M ${svgCoords[0].x} ${svgCoords[0].y}`;
      for (let i = 1; i < svgCoords.length; i++) {
        d += ` L ${svgCoords[i].x} ${svgCoords[i].y}`;
      }

      const maxP = points.reduce((prev, curr) => (curr.elevation > prev.elevation ? curr : prev), points[0]);
      const maxR = RADIUS_HORIZON * (90 - maxP.elevation) / 90.0;
      const maxAngleRad = (maxP.azimuth - 90) * (Math.PI / 180);
      const maxSvgX = Math.round(CENTER_X + maxR * Math.cos(maxAngleRad));
      const maxSvgY = Math.round(CENTER_Y + maxR * Math.sin(maxAngleRad));

      const timeStr = `${String(maxP.time.getHours()).padStart(2, '0')}:${String(maxP.time.getMinutes()).padStart(2, '0')}`;

      const arcGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      arcGroup.setAttribute('id', `arc-${pass.satellite.id}`);
      arcGroup.innerHTML = `
        <path d="${d}" fill="none" stroke="${color}" stroke-width="${isCSS || isFocused ? '3.5' : '2'}" stroke-linecap="round" ${isCSS || isFocused ? '' : 'stroke-dasharray="4,3"'} opacity="${isFocused ? '1' : '0.85'}" />
        <circle cx="${maxSvgX}" cy="${maxSvgY}" r="${isFocused ? '6' : '4'}" fill="${color}">
          <animate attributeName="opacity" values="1;0.2;1" dur="${isFocused ? '0.8s' : '2s'}" repeatCount="indefinite" />
        </circle>
        <text x="${maxSvgX + 6}" y="${maxSvgY - 4}" fill="${color}" font-size="9" font-family="monospace" font-weight="bold">
          ${pass.satellite.name_en.split(' ')[0]} ${timeStr}
        </text>
      `;

      dom.polarRadarArcs.appendChild(arcGroup);
    });
  }

  // Animate Satellite Transit Simulation on Radar
  function simulatePassTransit(targetPass = null) {
    const pass = targetPass || (SPB_STATE.futurePasses.find(p => p.satellite.id === 'css') || SPB_STATE.futurePasses[0]);
    if (!pass || !pass.allPoints || pass.allPoints.length < 2) return;

    renderPolarRadarArcs(pass);

    const CENTER_X = 150;
    const CENTER_Y = 150;
    const RADIUS_HORIZON = 140;

    const svgCoords = pass.allPoints.map((p) => {
      const r = RADIUS_HORIZON * (90 - p.elevation) / 90.0;
      const angleRad = (p.azimuth - 90) * (Math.PI / 180);
      return {
        x: Math.round(CENTER_X + r * Math.cos(angleRad)),
        y: Math.round(CENTER_Y + r * Math.sin(angleRad)),
        elev: Math.round(p.elevation),
        az: Math.round(p.azimuth)
      };
    });

    // Remove existing sim blip
    const oldSim = document.getElementById('radar-sim-blip');
    if (oldSim) oldSim.remove();

    const simBlip = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    simBlip.setAttribute('id', 'radar-sim-blip');
    simBlip.setAttribute('r', '6');
    simBlip.setAttribute('fill', '#ffffff');
    simBlip.setAttribute('stroke', '#ff2a55');
    simBlip.setAttribute('stroke-width', '2.5');
    simBlip.setAttribute('cx', svgCoords[0].x);
    simBlip.setAttribute('cy', svgCoords[0].y);
    dom.polarRadarArcs.appendChild(simBlip);

    let step = 0;
    const totalSteps = svgCoords.length;
    const interval = setInterval(() => {
      if (step >= totalSteps) {
        clearInterval(interval);
        setTimeout(() => simBlip.remove(), 1200);
        return;
      }
      simBlip.setAttribute('cx', svgCoords[step].x);
      simBlip.setAttribute('cy', svgCoords[step].y);
      step++;
    }, 45);
  }

  function initRadarSimulation() {
    if (dom.btnSimulatePass) {
      dom.btnSimulatePass.addEventListener('click', () => {
        simulatePassTransit();
      });
    }
  }

  // 5. Geolocation API handling
  function initGeolocation() {
    if (!dom.btnGpsLocate) return;

    dom.btnGpsLocate.addEventListener('click', () => {
      if (!navigator.geolocation) {
        alert('当前浏览器环境不支持 HTML5 Geolocation 定位');
        return;
      }

      const origText = dom.btnGpsLocate.innerHTML;
      dom.btnGpsLocate.innerHTML = `
        <span class="inline-block w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mr-1"></span>
        <span>侦测经纬网中...</span>
      `;

      if (dom.radarStatusText) {
        dom.radarStatusText.textContent = 'GPS TRIANGULATING...';
        dom.radarStatusText.className = 'text-amber-400 font-semibold animate-pulse';
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setTargetLocation('当前侦测位置 (GPS)', lat, lon);
          dom.btnGpsLocate.innerHTML = origText;
          if (window.lucide) lucide.createIcons();
        },
        (error) => {
          console.warn('GPS location failed:', error);
          alert('GPS 定位获取失败或被拒绝，已维持当前默认坐标。');
          dom.btnGpsLocate.innerHTML = origText;
          if (dom.radarStatusText) {
            dom.radarStatusText.textContent = 'GPS TIMEOUT / DEFAULT';
            dom.radarStatusText.className = 'text-slate-400 font-semibold';
          }
          if (window.lucide) lucide.createIcons();
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    });
  }

  // 6. City Search & Autocomplete
  function initCitySearch() {
    if (!dom.citySearchInput || !dom.btnSearchCity) return;

    function handleSearch() {
      const query = dom.citySearchInput.value.trim().toLowerCase();
      if (!query) return;

      const found = SPB_STATE.cities.find((c) =>
        c.name.includes(query) ||
        (c.name_en && c.name_en.toLowerCase().includes(query)) ||
        c.id.includes(query)
      );

      if (found) {
        setTargetLocation(found.name, found.lat, found.lon);
        dom.cityDropdown.classList.add('hidden');
      } else {
        alert(`未在离线词典中找到城市 "${query}"，您可展开下方手动输入经纬度。`);
      }
    }

    dom.btnSearchCity.addEventListener('click', handleSearch);
    dom.citySearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSearch();
    });

    dom.citySearchInput.addEventListener('input', () => {
      const query = dom.citySearchInput.value.trim().toLowerCase();
      if (!query) {
        dom.cityDropdown.classList.add('hidden');
        return;
      }

      const matches = SPB_STATE.cities.filter((c) =>
        c.name.includes(query) ||
        (c.name_en && c.name_en.toLowerCase().includes(query))
      ).slice(0, 6);

      if (!matches.length) {
        dom.cityDropdown.classList.add('hidden');
        return;
      }

      dom.cityDropdown.innerHTML = '';
      matches.forEach((m) => {
        const item = document.createElement('div');
        item.className = 'p-2.5 hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs font-mono border-b border-slate-800 last:border-b-0';
        item.innerHTML = `
          <span class="text-white font-bold">${m.name} <span class="text-slate-400 font-normal">(${m.name_en || ''})</span></span>
          <span class="text-cyan-400 text-[11px]">${m.lat.toFixed(2)}°N, ${m.lon.toFixed(2)}°E</span>
        `;
        item.addEventListener('click', () => {
          setTargetLocation(m.name, m.lat, m.lon);
          dom.citySearchInput.value = m.name;
          dom.cityDropdown.classList.add('hidden');
        });
        dom.cityDropdown.appendChild(item);
      });
      dom.cityDropdown.classList.remove('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!dom.citySearchInput.contains(e.target) && !dom.cityDropdown.contains(e.target)) {
        dom.cityDropdown.classList.add('hidden');
      }
    });
  }

  // 7. Manual Coordinates
  function initManualCoordinates() {
    if (!dom.btnToggleManualCoord || !dom.manualCoordDrawer) return;

    dom.btnToggleManualCoord.addEventListener('click', () => {
      dom.manualCoordDrawer.classList.toggle('hidden');
    });

    if (dom.btnApplyCustomCoord) {
      dom.btnApplyCustomCoord.addEventListener('click', () => {
        const lat = parseFloat(dom.inputCustomLat.value);
        const lon = parseFloat(dom.inputCustomLon.value);

        if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
          alert('请输入合法的纬度 (-90 ~ 90) 与经度 (-180 ~ 180)');
          return;
        }

        setTargetLocation('自定义经纬坐标', lat, lon);
        dom.manualCoordDrawer.classList.add('hidden');
      });
    }
  }

  // 8. Filters for Tab 1 (Past Passes)
  function initFilters() {
    function setFilter(filterType, activeBtn) {
      SPB_STATE.pastFilter = filterType;
      document.querySelectorAll('.filter-past-btn').forEach(btn => {
        btn.className = 'filter-past-btn px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 transition';
      });
      activeBtn.className = 'filter-past-btn px-2.5 py-1 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400 font-bold transition';
      renderPastDossierCards();
      if (window.lucide) lucide.createIcons();
    }

    if (dom.filterPastAll) {
      dom.filterPastAll.addEventListener('click', () => setFilter('all', dom.filterPastAll));
    }
    if (dom.filterPastClear) {
      dom.filterPastClear.addEventListener('click', () => setFilter('clear', dom.filterPastClear));
    }
    if (dom.filterPastHires) {
      dom.filterPastHires.addEventListener('click', () => setFilter('hires', dom.filterPastHires));
    }
  }

  // 9. Poster Modal & Canvas Generation
  async function openPosterModal() {
    if (!dom.posterModal) return;

    dom.posterModal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();

    const canvas = document.getElementById('poster-canvas');
    const placeholder = document.getElementById('poster-placeholder');

    if (canvas && window.PosterGenerator) {
      if (placeholder) {
        placeholder.innerHTML = `
          <div class="inline-block w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <div class="text-xs font-mono text-cyan-300">SYNTHESIZING DECLASSIFIED CANVAS POSTER...</div>
          <p class="text-[11px] text-slate-500">正在调取天基对地切片、解密标定经纬网格与绝密电子印章...</p>
        `;
        placeholder.classList.remove('hidden');
      }

      const pass = SPB_STATE.selectedPassForPoster || SPB_STATE.pastPasses[0] || null;

      try {
        await window.PosterGenerator.render(canvas, {
          cityName: SPB_STATE.currentCity,
          lat: SPB_STATE.currentLat,
          lon: SPB_STATE.currentLon,
          pass,
          totalPassesCount: SPB_STATE.pastPasses.length
        });
        if (placeholder) placeholder.classList.add('hidden');
      } catch (err) {
        console.error('Poster rendering error:', err);
        if (placeholder) {
          placeholder.innerHTML = `
            <i data-lucide="alert-circle" class="w-8 h-8 mx-auto text-red-400 mb-2"></i>
            <div class="text-xs font-mono text-red-300">海报合成出现异常，已启用保底渲染</div>
          `;
          if (window.lucide) lucide.createIcons();
        }
      }
    }
  }

  function closeModal() {
    if (dom.posterModal) {
      dom.posterModal.classList.add('hidden');
    }
  }

  function initPosterModal() {
    if (dom.btnExportDossierAll) {
      dom.btnExportDossierAll.addEventListener('click', () => {
        SPB_STATE.selectedPassForPoster = SPB_STATE.pastPasses[0] || null;
        openPosterModal();
      });
    }

    if (dom.btnCloseModal) dom.btnCloseModal.addEventListener('click', closeModal);
    if (dom.btnCancelPoster) dom.btnCancelPoster.addEventListener('click', closeModal);

    if (dom.btnDownloadPoster) {
      dom.btnDownloadPoster.addEventListener('click', () => {
        const canvas = document.getElementById('poster-canvas');
        if (!canvas) return;

        try {
          canvas.toBlob((blob) => {
            if (!blob) {
              // Fallback to dataURL
              const dataUrl = canvas.toDataURL('image/png');
              const link = document.createElement('a');
              link.download = `绝密·太空偷窥局档案-${SPB_STATE.currentCity}.png`;
              link.href = dataUrl;
              link.click();
              return;
            }

            // Check if mobile native share is available
            const file = new File([blob], `绝密·太空偷窥局档案-${SPB_STATE.currentCity}.png`, { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              navigator.share({
                files: [file],
                title: '🛰️ 太空偷窥局 · 绝密天基监视档案',
                text: `经天基证实：过去7天已有卫星在飞越【${SPB_STATE.currentCity}】上空时按下了快门。你自以为在独处，其实头顶有 17,000 颗眼睛在看你。`
              }).catch(() => {
                // If user cancelled or failed, download file
                downloadBlob(blob);
              });
            } else {
              downloadBlob(blob);
            }
          }, 'image/png');
        } catch (e) {
          console.error('Download poster failed:', e);
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `绝密·太空偷窥局档案-${SPB_STATE.currentCity}.png`;
          link.href = dataUrl;
          link.click();
        }
      });
    }

    function downloadBlob(blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `绝密·太空偷窥局档案-${SPB_STATE.currentCity}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dom.posterModal && !dom.posterModal.classList.contains('hidden')) {
        closeModal();
      }
    });
  }

  // 10. Global 2D World Map Real-time Tracker (CSS Tiangong & ISS)
  function updateWorldMapTracker() {
    if (!window.OrbitEngine || !window.OrbitEngine.getLivePosition) return;

    const now = new Date();
    const MAP_W = 800;
    const MAP_H = 400;

    const toSvgCoords = (lat, lon) => {
      const x = ((lon + 180.0) / 360.0) * MAP_W;
      const y = ((90.0 - lat) / 180.0) * MAP_H;
      return {
        x: Math.max(0, Math.min(MAP_W, x)),
        y: Math.max(0, Math.min(MAP_H, y))
      };
    };

    // 1. Update Target City Marker
    if (dom.worldMapTarget) {
      const tPos = toSvgCoords(SPB_STATE.currentLat, SPB_STATE.currentLon);
      dom.worldMapTarget.innerHTML = `
        <circle cx="${tPos.x.toFixed(1)}" cy="${tPos.y.toFixed(1)}" r="5" fill="#00ffc8" class="animate-ping" opacity="0.6"/>
        <circle cx="${tPos.x.toFixed(1)}" cy="${tPos.y.toFixed(1)}" r="3" fill="#00ffc8" stroke="#07090e" stroke-width="1.5"/>
        <text x="${(tPos.x + 7).toFixed(1)}" y="${(tPos.y + 3).toFixed(1)}" fill="#00ffc8" font-size="9" font-family="monospace" font-weight="bold">${SPB_STATE.currentCity}</text>
      `;
    }

    // 2. Fetch Live Positions for CSS and ISS
    const cssPos = window.OrbitEngine.getLivePosition('css', now);
    const issPos = window.OrbitEngine.getLivePosition('iss', now);

    if (cssPos && dom.trackerCssPos && dom.trackerCssAlt) {
      const latD = cssPos.lat >= 0 ? `${cssPos.lat.toFixed(2)}°N` : `${Math.abs(cssPos.lat).toFixed(2)}°S`;
      const lonD = cssPos.lon >= 0 ? `${cssPos.lon.toFixed(2)}°E` : `${Math.abs(cssPos.lon).toFixed(2)}°W`;
      dom.trackerCssPos.textContent = `${latD}, ${lonD}`;
      dom.trackerCssAlt.textContent = `${cssPos.alt.toFixed(1)} km`;
    }

    if (issPos && dom.trackerIssPos && dom.trackerIssAlt) {
      const latD = issPos.lat >= 0 ? `${issPos.lat.toFixed(2)}°N` : `${Math.abs(issPos.lat).toFixed(2)}°S`;
      const lonD = issPos.lon >= 0 ? `${issPos.lon.toFixed(2)}°E` : `${Math.abs(issPos.lon).toFixed(2)}°W`;
      dom.trackerIssPos.textContent = `${latD}, ${lonD}`;
      dom.trackerIssAlt.textContent = `${issPos.alt.toFixed(1)} km`;
    }

    // 3. Render Ground Tracks on World Map (Past 45m to Future 45m)
    if (dom.worldMapTracks && window.OrbitEngine.computeGroundTrack) {
      const buildTrackPath = (points, strokeColor, strokeDash = '3,2') => {
        if (!points || points.length < 2) return '';
        const paths = [];
        let currentSegment = [];

        for (let i = 0; i < points.length; i++) {
          const pt = points[i];
          if (currentSegment.length > 0) {
            const prev = points[i - 1];
            // If satellite crossed the antimeridian (+180 / -180)
            if (Math.abs(pt.lon - prev.lon) > 180) {
              paths.push(currentSegment);
              currentSegment = [];
            }
          }
          currentSegment.push(toSvgCoords(pt.lat, pt.lon));
        }
        if (currentSegment.length > 0) paths.push(currentSegment);

        return paths.map(seg => {
          if (seg.length < 2) return '';
          let d = `M ${seg[0].x.toFixed(1)} ${seg[0].y.toFixed(1)}`;
          for (let k = 1; k < seg.length; k++) {
            d += ` L ${seg[k].x.toFixed(1)} ${seg[k].y.toFixed(1)}`;
          }
          return `<path d="${d}" fill="none" stroke="${strokeColor}" stroke-width="1.3" stroke-dasharray="${strokeDash}" opacity="0.8" />`;
        }).join('');
      };

      const pastStart = new Date(now.getTime() - 45 * 60000);
      const cssTrackPts = window.OrbitEngine.computeGroundTrack('css', pastStart, 90, 2);
      const issTrackPts = window.OrbitEngine.computeGroundTrack('iss', pastStart, 90, 2);

      let tracksHtml = '';
      tracksHtml += buildTrackPath(cssTrackPts, '#ffb800');
      tracksHtml += buildTrackPath(issTrackPts, '#00ffc8');
      dom.worldMapTracks.innerHTML = tracksHtml;
    }

    // 4. Render Satellite Position Icons
    if (dom.worldMapSats) {
      let satsHtml = '';

      if (cssPos) {
        const p = toSvgCoords(cssPos.lat, cssPos.lon);
        satsHtml += `
          <g transform="translate(${p.x.toFixed(1)}, ${p.y.toFixed(1)})">
            <circle cx="0" cy="0" r="9" fill="#ffb800" opacity="0.25" class="animate-ping" />
            <circle cx="0" cy="0" r="4.5" fill="#ffb800" stroke="#07090e" stroke-width="1.5" />
            <text x="7" y="3" fill="#ffb800" font-size="8.5" font-family="monospace" font-weight="bold">CSS 天宫</text>
          </g>
        `;
      }

      if (issPos) {
        const p = toSvgCoords(issPos.lat, issPos.lon);
        satsHtml += `
          <g transform="translate(${p.x.toFixed(1)}, ${p.y.toFixed(1)})">
            <circle cx="0" cy="0" r="9" fill="#00c0ff" opacity="0.25" class="animate-ping" />
            <circle cx="0" cy="0" r="4.5" fill="#00c0ff" stroke="#07090e" stroke-width="1.5" />
            <text x="7" y="3" fill="#00c0ff" font-size="8.5" font-family="monospace" font-weight="bold">ISS 空间站</text>
          </g>
        `;
      }

      dom.worldMapSats.innerHTML = satsHtml;
    }
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initTabs();
    initGeolocation();
    initCitySearch();
    initManualCoordinates();
    initFilters();
    initPosterModal();
    initRadarSimulation();
    loadData();

    // Start 2D World Map Tracker
    setTimeout(updateWorldMapTracker, 500);
    setInterval(updateWorldMapTracker, 1500);

    if (window.lucide) {
      lucide.createIcons();
    }
    console.log('🛰️ [SPB] 太空偷窥局 SGP4 实时解算终端已就绪.');
  });
})();
