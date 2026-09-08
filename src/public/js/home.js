// ARCHITECT PORTFOLIO LANDING PAGE SCRIPTS

// WebGL Context & Performance Optimizer for MapLibre GL
(function () {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  if (originalGetContext) {
    HTMLCanvasElement.prototype.getContext = function (type, attributes) {
      if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
        attributes = attributes || {};
        attributes.failIfMajorPerformanceCaveat = false;
        attributes.preserveDrawingBuffer = false;
      }
      return originalGetContext.call(this, type, attributes);
    };
  }
})();

// --- 1. PORTFOLIO GRID FILTERING ---
function initPortfolioFilters() {
  const tabs = document.querySelectorAll('.tab-btn');
  const cards = document.querySelectorAll('.project-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Toggle active states
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.getAttribute('data-category');

      cards.forEach(card => {
        const cardCat = card.getAttribute('data-cat');
        if (category === 'all' || cardCat === category) {
          card.style.display = 'block';
          // Trigger slight fade-in animation
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transition = 'opacity 0.4s ease';
          }, 30);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// --- 2. FAQ ACCORDION TRANSITIONS ---
function initFaqAccordion() {
  const accordions = document.querySelectorAll('.accordion-item');

  accordions.forEach(item => {
    const btn = item.querySelector('.accordion-header-btn');
    const panel = item.querySelector('.accordion-content-panel');

    if (btn && panel) {
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Collapse all others
        accordions.forEach(acc => {
          acc.classList.remove('active');
          const p = acc.querySelector('.accordion-content-panel');
          if (p) p.style.maxHeight = '0px';
        });

        if (!isActive) {
          item.classList.add('active');
          panel.style.maxHeight = panel.scrollHeight + "px";
        } else {
          item.classList.remove('active');
          panel.style.maxHeight = "0px";
        }
      });
    }
  });
}


// --- 4. BLUEPRINT GRID HOVER RADIAL EFFECT & CAD CROSSHAIRS ---
function initBlueprintGridHover() {
  const sections = document.querySelectorAll('.hero-section, .contact-section');

  sections.forEach(section => {
    const coordBox = section.querySelector('.blueprint-coordinates');

    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      section.style.setProperty('--mouse-x', `${x}px`);
      section.style.setProperty('--mouse-y', `${y}px`);

      // Hide crosshair when hovering over interactive elements (buttons, links, card, inputs)
      const isInteractive = e.target.closest('a, button, select, textarea, input, img, .hero-image-card, .contact-studio-card, .contact-form-box');
      if (isInteractive) {
        section.classList.add('hide-blueprint-effects');
      } else {
        section.classList.remove('hide-blueprint-effects');
      }

      if (coordBox) {
        coordBox.textContent = `[Toạ độ] X: ${x.toFixed(0)}mm | Y: ${y.toFixed(0)}mm | Độ phóng 1:100`;
      }
    });

    section.addEventListener('mouseleave', () => {
      section.classList.remove('hide-blueprint-effects');
    });
  });
}

// --- 5. 3D PERSPECTIVE SCROLL EFFECT ---
function init3DScrollEffect() {
  const hero = document.querySelector('.hero-section');
  const about = document.querySelector('.about-section');
  if (!hero || !about) return;

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    const windowHeight = window.innerHeight || 800;

    // Activate transition during scroll from top down to 1.1x viewport height
    const triggerRange = windowHeight * 1.1;
    const progress = Math.min(Math.max(scrollPos / triggerRange, 0), 1);

    // Hero hinges backwards (pivot bottom)
    const heroRotateX = progress * 24;
    const heroTranslateZ = progress * -180;
    const heroTranslateY = progress * -60;
    const heroOpacity = 1 - (progress * 1.35);

    hero.style.transform = `perspective(1200px) rotateX(${heroRotateX}deg) translateZ(${heroTranslateZ}px) translateY(${heroTranslateY}px)`;
    hero.style.opacity = Math.max(heroOpacity, 0);

    // About Us hinges forward (pivot top)
    const aboutProgress = progress;
    const aboutRotateX = (1 - aboutProgress) * -24;
    const aboutTranslateZ = (1 - aboutProgress) * -180;
    const aboutTranslateY = (1 - aboutProgress) * 120;
    const aboutOpacity = aboutProgress * 1.8;

    about.style.transform = `perspective(1200px) rotateX(${aboutRotateX}deg) translateZ(${aboutTranslateZ}px) translateY(${aboutTranslateY}px)`;
    about.style.opacity = Math.min(Math.max(aboutOpacity, 0), 1);
  });
}

