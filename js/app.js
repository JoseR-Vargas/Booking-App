// Sistema de logging avanzado
const Logger = {
    levels: {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3
    },
    currentLevel: 3, // DEBUG por defecto
    
    log(level, message, data = null) {
        if (this.levels[level] <= this.currentLevel) {
            const timestamp = new Date().toISOString();
            const logEntry = {
                timestamp,
                level,
                message,
                data,
                url: window.location.href,
                userAgent: navigator.userAgent
            };
            
            // Console output con colores
            const colors = {
                ERROR: 'color: red; font-weight: bold;',
                WARN: 'color: orange; font-weight: bold;',
                INFO: 'color: blue; font-weight: bold;',
                DEBUG: 'color: gray;'
            };
            
            console.log(`%c[${level}] ${timestamp}`, colors[level], message, data || '');
            
            // Enviar logs críticos al servidor
            if (level === 'ERROR') {
                this.sendLogToServer(logEntry);
            }
            
            // Guardar en localStorage para debugging
            this.saveLogLocally(logEntry);
        }
    },
    
    error(message, data = null) { this.log('ERROR', message, data); },
    warn(message, data = null) { this.log('WARN', message, data); },
    info(message, data = null) { this.log('INFO', message, data); },
    debug(message, data = null) { this.log('DEBUG', message, data); },
    
    sendLogToServer(logEntry) {
        try {
            fetch('/api/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logEntry)
            }).catch(e => console.error('Error enviando log al servidor:', e));
        } catch (e) {
            console.error('Error enviando log:', e);
        }
    },
    
    saveLogLocally(logEntry) {
        try {
            const logs = JSON.parse(localStorage.getItem('appLogs') || '[]');
            logs.push(logEntry);
            
            // Mantener solo los últimos 100 logs
            if (logs.length > 100) {
                logs.splice(0, logs.length - 100);
            }
            
            localStorage.setItem('appLogs', JSON.stringify(logs));
        } catch (e) {
            console.error('Error guardando log localmente:', e);
        }
    },
    
    getLogs() {
        try {
            return JSON.parse(localStorage.getItem('appLogs') || '[]');
        } catch (e) {
            console.error('Error obteniendo logs:', e);
            return [];
        }
    },
    
    clearLogs() {
        localStorage.removeItem('appLogs');
        console.log('Logs locales limpiados');
    }
};

// Configuración mejorada con logs
let CONFIG = {
    API_BASE_URL: window.location.origin,
    MERCADOPAGO_PUBLIC_KEY: '',
    DEBUG_MODE: true,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
};

// Estado global mejorado con logs
const AppState = {
    currentStep: 1,
    selectedService: null,
    selectedDate: null,
    selectedTime: null,
    clientData: {},
    services: [],
    reservationData: null,
    isLoading: false,
    errors: [],
    
    // Métodos para manejo de estado con logs
    setState(key, value) {
        Logger.debug(`Estado actualizado: ${key}`, { oldValue: this[key], newValue: value });
        this[key] = value;
    },
    
    addError(error) {
        Logger.error('Error añadido al estado', error);
        this.errors.push({
            message: error.message || error,
            timestamp: new Date().toISOString(),
            context: error.context || null
        });
    },
    
    clearErrors() {
        Logger.debug('Errores limpiados del estado');
        this.errors = [];
    },
    
    getState() {
        return {
            currentStep: this.currentStep,
            selectedService: this.selectedService,
            selectedDate: this.selectedDate,
            selectedTime: this.selectedTime,
            hasClientData: Object.keys(this.clientData).length > 0,
            servicesLoaded: this.services.length > 0,
            isLoading: this.isLoading,
            errorCount: this.errors.length
        };
    }
};

// Servicios de ejemplo para testing
const DEMO_SERVICES = [
    {
        id: 'corte-cabello',
        name: 'Corte de Cabello',
        description: 'Corte profesional adaptado a tu estilo',
        duration: 45,
        price: 25000,
        category: 'cabello'
    },
    {
        id: 'manicure',
        name: 'Manicure Clásica',
        description: 'Cuidado completo de manos y uñas',
        duration: 60,
        price: 35000,
        category: 'uñas'
    },
    {
        id: 'facial',
        name: 'Limpieza Facial',
        description: 'Tratamiento profundo de limpieza facial',
        duration: 90,
        price: 45000,
        category: 'facial'
    }
];

// Instancia de MercadoPago
let mp = null;

// Función de respaldo simple para abrir el modal
function openModalSimple() {
    console.log('🔧 Función de respaldo activada');
    try {
        // Cargar servicios demo si no hay servicios cargados
        if (AppState.services.length === 0) {
            AppState.services = DEMO_SERVICES;
            renderServicesModalDemo();
            console.log('✅ Servicios demo cargados');
        }
        
        const modalElement = document.getElementById('reservaModal');
        if (modalElement) {
            // Verificar si Bootstrap está disponible
            if (typeof bootstrap !== 'undefined') {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
                console.log('✅ Modal abierto con Bootstrap');
            } else {
                // Fallback manual
                modalElement.style.display = 'block';
                modalElement.classList.add('show');
                document.body.classList.add('modal-open');
                console.log('✅ Modal abierto manualmente');
            }
        } else {
            console.error('❌ No se encontró el elemento modal');
        }
    } catch (error) {
        console.error('❌ Error al abrir modal:', error);
    }
}

// Función para renderizar servicios demo en el modal
function renderServicesModalDemo() {
    const container = document.getElementById('serviciosModal');
    if (!container) return;
    
    container.innerHTML = DEMO_SERVICES.map(service => `
        <div class="col-md-6">
            <div class="service-selection-card" onclick="selectServiceDemo('${service.id}')" style="cursor: pointer; padding: 15px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 10px; transition: all 0.3s;">
                <div class="service-icon mb-3">
                    <i class="fas ${getServiceIcon(service.category)}" style="font-size: 2rem; color: #007bff;"></i>
                </div>
                <h6 style="font-weight: bold; text-align: center;">Corte de Cabello</h6>
                <p style="color: #666; font-size: 14px; text-align: center;">Corte profesional adaptado a tu estilo</p>
                <div style="color: #007bff; font-weight: bold; text-align: center;">$25.000</div>
                <small style="color: #666; text-align: center; display: block;">⏰ 45 minutos</small>
            </div>
        </div>
    `).join('');
}

// Función para obtener icono del servicio
function getServiceIcon(category) {
    const icons = {
        'cabello': 'fa-cut',
        'facial': 'fa-smile',
        'uñas': 'fa-hand-sparkles',
        'bienestar': 'fa-spa',
        'maquillaje': 'fa-palette'
    };
    return icons[category] || 'fa-spa';
}

// Función para seleccionar servicio demo
function selectServiceDemo(serviceId) {
    Logger.info(`🎯 Servicio seleccionado: ${serviceId}`);
    
    try {
        const service = DEMO_SERVICES.find(s => s.id === serviceId);
        if (!service) {
            Logger.error(`❌ Servicio no encontrado: ${serviceId}`);
            showToast('Error: Servicio no encontrado', 'error');
            return;
        }
        
        AppState.setState('selectedService', service);
        Logger.info(`✅ Servicio encontrado: ${service.name}`);
        
        // Destacar el servicio seleccionado
        document.querySelectorAll('.service-selection-card').forEach(card => {
            card.style.backgroundColor = '#f8f9fa';
            card.style.borderColor = '#ddd';
        });
        
        // Destacar el seleccionado
        if (event && event.currentTarget) {
            event.currentTarget.style.backgroundColor = '#e7f3ff';
            event.currentTarget.style.borderColor = '#007bff';
        }
        
        // Mostrar modal de confirmación
        showServiceSelectedModal(service);
        
    } catch (error) {
        Logger.error('❌ Error seleccionando servicio', error);
        AppState.addError(error);
        showToast('Error al seleccionar servicio', 'error');
    }
}

