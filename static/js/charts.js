// ═══════════════════════════════════════════
// ETF Tracker - Chart.js Wrappers
// ═══════════════════════════════════════════

const ChartStore = {};

function destroyChart(id) {
    if (ChartStore[id]) {
        ChartStore[id].destroy();
        delete ChartStore[id];
    }
}

function renderLineChart(canvasId, data, datasets, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    destroyChart(canvasId);
    ChartStore[canvasId] = new Chart(ctx, {
        type: 'line',
        data: { labels: data.map(d => d.month || d.date || d.year), datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            plugins: {
                legend: { display: options.legend !== false, position: 'bottom', labels: { usePointStyle: true, padding: 16, font: { size: 11 } } },
                tooltip: { backgroundColor: '#0A2540', titleFont: { size: 12, weight: '600' }, bodyFont: { size: 11 }, padding: 10, cornerRadius: 8, displayColors: true }
            },
            scales: {
                x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#8A94A6', maxTicksLimit: 8 } },
                y: { grid: { color: '#EDF1F7' }, ticks: { font: { size: 10 }, color: '#8A94A6', callback: v => v >= 1000 ? `€${(v/1000).toFixed(0)}k` : `€${v}` } }
            },
            ...options
        }
    });
}

function renderAreaChart(canvasId, data, datasets, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    destroyChart(canvasId);
    const filledDatasets = datasets.map(ds => ({
        ...ds,
        fill: true,
        backgroundColor: ds.backgroundColor || hexToRgba(ds.borderColor, 0.1),
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4
    }));
    ChartStore[canvasId] = new Chart(ctx, {
        type: 'line',
        data: { labels: data.map(d => d.month || d.date || d.year), datasets: filledDatasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            plugins: {
                legend: { display: options.legend !== false, position: 'bottom', labels: { usePointStyle: true, padding: 16, font: { size: 11 } } },
                tooltip: { backgroundColor: '#0A2540', titleFont: { size: 12, weight: '600' }, bodyFont: { size: 11 }, padding: 10, cornerRadius: 8 }
            },
            scales: {
                x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#8A94A6', maxTicksLimit: 8 } },
                y: { grid: { color: '#EDF1F7' }, ticks: { font: { size: 10 }, color: '#8A94A6', callback: v => v >= 1000 ? `€${(v/1000).toFixed(0)}k` : `€${v}` } }
            },
            ...options
        }
    });
}

function renderPieChart(canvasId, labels, values, colors, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    destroyChart(canvasId);
    ChartStore[canvasId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: options.cutout || '60%',
            plugins: {
                legend: { display: options.legend !== false, position: 'right', labels: { usePointStyle: true, padding: 12, font: { size: 11 } } },
                tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.parsed}%` }, backgroundColor: '#0A2540', padding: 8, cornerRadius: 6 }
            },
            ...options
        }
    });
}

function renderBarChart(canvasId, labels, values, color, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    destroyChart(canvasId);
    ChartStore[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{ data: values, backgroundColor: color, borderRadius: 4, barThickness: options.barThickness || 24 }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: options.horizontal ? 'y' : 'x',
            plugins: {
                legend: { display: false },
                tooltip: { backgroundColor: '#0A2540', padding: 8, cornerRadius: 6 }
            },
            scales: {
                x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#8A94A6' } },
                y: { grid: { color: '#EDF1F7', drawBorder: false }, ticks: { font: { size: 10 }, color: '#8A94A6' } }
            },
            ...options
        }
    });
}

function renderRadarChart(canvasId, labels, values, color) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    destroyChart(canvasId);
    ChartStore[canvasId] = new Chart(ctx, {
        type: 'radar',
        data: {
            labels,
            datasets: [{ data: values, backgroundColor: hexToRgba(color, 0.15), borderColor: color, borderWidth: 1.5, pointRadius: 0 }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: { min: 0, max: 100, ticks: { display: false }, grid: { color: '#DCE3ED' }, pointLabels: { font: { size: 11 }, color: '#4B5768' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