// --- 6. GOOGLE MAP MODAL OVERLAY ---
function initMapModal() {
  const heroCard = document.querySelector('.hero-image-card');
  const modal = document.getElementById('map-modal');
  const closeBtn = document.getElementById('close-map-modal');

  if (heroCard && modal && closeBtn) {
    heroCard.addEventListener('click', () => {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Lock background scrolling
    });

    const closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = ''; // Unlock background scrolling
    };

    closeBtn.addEventListener('click', closeModal);

    // Close modal when clicking on the blurred background wrapper
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Support close on Escape key press
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }
}


// --- 7. NATIONAL MAP VISUALIZATION CONTROLLER ---
function initNationalMap() {
  const provSelect = document.getElementById('map-province-select');
  const selectedTitle = document.getElementById('selected-province-title');
  const placeholder = document.getElementById('province-map-placeholder');
  const loader = document.getElementById('province-map-loader');

  if (!provSelect || !selectedTitle || !placeholder || !loader) return;

  let mapNational = null;
  let mapProvince = null;
  let administrativeData = null;
  let hoveredProvinceCodeName = null;
  let selectedProvinceCodeName = null;

  // Helper to compute bounding box from GeoJSON
  function getGeoJSONBounds(geojson) {
    let minLng = 180, maxLng = -180, minLat = 90, maxLat = -90;

    if (geojson.bbox) {
      return [
        [geojson.bbox[0], geojson.bbox[1]],
        [geojson.bbox[2], geojson.bbox[3]]
      ];
    }

    let hasCoords = false;
    geojson.features.forEach(f => {
      if (f.bbox) {
        minLng = Math.min(minLng, f.bbox[0]);
        minLat = Math.min(minLat, f.bbox[1]);
        maxLng = Math.max(maxLng, f.bbox[2]);
        maxLat = Math.max(maxLat, f.bbox[3]);
        hasCoords = true;
      } else if (f.geometry && f.geometry.coordinates) {
        const traverse = (coords) => {
          if (typeof coords[0] === 'number') {
            minLng = Math.min(minLng, coords[0]);
            minLat = Math.min(minLat, coords[1]);
            maxLng = Math.max(maxLng, coords[0]);
            maxLat = Math.max(maxLat, coords[1]);
            hasCoords = true;
          } else {
            coords.forEach(traverse);
          }
        };
        traverse(f.geometry.coordinates);
      }
    });

    if (!hasCoords) {
      return [[102.0, 6.0], [118.0, 23.6]];
    }
    return [[minLng, minLat], [maxLng, maxLat]];
  }

  // Helper to compute a unique, stable color from a code string
  function getUniqueColor(code) {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
      '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
      '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#14b8a6', '#059669',
      '#4f46e5', '#0891b2', '#2563eb', '#db2777', '#c084fc', '#fb7185'
    ];
    if (!code) return colors[0];
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  // Helper to dynamically color provinces/islands on hover or click selection
  function refreshNationalMapColors() {
    if (!mapNational) return;
    const activeCodeName = hoveredProvinceCodeName || selectedProvinceCodeName;
    if (!activeCodeName || activeCodeName === 'all') {
      if (mapNational.getLayer('province-fill')) {
        mapNational.setPaintProperty('province-fill', 'fill-color', ['get', 'color']);
      }
    } else {
      if (mapNational.getLayer('province-fill')) {
        mapNational.setPaintProperty('province-fill', 'fill-color', [
          'case',
          ['==', ['get', 'unit_code_name'], activeCodeName],
          ['get', 'color'],
          '#e2e8f0'
        ]);
      }
    }
  }

  // Load administrative lookup data
  fetch('/api/administrative-data')
    .then(res => res.json())
    .then(data => {
      administrativeData = data;
    })
    .catch(err => console.error('Failed to load administrative lookup data:', err));

  // Initialize both maps
  function initMaps() {
    // 1. National Map (Left)
    mapNational = new maplibregl.Map({
      container: 'map-national-container',
      style: {
        version: 8,
        sources: {},
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: {
              'background-color': '#f8fafc'
            }
          }
        ]
      },
      center: [106.660172, 16.047079], // Vietnam Center
      zoom: 4.8,
      pitch: 0,
      bearing: 0,
      interactive: false
    });

    // 2. Province Map (Right)
    mapProvince = new maplibregl.Map({
      container: 'map-province-container',
      style: {
        version: 8,
        sources: {},
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: {
              'background-color': '#f8fafc'
            }
          }
        ]
      },
      center: [108.212, 16.031], // Da Nang Center as initial view
      zoom: 9.5,
      pitch: 0,
      bearing: 0
    });

    mapNational.on('load', () => {
      loadNationalGeoJSON();
    });

    mapProvince.on('load', () => {
      setupProvinceMapInteractions();
    });
  }

  function loadNationalGeoJSON() {
    const provinceCodes = [
      '01_ha_noi', '04_cao_bang', '08_tuyen_quang', '11_dien_bien', '12_lai_chau',
      '14_son_la', '15_lao_cai', '19_thai_nguyen', '20_lang_son', '22_quang_ninh',
      '24_bac_ninh', '25_phu_tho', '31_hai_phong', '33_hung_yen', '37_ninh_binh',
      '38_thanh_hoa', '40_nghe_an', '42_ha_tinh', '44_quang_tri', '46_hue',
      '48_da_nang', '51_quang_ngai', '52_gia_lai', '56_khanh_hoa', '66_dak_lak',
      '68_lam_dong', '75_dong_nai', '79_ho_chi_minh', '80_tay_ninh', '82_dong_thap',
      '86_vinh_long', '91_an_giang', '92_can_tho', '96_ca_mau'
    ];

    const provincePromises = provinceCodes.map(code =>
      fetch(`/geojson/${code}/${code}.geojson`)
        .then(res => res.ok ? res.json() : null)
        .then(geojson => {
          if (geojson && geojson.features) {
            geojson.features.forEach(f => {
              f.properties.color = getUniqueColor(f.properties.unit_code_name);
            });
          }
          return geojson;
        })
        .catch(() => null)
    );

    const islandFiles = [
      { url: '/geojson/48_da_nang/wards/20333_hoang_sa.geojson', name: 'Quần đảo Hoàng Sa (Đà Nẵng)', parentCodeName: '48_da_nang' },
      { url: '/geojson/56_khanh_hoa/wards/22736_truong_sa.geojson', name: 'Quần đảo Trường Sa (Khánh Hòa)', parentCodeName: '56_khanh_hoa' }
    ];

    const islandPromises = islandFiles.map(island =>
      fetch(island.url)
        .then(res => res.ok ? res.json() : null)
        .then(geojson => {
          if (geojson && geojson.features) {
            geojson.features.forEach(f => {
              f.properties.color = getUniqueColor(island.parentCodeName.substring(3));
              f.properties.unit_code_name = island.parentCodeName.substring(3);
            });
          }
          return geojson;
        })
        .catch(() => null)
    );

    Promise.all([...provincePromises, ...islandPromises]).then(results => {
      const geojsonList = results.filter(Boolean);
      const combinedGeoJSON = {
        type: 'FeatureCollection',
        features: geojsonList.flatMap(data => data.features || [])
      };

      mapNational.addSource('vietnam-provinces', {
        type: 'geojson',
        data: combinedGeoJSON
      });

      // 2D Fill Layer (Unique colored provinces)
      mapNational.addLayer({
        id: 'province-fill',
        type: 'fill',
        source: 'vietnam-provinces',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.85
        }
      });

      // 2D Line Layer (EVN Blue separators)
      mapNational.addLayer({
        id: 'province-line',
        type: 'line',
        source: 'vietnam-provinces',
        paint: {
          'line-color': '#29348f',
          'line-width': 1.5
        }
      });

      // Subtle white hover highlight overlay
      mapNational.addLayer({
        id: 'province-highlight',
        type: 'fill',
        source: 'vietnam-provinces',
        paint: {
          'fill-color': '#ffffff',
          'fill-opacity': 0.35
        },
        filter: ['==', ['get', 'unit_code_name'], '']
      });

      // Fit bounds to show Vietnam fully (including Hoàng Sa / Trường Sa)
      mapNational.fitBounds([[101.5, 6.0], [118.0, 23.6]], {
        padding: 10,
        animate: false
      });

      // Hover Tooltip popups
      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false
      });

      // Province Hover
      mapNational.on('mousemove', 'province-fill', (e) => {
        mapNational.getCanvas().style.cursor = 'pointer';
        const feature = e.features[0];
        const name = feature.properties.unit_name || 'Tỉnh / Thành';
        const area = feature.properties.area_km2 ? Math.round(feature.properties.area_km2).toLocaleString() : 'N/A';
        const codeName = feature.properties.unit_code_name;

        if (hoveredProvinceCodeName !== codeName) {
          hoveredProvinceCodeName = codeName;
          refreshNationalMapColors();
        }

        mapNational.setFilter('province-highlight', ['==', ['get', 'unit_code_name'], codeName]);

        popup.setLngLat(e.lngLat)
          .setHTML(`<div class="p-2 text-xs font-sans text-slate-800">
            <strong class="text-sm text-blue-800">${name}</strong><br/>
            Diện tích: ${area} km²
          </div>`)
          .addTo(mapNational);
      });

      mapNational.on('mouseleave', 'province-fill', () => {
        mapNational.getCanvas().style.cursor = '';
        hoveredProvinceCodeName = null;
        refreshNationalMapColors();

        const currentVal = provSelect.value;
        if (currentVal === 'all') {
          mapNational.setFilter('province-highlight', ['==', ['get', 'unit_code_name'], '']);
        } else {
          const cleanCodeName = currentVal.substring(3);
          mapNational.setFilter('province-highlight', ['==', ['get', 'unit_code_name'], cleanCodeName]);
        }
        popup.remove();
      });

      // Handle map click to load wards!
      mapNational.on('click', 'province-fill', (e) => {
        const feature = e.features[0];
        const codeName = feature.properties.unit_code_name;

        // Find matching option in select dropdown
        const matchingOption = Array.from(provSelect.options).find(opt => opt.value.endsWith(codeName));
        if (matchingOption) {
          provSelect.value = matchingOption.value;
          triggerProvinceSelection(matchingOption.value, matchingOption.textContent);
        }
      });
    });
  }

  function setupProvinceMapInteractions() {
    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    mapProvince.on('mousemove', (e) => {
      if (!mapProvince.getLayer('ward-fill')) return;
      const features = mapProvince.queryRenderedFeatures(e.point, { layers: ['ward-fill'] });
      if (features.length > 0) {
        mapProvince.getCanvas().style.cursor = 'pointer';
        const feature = features[0];
        const name = feature.properties.unit_name || 'Xã / Phường';
        const codeName = feature.properties.unit_code_name;

        mapProvince.setFilter('ward-highlight', ['==', ['get', 'unit_code_name'], codeName]);

        popup.setLngLat(e.lngLat)
          .setHTML(`<div class="p-2 text-xs font-sans text-slate-800">
            <strong class="text-sm text-red-600">${name}</strong>
          </div>`)
          .addTo(mapProvince);
      } else {
        mapProvince.getCanvas().style.cursor = '';
        if (mapProvince.getLayer('ward-highlight')) {
          mapProvince.setFilter('ward-highlight', ['==', ['get', 'unit_code_name'], '']);
        }
        popup.remove();
      }
    });

    mapProvince.on('mouseleave', () => {
      mapProvince.getCanvas().style.cursor = '';
      if (mapProvince.getLayer('ward-highlight')) {
        mapProvince.setFilter('ward-highlight', ['==', ['get', 'unit_code_name'], '']);
      }
      popup.remove();
    });
  }

  // --- Collapsible Ward List Controls ---
  const toggleBtn = document.getElementById('toggle-ward-panel-btn');
  const panelBody = document.getElementById('ward-panel-body');
  const panelArrow = document.getElementById('ward-panel-arrow');
  const searchInput = document.getElementById('ward-search-input');
  const wardListContainer = document.getElementById('ward-names-list');
  const emptyState = document.getElementById('ward-list-empty-state');

  if (toggleBtn && panelBody && panelArrow) {
    toggleBtn.addEventListener('click', () => {
      panelBody.classList.toggle('hidden');
      panelArrow.classList.toggle('rotate-180');
    });
  }

  // --- Collapsible Agency Info Panel ---
  const agencyToggleBtn = document.getElementById('toggle-agency-panel-btn');
  const agencyPanelBody = document.getElementById('agency-panel-body');
  const agencyPanelArrow = document.getElementById('agency-panel-arrow');

  if (agencyToggleBtn && agencyPanelBody && agencyPanelArrow) {
    agencyToggleBtn.addEventListener('click', () => {
      agencyPanelBody.classList.toggle('hidden');
      agencyPanelArrow.classList.toggle('rotate-180');
    });
  }

  if (searchInput && wardListContainer) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const items = wardListContainer.querySelectorAll('.ward-list-item');
      items.forEach(item => {
        const text = item.getAttribute('data-name').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (text.includes(query)) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  }

  // Load and combine wards GeoJSONs for selected province
  function triggerProvinceSelection(provCodeName, provFullName) {
    if (provCodeName === 'all') {
      placeholder.classList.remove('hidden');
      selectedTitle.textContent = 'Chưa chọn tỉnh thành';
      selectedProvinceCodeName = null;
      mapNational.setFilter('province-highlight', ['==', ['get', 'unit_code_name'], '']);
      refreshNationalMapColors();

      if (wardListContainer) {
        wardListContainer.innerHTML = '';
        if (emptyState) wardListContainer.appendChild(emptyState);
      }
      return;
    }

    const provinceCode = provCodeName.substring(0, 2);
    const cleanCodeName = provCodeName.substring(3);
    selectedProvinceCodeName = cleanCodeName;

    // Highlight left map, but KEEP national scale fixed (no zoom-in on left map)
    mapNational.setFilter('province-highlight', ['==', ['get', 'unit_code_name'], cleanCodeName]);
    refreshNationalMapColors();

    // Show loaders
    placeholder.classList.add('hidden');
    loader.classList.remove('hidden');
    selectedTitle.textContent = provFullName;

    // Look up wards in global database
    if (!administrativeData) {
      setTimeout(() => triggerProvinceSelection(provCodeName, provFullName), 200);
      return;
    }

    const provinceObj = administrativeData.find(p => p.Code === provinceCode);
    if (!provinceObj || !provinceObj.Wards) {
      loader.classList.add('hidden');
      selectedTitle.textContent = `${provFullName} (Không có dữ liệu chi tiết)`;
      if (wardListContainer) {
        wardListContainer.innerHTML = '<div class="text-center py-6 text-slate-400 text-[10px]">Không có dữ liệu xã phường.</div>';
      }
      return;
    }

    const wardsList = provinceObj.Wards;

    // Populate the collapsible panel list from top to bottom
    if (wardListContainer) {
      wardListContainer.innerHTML = '';
      if (searchInput) searchInput.value = '';

      wardsList.forEach(ward => {
        const btn = document.createElement('button');
        btn.className = 'ward-list-item w-full text-left px-2 py-1 rounded text-[10px] text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium flex justify-between items-center border-b border-slate-100/50';
        btn.setAttribute('data-code', ward.Code);
        btn.setAttribute('data-codename', ward.CodeName);
        btn.setAttribute('data-name', ward.FullName);

        btn.innerHTML = `
          <span>${ward.FullName}</span>
          <span class="text-[9px] text-slate-400 font-mono">${ward.Code}</span>
        `;

        // Highlight ward on right map on hover
        btn.addEventListener('mouseenter', () => {
          if (mapProvince && mapProvince.getLayer('ward-highlight')) {
            mapProvince.setFilter('ward-highlight', ['==', ['get', 'unit_code_name'], ward.CodeName]);
          }
        });

        btn.addEventListener('mouseleave', () => {
          if (mapProvince && mapProvince.getLayer('ward-highlight')) {
            mapProvince.setFilter('ward-highlight', ['==', ['get', 'unit_code_name'], '']);
          }
        });

        // Click to ease mapProvince viewport on click
        btn.addEventListener('click', () => {
          if (mapProvince && mapProvince.getSource('province-wards-source')) {
            const features = mapProvince.querySourceFeatures('province-wards-source', {
              filter: ['==', ['get', 'unit_code_name'], ward.CodeName]
            });
            if (features && features.length > 0) {
              const bounds = getGeoJSONBounds({ type: 'FeatureCollection', features: features });
              mapProvince.fitBounds(bounds, {
                padding: 40,
                animate: true,
                duration: 800
              });
            }
          }
        });

        wardListContainer.appendChild(btn);
      });
    }

    const promises = wardsList.map(ward => {
      const geojsonUrl = `/geojson/${provCodeName}/wards/${ward.Code}_${ward.CodeName}.geojson`;
      return fetch(geojsonUrl)
        .then(res => res.ok ? res.json() : null)
        .catch(() => null);
    });

    Promise.all(promises).then(results => {
      const geojsonList = results.filter(Boolean);
      geojsonList.forEach(data => {
        if (data && data.features) {
          data.features.forEach(f => {
            f.properties.color = getUniqueColor(f.properties.unit_code);
          });
        }
      });

      const combinedWardsGeoJSON = {
        type: 'FeatureCollection',
        features: geojsonList.flatMap(data => data.features || [])
      };

      // Clean old layers/source
      if (mapProvince.getLayer('ward-fill')) mapProvince.removeLayer('ward-fill');
      if (mapProvince.getLayer('ward-line')) mapProvince.removeLayer('ward-line');
      if (mapProvince.getLayer('ward-highlight')) mapProvince.removeLayer('ward-highlight');
      if (mapProvince.getSource('province-wards-source')) mapProvince.removeSource('province-wards-source');

      mapProvince.addSource('province-wards-source', {
        type: 'geojson',
        data: combinedWardsGeoJSON
      });

      // Fill Layer (Unique colored Wards)
      mapProvince.addLayer({
        id: 'ward-fill',
        type: 'fill',
        source: 'province-wards-source',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.85
        }
      });

      // Line Layer (White separators)
      mapProvince.addLayer({
        id: 'ward-line',
        type: 'line',
        source: 'province-wards-source',
        paint: {
          'line-color': '#ffffff',
          'line-width': 1.0
        }
      });

      // Highlight Layer (Red)
      mapProvince.addLayer({
        id: 'ward-highlight',
        type: 'fill',
        source: 'province-wards-source',
        paint: {
          'fill-color': '#db0d0d',
          'fill-opacity': 0.7
        },
        filter: ['==', ['get', 'unit_code_name'], '']
      });

      // Automatically compute bounding box of province wards and fit map without hardcoding
      const bounds = getGeoJSONBounds(combinedWardsGeoJSON);
      mapProvince.fitBounds(bounds, {
        padding: 25,
        animate: true,
        duration: 1000
      });

      loader.classList.add('hidden');
    });
  }

  // Handle select dropdown change
  provSelect.addEventListener('change', () => {
    const val = provSelect.value;
    const opt = provSelect.options[provSelect.selectedIndex];
    triggerProvinceSelection(val, opt.textContent);
  });

  // Start maps initialization
  initMaps();
}