// Exponer funciones globalmente para compatibilidad
window.selectServiceDemo = selectServiceDemo;
window.openModalSimple = openModalSimple;
window.handleNextStep = handleNextStep;
window.handlePreviousStep = handlePreviousStep;
window.nextStep = nextStep;
window.updateStepUI = updateStepUI;

// Configurar event listeners básicos inmediatamente
document.addEventListener('DOMContentLoaded', function() {
    Logger.info('🚀 DOM cargado - configurando listeners básicos...');
    
    // Configurar botones con función de respaldo
    const buttons = ['btnReservarNav', 'btnReservarHero', 'btnReservarContacto'];
    buttons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                Logger.info(`🖱️ Click en ${buttonId}`);
                testModal(); // Usar testModal que ya detecta si hay servicios reales
            });
            Logger.debug(`✅ Listener configurado para ${buttonId}`);
        } else {
            Logger.warn(`⚠️ No se encontró el botón ${buttonId}`);
        }
    });
    
    Logger.info('✅ Eventos configurados');
    
    // Inicializar la aplicación completa inmediatamente
    initializeApp().then(() => {
        Logger.info('🎉 Aplicación completamente inicializada');
        
        // Mostrar estado de conexión
        updateConnectionStatus();
        
        if (AppState.services.length > 0 && AppState.services !== DEMO_SERVICES) {
            Logger.info('✅ SERVICIOS REALES CARGADOS - Backend conectado');
            showToast('✅ Conectado al backend - Servicios reales disponibles', 'success');
        } else {
            Logger.warn('⚠️ USANDO SERVICIOS DEMO - Backend no conectado');
            showToast('⚠️ Modo demo activo - Sin conexión al backend', 'warning');
        }
    }).catch(error => {
        Logger.error('Error en inicialización:', error);
        showToast('Error de conexión - Modo demo activado', 'error');
    });
});

// Función para forzar conexión al backend (se puede llamar manualmente)
window.forceBackendConnection = async function() {
    Logger.info('🔄 Forzando conexión al backend...');
    updateConnectionStatus('connecting');
    
    try {
        await loadServerConfiguration();
        await loadRealServicesFromBackend();
        
        if (AppState.services.length > 0) {
            Logger.info('✅ Conexión forzada exitosa');
            showToast('✅ Backend conectado exitosamente', 'success');
            renderServicesInMainPage();
            updateConnectionStatus('connected');
        } else {
            updateConnectionStatus('demo');
        }
    } catch (error) {
        Logger.error('❌ Error forzando conexión', error);
        showToast('❌ Error conectando al backend', 'error');
        updateConnectionStatus('error');
    }
};

// Función para actualizar el indicador de estado de conexión
function updateConnectionStatus(status = null) {
    const statusElement = document.getElementById('connectionStatus');
    if (!statusElement) return;
    
    // Auto-detectar estado si no se proporciona
    if (!status) {
        if (AppState.services.length > 0 && AppState.services !== DEMO_SERVICES) {
            // Verificar si son servicios reales comparando con demo
            const hasRealServices = !AppState.services.every(s => 
                DEMO_SERVICES.some(d => d.id === s.id && d.name === s.name)
            );
            status = hasRealServices ? 'connected' : 'demo';
        } else {
            status = 'demo';
        }
    }
    
    const statusConfig = {
        connecting: {
            class: 'bg-info',
            icon: 'fas fa-sync fa-spin',
            text: 'Conectando al backend...',
            color: 'text-white'
        },
        connected: {
            class: 'bg-success',
            icon: 'fas fa-check-circle',
            text: `Backend Conectado (${AppState.services.length} servicios)`,
            color: 'text-white'
        },
        demo: {
            class: 'bg-warning',
            icon: 'fas fa-flask',
            text: 'Modo Demo (Sin backend)',
            color: 'text-dark'
        },
        error: {
            class: 'bg-danger',
            icon: 'fas fa-exclamation-triangle',
            text: 'Error de conexión',
            color: 'text-white'
        },
        initializing: {
            class: 'bg-secondary',
            icon: 'fas fa-sync fa-spin',
            text: 'Inicializando...',
            color: 'text-white'
        }
    };
    
    const config = statusConfig[status] || statusConfig.demo;
    
    statusElement.innerHTML = `
        <span class="badge ${config.class} ${config.color}">
            <i class="${config.icon} me-1"></i>${config.text}
        </span>
        ${status === 'connected' ? `
            <button class="btn btn-sm btn-outline-success ms-2" onclick="checkBackendEndpoints()" title="Verificar endpoints">
                <i class="fas fa-search"></i>
            </button>
        ` : ''}
        ${status === 'demo' || status === 'error' ? `
            <button class="btn btn-sm btn-outline-primary ms-2" onclick="forceBackendConnection()" title="Reintentar conexión">
                <i class="fas fa-redo"></i>
            </button>
        ` : ''}
    `;
    
    Logger.debug(`Estado de conexión actualizado: ${status}`);
}

// Función para verificar endpoints del backend
window.checkBackendEndpoints = async function() {
    Logger.info('🔍 Verificando endpoints del backend...');
    
    const endpoints = [
        '/config',
        '/bookings/services',
        '/bookings/available-slots/haircut/2024-12-12'
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await ApiHelper.get(endpoint);
            Logger.info(`✅ ${endpoint}: OK`, response);
        } catch (error) {
            Logger.error(`❌ ${endpoint}: Error`, error);
        }
    }
    
    showToast('Verificación de endpoints completada - Ver consola', 'info');
};

async function initializeApp() {
    Logger.info('🚀 Iniciando aplicación...');
    updateConnectionStatus('initializing');
    
    try {
        // Mostrar indicador de carga
        AppState.setState('isLoading', true);
        
        // Paso 1: Cargar configuración del servidor
        Logger.info('📡 Cargando configuración del servidor...');
        updateConnectionStatus('connecting');
        await loadServerConfiguration();
        
        // Paso 2: Cargar servicios reales desde el backend
        Logger.info('🛍️ Cargando servicios desde el backend...');
        await loadRealServicesFromBackend();
        
        // Verificar si se cargaron servicios reales
        const hasRealServices = AppState.services.length > 0 && 
                               AppState.services !== DEMO_SERVICES && 
                               !AppState.services.every(s => DEMO_SERVICES.some(d => d.id === s.id));
        
        if (hasRealServices) {
            Logger.info('✅ Servicios reales cargados del backend');
            updateConnectionStatus('connected');
        } else {
            Logger.warn('⚠️ No se pudieron cargar servicios reales, usando demo');
            updateConnectionStatus('demo');
        }
        
        // Paso 3: Configurar fecha mínima
        Logger.debug('📅 Configurando fechas...');
        setMinDate();
        
        // Paso 4: Configurar event listeners
        Logger.debug('🎯 Configurando eventos...');
        setupEventListeners();
        
        // Paso 5: Inicializar MercadoPago si está disponible
        if (CONFIG.MERCADOPAGO_PUBLIC_KEY) {
            Logger.info('💳 Inicializando MercadoPago...');
            try {
                mp = new MercadoPago(CONFIG.MERCADOPAGO_PUBLIC_KEY);
                Logger.info('✅ MercadoPago inicializado');
            } catch (error) {
                Logger.warn('⚠️ Error inicializando MercadoPago', error);
            }
        } else {
            Logger.warn('⚠️ No hay clave pública de MercadoPago configurada');
        }
        
        // Paso 6: Renderizar servicios en la página principal
        if (AppState.services.length > 0) {
            Logger.info('🎨 Renderizando servicios en la página...');
            renderServicesInMainPage();
        }
        
        AppState.setState('isLoading', false);
        Logger.info('✅ Aplicación inicializada correctamente');
        
        // Mostrar mensaje de éxito o advertencia
        if (hasRealServices) {
            showToast('🎉 Aplicación conectada al backend exitosamente', 'success');
        } else {
            showToast('⚠️ Aplicación funcionando en modo demo', 'warning');
        }
        
    } catch (error) {
        Logger.error('❌ Error crítico al inicializar la aplicación:', error);
        AppState.setState('isLoading', false);
        AppState.addError(error);
        updateConnectionStatus('error');
        
        // Mostrar error al usuario
        showToast('Error al conectar con el servidor. Usando modo demo.', 'error');
        
        // Fallback: usar datos demo
        await initializeDemoMode();
    }
}

