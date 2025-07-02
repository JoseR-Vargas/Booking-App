// Función simple para probar el modal inmediatamente
function testModal() {
    console.log('🔥 testModal() ejecutada');
    
    try {
        const modal = document.getElementById('reservaModal');
        if (modal) {
            console.log('✅ Modal encontrado');
            
            // Cargar servicios demo en el modal
            const serviciosContainer = document.getElementById('serviciosModal');
            if (serviciosContainer) {
                serviciosContainer.innerHTML = `
                    <div class="col-md-6">
                        <div style="cursor: pointer; padding: 15px; border: 2px solid #007bff; border-radius: 8px; background: #f8f9fa;">
                            <div style="text-align: center; margin-bottom: 10px;">
                                <i class="fas fa-cut" style="font-size: 2rem; color: #007bff;"></i>
                            </div>
                            <h6 style="font-weight: bold; text-align: center;">Corte de Cabello</h6>
                            <p style="color: #666; font-size: 14px; text-align: center;">Corte profesional adaptado a tu estilo</p>
                            <div style="color: #007bff; font-weight: bold; text-align: center;">$25.000</div>
                            <small style="color: #666; text-align: center; display: block;">⏰ 45 minutos</small>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div style="cursor: pointer; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #fff;">
                            <div style="text-align: center; margin-bottom: 10px;">
                                <i class="fas fa-hand-sparkles" style="font-size: 2rem; color: #007bff;"></i>
                            </div>
                            <h6 style="font-weight: bold; text-align: center;">Manicure</h6>
                            <p style="color: #666; font-size: 14px; text-align: center;">Cuidado completo de manos y uñas</p>
                            <div style="color: #007bff; font-weight: bold; text-align: center;">$35.000</div>
                            <small style="color: #666; text-align: center; display: block;">⏰ 60 minutos</small>
                        </div>
                    </div>
                `;
                console.log('✅ Servicios cargados en el modal');
            }
            
            // Abrir el modal
            if (typeof bootstrap !== 'undefined') {
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
                console.log('✅ Modal abierto con Bootstrap');
            } else {
                modal.style.display = 'block';
                modal.classList.add('show');
                modal.style.opacity = '1';
                modal.style.paddingRight = '17px';
                document.body.classList.add('modal-open');
                                 console.log('✅ Modal abierto manualmente');
             }
             
             // Configurar botón de cerrar
             const closeBtn = modal.querySelector('.btn-close');
             if (closeBtn) {
                 closeBtn.onclick = function() {
                     if (typeof bootstrap !== 'undefined') {
                         const bsModal = bootstrap.Modal.getInstance(modal);
                         if (bsModal) bsModal.hide();
                     } else {
                         modal.style.display = 'none';
                         modal.classList.remove('show');
                         document.body.classList.remove('modal-open');
                     }
                 };
                 console.log('✅ Botón de cerrar configurado');
             }
             
         } else {
             console.error('❌ No se encontró el modal');
             alert('No se encontró el modal de reserva');
         }
     } catch (error) {
         console.error('❌ Error:', error);
         alert('Error al abrir el modal: ' + error.message);
     }
}

// Configuración global
let CONFIG = {
    API_BASE_URL: window.location.origin,
    MERCADOPAGO_PUBLIC_KEY: '',
};

// Estado global de la aplicación
const AppState = {
    currentStep: 1,
    selectedService: null,
    selectedDate: null,
    selectedTime: null,
    clientData: {},
    services: [],
    reservationData: null
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
                <h6 class="fw-bold">${service.name}</h6>
                <p class="text-muted small">${service.description}</p>
                <div class="service-price text-primary fw-bold">$${service.price.toLocaleString()}</div>
                <small class="text-muted">
                    <i class="fas fa-clock me-1"></i>${service.duration} minutos
                </small>
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
    const service = DEMO_SERVICES.find(s => s.id === serviceId);
    if (service) {
        AppState.selectedService = service;
        console.log('✅ Servicio seleccionado:', service.name);
        
        // Destacar el servicio seleccionado
        document.querySelectorAll('.service-selection-card').forEach(card => {
            card.style.backgroundColor = '#f8f9fa';
            card.style.borderColor = '#ddd';
        });
        
        // Destacar el seleccionado
        event.currentTarget.style.backgroundColor = '#e7f3ff';
        event.currentTarget.style.borderColor = '#007bff';
        
        // Mostrar mensaje de confirmación
        setTimeout(() => {
            alert(`Has seleccionado: ${service.name}\n\nEn la versión completa podrás continuar con la reserva.\n\nPor ahora este es un demo funcional del modal.`);
        }, 500);
    }
}

// Configurar event listeners básicos inmediatamente
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado - configurando listeners básicos...');
    
    // Configurar botones con función de respaldo
    const buttons = ['btnReservarNav', 'btnReservarHero', 'btnReservarContacto'];
    buttons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                console.log(`🖱️ Click en ${buttonId}`);
                openModalSimple();
            });
            console.log(`✅ Listener configurado para ${buttonId}`);
        } else {
            console.warn(`⚠️ No se encontró el botón ${buttonId}`);
        }
    });
    
    // Inicializar la aplicación completa después
    setTimeout(initializeApp, 100);
});

async function initializeApp() {
    try {
        // Cargar configuración del servidor
        await loadConfig();
        
        // Configurar fecha mínima
        setMinDate();
        
        // Cargar servicios
        await loadServices();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Inicializar MercadoPago (solo si hay clave pública configurada)
        if (CONFIG.MERCADOPAGO_PUBLIC_KEY) {
            mp = new MercadoPago(CONFIG.MERCADOPAGO_PUBLIC_KEY);
        }
        
        console.log('✅ Aplicación inicializada correctamente');
        
    } catch (error) {
        console.error('❌ Error al inicializar la aplicación:', error);
        showToast('Error al cargar la aplicación. Por favor recarga la página.', 'error');
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