// --- DOM READY BINDINGS ---
window.addEventListener('DOMContentLoaded', () => {
  initPortfolioFilters();
  initFaqAccordion();
  initBlueprintGridHover();
  init3DScrollEffect();
  initLoginModal();
  initMapModal();
  initNationalMap();
  initNavScroll();
  initMapToServicesMorph();
  initServicesToProjectsMorph();
  initSeamlessVideos();
  initBulletListScroll();
  initCardTilt();

  // Contact form submission simulator
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert("Inquiry submitted successfully! Our team will contact you shortly.");
      form.reset();
    });
  }
});

// --- 8. SMOOTH SCROLLING FOR NAVIGATION LINKS ---
function initNavScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId !== '#') {
        e.preventDefault();
        if (targetId === '#home') {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        } else {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
        // Update URL hash without jumping
        history.pushState(null, null, targetId);
      }
    });
  });
}

// --- 9. BULLET LIST MARQUEE SCROLL ---
function initBulletListScroll() {
  const lists = document.querySelectorAll('.bullet-list:not(.no-scroll)');
  lists.forEach(list => {
    const items = list.querySelectorAll('li');
    // Chỉ kích hoạt khi có hơn 5 dòng
    if (items.length > 5) {
      // Để tạo hiệu ứng cuộn tròn vô tận, nhân đôi danh sách
      const originalItems = Array.from(items);
      originalItems.forEach(item => {
        const clone = item.cloneNode(true);
        list.appendChild(clone);
      });

      let scrollPos = 0;
      const scrollSpeed = 0.2; // Tốc độ cuộn
      let isHovered = false;

      // Dừng cuộn khi di chuột vào
      list.addEventListener('mouseenter', () => isHovered = true);
      list.addEventListener('mouseleave', () => isHovered = false);

      // Đồng bộ vị trí cuộn khi người dùng cuộn tay
      list.addEventListener('scroll', () => {
        if (isHovered) {
          scrollPos = list.scrollTop;
        }
      });

      function autoScroll() {
        if (!isHovered) {
          scrollPos += scrollSpeed;
          // Nếu đã cuộn hết phần danh sách gốc (một nửa tổng chiều cao hiện tại)
          if (scrollPos >= list.scrollHeight / 2) {
            scrollPos = 0; // Đặt lại về đầu để tạo vòng lặp mượt mà
          }
          list.scrollTop = scrollPos;
        }
        requestAnimationFrame(autoScroll);
      }

      // Khởi chạy animation
      requestAnimationFrame(autoScroll);
    }
  });
}