// Función para cargar configuración del servidor
async function loadServerConfiguration() {
    try {
        Logger.debug('🔗 Intentando conexión con /config...');
        const response = await ApiHelper.get('/config');
        
        if (response.success) {
            // Actualizar configuración
            CONFIG.MERCADOPAGO_PUBLIC_KEY = response.data.mercadopago.publicKey || '';
            CONFIG.API_BASE_URL = response.data.api.baseUrl || CONFIG.API_BASE_URL;
            
            Logger.info('✅ Configuración del servidor cargada:', {
                hasMercadoPago: !!CONFIG.MERCADOPAGO_PUBLIC_KEY,
                apiBaseUrl: CONFIG.API_BASE_URL
            });
        } else {
            throw new Error('Respuesta del servidor no exitosa');
        }
    } catch (error) {
        Logger.warn('⚠️ No se pudo cargar configuración del servidor, usando valores por defecto', error);
        // Continuar con valores por defecto
    }
}

// Función para cargar servicios reales desde el backend
async function loadRealServicesFromBackend() {
    try {
        Logger.debug('🔗 Intentando cargar servicios desde /bookings/services...');
        const response = await ApiHelper.get('/bookings/services');
        
        Logger.debug('📊 Respuesta del servidor:', response);
        
        if (response && response.success && response.data && response.data.length > 0) {
            // Mapear servicios del backend al formato del frontend
            const mappedServices = response.data.map(service => ({
                id: service.id,
                name: service.name,
                description: service.description,
                duration: service.duration,
                price: service.price,
                category: service.category || 'bienestar',
                requirements: service.requirements || []
            }));
            
            AppState.setState('services', mappedServices);
            Logger.info('✅ Servicios reales cargados desde el backend:', {
                count: mappedServices.length,
                services: mappedServices.map(s => s.name)
            });
            
            return mappedServices;
        } else {
            Logger.warn('⚠️ Respuesta del servidor no válida:', response);
            throw new Error('No se encontraron servicios en el backend');
        }
    } catch (error) {
        Logger.error('❌ Error cargando servicios del backend:', error);
        Logger.warn('🔄 Usando servicios demo como fallback');
        
        // Fallback: usar servicios demo
        AppState.setState('services', DEMO_SERVICES);
        return DEMO_SERVICES;
    }
}

// Función para renderizar servicios en la página principal
function renderServicesInMainPage() {
    const container = document.getElementById('serviciosContainer');
    if (!container) {
        Logger.warn('⚠️ Container de servicios no encontrado en la página');
        return;
    }
    
    Logger.debug('🎨 Renderizando servicios en la página principal...');
    
    container.innerHTML = AppState.services.map(service => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card service-card h-100" data-service-id="${service.id}">
                <div class="card-body text-center">
                    <div class="service-icon mb-3">
                        <i class="fas ${getServiceIcon(service.category)}"></i>
                    </div>
                    <h5 class="card-title fw-bold">${service.name}</h5>
                    <p class="card-text text-muted">${service.description}</p>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="badge bg-primary rounded-pill">
                            <i class="fas fa-clock me-1"></i>${service.duration} min
                        </span>
                        <span class="h5 text-primary fw-bold mb-0">
                            $${service.price.toLocaleString()}
                        </span>
                    </div>
                    <button class="btn btn-primary-custom w-100" onclick="selectServiceAndOpenModal('${service.id}')">
                        <i class="fas fa-calendar-alt me-2"></i>Reservar Ahora
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    Logger.info('✅ Servicios renderizados en la página principal');
}

// Función para inicializar modo demo como fallback
async function initializeDemoMode() {
    Logger.info('🔄 Iniciando modo demo...');
    updateConnectionStatus('demo');
    
    try {
        // Usar servicios demo
        AppState.setState('services', DEMO_SERVICES);
        
        // Configurar fecha mínima
        setMinDate();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Renderizar servicios demo
        renderServicesInMainPage();
        
        Logger.info('✅ Modo demo inicializado');
        showToast('⚠️ Funcionando en modo demo - Sin conexión al backend', 'warning');
        
    } catch (error) {
        Logger.error('❌ Error crítico incluso en modo demo:', error);
        updateConnectionStatus('error');
        showToast('Error crítico de la aplicación', 'error');
    }
}

async function loadConfig() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/config`);
        const data = await response.json();
        
        if (data.success) {
            CONFIG.MERCADOPAGO_PUBLIC_KEY = data.data.mercadopago.publicKey || '';
            CONFIG.API_BASE_URL = data.data.api.baseUrl || window.location.origin;
        }
    } catch (error) {
        console.error('Error cargando configuración:', error);
        // Continuar con valores por defecto
    }
}

function setMinDate() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const appointmentDateInput = document.getElementById('appointmentDate');
    if (appointmentDateInput) {
        appointmentDateInput.min = tomorrow.toISOString().split('T')[0];
        
        // Establecer fecha máxima (30 días en el futuro)
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + 30);
        appointmentDateInput.max = maxDate.toISOString().split('T')[0];
    }
}

async function loadServices() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/bookings/services`);
        const data = await response.json();
        
        if (data.success) {
            AppState.services = data.data;
            renderServices();
            renderServicesModal();
        } else {
            throw new Error(data.message || 'Error al cargar servicios');
        }
    } catch (error) {
        console.error('Error cargando servicios:', error);
        showToast('Error al cargar los servicios disponibles', 'error');
    }
}

