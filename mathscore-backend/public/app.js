// Core variables for dashboard UI
let uptimeSeconds = 0;
let maintenanceMode = false;

// Format duration
function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  if (h > 0) return `${h}s ${m}d ${s}son`;
  if (m > 0) return `${m}d ${s}son`;
  return `${s} soniya`;
}

// Fetch general stats from API
async function fetchStats() {
  try {
    const response = await fetch('/api/system/stats');
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    
    // Update numeric count values
    document.getElementById('statApiHits').innerText = data.counts.apiHits;
    document.getElementById('statSecurityEvents').innerText = data.counts.securityEvents;
    document.getElementById('statCourses').innerText = data.counts.courses;
    document.getElementById('statTests').innerText = data.counts.tests;
    document.getElementById('statSubmissions').innerText = data.counts.submissions;
    document.getElementById('statUsers').innerText = data.counts.users;

    // Update Server Info
    document.getElementById('sysOS').innerText = data.system.platform + ' (' + data.system.arch + ')';
    document.getElementById('sysArch').innerText = data.system.cpuModel.substring(0, 32) + '...';
    document.getElementById('sysNode').innerText = data.system.nodeVersion;
    document.getElementById('sysMemory').innerText = `${data.system.freeMemory} free / ${data.system.totalMemory}`;
    document.getElementById('sysProcessMemory').innerText = data.system.processMemory;
    
    // Uptime tracker
    uptimeSeconds = data.system.uptime;
    document.getElementById('sysUptime').innerText = formatUptime(uptimeSeconds);

    // Maintenance Mode Toggle UI
    maintenanceMode = data.system.maintenanceMode;
    updateMaintenanceUI(maintenanceMode);

    // Load initial logs
    renderInitialSecurityLogs(data.recentSecurityLogs);
    renderInitialApiLogs(data.recentApiLogs);

  } catch (error) {
    console.error('Error syncing statistics:', error);
  }
}

// Render security logs initially
function renderInitialSecurityLogs(logs) {
  const container = document.getElementById('securityLogsContainer');
  if (!logs || logs.length === 0) {
    container.innerHTML = `<p class="text-slate-500 text-center py-6 font-semibold">Tizimda hozircha hech qanday kiberhujum yoki shubhali faoliyat aniqlanmadi.</p>`;
    return;
  }

  container.innerHTML = '';
  logs.forEach(log => {
    addSecurityIncidentToUi(log, false); // append
  });
}

// Render API logs initially
function renderInitialApiLogs(logs) {
  const container = document.getElementById('apiLogsContainer');
  if (!logs || logs.length === 0) {
    container.innerHTML = `<p class="text-slate-500 text-center py-6 font-semibold">Trafik kelishi kutilmoqda...</p>`;
    return;
  }

  container.innerHTML = '';
  logs.forEach(log => {
    addApiLogToUi(log, false); // append
  });
}

// Update Maintenance UI states
function updateMaintenanceUI(enabled) {
  const btnToggle = document.getElementById('btnMaintenanceToggle');
  const btn = document.getElementById('btnMaintenance');
  const alertBar = document.getElementById('maintenanceAlert');

  if (enabled) {
    btnToggle.classList.replace('translate-x-0', 'translate-x-5');
    btn.classList.replace('bg-slate-700', 'bg-rose-500');
    alertBar.classList.remove('hidden');
  } else {
    btnToggle.classList.replace('translate-x-5', 'translate-x-0');
    btn.classList.replace('bg-rose-500', 'bg-slate-700');
    alertBar.classList.add('hidden');
  }
}

// Toggle Maintenance via API
async function toggleMaintenance() {
  const targetState = !maintenanceMode;
  try {
    const response = await fetch('/api/system/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_maintenance', value: targetState })
    });
    const data = await response.json();
    if (data.success) {
      maintenanceMode = data.maintenanceMode;
      updateMaintenanceUI(maintenanceMode);
    }
  } catch (error) {
    console.error('Failed to toggle maintenance mode:', error);
  }
}

// Clear Logs via API
async function clearLogs() {
  if (!confirm('Haqiqatdan ham barcha kiberhujum va so\'rovlar tarixini tozalamoqchimisiz?')) return;
  try {
    const response = await fetch('/api/system/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear_logs' })
    });
    const data = await response.json();
    if (data.success) {
      fetchStats();
    }
  } catch (error) {
    console.error('Failed to clear logs:', error);
  }
}

// Render dynamic colored status indicator
function getStatusClass(status) {
  if (status >= 200 && status < 300) return 'text-emerald-400';
  if (status >= 300 && status < 400) return 'text-blue-400';
  if (status >= 400 && status < 500) return 'text-amber-400';
  return 'text-rose-400';
}