// --- 10. SERVICES TO PROJECTS 3D MORPH SCROLL ---
function initServicesToProjectsMorph() {
  const services = document.querySelector('.services-section');
  const projects = document.querySelector('.portfolio-section');
  
  if (!services || !projects) return;

  services.style.transformOrigin = 'bottom center';
  projects.style.transformOrigin = 'top center';

  window.addEventListener('scroll', () => {
    const projectsRect = projects.getBoundingClientRect();
    const windowHeight = window.innerHeight || 800;
    
    let progress = 0;
    const triggerStart = windowHeight;
    const triggerEnd = windowHeight * 0.2;
    const triggerRange = triggerStart - triggerEnd;
    
    if (projectsRect.top <= triggerStart && projectsRect.top >= triggerEnd) {
       progress = 1 - ((projectsRect.top - triggerEnd) / triggerRange);
    } else if (projectsRect.top < triggerEnd) {
       progress = 1;
    }

    if (progress === 0 && projectsRect.top > triggerStart) {
      services.style.transform = 'none';
      services.style.opacity = 1;
      projects.style.transform = 'none';
      projects.style.opacity = 1;
      return;
    }

    const servicesRotateX = progress * 24; 
    const servicesTranslateZ = progress * -180; 
    const servicesTranslateY = progress * 100;
    const servicesOpacity = 1 - (progress * 1.5);

    services.style.transform = `perspective(1200px) translateY(${servicesTranslateY}px) rotateX(${servicesRotateX}deg) translateZ(${servicesTranslateZ}px)`;
    services.style.opacity = Math.max(servicesOpacity, 0);

    const projectsProgress = progress;
    const projectsRotateX = (1 - projectsProgress) * -24;
    const projectsTranslateZ = (1 - projectsProgress) * -180;
    const projectsTranslateY = (1 - projectsProgress) * 120;
    const projectsOpacity = projectsProgress * 1.8;

    projects.style.transform = `perspective(1200px) rotateX(${projectsRotateX}deg) translateZ(${projectsTranslateZ}px) translateY(${projectsTranslateY}px)`;
    projects.style.opacity = Math.min(Math.max(projectsOpacity, 0), 1);
  });
}