function renderServices() {
    const container = document.getElementById('serviciosContainer');
    if (!container) return;
    
    container.innerHTML = AppState.services.map(service => `
        <div class="col-md-6 col-lg-4">
            <div class="card service-card h-100">
                <div class="card-body text-center">
                    <div class="service-icon mb-3">
                        <i class="fas ${getServiceIcon(service.category)}"></i>
                    </div>
                    <h5 class="card-title fw-bold">${service.name}</h5>
                    <p class="card-text text-muted">${service.description}</p>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="badge bg-primary rounded-pill">
                            <i class="fas fa-clock me-1"></i>${service.duration} min
                        </span>
                        <span class="h5 text-primary fw-bold mb-0">
                            $${service.price.toLocaleString()}
                        </span>
                    </div>
                    ${service.requirements ? `
                        <div class="mb-3">
                            <small class="text-muted">
                                <i class="fas fa-info-circle me-1"></i>
                                ${service.requirements.join(', ')}
                            </small>
                        </div>
                    ` : ''}
                    <button class="btn btn-primary-custom w-100" 
                            onclick="selectServiceAndOpenModal('${service.id}')">
                        <i class="fas fa-calendar-plus me-2"></i>Reservar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderServicesModal() {
    const container = document.getElementById('serviciosModal');
    if (!container) return;
    
    container.innerHTML = AppState.services.map(service => `
        <div class="col-md-6">
            <div class="service-selection-card" onclick="selectService('${service.id}')">
                <div class="service-icon mb-3">
                    <i class="fas ${getServiceIcon(service.category)}"></i>
                </div>
                <h6 class="fw-bold">${service.name}</h6>
                <p class="text-muted small">${service.description}</p>
                <div class="service-price">$${service.price.toLocaleString()}</div>
                <small class="text-muted">
                    <i class="fas fa-clock me-1"></i>${service.duration} minutos
                </small>
                ${service.requirements ? `
                    <div class="mt-2">
                        <small class="text-warning">
                            <i class="fas fa-exclamation-triangle me-1"></i>
                            ${service.requirements.join(', ')}
                        </small>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function getServiceIcon(category) {
    const icons = {
        'cabello': 'fa-cut',
        'facial': 'fa-smile',
        'uñas': 'fa-hand-sparkles',
        'bienestar': 'fa-spa',
        'maquillaje': 'fa-palette'
    };
    return icons[category] || 'fa-spa';
}

function setupEventListeners() {
    // Botones de reserva
    const reserveButtons = [
        'btnReservarNav',
        'btnReservarHero', 
        'btnReservarContacto'
    ];
    
    reserveButtons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', openReservationModal);
        }
    });
    
    // Navegación del modal
    const btnNext = document.getElementById('btnNext');
    const btnBack = document.getElementById('btnBack');
    
    if (btnNext) btnNext.addEventListener('click', handleNextStep);
    if (btnBack) btnBack.addEventListener('click', handlePreviousStep);
    
    // Cambio de fecha
    const appointmentDate = document.getElementById('appointmentDate');
    if (appointmentDate) {
        appointmentDate.addEventListener('change', handleDateChange);
    }
    
    // Smooth scrolling para navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function selectServiceAndOpenModal(serviceId) {
    selectService(serviceId);
    openReservationModal();
    // Avanzar automáticamente al paso 2
    setTimeout(() => {
        nextStep();
    }, 500);
}

function selectService(serviceId) {
    // Remover selección anterior
    document.querySelectorAll('.service-selection-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Seleccionar nuevo servicio
    event.target.closest('.service-selection-card').classList.add('selected');
    
    AppState.selectedService = AppState.services.find(s => s.id === serviceId);
    
    // Actualizar información del servicio seleccionado
    updateSelectedServiceInfo();
}

function updateSelectedServiceInfo() {
    const infoContainer = document.getElementById('selectedServiceInfo');
    if (!infoContainer || !AppState.selectedService) return;
    
    infoContainer.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="service-icon me-3" style="width: 50px; height: 50px; font-size: 1.5rem;">
                <i class="fas ${getServiceIcon(AppState.selectedService.category)}"></i>
            </div>
            <div>
                <h6 class="mb-1">${AppState.selectedService.name}</h6>
                <p class="mb-0 text-muted">${AppState.selectedService.description}</p>
                <small class="text-primary">
                    <i class="fas fa-clock me-1"></i>${AppState.selectedService.duration} min • 
                    <i class="fas fa-dollar-sign me-1"></i>${AppState.selectedService.price.toLocaleString()}
                </small>
            </div>
        </div>
    `;
}

function openReservationModal() {
    console.log('🔍 Abriendo modal de reserva...');
    
    try {
        // Usar la función de respaldo si hay problemas
        openModalSimple();
        
        // Reiniciar el estado del modal si la app está inicializada
        if (typeof resetModalState === 'function') {
            resetModalState();
        }
        
        console.log('✅ Modal abierto correctamente');
    } catch (error) {
        console.error('❌ Error al abrir modal:', error);
        // Intentar función de respaldo
        openModalSimple();
    }
}

function resetModalState() {
    AppState.currentStep = 1;
    AppState.selectedService = null;
    AppState.selectedDate = null;
    AppState.selectedTime = null;
    AppState.clientData = {};
    
    // Mostrar solo el primer paso
    document.querySelectorAll('.step-content').forEach(step => {
        step.classList.add('d-none');
    });
    document.getElementById('step1').classList.remove('d-none');
    
    // Resetear botones
    document.getElementById('btnBack').style.display = 'none';
    document.getElementById('btnNext').innerHTML = 'Siguiente <i class="fas fa-arrow-right ms-2"></i>';
    
    // Limpiar formulario
    const form = document.getElementById('clientForm');
    if (form) form.reset();
}

async function handleNextStep() {
    if (!validateCurrentStep()) return;
    
    if (AppState.currentStep < 4) {
        nextStep();
    } else {
        // Crear reserva
        await createReservation();
    }
}

function validateCurrentStep() {
    switch (AppState.currentStep) {
        case 1:
            if (!AppState.selectedService) {
                showToast('Por favor selecciona un servicio', 'error');
                return false;
            }
            break;
            
        case 2:
            const date = document.getElementById('appointmentDate').value;
            const time = document.getElementById('appointmentTime').value;
            
            if (!date) {
                showToast('Por favor selecciona una fecha', 'error');
                return false;
            }
            
            if (!time) {
                showToast('Por favor selecciona una hora', 'error');
                return false;
            }
            
            AppState.selectedDate = date;
            AppState.selectedTime = time;
            break;
            
        case 3:
            const form = document.getElementById('clientForm');
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                showToast('Por favor completa todos los campos requeridos', 'error');
                return false;
            }
            
            // Guardar datos del cliente
            AppState.clientData = {
                clientName: document.getElementById('clientName').value,
                clientId: document.getElementById('clientId').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                notes: document.getElementById('notes').value
            };
            
            // Actualizar resumen
            updateConfirmationSummary();
            break;
    }
    
    return true;
}

function nextStep() {
    AppState.currentStep++;
    updateStepUI();
}

function handlePreviousStep() {
    if (AppState.currentStep > 1) {
        AppState.currentStep--;
        updateStepUI();
    }
}

function updateStepUI() {
    // Ocultar todos los pasos
    document.querySelectorAll('.step-content').forEach(step => {
        step.classList.add('d-none');
    });
    
    // Mostrar paso actual
    document.getElementById(`step${AppState.currentStep}`).classList.remove('d-none');
    
    // Actualizar indicadores
    document.querySelectorAll('.step-number').forEach((indicator, index) => {
        indicator.classList.remove('active', 'completed');
        
        if (index + 1 < AppState.currentStep) {
            indicator.classList.add('completed');
        } else if (index + 1 === AppState.currentStep) {
            indicator.classList.add('active');
        }
    });
    
    // Actualizar botones
    const btnBack = document.getElementById('btnBack');
    const btnNext = document.getElementById('btnNext');
    
    btnBack.style.display = AppState.currentStep > 1 ? 'inline-block' : 'none';
    
    if (AppState.currentStep === 4) {
        btnNext.innerHTML = '<i class="fas fa-credit-card me-2"></i>Crear Reserva y Pagar';
        btnNext.classList.add('btn-lg');
    } else {
        btnNext.innerHTML = 'Siguiente <i class="fas fa-arrow-right ms-2"></i>';
        btnNext.classList.remove('btn-lg');
    }
}

async function handleDateChange() {
    const date = document.getElementById('appointmentDate').value;
    const timeSelect = document.getElementById('appointmentTime');
    
    if (!date || !AppState.selectedService) return;
    
    try {
        // Mostrar loading
        timeSelect.innerHTML = '<option value="">Cargando horarios...</option>';
        timeSelect.disabled = true;
        
        const response = await fetch(
            `${CONFIG.API_BASE_URL}/bookings/available-slots/${AppState.selectedService.id}/${date}`
        );
        const data = await response.json();
        
        if (data.success) {
            timeSelect.innerHTML = '<option value="">Selecciona una hora</option>';
            
            if (data.data.availableSlots.length === 0) {
                timeSelect.innerHTML = '<option value="">No hay horarios disponibles</option>';
            } else {
                data.data.availableSlots.forEach(slot => {
                    timeSelect.innerHTML += `<option value="${slot}">${slot}</option>`;
                });
            }
        } else {
            throw new Error(data.message || 'Error al cargar horarios');
        }
    } catch (error) {
        console.error('Error cargando horarios:', error);
        timeSelect.innerHTML = '<option value="">Error al cargar horarios</option>';
        showToast('Error al cargar los horarios disponibles', 'error');
    } finally {
        timeSelect.disabled = false;
    }
}

function updateConfirmationSummary() {
    const container = document.getElementById('confirmationSummary');
    if (!container) return;
    
    const appointmentDate = new Date(AppState.selectedDate);
    const formattedDate = appointmentDate.toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    container.innerHTML = `
        <div class="mb-4">
            <h5 class="mb-3">
                <i class="fas fa-user me-2"></i>Información del Cliente
            </h5>
            <div class="summary-item">
                <span>Nombre:</span>
                <strong>${AppState.clientData.clientName}</strong>
            </div>
            <div class="summary-item">
                <span>Cédula:</span>
                <strong>${AppState.clientData.clientId}</strong>
            </div>
            <div class="summary-item">
                <span>Email:</span>
                <strong>${AppState.clientData.email}</strong>
            </div>
            <div class="summary-item">
                <span>Teléfono:</span>
                <strong>${AppState.clientData.phone}</strong>
            </div>
            ${AppState.clientData.notes ? `
                <div class="summary-item">
                    <span>Notas:</span>
                    <strong>${AppState.clientData.notes}</strong>
                </div>
            ` : ''}
        </div>
        
        <div class="mb-4">
            <h5 class="mb-3">
                <i class="fas fa-spa me-2"></i>Detalles del Servicio
            </h5>
            <div class="summary-item">
                <span>Servicio:</span>
                <strong>${AppState.selectedService.name}</strong>
            </div>
            <div class="summary-item">
                <span>Duración:</span>
                <strong>${AppState.selectedService.duration} minutos</strong>
            </div>
            <div class="summary-item">
                <span>Fecha:</span>
                <strong>${formattedDate}</strong>
            </div>
            <div class="summary-item">
                <span>Hora:</span>
                <strong>${AppState.selectedTime}</strong>
            </div>
        </div>
        
        <div class="text-center">
            <div class="summary-item border-0 justify-content-center">
                <span class="h4">Total a Pagar:</span>
                <span class="h3 text-primary">$${AppState.selectedService.price.toLocaleString()}</span>
            </div>
        </div>
        
        <div class="alert alert-warning mt-3">
            <i class="fas fa-info-circle me-2"></i>
            <strong>Importante:</strong> Podrás cancelar tu reserva hasta 24 horas antes de la cita.
            Te enviaremos confirmación por email y SMS.
        </div>
    `;
}

async function createReservation() {
    try {
        // Mostrar modal de loading
        showLoadingModal('Creando tu reserva...', 'Por favor espera un momento');
        
        const reservationData = {
            clientName: AppState.clientData.clientName,
            clientId: AppState.clientData.clientId,
            email: AppState.clientData.email,
            phone: AppState.clientData.phone,
            serviceType: AppState.selectedService.id,
            appointmentDate: AppState.selectedDate,
            appointmentTime: AppState.selectedTime,
            notes: AppState.clientData.notes || ''
        };
        
        const response = await fetch(`${CONFIG.API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reservationData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            AppState.reservationData = result.data;
            
            // Ocultar modal de loading
            hideLoadingModal();
            
            // Mostrar éxito y proceder al pago
            showToast(
                `¡Reserva creada exitosamente! Código: ${result.data.booking.reservationCode}`,
                'success'
            );
            
            // Cerrar modal de reserva
            bootstrap.Modal.getInstance(document.getElementById('reservaModal')).hide();
            
            // Proceder al pago
            setTimeout(() => {
                proceedToPayment(result.data.paymentUrl, result.data.booking.reservationCode);
            }, 1000);
            
        } else {
            throw new Error(result.message || 'Error al crear la reserva');
        }
        
    } catch (error) {
        console.error('Error creando reserva:', error);
        hideLoadingModal();
        showToast(error.message || 'Error al crear la reserva. Por favor intenta nuevamente.', 'error');
    }
}

function proceedToPayment(paymentUrl, reservationCode) {
    // Mostrar opciones de pago
    const paymentModal = `
        <div class="modal fade" id="paymentModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-check-circle me-2"></i>¡Reserva Creada!
                        </h5>
                    </div>
                    <div class="modal-body text-center py-4">
                        <div class="mb-4">
                            <i class="fas fa-calendar-check text-success" style="font-size: 4rem;"></i>
                        </div>
                        <h4 class="mb-3">Código de Reserva</h4>
                        <div class="alert alert-info">
                            <h3 class="mb-0 fw-bold">${reservationCode}</h3>
                        </div>
                        <p class="text-muted mb-4">
                            Guarda este código para consultar tu reserva. 
                            También lo recibirás por email y SMS.
                        </p>
                        <div class="d-grid gap-2">
                            <button class="btn btn-primary-custom btn-lg" onclick="openPaymentWindow('${paymentUrl}')">
                                <i class="fas fa-credit-card me-2"></i>Pagar Ahora
                            </button>
                            <button class="btn btn-outline-secondary" onclick="closePaymentModal()">
                                Pagar Después
                            </button>
                        </div>
                        <small class="text-muted mt-3 d-block">
                            Puedes pagar después usando tu código de reserva
                        </small>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Agregar modal al DOM
    document.body.insertAdjacentHTML('beforeend', paymentModal);
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
    modal.show();
}

function openPaymentWindow(paymentUrl) {
    // Abrir ventana de pago
    window.open(paymentUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    
    // Cerrar modal
    closePaymentModal();
    
    // Mostrar mensaje de seguimiento
    setTimeout(() => {
        showToast(
            'Completa el pago en la ventana que se abrió. Recibirás confirmación cuando el pago sea exitoso.',
            'info'
        );
    }, 500);
}

function closePaymentModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
    if (modal) {
        modal.hide();
        // Remover modal del DOM
        setTimeout(() => {
            const modalElement = document.getElementById('paymentModal');
            if (modalElement) {
                modalElement.remove();
            }
        }, 300);
    }
}

function showLoadingModal(title, subtitle) {
    document.getElementById('loadingText').textContent = title;
    document.getElementById('loadingSubtext').textContent = subtitle;
    
    const modal = new bootstrap.Modal(document.getElementById('loadingModal'));
    modal.show();
}

function hideLoadingModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('loadingModal'));
    if (modal) {
        modal.hide();
    }
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

// Función global para consultar reserva (puede ser usada en otras páginas)
window.consultarReserva = async function(reservationCode) {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/bookings/booking/${reservationCode}`);
        const data = await response.json();
        
        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.message || 'Reserva no encontrada');
        }
    } catch (error) {
        console.error('Error consultando reserva:', error);
        throw error;
    }
};

// Función global para cancelar reserva
window.cancelarReserva = async function(reservationCode) {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/bookings/cancel/${reservationCode}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        
        if (data.success) {
            showToast('Reserva cancelada exitosamente', 'success');
            return data.data;
        } else {
            throw new Error(data.message || 'Error al cancelar la reserva');
        }
    } catch (error) {
        console.error('Error cancelando reserva:', error);
        showToast(error.message, 'error');
        throw error;
    }
};

// Manejar el retorno del pago (si se configura webhook)
window.handlePaymentReturn = function(paymentId, status, reservationCode) {
    if (status === 'approved') {
        showToast('¡Pago exitoso! Tu reserva ha sido confirmada. Recibirás un email de confirmación.', 'success');
    } else if (status === 'pending') {
        showToast('Tu pago está siendo procesado. Te notificaremos cuando sea confirmado.', 'info');
    } else {
        showToast('Hubo un problema con el pago. Por favor intenta nuevamente.', 'error');
    }
};

// Log de inicialización
console.log('🎨 Beauty Center App - Frontend cargado correctamente');
console.log('📱 Para consultar una reserva: consultarReserva("CODIGO")');
console.log('❌ Para cancelar una reserva: cancelarReserva("CODIGO")'); 

// Función mejorada para probar el modal con logs
function testModal() {
    Logger.info('🔥 Iniciando testModal()');
    
    try {
        const modal = document.getElementById('reservaModal');
        if (!modal) {
            Logger.error('Modal no encontrado en el DOM');
            showToast('Error: Modal no encontrado', 'error');
            return;
        }
        
        Logger.debug('Modal encontrado, cargando servicios');
        
        // Cargar servicios (reales o demo) con logs
        const serviciosContainer = document.getElementById('serviciosModal');
        if (serviciosContainer) {
            // Verificar si tenemos servicios reales o demo
            const hasRealServices = AppState.services.length > 0 && 
                                  AppState.services !== DEMO_SERVICES && 
                                  !AppState.services.every(s => DEMO_SERVICES.some(d => d.id === s.id));
            
            if (hasRealServices) {
                serviciosContainer.innerHTML = generateRealServicesHTML();
                Logger.info('✅ SERVICIOS REALES cargados en el modal - Backend conectado');
                showToast('🎉 Servicios reales del backend cargados', 'success');
            } else {
                // Intentar cargar servicios reales una vez más
                Logger.warn('⚠️ No hay servicios reales, intentando reconectar...');
                loadRealServicesFromBackend().then(() => {
                    if (AppState.services.length > 0 && AppState.services !== DEMO_SERVICES) {
                        serviciosContainer.innerHTML = generateRealServicesHTML();
                        Logger.info('✅ Servicios reales cargados tras reconexión');
                        showToast('✅ Conexión al backend restablecida', 'success');
                    } else {
                        serviciosContainer.innerHTML = generateServicesHTML();
                        Logger.debug('⚠️ Usando servicios demo - Sin conexión al backend');
                        showToast('⚠️ Modo demo - Sin conexión al backend', 'warning');
                    }
                }).catch(() => {
                    serviciosContainer.innerHTML = generateServicesHTML();
                    Logger.debug('⚠️ Servicios demo cargados - Backend no disponible');
                    showToast('⚠️ Backend no disponible - Modo demo', 'warning');
                });
            }
        } else {
            Logger.warn('Container de servicios no encontrado');
        }
        
        // Abrir modal con logs
        if (typeof bootstrap !== 'undefined') {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
            Logger.info('Modal abierto con Bootstrap');
        } else {
            Logger.warn('Bootstrap no disponible, usando fallback');
            modal.style.display = 'block';
            modal.classList.add('show');
            modal.style.opacity = '1';
            modal.style.paddingRight = '17px';
            document.body.classList.add('modal-open');
            Logger.info('Modal abierto manualmente');
        }
        
        // Configurar eventos con logs
        setupModalEvents(modal);
        
    } catch (error) {
        Logger.error('Error en testModal()', error);
        showToast('Error al abrir el modal: ' + error.message, 'error');
    }
}

// Función para generar HTML de servicios demo
function generateServicesHTML() {
    Logger.debug('Generando HTML de servicios demo');
    
    return DEMO_SERVICES.map(service => `
        <div class="col-md-6 mb-3">
            <div class="service-selection-card" 
                 onclick="selectServiceDemo('${service.id}')" 
                 data-service-id="${service.id}"
                 style="cursor: pointer; padding: 20px; border: 2px solid #e9ecef; border-radius: 12px; transition: all 0.3s; background: white;">
                <div class="service-icon text-center mb-3">
                    <i class="fas ${getServiceIcon(service.category)}" style="font-size: 2.5rem; color: #667eea;"></i>
                </div>
                <h6 class="fw-bold text-center mb-2">${service.name}</h6>
                <p class="text-muted small text-center mb-3">${service.description}</p>
                <div class="service-price text-center mb-2">
                    <span class="text-primary fw-bold fs-5">$${service.price.toLocaleString()}</span>
                </div>
                <div class="text-center">
                    <small class="text-muted">
                        <i class="fas fa-clock me-1"></i>${service.duration} minutos
                    </small>
                </div>
            </div>
        </div>
    `).join('');
}

// Función para generar HTML de servicios reales del backend
function generateRealServicesHTML() {
    Logger.debug('Generando HTML de servicios reales del backend');
    
    return AppState.services.map(service => `
        <div class="col-md-6 mb-3">
            <div class="service-selection-card" 
                 onclick="selectRealService('${service.id}')" 
                 data-service-id="${service.id}"
                 style="cursor: pointer; padding: 20px; border: 2px solid #e9ecef; border-radius: 12px; transition: all 0.3s; background: white;">
                <div class="service-icon text-center mb-3">
                    <i class="fas ${getServiceIcon(service.category)}" style="font-size: 2.5rem; color: #667eea;"></i>
                </div>
                <h6 class="fw-bold text-center mb-2">${service.name}</h6>
                <p class="text-muted small text-center mb-3">${service.description}</p>
                <div class="service-price text-center mb-2">
                    <span class="text-primary fw-bold fs-5">$${service.price.toLocaleString()}</span>
                </div>
                <div class="text-center">
                    <small class="text-muted">
                        <i class="fas fa-clock me-1"></i>${service.duration} minutos
                    </small>
                </div>
                <div class="mt-2">
                    <span class="badge bg-success">
                        <i class="fas fa-server me-1"></i>Backend Conectado
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// Función para configurar eventos del modal
function setupModalEvents(modal) {
    Logger.debug('Configurando eventos del modal');
    
    // Botón de cerrar
    const closeBtn = modal.querySelector('.btn-close');
    if (closeBtn) {
        closeBtn.onclick = function() {
            Logger.debug('Cerrando modal por botón X');
            closeModal(modal);
        };
    }
    
    // Click fuera del modal
    modal.onclick = function(event) {
        if (event.target === modal) {
            Logger.debug('Cerrando modal por click fuera');
            closeModal(modal);
        }
    };
    
    // Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.classList.contains('show')) {
            Logger.debug('Cerrando modal por tecla Escape');
            closeModal(modal);
        }
    });
    
    Logger.debug('Eventos del modal configurados');
}

