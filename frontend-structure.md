# 🎨 Frontend Profesional - Beauty Center

## Estructura de Páginas Recomendada

### 1. **Landing Page Profesional**
```
/ (Página Principal)
├── Hero Section
│   ├── Logo + Slogan profesional
│   ├── CTA principal "Reservar Cita"
│   └── Teléfono de contacto destacado
├── Servicios Destacados
│   ├── Grid de servicios con precios
│   ├── Imágenes de alta calidad
│   └── Duración estimada
├── Proceso de Reserva (3 pasos)
├── Testimonios de clientes
├── Galería de trabajos
├── Información de contacto
└── Footer con redes sociales
```

### 2. **Sistema de Reservas**
```
/reservar
├── Paso 1: Selección de Servicio
│   ├── Cards con servicios disponibles
│   ├── Información detallada de cada servicio
│   └── Precios claramente visibles
├── Paso 2: Selección de Fecha y Hora
│   ├── Calendario interactivo
│   ├── Horarios disponibles en tiempo real
│   └── Validación de disponibilidad
├── Paso 3: Datos del Cliente
│   ├── Formulario con validación
│   ├── Campo de notas opcionales
│   └── Términos y condiciones
├── Paso 4: Confirmación
│   ├── Resumen de la reserva
│   ├── Información de pago
│   └── Botón de pago con MercadoPago
└── Paso 5: Pago y Confirmación
    ├── Procesamiento de pago
    ├── Descarga de comprobante
    └── SMS/Email de confirmación
```

### 3. **Panel de Administración**
```
/admin
├── Dashboard
│   ├── Métricas del día/semana/mes
│   ├── Ingresos y estadísticas
│   └── Próximas citas
├── Gestión de Citas
│   ├── Calendario de citas
│   ├── Detalles de cada reserva
│   ├── Marcar como completada
│   └── Gestión de cancelaciones
├── Reportes
│   ├── Ingresos por período
│   ├── Servicios más populares
│   └── Análisis de clientes
└── Configuración
    ├── Horarios de atención
    ├── Servicios y precios
    └── Información del negocio
```

## Tecnologías Frontend Recomendadas

### Opción 1: **React + Bootstrap (Profesional)**
- ✅ React 18 con hooks
- ✅ Bootstrap 5 + React-Bootstrap
- ✅ React Router para navegación
- ✅ Axios para API calls
- ✅ React-Toastify para notificaciones
- ✅ React-Calendar para selección de fechas
- ✅ Formik + Yup para formularios

### Opción 2: **HTML/JS Puro (Simplificado)**
- ✅ HTML5 + CSS3 + Vanilla JavaScript
- ✅ Bootstrap 5 CDN
- ✅ Fetch API para backend
- ✅ SweetAlert2 para alertas elegantes
- ✅ Flatpickr para selección de fechas