// --- 11. MAP TO SERVICES 3D MORPH SCROLL ---
function initMapToServicesMorph() {
  const mapSection = document.getElementById('national-map-section');
  const services = document.querySelector('.services-section');
  
  if (!mapSection || !services) return;

  mapSection.style.transformOrigin = 'bottom center';
  services.style.transformOrigin = 'top center';

  window.addEventListener('scroll', () => {
    const servicesRect = services.getBoundingClientRect();
    const windowHeight = window.innerHeight || 800;
    
    let progress = 0;
    const triggerStart = windowHeight;
    const triggerEnd = windowHeight * 0.2;
    const triggerRange = triggerStart - triggerEnd;
    
    if (servicesRect.top <= triggerStart && servicesRect.top >= triggerEnd) {
       progress = 1 - ((servicesRect.top - triggerEnd) / triggerRange);
    } else if (servicesRect.top < triggerEnd) {
       progress = 1;
    }

    if (progress === 0 && servicesRect.top > triggerStart) {
      mapSection.style.transform = 'none';
      mapSection.style.opacity = 1;
      services.style.transform = 'none';
      services.style.opacity = 1;
      return;
    }

    const mapRotateX = progress * 24; 
    const mapTranslateZ = progress * -180; 
    const mapTranslateY = progress * 100;
    const mapOpacity = 1 - (progress * 1.5);

    mapSection.style.transform = `perspective(1200px) translateY(${mapTranslateY}px) rotateX(${mapRotateX}deg) translateZ(${mapTranslateZ}px)`;
    mapSection.style.opacity = Math.max(mapOpacity, 0);

    const servicesProgress = progress;
    const servicesRotateX = (1 - servicesProgress) * -24;
    const servicesTranslateZ = (1 - servicesProgress) * -180;
    const servicesTranslateY = (1 - servicesProgress) * 120;
    const servicesOpacity = servicesProgress * 1.8;

    // Remove the perspective/transform when progress is 1 so it doesn't interfere with the next morph section
    if (progress === 1) {
        services.style.transform = 'none';
    } else {
        services.style.transform = `perspective(1200px) rotateX(${servicesRotateX}deg) translateZ(${servicesTranslateZ}px) translateY(${servicesTranslateY}px)`;
    }
    services.style.opacity = Math.min(Math.max(servicesOpacity, 0), 1);
  });
}