// Función para cerrar modal
function closeModal(modal) {
    try {
        if (typeof bootstrap !== 'undefined') {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
                Logger.debug('Modal cerrado con Bootstrap');
            }
        } else {
            modal.style.display = 'none';
            modal.classList.remove('show');
            document.body.classList.remove('modal-open');
            Logger.debug('Modal cerrado manualmente');
        }
    } catch (error) {
        Logger.error('Error cerrando modal', error);
    }
}

// API Helper con logs y retry
const ApiHelper = {
    async request(endpoint, options = {}) {
        Logger.debug(`API Request: ${endpoint}`, options);
        
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            ...options
        };
        
        let lastError;
        
        for (let attempt = 1; attempt <= CONFIG.RETRY_ATTEMPTS; attempt++) {
            try {
                Logger.debug(`Intento ${attempt} para ${endpoint}`);
                
                const response = await fetch(CONFIG.API_BASE_URL + endpoint, defaultOptions);
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
                }
                
                const data = await response.json();
                Logger.debug(`API Response: ${endpoint}`, data);
                
                return data;
                
            } catch (error) {
                lastError = error;
                Logger.warn(`Intento ${attempt} falló para ${endpoint}`, error);
                
                if (attempt < CONFIG.RETRY_ATTEMPTS) {
                    await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * attempt));
                }
            }
        }
        
        Logger.error(`Todos los intentos fallaron para ${endpoint}`, lastError);
        throw lastError;
    },
    
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },
    
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

