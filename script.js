// ====================== LEGEND ======================
var categories = [
  "Hutan Belukar","Hutan Lebat","Kampung Padat","Kebun Sejenis",
  "Komplek Olahraga","Sawah","Semak","Tegalan/Ladang"
];
var colors = [
  "#32CD32","#006400","#B22222","#ADFF2F",
  "#00BFFF","#7CFC00","#9ACD32","#D2691E"
];
var legendContent = document.getElementById("legend-content");
categories.forEach((cat, i) => {
  legendContent.innerHTML +=
    `<div class="row" style="margin-left:15px;">
      <span class="swatch" style="background:${colors[i]}"></span> ${cat}
    </div>`;
});
function toggleLegend() {
  var content = document.getElementById("legend-content");
  var toggleIcon = document.getElementById("legend-toggle");
  if (content.style.display === "none") {
    content.style.display = "block"; toggleIcon.textContent = "▼";
  } else {
    content.style.display = "none"; toggleIcon.textContent = "▲";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector(".panel-header");
  const body = document.querySelector(".panel-body");
  const toggleBtn = document.querySelector(".toggle-btn");

  header.addEventListener("click", () => {
    body.classList.toggle("hidden");

    // Default ▲ → kalau dibuka ▼
    toggleBtn.textContent = body.classList.contains("hidden") ? "▲" : "▼";
  });
});


// ====================== MAP ======================
const map = L.map('map', {
  zoomControl: true, fullscreenControl: true,
  center: [-8.40421547694561, 116.54341571883141],
  zoom: 13, zoomAnimation: true,
});

// Basemap
const cartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap &copy; CARTO' }).addTo(map);
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' });
const esriSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles &copy; Esri' });
const esriTopo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme' });
const cartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap &copy; CARTO' });
const baseMaps = { "Dark": cartoDark, "Light": cartoLight, "OSM": osm, "Satellite": esriSat, "Topographic": esriTopo };

// Styles
function styleWisata(){ return { color:"#ff6600", weight:2, fillOpacity:0.5 }; }
function styleJalan(){ return { color:"#FF073A", weight:4 }; }
function styleSungai(){ return { color:"#1E90FF", weight:1.5 }; }
function styleAdmin(){ return { color:"#00FF7F", weight:2, opacity:1, fillOpacity:0, dashArray:5 }; }
function styleBatasDusun(){ return { color:"#FFD700", weight:2, dashArray:"5,5" }; }
function styleLahan(feature){
  var KategoriColors = {
    "Hutan Belukar": "#32CD32","Hutan Lebat": "#006400","Kampung Padat": "#B22222",
    "Kebun Sejenis": "#ADFF2F","Komplek Olahraga": "#00BFFF","Sawah": "#7CFC00",
    "Semak": "#9ACD32","Tegalan/Ladang": "#D2691E"
  };
  return { weight:1, fillColor: KategoriColors[feature.properties.Kategori] || "#CCCCCC", fillOpacity: 1 };
}

// ====================== LAYERS ======================
// Penggunaan Lahan (polygon) + popup
// ====================== STYLE ======================
function styleLahan(feature){
  var KategoriColors = {
    "Hutan Belukar": "#32CD32","Hutan Lebat": "#006400","Kampung Padat": "#B22222",
    "Kebun Sejenis": "#ADFF2F","Komplek Olahraga": "#00BFFF","Sawah": "#7CFC00",
    "Semak": "#9ACD32","Tegalan/Ladang": "#D2691E"
  };
  return { 
    weight: 1, 
    fillColor: KategoriColors[feature.properties.Kategori] || "#CCCCCC", 
    fillOpacity: 1 
  };
}
// ====================== LAYER GEOJSON ======================
var penggunaanLahan = new L.GeoJSON.AJAX(
  ["data/Penggunaan_Lahan.geojson"],
  {
    style: styleLahan,
    onEachFeature: function (feature, layer) {
      let props = feature.properties;

      // bikin konten popup
      let content = `<div style="font-family:Poppins,sans-serif;font-size:13px;max-width:250px;">`;
      content += `<h4 style="margin:0 0 5px 0;">Penggunaan Lahan</h4>`;
      content += `<table style="border-collapse:collapse;width:100%;">`;

      for (let key in props) {
        if (props.hasOwnProperty(key)) {
          content += `
            <tr>
              <td style="border:1px solid #ccc;padding:4px;"><strong>${key}</strong></td>
              <td style="border:1px solid #ccc;padding:4px;">${props[key] ?? ""}</td>
            </tr>`;
        }
      }

      content += `</table></div>`;
      layer.bindPopup(content);
    }
  }
); // ⚠️ tidak pakai .addTo(map), jadi defaultnya ngumpet