// Add API log dynamically to UI list
function addApiLogToUi(log, prepend = true) {
  const container = document.getElementById('apiLogsContainer');
  
  // Clean placeholder text
  if (container.querySelector('.text-slate-500')) {
    container.innerHTML = '';
  }

  const logRow = document.createElement('div');
  logRow.className = 'flex justify-between items-center gap-3 p-2 bg-slate-900/30 border border-white/5 rounded-lg hover:bg-slate-900/60 transition-all font-mono animate-fadeIn';
  
  const statusColor = getStatusClass(log.statusCode || 200);
  const time = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();

  logRow.innerHTML = `
    <div class="flex items-center gap-2 overflow-hidden mr-2">
      <span class="text-[9px] text-slate-500 font-sans">${time}</span>
      <span class="font-extrabold text-[10px] uppercase text-indigo-400 select-none">${log.method}</span>
      <span class="text-slate-300 truncate max-w-[250px] md:max-w-[450px]" title="${log.url}">${log.url}</span>
    </div>
    <div class="flex items-center gap-3 shrink-0">
      <span class="text-[10px] text-slate-400 font-sans select-none truncate max-w-[80px]" title="${log.ip}">${log.ip}</span>
      <span class="font-bold font-sans ${statusColor} bg-slate-950 px-2 py-0.5 rounded border border-white/5">${log.statusCode || 200}</span>
    </div>
  `;

  if (prepend) {
    container.insertBefore(logRow, container.firstChild);
    // Keep maximum 30 log traces visible to avoid DOM bloat
    if (container.children.length > 30) {
      container.lastChild.remove();
    }
  } else {
    container.appendChild(logRow);
  }
}

// Get security warning color parameters
function getSeverityParams(severity) {
  switch (severity) {
    case 'CRITICAL':
      return { border: 'border-l-rose-500 bg-rose-500/10', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
    case 'HIGH':
      return { border: 'border-l-orange-500 bg-orange-500/10', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
    case 'MEDIUM':
      return { border: 'border-l-amber-500 bg-amber-500/10', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    default:
      return { border: 'border-l-blue-500 bg-blue-500/10', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
  }
}

// Add Security Incident dynamically to UI list
function addSecurityIncidentToUi(log, prepend = true) {
  const container = document.getElementById('securityLogsContainer');
  
  // Clean placeholder text
  if (container.querySelector('.text-slate-500')) {
    container.innerHTML = '';
  }

  const incidentRow = document.createElement('div');
  const params = getSeverityParams(log.severity || 'LOW');
  
  incidentRow.className = `flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border border-white/5 border-l-4 ${params.border} rounded-xl hover:bg-slate-900/60 transition-all animate-fadeIn`;
  
  const time = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();

  incidentRow.innerHTML = `
    <div class="flex items-start gap-2.5">
      <span class="material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${params.text}">security</span>
      <div>
        <div class="flex items-center gap-2 flex-wrap">
          <span class="font-bold text-white tracking-tight">${log.type}</span>
          <span class="px-2 py-0.5 rounded-full text-[9px] font-bold border ${params.badge}">${log.severity || 'LOW'}</span>
        </div>
        <p class="text-slate-300 text-[11px] mt-1 font-medium leading-relaxed">${log.message}</p>
      </div>
    </div>
    <div class="flex sm:flex-col items-end gap-1.5 shrink-0 text-right mt-2 sm:mt-0 font-mono text-[10px]">
      <span class="text-slate-500">${time}</span>
      <span class="text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 select-all">${log.ip || 'unknown'}</span>
    </div>
  `;

  if (prepend) {
    container.insertBefore(incidentRow, container.firstChild);
    // Keep maximum 20 visible incidents
    if (container.children.length > 20) {
      container.lastChild.remove();
    }
  } else {
    container.appendChild(incidentRow);
  }
}

// Start real-time Server-Sent Events (SSE) listener
function initSSE() {
  const eventSource = new EventSource('/api/system/stream');

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'api_log') {
        // Increment hits counter
        const hitEl = document.getElementById('statApiHits');
        hitEl.innerText = parseInt(hitEl.innerText) + 1;
        
        // Add log entry to list
        addApiLogToUi(data.data, true);
      }
      
      else if (data.type === 'sec_log') {
        // Increment incident counter
        const secEl = document.getElementById('statSecurityEvents');
        secEl.innerText = parseInt(secEl.innerText) + 1;
        
        // Add incident card to list
        addSecurityIncidentToUi(data.data, true);
      }
    } catch (err) {
      console.error('Failed to parse SSE event payload:', err);
    }
  };

  eventSource.onerror = (err) => {
    console.warn('SSE connection interrupted. Reconnecting in 5s...');
    eventSource.close();
    setTimeout(initSSE, 5000);
  };
}

// Periodically update uptime count every second
setInterval(() => {
  uptimeSeconds++;
  document.getElementById('sysUptime').innerText = formatUptime(uptimeSeconds);
}, 1000);

// Init Dashboard on page load
window.addEventListener('DOMContentLoaded', () => {
  fetchStats();
  initSSE();
});