// Función para seleccionar servicio real del backend
function selectRealService(serviceId) {
    Logger.info(`🎯 Servicio real seleccionado: ${serviceId}`);
    
    try {
        const service = AppState.services.find(s => s.id === serviceId);
        if (!service) {
            Logger.error(`❌ Servicio real no encontrado: ${serviceId}`);
            showToast('Error: Servicio no encontrado', 'error');
            return;
        }
        
        AppState.setState('selectedService', service);
        Logger.info(`✅ Servicio real encontrado: ${service.name}`);
        
        // Destacar el servicio seleccionado
        document.querySelectorAll('.service-selection-card').forEach(card => {
            card.style.backgroundColor = '#f8f9fa';
            card.style.borderColor = '#e9ecef';
        });
        
        // Destacar el seleccionado
        if (event && event.currentTarget) {
            event.currentTarget.style.backgroundColor = '#e7f3ff';
            event.currentTarget.style.borderColor = '#007bff';
        }
        
        // Mostrar modal de confirmación con datos reales
        showRealServiceSelectedModal(service);
        
    } catch (error) {
        Logger.error('❌ Error seleccionando servicio real', error);
        AppState.addError(error);
        showToast('Error al seleccionar servicio', 'error');
    }
}

// Función para mostrar modal de servicio seleccionado (modo demo)
function showServiceSelectedModal(service) {
    Logger.debug('Mostrando modal de servicio seleccionado (demo)', service);
    
    const modalContent = `
        <div class="modal fade" id="serviceSelectedModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-warning text-dark">
                        <h5 class="modal-title">
                            <i class="fas fa-flask me-2"></i>Modo Demo
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <div class="mb-4">
                            <i class="fas ${getServiceIcon(service.category)} display-1 text-warning"></i>
                        </div>
                        <h4 class="mb-3">Has seleccionado: ${service.name}</h4>
                        <p class="text-muted mb-4">${service.description}</p>
                        
                        <div class="alert alert-warning">
                            <h6><i class="fas fa-exclamation-triangle me-2"></i>Funcionando en modo demo</h6>
                            <p class="mb-0">No hay conexión con el backend. Los datos son ficticios.</p>
                        </div>
                        
                        <div class="d-grid gap-2 mt-4">
                            <button class="btn btn-outline-secondary" onclick="showDevelopmentStatus()">
                                <i class="fas fa-info me-2"></i>Ver Estado de Desarrollo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Crear y mostrar el modal
    const existingModal = document.getElementById('serviceSelectedModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalContent);
    
    const modal = document.getElementById('serviceSelectedModal');
    if (typeof bootstrap !== 'undefined') {
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        // Limpiar el modal después de cerrarlo
        modal.addEventListener('hidden.bs.modal', function() {
            modal.remove();
        });
    }
}

// Función para mostrar modal de servicio real seleccionado
function showRealServiceSelectedModal(service) {
    Logger.debug('Mostrando modal de servicio real seleccionado', service);
    
    const modalContent = `
        <div class="modal fade" id="realServiceSelectedModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-check-circle me-2"></i>¡Servicio Seleccionado!
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-4 text-center">
                                <div class="mb-3">
                                    <i class="fas ${getServiceIcon(service.category)} display-1 text-success"></i>
                                </div>
                                <span class="badge bg-success mb-3">
                                    <i class="fas fa-server me-1"></i>Backend Conectado
                                </span>
                            </div>
                            <div class="col-md-8">
                                <h4 class="mb-3">${service.name}</h4>
                                <p class="text-muted mb-3">${service.description}</p>
                                
                                <div class="row mb-3">
                                    <div class="col-6">
                                        <div class="d-flex align-items-center">
                                            <i class="fas fa-clock text-success me-2"></i>
                                            <span><strong>${service.duration}</strong> minutos</span>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="d-flex align-items-center">
                                            <i class="fas fa-dollar-sign text-success me-2"></i>
                                            <span><strong>$${service.price.toLocaleString()}</strong></span>
                                        </div>
                                    </div>
                                </div>
                                
                                ${service.requirements && service.requirements.length > 0 ? `
                                <div class="alert alert-info mb-3">
                                    <h6><i class="fas fa-info-circle me-2"></i>Requisitos:</h6>
                                    <ul class="mb-0">
                                        ${service.requirements.map(req => `<li>${req}</li>`).join('')}
                                    </ul>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div class="alert alert-success">
                            <h6><i class="fas fa-rocket me-2"></i>¡Backend Conectado! Próximos pasos disponibles:</h6>
                            <ul class="list-unstyled mb-0">
                                <li><i class="fas fa-calendar-alt me-2 text-success"></i>Elegir fecha y hora disponible</li>
                                <li><i class="fas fa-user me-2 text-success"></i>Completar información personal</li>
                                <li><i class="fas fa-credit-card me-2 text-success"></i>Procesar pago con MercadoPago</li>
                                <li><i class="fas fa-envelope me-2 text-success"></i>Recibir confirmación automática</li>
                            </ul>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button class="btn btn-success btn-lg" onclick="proceedToRealBooking('${service.id}')">
                                <i class="fas fa-calendar-alt me-2"></i>Continuar con Reserva Real
                            </button>
                            <div class="row">
                                <div class="col-6">
                                    <button class="btn btn-outline-primary w-100" onclick="checkAvailableSlots('${service.id}')">
                                        <i class="fas fa-clock me-2"></i>Ver Horarios
                                    </button>
                                </div>
                                <div class="col-6">
                                    <button class="btn btn-outline-secondary w-100" onclick="showDevelopmentStatus()">
                                        <i class="fas fa-info me-2"></i>Estado
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Crear y mostrar el modal
    const existingModal = document.getElementById('realServiceSelectedModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalContent);
    
    const modal = document.getElementById('realServiceSelectedModal');
    if (typeof bootstrap !== 'undefined') {
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        // Limpiar el modal después de cerrarlo
        modal.addEventListener('hidden.bs.modal', function() {
            modal.remove();
        });
    }
}

// Función para proceder a reserva completa (modo demo)
function proceedToFullBooking(serviceId) {
    Logger.info(`Procediendo a reserva completa para servicio: ${serviceId}`);
    
    // Cerrar modal actual
    const modal = document.getElementById('serviceSelectedModal');
    if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) bsModal.hide();
    }
    
    // Aquí se implementaría el flujo completo conectado al backend
    showToast('Iniciando flujo completo de reserva...', 'info');
    
    // Cargar configuración del servidor
    loadServerConfig().then(() => {
        // Cargar servicios reales del servidor
        loadRealServices().then(() => {
            // Abrir modal de reserva completa
            openFullBookingModal(serviceId);
        }).catch(error => {
            Logger.error('Error cargando servicios reales', error);
            showToast('Error conectando con el servidor. Usando modo demo.', 'warn');
            openFullBookingModal(serviceId);
        });
    }).catch(error => {
        Logger.error('Error cargando configuración del servidor', error);
        showToast('Error de conexión. Usando modo demo.', 'warn');
        openFullBookingModal(serviceId);
    });
}

// Función para proceder a reserva real con backend
function proceedToRealBooking(serviceId) {
    Logger.info(`🚀 Procediendo a reserva REAL para servicio: ${serviceId}`);
    
    try {
        // Cerrar modal actual
        const modal = document.getElementById('realServiceSelectedModal');
        if (modal) {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
        }
        
        // Aquí implementarías la FASE 2 - Flujo completo de reservas
        showToast('🎉 ¡Iniciando reserva real con backend conectado!', 'success');
        
        // Por ahora, mostrar que está preparado para la FASE 2
        showNextPhaseModal(serviceId);
        
    } catch (error) {
        Logger.error('Error procediendo a reserva real', error);
        showToast('Error iniciando reserva real', 'error');
    }
}

// Función para verificar horarios disponibles
async function checkAvailableSlots(serviceId) {
    Logger.info(`🕐 Verificando horarios disponibles para servicio: ${serviceId}`);
    
    try {
        // Mostrar loading
        showToast('Consultando horarios disponibles...', 'info');
        
        // Obtener fecha de mañana como ejemplo
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];
        
        // Consultar horarios disponibles al backend
        const response = await ApiHelper.get(`/bookings/available-slots/${serviceId}/${dateStr}`);
        
        if (response.success) {
            Logger.info('✅ Horarios disponibles obtenidos:', response.data);
            showAvailableSlotsModal(serviceId, dateStr, response.data.availableSlots);
        } else {
            throw new Error(response.message || 'Error obteniendo horarios');
        }
        
    } catch (error) {
        Logger.error('Error consultando horarios disponibles', error);
        showToast('Error consultando horarios. Verificar conexión con backend.', 'error');
    }
}

// Función para mostrar modal de próxima fase
function showNextPhaseModal(serviceId) {
    const modalContent = `
        <div class="modal fade" id="nextPhaseModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-info text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-rocket me-2"></i>¡FASE 1 Completada!
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <div class="mb-4">
                            <i class="fas fa-check-circle display-1 text-success"></i>
                        </div>
                        <h4 class="mb-3">¡Backend Conectado Exitosamente!</h4>
                        <p class="text-muted mb-4">La FASE 1 está completa. El frontend ya se conecta con el backend.</p>
                        
                        <div class="alert alert-success">
                            <h6><i class="fas fa-list me-2"></i>Lo que funciona ahora:</h6>
                            <ul class="list-unstyled mb-0 text-start">
                                <li>✅ Carga de servicios reales desde el backend</li>
                                <li>✅ Configuración dinámica del servidor</li>
                                <li>✅ Sistema de logs avanzado</li>
                                <li>✅ Manejo de errores robusto</li>
                                <li>✅ Fallback a modo demo si falla la conexión</li>
                            </ul>
                        </div>
                        
                        <div class="alert alert-info">
                            <h6><i class="fas fa-road me-2"></i>Próximo: FASE 2</h6>
                            <p class="mb-0">Implementar calendario de fechas, selector de horarios y formulario de datos del cliente.</p>
                        </div>
                        
                        <div class="d-grid gap-2 mt-4">
                            <button class="btn btn-success btn-lg" onclick="startPhase2('${serviceId}')">
                                <i class="fas fa-calendar-alt me-2"></i>Iniciar FASE 2
                            </button>
                            <button class="btn btn-outline-primary" onclick="showDevelopmentStatus()">
                                <i class="fas fa-info me-2"></i>Ver Progreso Completo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Crear y mostrar el modal
    const existingModal = document.getElementById('nextPhaseModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalContent);
    
    const modal = document.getElementById('nextPhaseModal');
    if (typeof bootstrap !== 'undefined') {
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        modal.addEventListener('hidden.bs.modal', function() {
            modal.remove();
        });
    }
}

// Función para mostrar horarios disponibles
function showAvailableSlotsModal(serviceId, date, slots) {
    Logger.info('📅 Mostrando horarios disponibles:', { serviceId, date, slots });
    
    const modalContent = `
        <div class="modal fade" id="availableSlotsModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-clock me-2"></i>Horarios Disponibles
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <h6 class="mb-3">Fecha: ${new Date(date).toLocaleDateString('es-ES', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}</h6>
                        
                        ${slots.length > 0 ? `
                            <div class="row g-2">
                                ${slots.map(slot => `
                                    <div class="col-6">
                                        <button class="btn btn-outline-primary w-100" onclick="selectTimeSlot('${serviceId}', '${date}', '${slot}')">
                                            <i class="fas fa-clock me-2"></i>${slot}
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="alert alert-warning">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                No hay horarios disponibles para esta fecha.
                            </div>
                        `}
                        
                        <div class="mt-3">
                            <span class="badge bg-success">
                                <i class="fas fa-server me-1"></i>Datos reales del backend
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Crear y mostrar el modal
    const existingModal = document.getElementById('availableSlotsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalContent);
    
    const modal = document.getElementById('availableSlotsModal');
    if (typeof bootstrap !== 'undefined') {
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        modal.addEventListener('hidden.bs.modal', function() {
            modal.remove();
        });
    }
}

// Función placeholder para seleccionar horario
function selectTimeSlot(serviceId, date, time) {
    Logger.info(`⏰ Horario seleccionado:`, { serviceId, date, time });
    showToast(`Horario seleccionado: ${time} - ¡Listo para FASE 2!`, 'success');
    
    // Cerrar modal actual
    const modal = document.getElementById('availableSlotsModal');
    if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) bsModal.hide();
    }
}

// Función placeholder para iniciar FASE 2
function startPhase2(serviceId) {
    Logger.info(`🚀 Iniciando FASE 2 para servicio: ${serviceId}`);
    showToast('🚧 FASE 2 lista para implementar - Calendario y formularios', 'info');
    
    // Cerrar modal actual
    const modal = document.getElementById('nextPhaseModal');
    if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) bsModal.hide();
    }
}

