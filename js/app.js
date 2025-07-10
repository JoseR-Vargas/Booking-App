// Configuración básica
const CONFIG = {
    API_BASE_URL: window.location.origin,
    DEBUG_MODE: true
};

// Estado global simplificado
let currentStep = 1;
let selectedService = null;
let modalInitialized = false;

// Servicios demo
const DEMO_SERVICES = [
    {
        id: 'corte-cabello',
        name: 'Corte de Cabello',
        description: 'Corte profesional adaptado a tu estilo',
        duration: 45,
        price: 25000,
        icon: 'fas fa-cut'
    },
    {
        id: 'manicure',
        name: 'Manicure Clásica',
        description: 'Cuidado completo de manos y uñas',
        duration: 60,
        price: 35000,
        icon: 'fas fa-hand-sparkles'
    },
    {
        id: 'facial',
        name: 'Limpieza Facial',
        description: 'Tratamiento profundo de limpieza facial',
        duration: 90,
        price: 45000,
        icon: 'fas fa-smile'
    },
    {
        id: 'spa',
        name: 'Spa Relajante',
        description: 'Experiencia completa de relajación',
        duration: 120,
        price: 80000,
        icon: 'fas fa-spa'
    }
];

// Función para mostrar notificaciones
function showToast(message, type = 'info') {
    if (typeof Toastify !== 'undefined') {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: colors[type] || colors.info,
            stopOnFocus: true
        }).showToast();
    } else {
        alert(message);
    }
}

// Función de compatibilidad para openModalSimple
function openModalSimple() {
    console.log('🔧 openModalSimple() llamada - redirigiendo a testModal()');
    testModal();
}

// Función de compatibilidad para forceBackendConnection
function forceBackendConnection() {
    console.log('🔧 forceBackendConnection() llamada');
    showToast('🔧 Función de debug ejecutada', 'info');
}

