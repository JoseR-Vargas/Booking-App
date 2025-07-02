// Configuración del panel de administración
const ADMIN_CONFIG = {
    API_BASE_URL: window.location.origin,
    REFRESH_INTERVAL: 30000, // 30 segundos
};

// Estado global del admin
let currentBookingDetails = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

function initializeAdmin() {
    console.log('🔧 Inicializando panel de administración...');
    
    // Configurar navegación
    setupNavigation();
    
    // Configurar fechas por defecto
    setDefaultDates();
    
    // Cargar dashboard por defecto
    loadDashboard();
    
    // Configurar auto-refresh
    setupAutoRefresh();
    
    console.log('✅ Panel de administración inicializado');
}

function setupNavigation() {
    document.querySelectorAll('.sidebar .nav-link[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const section = this.getAttribute('data-section');
            showSection(section);
            
            // Actualizar clase activa
            document.querySelectorAll('.sidebar .nav-link').forEach(nav => {
                nav.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
}

function setDefaultDates() {
    const today = new Date();
    
    // Fecha para citas diarias
    const selectedDate = document.getElementById('selectedDate');
    if (selectedDate) {
        selectedDate.value = today.toISOString().split('T')[0];
    }
    
    // Mes para citas mensuales
    const selectedMonth = document.getElementById('selectedMonth');
    if (selectedMonth) {
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        selectedMonth.value = `${year}-${month}`;
    }
}

function showSection(sectionName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('d-none');
    });
    
    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(`${sectionName}-content`);
    if (targetSection) {
        targetSection.classList.remove('d-none');
        
        // Cargar datos según la sección
        switch (sectionName) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'citas-hoy':
                loadDailyBookings();
                break;
            case 'citas-semana':
                loadWeeklyBookings();
                break;
            case 'citas-mes':
                loadMonthlyBookings();
                break;
        }
    }
}

async function loadDashboard() {
    try {
        const response = await fetch(`${ADMIN_CONFIG.API_BASE_URL}/bookings/admin/dashboard`);
        const data = await response.json();
        
        if (data.success) {
            renderDashboardStats(data.data);
        } else {
            throw new Error(data.message || 'Error al cargar dashboard');
        }
    } catch (error) {
        console.error('Error cargando dashboard:', error);
        showToast('Error al cargar las estadísticas del dashboard', 'error');
    }
}