// Función para cargar configuración del servidor
async function loadServerConfig() {
    Logger.debug('Cargando configuración del servidor');
    
    try {
        const response = await ApiHelper.get('/config');
        if (response.success) {
            CONFIG.MERCADOPAGO_PUBLIC_KEY = response.data.mercadopago.publicKey;
            CONFIG.API_BASE_URL = response.data.api.baseUrl || CONFIG.API_BASE_URL;
            Logger.info('Configuración del servidor cargada', response.data);
        }
    } catch (error) {
        Logger.warn('No se pudo cargar configuración del servidor', error);
        // Continuar con configuración por defecto
    }
}

// Función para cargar servicios reales del servidor
async function loadRealServices() {
    Logger.debug('Cargando servicios reales del servidor');
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/bookings/services`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            AppState.setState('services', data.data);
            Logger.info('Servicios reales cargados', data.data);
        } else {
            Logger.warn('No se encontraron servicios en el servidor');
            AppState.setState('services', DEMO_SERVICES);
        }
    } catch (error) {
        Logger.warn('Error cargando servicios del servidor', error);
        AppState.setState('services', DEMO_SERVICES);
    }
}

// Función para abrir modal de reserva completa
function openFullBookingModal(serviceId) {
    Logger.info(`Abriendo modal de reserva completa para: ${serviceId}`);
    
    // Aquí implementarías el modal completo con:
    // - Selector de fecha
    // - Selector de hora
    // - Formulario de datos del cliente
    // - Integración con MercadoPago
    // - Confirmación por email
    
    showToast('Modal de reserva completa en desarrollo...', 'info');
}

// Función para mostrar estado de desarrollo
function showDevelopmentStatus() {
    Logger.info('Mostrando estado de desarrollo');
    
    const statusModal = `
        <div class="modal fade" id="developmentStatusModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-code me-2"></i>Estado de Desarrollo
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6 class="text-success"><i class="fas fa-check me-2"></i>Completado (Backend)</h6>
                                <ul class="list-unstyled">
                                    <li>✅ API de reservas</li>
                                    <li>✅ Integración MercadoPago</li>
                                    <li>✅ Sistema de notificaciones</li>
                                    <li>✅ Base de datos MongoDB</li>
                                    <li>✅ Panel de administración</li>
                                    <li>✅ Gestión de horarios</li>
                                    <li>✅ Validaciones de negocio</li>
                                </ul>
                            </div>
                            <div class="col-md-6">
                                <h6 class="text-success"><i class="fas fa-check me-2"></i>FASE 1 Completada (Frontend)</h6>
                                <ul class="list-unstyled">
                                    <li>✅ Conexión Frontend-Backend</li>
                                    <li>✅ Sistema de logs avanzado</li>
                                    <li>✅ Manejo de errores robusto</li>
                                    <li>✅ Carga de servicios reales</li>
                                    <li>✅ Configuración dinámica</li>
                                    <li>✅ Consulta de horarios disponibles</li>
                                </ul>
                                
                                <h6 class="text-warning mt-3"><i class="fas fa-clock me-2"></i>Próximo: FASE 2</h6>
                                <ul class="list-unstyled">
                                    <li>⏳ Calendario interactivo</li>
                                    <li>⏳ Formulario de datos cliente</li>
                                    <li>⏳ Flujo completo de reservas</li>
                                    <li>⏳ Integración de pagos</li>
                                    <li>⏳ Dashboard de usuario</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="mt-4 p-3 bg-light rounded">
                            <h6><i class="fas fa-rocket me-2"></i>Próximos pasos:</h6>
                            <ol class="mb-0">
                                <li>Conectar completamente Frontend con Backend</li>
                                <li>Implementar flujo de reservas paso a paso</li>
                                <li>Integrar MercadoPago en el frontend</li>
                                <li>Añadir manejo de errores robusto</li>
                                <li>Implementar notificaciones en tiempo real</li>
                            </ol>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="Logger.clearLogs(); showToast('Logs limpiados', 'success');">
                            <i class="fas fa-trash me-2"></i>Limpiar Logs
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="console.log('Logs:', Logger.getLogs());">
                            <i class="fas fa-eye me-2"></i>Ver Logs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Crear y mostrar el modal
    const existingModal = document.getElementById('developmentStatusModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', statusModal);
    
    const modal = document.getElementById('developmentStatusModal');
    if (typeof bootstrap !== 'undefined') {
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        // Limpiar el modal después de cerrarlo
        modal.addEventListener('hidden.bs.modal', function() {
            modal.remove();
        });
    }
} 