// Función para abrir el modal de reserva
function testModal() {
    console.log('🔥 testModal() ejecutada');
    
    try {
        const modal = document.getElementById('reservaModal');
        if (modal) {
            console.log('✅ Modal encontrado');
            
            // Resetear estado
            currentStep = 1;
            selectedService = null;
            modalInitialized = true;
            console.log('🔄 Estado reseteado - Step:', currentStep, 'Service:', selectedService);
            
            updateModalStep();
            
            // Cargar servicios demo en el modal
            const serviciosContainer = document.getElementById('serviciosModal');
            if (serviciosContainer) {
                serviciosContainer.innerHTML = `
                    <div class="col-md-6">
                        <div class="service-selection-card" data-service-id="corte-cabello" data-service-name="Corte de Cabello" data-service-price="25000" style="cursor: pointer; padding: 20px; border: 2px solid #007bff; border-radius: 12px; background: #f8f9fa; text-align: center; transition: all 0.3s;">
                            <div style="margin-bottom: 15px;">
                                <i class="fas fa-cut" style="font-size: 3rem; color: #007bff;"></i>
                            </div>
                            <h5 style="font-weight: bold; color: #333;">✂️ Corte de Cabello</h5>
                            <p style="color: #666; margin: 10px 0;">Corte profesional adaptado a tu estilo personal</p>
                            <div style="color: #007bff; font-weight: bold; font-size: 1.2rem;">$25.000</div>
                            <small style="color: #666;"><i class="fas fa-clock me-1"></i>45 minutos</small>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="service-selection-card" data-service-id="manicure" data-service-name="Manicure Clásica" data-service-price="35000" style="cursor: pointer; padding: 20px; border: 1px solid #ddd; border-radius: 12px; background: #fff; text-align: center; transition: all 0.3s;">
                            <div style="margin-bottom: 15px;">
                                <i class="fas fa-hand-sparkles" style="font-size: 3rem; color: #e91e63;"></i>
                            </div>
                            <h5 style="font-weight: bold; color: #333;">💅 Manicure Clásica</h5>
                            <p style="color: #666; margin: 10px 0;">Cuidado completo de manos y uñas</p>
                            <div style="color: #e91e63; font-weight: bold; font-size: 1.2rem;">$35.000</div>
                            <small style="color: #666;"><i class="fas fa-clock me-1"></i>60 minutos</small>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="service-selection-card" data-service-id="facial" data-service-name="Limpieza Facial" data-service-price="45000" style="cursor: pointer; padding: 20px; border: 1px solid #ddd; border-radius: 12px; background: #fff; text-align: center; transition: all 0.3s;">
                            <div style="margin-bottom: 15px;">
                                <i class="fas fa-smile" style="font-size: 3rem; color: #28a745;"></i>
                            </div>
                            <h5 style="font-weight: bold; color: #333;">😊 Limpieza Facial</h5>
                            <p style="color: #666; margin: 10px 0;">Tratamiento profundo de limpieza facial</p>
                            <div style="color: #28a745; font-weight: bold; font-size: 1.2rem;">$45.000</div>
                            <small style="color: #666;"><i class="fas fa-clock me-1"></i>90 minutos</small>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="service-selection-card" data-service-id="spa" data-service-name="Spa Relajante" data-service-price="80000" style="cursor: pointer; padding: 20px; border: 1px solid #ddd; border-radius: 12px; background: #fff; text-align: center; transition: all 0.3s;">
                            <div style="margin-bottom: 15px;">
                                <i class="fas fa-spa" style="font-size: 3rem; color: #6f42c1;"></i>
                            </div>
                            <h5 style="font-weight: bold; color: #333;">🧘‍♀️ Spa Relajante</h5>
                            <p style="color: #666; margin: 10px 0;">Experiencia completa de relajación</p>
                            <div style="color: #6f42c1; font-weight: bold; font-size: 1.2rem;">$80.000</div>
                            <small style="color: #666;"><i class="fas fa-clock me-1"></i>120 minutos</small>
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
            
            // Configurar eventos usando delegación simple
            setTimeout(() => {
                const serviciosContainer = document.getElementById('serviciosModal');
                console.log('🔍 Verificando configuración de eventos. Container:', !!serviciosContainer);
                console.log('🔍 Container ya configurado?', serviciosContainer ? serviciosContainer.hasAttribute('data-events-configured') : 'no container');
                
                if (serviciosContainer && !serviciosContainer.hasAttribute('data-events-configured')) {
                    console.log('🎯 Configurando eventos por delegación simple');
                    
                    // Marcar como configurado para evitar duplicación
                    serviciosContainer.setAttribute('data-events-configured', 'true');
                    
                    // Delegación de eventos para clicks
                    serviciosContainer.addEventListener('click', function(e) {
                        console.log('🖱️ CLICK EVENT TRIGGERED'); // Log importante!
                        const card = e.target.closest('.service-selection-card');
                        console.log('🔍 Card found:', !!card);
                        
                        if (card) {
                            console.log('🖱️ Click detectado en tarjeta de servicio');
                            
                            // Obtener datos de la tarjeta
                            const serviceId = card.getAttribute('data-service-id');
                            const serviceName = card.getAttribute('data-service-name');
                            const servicePrice = parseInt(card.getAttribute('data-service-price'));
                            
                            console.log('📝 Datos del servicio:', {serviceId, serviceName, servicePrice});
                            
                            // Llamar a la función de selección pasando el elemento target
                            console.log('🚀 ABOUT TO CALL selectServiceAndAdvance');
                            selectServiceAndAdvance(serviceId, serviceName, servicePrice, card);
                        }
                    });
                    
                    // Efectos hover
                    serviciosContainer.addEventListener('mouseenter', function(e) {
                        const card = e.target.closest('.service-selection-card');
                        if (card) {
                            card.style.transform = 'scale(1.05)';
                            card.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                        }
                    }, true);
                    
                    serviciosContainer.addEventListener('mouseleave', function(e) {
                        const card = e.target.closest('.service-selection-card');
                        if (card) {
                            card.style.transform = 'scale(1)';
                            card.style.boxShadow = 'none';
                        }
                    }, true);
                    
                    console.log('✅ Eventos configurados correctamente');
                } else {
                    console.log('ℹ️ Eventos ya configurados o no hay container, saltando...');
                }
            }, 100);
            
        } else {
            console.error('❌ No se encontró el modal');
            alert('No se encontró el modal de reserva');
        }
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error al abrir el modal: ' + error.message);
    }
}

// Función para seleccionar servicio y avanzar automáticamente
function selectServiceAndAdvance(serviceId, serviceName, price, targetElement = null) {
    console.log('🎯 Servicio seleccionado:', serviceName);
    console.log('📍 STACK TRACE:', new Error().stack);
    console.log('🔍 Paso 1 - Variables básicas');
    console.log('🔍 currentStep:', currentStep);
    console.log('🔍 selectedService:', selectedService);
    
    try {
        // Prevenir múltiples ejecuciones
        if (selectedService && currentStep > 1) {
            console.log('⚠️ Servicio ya seleccionado, ignorando...');
            return;
        }
        
        // Guardar servicio seleccionado
        selectedService = {
            id: serviceId,
            name: serviceName,
            price: price
        };
        console.log('✅ Servicio guardado:', selectedService);
        
        // Resetear estilos de todas las tarjetas
        document.querySelectorAll('.service-selection-card').forEach(card => {
            card.style.borderColor = '#ddd';
            card.style.backgroundColor = '#fff';
        });
        
        // Destacar la tarjeta seleccionada
        if (targetElement) {
            targetElement.style.borderColor = '#007bff';
            targetElement.style.backgroundColor = '#e7f3ff';
            console.log('🎨 Tarjeta destacada');
        } else {
            // Buscar la tarjeta por data-service-id
            const targetCard = document.querySelector(`[data-service-id="${serviceId}"]`);
            if (targetCard) {
                targetCard.style.borderColor = '#007bff';
                targetCard.style.backgroundColor = '#e7f3ff';
                console.log('🎨 Tarjeta encontrada y destacada');
            }
        }
        
        // Mostrar notificación y avanzar
        showToast('✅ Servicio seleccionado: ' + serviceName, 'success');
        console.log('📢 Toast mostrado');
        
        // Avanzar al siguiente paso después de un breve delay
        console.log('⏱️ Configurando timeout...');
        setTimeout(() => {
            console.log('🚀 Avanzando al paso 2...');
            currentStep = 2;
            updateModalStep();
            console.log('✅ Paso actualizado a:', currentStep);
        }, 1000);
        
        console.log('🎉 selectServiceAndAdvance completado');
        
    } catch (error) {
        console.error('❌ Error en selectServiceAndAdvance:', error);
    }
}

// Función para actualizar la UI del modal según el paso actual
function updateModalStep() {
    console.log('🔄 updateModalStep() llamada - Paso actual:', currentStep);
    
    // Ocultar todos los pasos
    const allSteps = document.querySelectorAll('.step-content');
    console.log('📝 Pasos encontrados:', allSteps.length);
    allSteps.forEach((step, index) => {
        step.classList.add('d-none');
        console.log(`📋 Ocultando paso ${index + 1}:`, step.id);
    });
    
    // Mostrar paso actual
    const currentStepElement = document.getElementById(`step${currentStep}`);
    console.log('🎯 Elemento del paso actual:', currentStepElement ? currentStepElement.id : 'NO ENCONTRADO');
    
    if (currentStepElement) {
        currentStepElement.classList.remove('d-none');
        console.log('✅ Paso mostrado:', currentStep);
    } else {
        console.error('❌ No se encontró el elemento step' + currentStep);
    }
    
    // Actualizar indicadores de pasos
    const indicators = document.querySelectorAll('.step-number');
    console.log('🔢 Indicadores encontrados:', indicators.length);
    indicators.forEach((indicator, index) => {
        indicator.classList.remove('active', 'completed');
        
        if (index + 1 < currentStep) {
            indicator.classList.add('completed');
            console.log(`✅ Indicador ${index + 1} marcado como completado`);
        } else if (index + 1 === currentStep) {
            indicator.classList.add('active');
            console.log(`🎯 Indicador ${index + 1} marcado como activo`);
        }
    });
    
    // Actualizar botones de navegación
    const btnBack = document.getElementById('btnBack');
    const btnNext = document.getElementById('btnNext');
    console.log('🔘 Botones encontrados - Back:', !!btnBack, 'Next:', !!btnNext);
    
    if (btnBack) {
        btnBack.style.display = currentStep > 1 ? 'inline-block' : 'none';
        console.log('⬅️ Botón Back:', currentStep > 1 ? 'visible' : 'oculto');
    }
    
    if (btnNext) {
        if (currentStep === 4) {
            btnNext.innerHTML = 'Finalizar Demo';
            btnNext.classList.add('btn-lg');
            console.log('🏁 Botón Next configurado para finalizar');
        } else {
            btnNext.innerHTML = 'Siguiente ';
            btnNext.classList.remove('btn-lg');
            console.log('➡️ Botón Next configurado para avanzar');
        }
    }
    
    // Rellenar datos demo según el paso
    console.log('📊 Llenando datos demo para paso:', currentStep);
    fillDemoData();
    console.log('🎉 updateModalStep() completada');
}

// Función para rellenar datos demo en cada paso
function fillDemoData() {
    console.log('📊 fillDemoData() para paso:', currentStep);
    
    if (currentStep === 2) {
        console.log('📅 Configurando paso 2 - Fecha y hora');
        
        // Paso 2: Fecha y hora - configurar fecha mínima
        const dateInput = document.getElementById('appointmentDate');
        const timeSelect = document.getElementById('appointmentTime');
        console.log('🔍 Elementos encontrados - Date:', !!dateInput, 'Time:', !!timeSelect);
        
        if (dateInput) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.min = tomorrow.toISOString().split('T')[0];
            dateInput.value = tomorrow.toISOString().split('T')[0];
            console.log('📅 Fecha configurada:', dateInput.value);
        }
        
        if (timeSelect) {
            timeSelect.innerHTML = `
                <option value="">Selecciona una hora</option>
                <option value="09:00">09:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="14:00">02:00 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="16:00">04:00 PM</option>
                <option value="17:00">05:00 PM</option>
            `;
            console.log('⏰ Horarios configurados');
        }
        
    } else if (currentStep === 3) {
        console.log('👤 Configurando paso 3 - Datos del cliente');
        
        // Paso 3: Datos del cliente - prellenar con datos demo
        const form = document.getElementById('clientForm');
        console.log('📝 Formulario encontrado:', !!form);
        
        if (form) {
            const clientName = document.getElementById('clientName');
            const clientId = document.getElementById('clientId');
            const email = document.getElementById('email');
            const phone = document.getElementById('phone');
            
            console.log('🔍 Campos encontrados:', { name: !!clientName, id: !!clientId, email: !!email, phone: !!phone });
            
            if (clientName) clientName.value = 'María García';
            if (clientId) clientId.value = '12345678';
            if (email) email.value = 'maria.garcia@email.com';
            if (phone) phone.value = '+57 300 123 4567';
            
            console.log('✅ Datos del cliente prellenados');
        }
        
    } else if (currentStep === 4) {
        console.log('📋 Configurando paso 4 - Resumen');
        
        // Paso 4: Resumen - mostrar toda la información
        updateConfirmationSummary();
    }
    
    console.log('✅ fillDemoData() completado');
}

// Función para actualizar el resumen de confirmación
function updateConfirmationSummary() {
    const container = document.getElementById('confirmationSummary');
    if (!container || !selectedService) return;
    
    const dateInput = document.getElementById('appointmentDate');
    const timeInput = document.getElementById('appointmentTime');
    const clientName = document.getElementById('clientName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    
    const selectedDate = dateInput ? dateInput.value : '';
    const selectedTime = timeInput ? timeInput.value : '';
    const formattedDate = selectedDate ? new Date(selectedDate).toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'No seleccionada';
    
    container.innerHTML = `
        <div class="mb-4">
            <h5 class="mb-3">
                <i class="fas fa-user me-2"></i>Información del Cliente
            </h5>
            <div class="summary-item">
                <span>Nombre:</span>
                <strong>${clientName}</strong>
            </div>
            <div class="summary-item">
                <span>Email:</span>
                <strong>${email}</strong>
            </div>
            <div class="summary-item">
                <span>Teléfono:</span>
                <strong>${phone}</strong>
            </div>
        </div>
        
        <div class="mb-4">
            <h5 class="mb-3">
                <i class="fas fa-spa me-2"></i>Detalles del Servicio
            </h5>
            <div class="summary-item">
                <span>Servicio:</span>
                <strong>${selectedService.name}</strong>
            </div>
            <div class="summary-item">
                <span>Precio:</span>
                <strong>$${selectedService.price.toLocaleString()}</strong>
            </div>
            <div class="summary-item">
                <span>Fecha:</span>
                <strong>${formattedDate}</strong>
            </div>
            <div class="summary-item">
                <span>Hora:</span>
                <strong>${selectedTime || 'No seleccionada'}</strong>
            </div>
        </div>
        
        <div class="alert alert-info">
            <i class="fas fa-info-circle me-2"></i>
            <strong>¡Esto es un demo!</strong> En la versión completa se procesaría el pago con MercadoPago.
        </div>
    `;
}

// Función para avanzar al siguiente paso
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < 4) {
            currentStep++;
            updateModalStep();
        } else {
            // Último paso - finalizar demo
            showToast('🎉 ¡Demo completado! En la versión real se procesaría el pago.', 'success');
            setTimeout(() => {
                closeModal();
            }, 2000);
        }
    }
}

// Función para retroceder al paso anterior
function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        updateModalStep();
    }
}

// Función para validar el paso actual (simplificada)
function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            if (!selectedService) {
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
            break;
            
        case 3:
            // Validación simplificada - solo verificar que los campos no estén vacíos
            const clientName = document.getElementById('clientName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            
            if (!clientName) {
                showToast('Por favor ingresa tu nombre completo', 'error');
                return false;
            }
            
            if (!email) {
                showToast('Por favor ingresa tu email', 'error');
                return false;
            }
            
            if (!phone) {
                showToast('Por favor ingresa tu teléfono', 'error');
                return false;
            }
            break;
    }
    
    return true;
}

// Función para cerrar el modal
function closeModal() {
    const modal = document.getElementById('reservaModal');
    if (modal) {
        if (typeof bootstrap !== 'undefined') {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
        } else {
            modal.style.display = 'none';
            modal.classList.remove('show');
            document.body.classList.remove('modal-open');
        }
    }
}

// Función de compatibilidad para los onclick inline antiguos
function selectService(serviceType) {
    console.log('🔗 selectService() llamada con:', serviceType);
    
    // Mapear tipos de servicio antiguos a los nuevos datos
    const serviceMap = {
        'corte': { id: 'corte-cabello', name: 'Corte de Cabello', price: 25000 },
        'manicure': { id: 'manicure', name: 'Manicure Clásica', price: 35000 },
        'facial': { id: 'facial', name: 'Limpieza Facial', price: 45000 },
        'spa': { id: 'spa', name: 'Spa Relajante', price: 80000 }
    };
    
    const serviceData = serviceMap[serviceType];
    if (serviceData) {
        console.log('📋 Mapeando a:', serviceData);
        selectServiceAndAdvance(serviceData.id, serviceData.name, serviceData.price);
    } else {
        console.error('❌ Tipo de servicio no encontrado:', serviceType);
    }
}

// Configurar eventos cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Booking App cargada correctamente');
    
    // Configurar botón de cerrar del modal
    const closeBtn = document.querySelector('#reservaModal .btn-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // Configurar botones de navegación del modal
    const btnNext = document.getElementById('btnNext');
    const btnBack = document.getElementById('btnBack');
    
    if (btnNext) {
        btnNext.addEventListener('click', function() {
            nextStep();
        });
    }
    
    if (btnBack) {
        btnBack.addEventListener('click', function() {
            previousStep();
        });
    }
    
    console.log('✅ Eventos configurados');
});

// Agregar estilos CSS adicionales para el resumen
const additionalStyles = `
    <style>
        .summary-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        
        .summary-item:last-child {
            border-bottom: none;
        }
        
        .summary-item span {
            color: #666;
            font-weight: 500;
        }
        
        .summary-item strong {
            color: #333;
            font-weight: 600;
        }
        
        .service-selection-card:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
    </style>
`;

// Insertar estilos adicionales en el head
document.head.insertAdjacentHTML('beforeend', additionalStyles); 