// Batas Admin Desa (polygon) + popup
var adminDesa = new L.GeoJSON.AJAX(["data/Admin_Desa1.geojson"], {
  style: styleAdmin,
  onEachFeature: (feature, layer) => {
    if(feature.properties && feature.properties.Nama_Desa){
      layer.bindPopup(`<b>Desa:</b> ${feature.properties.Nama_Desa}`);
    }
  }
});

// Batas Dusun (polygon) + popup
var batasDusun = new L.GeoJSON.AJAX(["data/Batas_Dusun.geojson"], {
    style: styleBatasDusun,
    onEachFeature: function (feature, layer) {
        let props = feature.properties;

        // Buat tabel dari atribut
        let content = `<div style="font-family:Poppins,sans-serif;font-size:13px;max-width:250px;">`;
        content += `<h4 style="margin:0 0 5px 0;">Batas Dusun</h4>`;
        content += `<table style="border-collapse:collapse;width:100%;">`;

        // Loop semua atribut di properties
        for (let key in props) {
            if (props.hasOwnProperty(key)) {
                content += `
                    <tr>
                        <td style="border:1px solid #ccc;padding:4px;"><strong>${key}</strong></td>
                        <td style="border:1px solid #ccc;padding:4px;">${props[key] ?? ""}</td>
                    </tr>
                `;
            }
        }

        content += `</table></div>`;

        layer.bindPopup(content);
    }
});


// Jalan (line) + popup
var jalan = new L.GeoJSON.AJAX(["data/Jalan.geojson"], {
  style: styleJalan,
  onEachFeature: (feature, layer) => {
    if(feature.properties && feature.properties.Nama_Jalan){
      layer.bindPopup(`<b>Jalan:</b> ${feature.properties.Nama_Jalan}`);
    }
  }
});

// Sungai (line) + popup
var sungai = new L.GeoJSON.AJAX(["data/Sungai.geojson"], {
  style: styleSungai,
  onEachFeature: (feature, layer) => {
    if(feature.properties && feature.properties.Nama_Sungai){
      layer.bindPopup(`<b>Sungai:</b> ${feature.properties.Nama_Sungai}`);
    }
  }
});

// Marker Kantor Desa + popup
var kantorIcon = L.icon({ iconUrl: 'aset/Icon1.png', iconSize: [32,37], iconAnchor:[16,37], popupAnchor:[0,-37] });
var titikKantor = new L.GeoJSON.AJAX(["data/Titik_Kantor_Desa.geojson"], {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, { icon: kantorIcon });
  },
  onEachFeature: function (feature, layer) {
    layer.bindPopup(
      "<b>Kantor Desa</b><br>" + (feature.properties.Nama || "")
    );
  }
});

// Marker Wisata + popup
var wisataIcon = L.icon({ iconUrl:'aset/Icon2.png', iconSize:[32,37], iconAnchor:[16,37], popupAnchor:[0,-37] });
var sebaranWisata = new L.GeoJSON.AJAX(["data/Sebaran_Wisata.geojson"], {
  pointToLayer: (feature, latlng) => {
    let marker = L.marker(latlng, { icon: wisataIcon });
    if(feature.properties && feature.properties.Nama){
      marker.bindPopup(`<b>Wisata:</b> ${feature.properties.Nama}`);
    }
    return marker;
  }
});