// --- 12. SEAMLESS VIDEO CUSTOM LOOP ---
function initSeamlessVideos() {
  const vids = document.querySelectorAll('.custom-seamless-loop');
  vids.forEach(vid => {
    // We intentionally do not use the native 'loop' attribute because browsers often insert a tiny delay.
    // Instead, we manually reset the video just before it hits the very end.
    
    vid.addEventListener('timeupdate', () => {
      // If we are within the last 0.1 seconds of the video
      if (vid.duration && vid.currentTime >= vid.duration - 0.1) {
        // Skip back to the very start. We use 0.05s to jump over potential black starting frames.
        vid.currentTime = 0.05; 
        vid.play().catch(e => console.log('Loop play prevented', e));
      }
    });
  });
}

// --- 13. LOGIN MODAL ---
function initLoginModal() {
  const btnLogin = document.querySelector('.btn-get-template'); // Login button in navbar
  const loginModal = document.getElementById('login-modal');
  const btnClose = document.getElementById('close-login-modal');
  
  if(btnLogin && loginModal && btnClose) {
    btnLogin.addEventListener('click', (e) => {
      e.preventDefault();
      loginModal.classList.remove('opacity-0', 'pointer-events-none');
      loginModal.firstElementChild.classList.remove('scale-95');
    });

    btnClose.addEventListener('click', () => {
      loginModal.classList.add('opacity-0', 'pointer-events-none');
      loginModal.firstElementChild.classList.add('scale-95');
    });
    
    // Close when clicking outside
    loginModal.addEventListener('click', (e) => {
      if(e.target === loginModal) {
        btnClose.click();
      }
    });
  }
}

// --- 14. INTERACTIVE 3D CARD TILT PHYSICS ENGINE ---
function initCardTilt() {
  const tiltCards = document.querySelectorAll('.hero-image-card, .project-card, .contact-studio-card');
  tiltCards.forEach(card => {
    card.style.transformStyle = 'preserve-3d';
    card.style.transition = 'transform 0.15s ease-out, box-shadow 0.3s ease';

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Max tilt 10 deg
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02) translateZ(8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0px)';
    });
  });
}