function renderDashboardStats(stats) {
    const container = document.getElementById('statsCards');
    if (!container) return;
    
    container.innerHTML = `
        <div class="col-lg-3 col-md-6 mb-4">
            <div class="stats-card">
                <div class="d-flex align-items-center">
                    <div class="stats-icon bg-primary me-3">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div>
                        <h3 class="mb-0">${stats.totalBookings || 0}</h3>
                        <p class="text-muted mb-0">Total Reservas</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-lg-3 col-md-6 mb-4">
            <div class="stats-card">
                <div class="d-flex align-items-center">
                    <div class="stats-icon bg-success me-3">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div>
                        <h3 class="mb-0">$${(stats.totalRevenue || 0).toLocaleString()}</h3>
                        <p class="text-muted mb-0">Ingresos Totales</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-lg-3 col-md-6 mb-4">
            <div class="stats-card">
                <div class="d-flex align-items-center">
                    <div class="stats-icon bg-warning me-3">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div>
                        <h3 class="mb-0">${stats.pendingBookings || 0}</h3>
                        <p class="text-muted mb-0">Pendientes</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-lg-3 col-md-6 mb-4">
            <div class="stats-card">
                <div class="d-flex align-items-center">
                    <div class="stats-icon bg-info me-3">
                        <i class="fas fa-percentage"></i>
                    </div>
                    <div>
                        <h3 class="mb-0">${Math.round(stats.conversionRate || 0)}%</h3>
                        <p class="text-muted mb-0">Conversión</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function loadDailyBookings() {
    const selectedDate = document.getElementById('selectedDate').value;
    if (!selectedDate) return;
    
    try {
        const response = await fetch(`${ADMIN_CONFIG.API_BASE_URL}/bookings/admin/daily?date=${selectedDate}`);
        const data = await response.json();
        
        if (data.success) {
            renderBookingsTable(data.data, 'dailyBookingsContainer');
        } else {
            throw new Error(data.message || 'Error al cargar citas del día');
        }
    } catch (error) {
        console.error('Error cargando citas diarias:', error);
        showToast('Error al cargar las citas del día', 'error');
    }
}

async function loadWeeklyBookings() {
    try {
        const response = await fetch(`${ADMIN_CONFIG.API_BASE_URL}/bookings/admin/weekly`);
        const data = await response.json();
        
        if (data.success) {
            renderBookingsTable(data.data, 'weeklyBookingsContainer');
        } else {
            throw new Error(data.message || 'Error al cargar citas de la semana');
        }
    } catch (error) {
        console.error('Error cargando citas semanales:', error);
        showToast('Error al cargar las citas de la semana', 'error');
    }
}

async function loadMonthlyBookings() {
    const selectedMonth = document.getElementById('selectedMonth').value;
    if (!selectedMonth) return;
    
    try {
        const response = await fetch(`${ADMIN_CONFIG.API_BASE_URL}/bookings/admin/monthly?month=${selectedMonth}`);
        const data = await response.json();
        
        if (data.success) {
            renderBookingsTable(data.data, 'monthlyBookingsContainer');
        } else {
            throw new Error(data.message || 'Error al cargar citas del mes');
        }
    } catch (error) {
        console.error('Error cargando citas mensuales:', error);
        showToast('Error al cargar las citas del mes', 'error');
    }
}

function renderBookingsTable(bookings, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!bookings || bookings.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-calendar-times text-muted fs-1 mb-3"></i>
                <h5 class="text-muted">No hay citas para mostrar</h5>
                <p class="text-muted">No se encontraron reservas para el período seleccionado.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-hover bg-white">
                <thead class="table-primary">
                    <tr>
                        <th>Código</th>
                        <th>Cliente</th>
                        <th>Servicio</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Estado</th>
                        <th>Pago</th>
                        <th>Total</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${bookings.map(booking => `
                        <tr>
                            <td>
                                <span class="fw-bold text-primary">${booking.reservationCode}</span>
                            </td>
                            <td>
                                <div>
                                    <div class="fw-semibold">${booking.clientName}</div>
                                    <small class="text-muted">${booking.email}</small>
                                </div>
                            </td>
                            <td>
                                <div>
                                    <div class="fw-semibold">${booking.serviceName}</div>
                                    <small class="text-muted">${booking.duration} min</small>
                                </div>
                            </td>
                            <td>${formatDate(booking.appointmentDate)}</td>
                            <td>
                                <span class="badge bg-light text-dark">${booking.appointmentTime}</span>
                            </td>
                            <td>
                                <span class="booking-status status-${booking.status}">
                                    ${getStatusText(booking.status)}
                                </span>
                            </td>
                            <td>
                                <span class="booking-status status-${booking.paymentStatus}">
                                    ${getPaymentStatusText(booking.paymentStatus)}
                                </span>
                            </td>
                            <td class="fw-bold">$${booking.price.toLocaleString()}</td>
                            <td>
                                <div class="btn-group btn-group-sm">
                                    <button class="btn btn-outline-primary" onclick="showBookingDetails('${booking.reservationCode}')" title="Ver detalles">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    ${booking.status === 'confirmed' ? `
                                        <button class="btn btn-outline-success" onclick="completeBooking('${booking.reservationCode}')" title="Completar">
                                            <i class="fas fa-check"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function showBookingDetails(reservationCode) {
    try {
        const response = await fetch(`${ADMIN_CONFIG.API_BASE_URL}/bookings/booking/${reservationCode}`);
        const data = await response.json();
        
        if (data.success) {
            currentBookingDetails = data.data;
            renderBookingDetailsModal(data.data);
            
            const modal = new bootstrap.Modal(document.getElementById('bookingDetailsModal'));
            modal.show();
        } else {
            throw new Error(data.message || 'Error al cargar detalles');
        }
    } catch (error) {
        console.error('Error cargando detalles:', error);
        showToast('Error al cargar los detalles de la reserva', 'error');
    }
}

function renderBookingDetailsModal(booking) {
    const container = document.getElementById('bookingDetailsContent');
    const btnComplete = document.getElementById('btnCompleteBooking');
    
    if (!container) return;
    
    container.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6 class="fw-bold mb-3">Información del Cliente</h6>
                <div class="mb-2"><strong>Nombre:</strong> ${booking.clientName}</div>
                <div class="mb-2"><strong>Cédula:</strong> ${booking.clientId}</div>
                <div class="mb-2"><strong>Email:</strong> ${booking.email}</div>
                <div class="mb-2"><strong>Teléfono:</strong> ${booking.phone}</div>
                ${booking.notes ? `<div class="mb-2"><strong>Notas:</strong> ${booking.notes}</div>` : ''}
            </div>
            <div class="col-md-6">
                <h6 class="fw-bold mb-3">Detalles del Servicio</h6>
                <div class="mb-2"><strong>Código:</strong> <span class="text-primary">${booking.reservationCode}</span></div>
                <div class="mb-2"><strong>Servicio:</strong> ${booking.serviceName}</div>
                <div class="mb-2"><strong>Fecha:</strong> ${formatDate(booking.appointmentDate)}</div>
                <div class="mb-2"><strong>Hora:</strong> ${booking.appointmentTime}</div>
                <div class="mb-2"><strong>Duración:</strong> ${booking.duration} minutos</div>
                <div class="mb-2"><strong>Precio:</strong> $${booking.price.toLocaleString()}</div>
            </div>
        </div>
        
        <div class="row mt-4">
            <div class="col-12">
                <h6 class="fw-bold mb-3">Estado de la Reserva</h6>
                <div class="row g-3">
                    <div class="col-md-6">
                        <div class="p-3 bg-light rounded">
                            <div class="mb-2"><strong>Estado:</strong></div>
                            <span class="booking-status status-${booking.status}">
                                ${getStatusText(booking.status)}
                            </span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="p-3 bg-light rounded">
                            <div class="mb-2"><strong>Estado del Pago:</strong></div>
                            <span class="booking-status status-${booking.paymentStatus}">
                                ${getPaymentStatusText(booking.paymentStatus)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        ${booking.createdAt ? `
            <div class="mt-4">
                <small class="text-muted">
                    <i class="fas fa-clock me-1"></i>
                    Reserva creada: ${formatDateTime(booking.createdAt)}
                </small>
            </div>
        ` : ''}
    `;
    
    // Mostrar botón de completar si aplica
    if (booking.status === 'confirmed' && btnComplete) {
        btnComplete.style.display = 'inline-block';
        btnComplete.onclick = () => completeBooking(booking.reservationCode);
    } else if (btnComplete) {
        btnComplete.style.display = 'none';
    }
}

async function completeBooking(reservationCode) {
    if (!confirm('¿Estás seguro de que quieres marcar esta cita como completada?')) {
        return;
    }
    
    try {
        const response = await fetch(`${ADMIN_CONFIG.API_BASE_URL}/bookings/admin/complete/${reservationCode}`, {
            method: 'PATCH'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Cita marcada como completada exitosamente', 'success');
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('bookingDetailsModal'));
            if (modal) modal.hide();
            
            // Refrescar la vista actual
            refreshCurrentView();
            
        } else {
            throw new Error(data.message || 'Error al completar la cita');
        }
    } catch (error) {
        console.error('Error completando cita:', error);
        showToast(error.message || 'Error al completar la cita', 'error');
    }
}

async function searchBooking() {
    const code = document.getElementById('searchCode').value.trim();
    if (!code) {
        showToast('Por favor ingresa un código de reserva', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${ADMIN_CONFIG.API_BASE_URL}/bookings/booking/${code}`);
        const data = await response.json();
        
        const resultsContainer = document.getElementById('searchResults');
        
        if (data.success) {
            resultsContainer.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Resultado de la Búsqueda</h5>
                    </div>
                    <div class="card-body">
                        ${renderBookingCard(data.data)}
                    </div>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    No se encontró ninguna reserva con el código "${code}"
                </div>
            `;
        }
    } catch (error) {
        console.error('Error buscando reserva:', error);
        showToast('Error al buscar la reserva', 'error');
    }
}

function renderBookingCard(booking) {
    return `
        <div class="row">
            <div class="col-md-8">
                <h6 class="fw-bold text-primary">${booking.reservationCode}</h6>
                <div class="row g-3">
                    <div class="col-md-6">
                        <div><strong>Cliente:</strong> ${booking.clientName}</div>
                        <div><strong>Email:</strong> ${booking.email}</div>
                        <div><strong>Teléfono:</strong> ${booking.phone}</div>
                    </div>
                    <div class="col-md-6">
                        <div><strong>Servicio:</strong> ${booking.serviceName}</div>
                        <div><strong>Fecha:</strong> ${formatDate(booking.appointmentDate)}</div>
                        <div><strong>Hora:</strong> ${booking.appointmentTime}</div>
                    </div>
                </div>
            </div>
            <div class="col-md-4 text-md-end">
                <div class="mb-2">
                    <span class="booking-status status-${booking.status}">
                        ${getStatusText(booking.status)}
                    </span>
                </div>
                <div class="mb-3">
                    <span class="booking-status status-${booking.paymentStatus}">
                        ${getPaymentStatusText(booking.paymentStatus)}
                    </span>
                </div>
                <div class="h5 text-primary">$${booking.price.toLocaleString()}</div>
                <div class="btn-group">
                    <button class="btn btn-primary btn-sm" onclick="showBookingDetails('${booking.reservationCode}')">
                        <i class="fas fa-eye me-1"></i>Ver Detalles
                    </button>
                    ${booking.status === 'confirmed' ? `
                        <button class="btn btn-success btn-sm" onclick="completeBooking('${booking.reservationCode}')">
                            <i class="fas fa-check me-1"></i>Completar
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

function handleSearchKeyPress(event) {
    if (event.key === 'Enter') {
        searchBooking();
    }
}

function refreshCurrentView() {
    const activeSection = document.querySelector('.sidebar .nav-link.active');
    if (activeSection) {
        const section = activeSection.getAttribute('data-section');
        showSection(section);
    }
}

function refreshStats() {
    loadDashboard();
    showToast('Estadísticas actualizadas', 'success');
}

function setupAutoRefresh() {
    setInterval(() => {
        const activeSection = document.querySelector('.sidebar .nav-link.active');
        if (activeSection) {
            const section = activeSection.getAttribute('data-section');
            if (section === 'dashboard') {
                loadDashboard();
            } else if (section === 'citas-hoy') {
                loadDailyBookings();
            }
        }
    }, ADMIN_CONFIG.REFRESH_INTERVAL);
}

function exportData() {
    // Implementar exportación de datos
    showToast('Función de exportación en desarrollo', 'info');
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('es-CO');
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendiente',
        'confirmed': 'Confirmada',
        'completed': 'Completada',
        'cancelled': 'Cancelada'
    };
    return statusMap[status] || status;
}

function getPaymentStatusText(status) {
    const statusMap = {
        'pending': 'Pendiente',
        'approved': 'Aprobado',
        'rejected': 'Rechazado'
    };
    return statusMap[status] || status;
}

function showToast(message, type = 'info') {
    const backgroundColor = {
        'success': 'linear-gradient(45deg, #00b894, #00cec9)',
        'error': 'linear-gradient(45deg, #e17055, #d63031)',
        'info': 'linear-gradient(45deg, #667eea, #764ba2)',
        'warning': 'linear-gradient(45deg, #fdcb6e, #e17055)'
    };
    
    Toastify({
        text: message,
        duration: type === 'error' ? 5000 : 3000,
        gravity: 'top',
        position: 'right',
        style: {
            background: backgroundColor[type] || backgroundColor.info,
            borderRadius: '10px',
            fontWeight: '500'
        },
        stopOnFocus: true,
        onClick: function() {
            this.hideToast();
        }
    }).showToast();
}

// Log de inicialización
console.log('🔧 Beauty Center Admin Panel - Cargado correctamente'); 