var sebaranWisata = new L.GeoJSON.AJAX(["data/Sebaran_Wisata.geojson"], {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, { icon: wisataIcon });
  },
  style: styleWisata, // kalau layernya polygon/line, ini tetap dipakai
  onEachFeature: function (feature, layer) {
    let props = feature.properties;
    let content = `<div style="font-family:Poppins, sans-serif;max-width:230px;">`;
    content += `<h4 style="margin:0;">${props.Nama || 'Wisata'}</h4>`;

    // Judul popup
    if (props.Nama) {
      content += `<h3 style="color:#ff6600;margin:0 0 5px;">📍 ${props.Nama}</h3>`;
    } else {
      content += `<h3 style="color:#ff6600;margin:0 0 5px;">📍 Lokasi Wisata</h3>`;
    }

    // Mapping nama field ke label yang lebih rapi
    const labelMap = {
      Nama: "Nama Wisata",
      Deskripsi: "Deskripsi",
      Kategori: "Kategori",
      Alamat: "Alamat",
      Link: "Google Maps",
      Foto: "Foto"
    };

    // Tabel atribut
    content += `<table style="font-size:0.85rem;color:#ffffff;width:100%;">`;
    for (let key in props) {
      if (props.hasOwnProperty(key) && props[key] && key !== "Foto") {
        let label = labelMap[key] || key;

        // Kalau field "Link", bikin jadi hyperlink
        if (key === "Link") {
          content += `<tr>
            <td style="font-weight:bold;">${label}</td>
            <td style="padding-left:5px;">: <a href="${props[key]}" target="_blank" style="color:#1e88e5;text-decoration:none;">Buka di Maps</a></td>
          </tr>`;
        } else {
          content += `<tr>
            <td style="font-weight:bold;">${label}</td>
            <td style="padding-left:5px;">: ${props[key]}</td>
          </tr>`;
        }
      }
    }
    content += `</table>`;

    // Foto
    if (props.Foto) {
      content += `<img src="${props.Foto}" style="width:100%;border-radius:10px;margin-top:5px;" />`;
    }

    // Footer
    content += `<p style="font-size:0.8rem;color:#777;margin-top:5px;">#ExploreSembalunBumbung</p>`;
    content += `</div>`;

    layer.bindPopup(content);
  }
});


// ====================== LAYERS CONTROL ======================
var overlays = {
  "Kantor Desa": titikKantor,
  "Sebaran Wisata": sebaranWisata,
  "Jalan": jalan,
  "Sungai": sungai,
  "Batas Desa": adminDesa,
  "Batas Dusun": batasDusun,
  "Penggunaan Lahan": penggunaanLahan // baru muncul kalau dicentang
};

// ✅ set collapsed:true biar control bisa di-minimize
L.control.layers(baseMaps, overlays, { collapsed:true }).addTo(map);

// ====================== DEFAULT YANG MAU TAMPIL ======================
titikKantor.addTo(map);
sebaranWisata.addTo(map);
jalan.addTo(map);
sungai.addTo(map);
adminDesa.addTo(map);
batasDusun.addTo(map);
// ❌ penggunaanLahan tetap gak ditampilkan default



// ====================== KONTROL TAMBAHAN ======================
L.Control.geocoder({ placeholder:'Cari lokasi...', errorMessage:'Tidak ditemukan.' }).addTo(map);
L.control.locate({ flyTo:true, showCompass:true, drawCircle:true, strings:{title:"Lokasi saya"} }).addTo(map);
L.control.scale({imperial:false}).addTo(map);

// ====================== ROUTING ======================
let routingControl, userLocation=null, stopBtnContainer;
const stopBtn = L.easyButton('uil uil-times', function() {
  if (routingControl) { 
    map.removeControl(routingControl); 
    routingControl=null; 
  } else { 
    alert("Tidak ada routing yang aktif."); 
  }
}, 'Stop Routing').addTo(map);

stopBtnContainer = stopBtn.button.closest('.leaflet-top.leaflet-left');

function startRouting(fromLatLng, toLatLng){
  if (routingControl) map.removeControl(routingControl);

  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(fromLatLng.lat, fromLatLng.lng),
      L.latLng(toLatLng.lat, toLatLng.lng)
    ],
    routeWhileDragging:false,
    addWaypoints:false,
    draggableWaypoints:false,
    showAlternatives:true
  }).addTo(map);

  routingControl.on('routesfound', ()=>{
    let panel=document.querySelector('.leaflet-routing-container');
    if(panel && stopBtnContainer){ 
      stopBtnContainer.appendChild(panel); 
      panel.classList.add('routing-panel-custom'); 

      // 🔹 Bikin tombol minimize kalau belum ada
      if(!document.querySelector('.routing-minimize')){
        let minimizeBtn = document.createElement("button");
        minimizeBtn.innerHTML = "▼ Minimize";
        minimizeBtn.className = "routing-minimize";
        minimizeBtn.onclick = ()=>{
        };
      }
    }
  });
}

map.on('locationfound', e=> userLocation=e.latlng);

// Routing otomatis saat klik wisata
sebaranWisata.on('click', e=>{
  if(!userLocation){ 
    alert("Aktifkan lokasi dulu!"); 
    map.locate({setView:false,maxZoom:16}); 
    return; 
  }
  startRouting(userLocation, e.latlng);
});