## Ejemplo de Landing Page HTML

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Beauty Center - Reserva tu Cita de Belleza</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --primary-color: #667eea;
            --secondary-color: #764ba2;
            --accent-color: #f093fb;
        }
        
        .hero-section {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
        }
        
        .service-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: none;
            border-radius: 15px;
            overflow: hidden;
        }
        
        .service-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.1);
        }
        
        .btn-primary-custom {
            background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
            border: none;
            border-radius: 30px;
            padding: 12px 30px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .btn-primary-custom:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white fixed-top shadow-sm">
        <div class="container">
            <a class="navbar-brand fw-bold" href="#">
                <i class="fas fa-spa text-primary me-2"></i>Beauty Center
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item"><a class="nav-link" href="#inicio">Inicio</a></li>
                    <li class="nav-item"><a class="nav-link" href="#servicios">Servicios</a></li>
                    <li class="nav-item"><a class="nav-link" href="#sobre-nosotros">Nosotros</a></li>
                    <li class="nav-item"><a class="nav-link" href="#contacto">Contacto</a></li>
                    <li class="nav-item">
                        <a class="btn btn-primary-custom text-white ms-2" href="#" id="btnReservar">
                            <i class="fas fa-calendar-alt me-2"></i>Reservar Cita
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="inicio" class="hero-section">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6">
                    <h1 class="display-4 fw-bold mb-4">
                        Tu belleza es nuestra 
                        <span class="text-warning">pasión</span>
                    </h1>
                    <p class="lead mb-4">
                        Experimenta el mejor cuidado de belleza con nuestros servicios profesionales. 
                        Reserva tu cita en línea de forma rápida y segura.
                    </p>
                    <div class="d-flex flex-wrap gap-3 mb-4">
                        <button class="btn btn-light btn-lg" id="btnReservarHero">
                            <i class="fas fa-calendar-check me-2"></i>Reservar Ahora
                        </button>
                        <a href="tel:+573001234567" class="btn btn-outline-light btn-lg">
                            <i class="fas fa-phone me-2"></i>Llamar Ahora
                        </a>
                    </div>
                    <div class="d-flex align-items-center">
                        <div class="me-4">
                            <i class="fas fa-star text-warning"></i>
                            <i class="fas fa-star text-warning"></i>
                            <i class="fas fa-star text-warning"></i>
                            <i class="fas fa-star text-warning"></i>
                            <i class="fas fa-star text-warning"></i>
                            <span class="ms-2">5.0 (120+ reseñas)</span>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6">
                    <img src="https://via.placeholder.com/600x500/667eea/ffffff?text=Beauty+Center" 
                         alt="Beauty Center" class="img-fluid rounded-3 shadow-lg">
                </div>
            </div>
        </div>
    </section>

    <!-- Servicios Section -->
    <section id="servicios" class="py-5 bg-light">
        <div class="container">
            <div class="text-center mb-5">
                <h2 class="display-5 fw-bold mb-3">Nuestros Servicios</h2>
                <p class="lead text-muted">Descubre nuestra amplia gama de servicios de belleza</p>
            </div>
            
            <div class="row g-4" id="serviciosContainer">
                <!-- Los servicios se cargarán dinámicamente desde la API -->
            </div>
        </div>
    </section>

    <!-- Modal de Reserva -->
    <div class="modal fade" id="reservaModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-calendar-alt me-2"></i>Reservar Cita
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div id="reservaFormContainer">
                        <!-- Formulario de reserva se carga aquí -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
        // Configuración de la API
        const API_BASE_URL = 'http://localhost:3000';
        
        // Cargar servicios al inicio
        document.addEventListener('DOMContentLoaded', async function() {
            await cargarServicios();
            configurarEventos();
        });

        async function cargarServicios() {
            try {
                const response = await fetch(`${API_BASE_URL}/bookings/services`);
                const data = await response.json();
                
                if (data.success) {
                    mostrarServicios(data.data);
                }
            } catch (error) {
                console.error('Error cargando servicios:', error);
            }
        }

        function mostrarServicios(servicios) {
            const container = document.getElementById('serviciosContainer');
            
            container.innerHTML = servicios.map(servicio => `
                <div class="col-md-6 col-lg-4">
                    <div class="card service-card h-100">
                        <div class="card-body text-center p-4">
                            <div class="mb-3">
                                <i class="fas fa-spa fa-3x text-primary"></i>
                            </div>
                            <h5 class="card-title fw-bold">${servicio.name}</h5>
                            <p class="card-text text-muted">${servicio.description}</p>
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="badge bg-primary rounded-pill">
                                    <i class="fas fa-clock me-1"></i>${servicio.duration} min
                                </span>
                                <span class="h5 text-primary fw-bold mb-0">
                                    $${servicio.price.toLocaleString()}
                                </span>
                            </div>
                            <button class="btn btn-primary-custom w-100" 
                                    onclick="iniciarReserva('${servicio.id}', '${servicio.name}', ${servicio.price})">
                                <i class="fas fa-calendar-plus me-2"></i>Reservar
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function configurarEventos() {
            // Botones de reserva
            document.getElementById('btnReservar').addEventListener('click', () => {
                document.getElementById('reservaModal').querySelector('.modal-body').scrollIntoView();
                new bootstrap.Modal(document.getElementById('reservaModal')).show();
            });

            document.getElementById('btnReservarHero').addEventListener('click', () => {
                document.getElementById('servicios').scrollIntoView({ behavior: 'smooth' });
            });
        }

        async function iniciarReserva(serviceId, serviceName, price) {
            // Mostrar modal de reserva con el servicio seleccionado
            const modal = new bootstrap.Modal(document.getElementById('reservaModal'));
            
            // Cargar formulario de reserva
            const formContainer = document.getElementById('reservaFormContainer');
            formContainer.innerHTML = await generarFormularioReserva(serviceId, serviceName, price);
            
            modal.show();
        }

        async function generarFormularioReserva(serviceId, serviceName, price) {
            return `
                <form id="reservaForm" class="needs-validation" novalidate>
                    <div class="row">
                        <div class="col-12 mb-3">
                            <div class="alert alert-info">
                                <strong><i class="fas fa-spa me-2"></i>${serviceName}</strong><br>
                                Precio: <strong>$${price.toLocaleString()}</strong>
                            </div>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Nombre Completo *</label>
                            <input type="text" class="form-control" name="clientName" required>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Cédula *</label>
                            <input type="text" class="form-control" name="clientId" required>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Email *</label>
                            <input type="email" class="form-control" name="email" required>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Teléfono *</label>
                            <input type="tel" class="form-control" name="phone" required>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Fecha *</label>
                            <input type="date" class="form-control" name="appointmentDate" 
                                   min="${new Date().toISOString().split('T')[0]}" required>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Hora *</label>
                            <select class="form-select" name="appointmentTime" required>
                                <option value="">Selecciona una fecha primero</option>
                            </select>
                        </div>
                        
                        <div class="col-12 mb-3">
                            <label class="form-label">Notas (Opcional)</label>
                            <textarea class="form-control" name="notes" rows="3" 
                                      placeholder="Cualquier comentario especial..."></textarea>
                        </div>
                        
                        <div class="col-12">
                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" name="terms" required>
                                <label class="form-check-label">
                                    Acepto los términos y condiciones
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <input type="hidden" name="serviceType" value="${serviceId}">
                    
                    <div class="d-grid">
                        <button type="submit" class="btn btn-primary-custom btn-lg">
                            <i class="fas fa-credit-card me-2"></i>Continuar al Pago
                        </button>
                    </div>
                </form>
            `;
        }

        // Manejar envío del formulario de reserva
        document.addEventListener('submit', async function(e) {
            if (e.target.id === 'reservaForm') {
                e.preventDefault();
                
                const formData = new FormData(e.target);
                const bookingData = Object.fromEntries(formData);
                
                try {
                    // Mostrar loading
                    Swal.fire({
                        title: 'Procesando...',
                        text: 'Creando tu reserva',
                        allowOutsideClick: false,
                        didOpen: () => Swal.showLoading()
                    });
                    
                    const response = await fetch(`${API_BASE_URL}/bookings`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(bookingData)
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        // Cerrar modal y redirigir a pago
                        bootstrap.Modal.getInstance(document.getElementById('reservaModal')).hide();
                        
                        Swal.fire({
                            icon: 'success',
                            title: '¡Reserva Creada!',
                            text: `Tu código de reserva es: ${result.data.booking.reservationCode}`,
                            showCancelButton: true,
                            confirmButtonText: 'Ir a Pagar',
                            cancelButtonText: 'Pagar Después'
                        }).then((decision) => {
                            if (decision.isConfirmed) {
                                window.open(result.data.paymentUrl, '_blank');
                            }
                        });
                    } else {
                        throw new Error(result.message || 'Error al crear la reserva');
                    }
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.message
                    });
                }
            }
        });

        // Cargar horarios disponibles cuando se selecciona fecha
        document.addEventListener('change', async function(e) {
            if (e.target.name === 'appointmentDate') {
                const form = e.target.closest('form');
                const serviceId = form.querySelector('[name="serviceType"]').value;
                const date = e.target.value;
                const timeSelect = form.querySelector('[name="appointmentTime"]');
                
                if (date && serviceId) {
                    try {
                        const response = await fetch(`${API_BASE_URL}/bookings/available-slots/${serviceId}/${date}`);
                        const data = await response.json();
                        
                        if (data.success) {
                            timeSelect.innerHTML = '<option value="">Selecciona una hora</option>';
                            data.data.availableSlots.forEach(slot => {
                                timeSelect.innerHTML += `<option value="${slot}">${slot}</option>`;
                            });
                            
                            if (data.data.availableSlots.length === 0) {
                                timeSelect.innerHTML = '<option value="">No hay horarios disponibles</option>';
                            }
                        }
                    } catch (error) {
                        console.error('Error cargando horarios:', error);
                    }
                }
            }
        });
    </script>
</body>
</html>
```

## 4. **Funcionalidades de Negocio Adicionales**

### **Sistema de Fidelización:**
- 🎯 Programa de puntos por servicios
- 🎁 Descuentos por referidos
- 📱 App móvil para clientes frecuentes

### **Marketing Digital:**
- 📧 Email marketing automatizado
- 📱 Integración con redes sociales
- 🔔 Push notifications
- 📊 Analytics de comportamiento

### **Expansión del Negocio:**
- 👥 Sistema multi-usuario (varios profesionales)
- 🏢 Múltiples sucursales
- 📦 Venta de productos complementarios
- 🎓 Sistema de capacitación online 