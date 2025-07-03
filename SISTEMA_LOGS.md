# Sistema de Logs Avanzado - Booking App

## ¿Qué añadí?

He implementado un sistema de logs completo que te permitirá ver exactamente qué está pasando en tu aplicación en tiempo real.

## Características del Sistema de Logs

### 1. **Logs con Colores en Consola**
- **ERROR**: Rojo y negrita
- **WARN**: Naranja y negrita  
- **INFO**: Azul y negrita
- **DEBUG**: Gris

### 2. **Guardado Automático**
- Logs guardados en localStorage del navegador
- Logs críticos enviados automáticamente al servidor
- Historial de los últimos 100 logs

### 3. **Información Detallada**
Cada log incluye:
- Timestamp exacto
- Nivel de log
- Mensaje descriptivo
- Datos adicionales (si los hay)
- URL actual
- User Agent

## Cómo Usar los Logs

### **En la Consola del Navegador:**
```javascript
// Logs básicos
Logger.info('La aplicación se está cargando');
Logger.warn('Advertencia: modo demo activado');
Logger.error('Error conectando con el servidor');
Logger.debug('Detalles técnicos para debugging');

// Logs con datos adicionales
Logger.info('Usuario seleccionó servicio', { 
    serviceId: 'corte-cabello', 
    price: 25000 
});

// Ver todos los logs guardados
Logger.getLogs();

// Limpiar logs
Logger.clearLogs();
```

### **Lo que Verás en la Aplicación:**
1. **Abre la consola del navegador** (F12)
2. **Carga la aplicación** - verás logs de inicialización
3. **Abre el modal** - verás logs del proceso
4. **Selecciona un servicio** - verás logs de la selección
5. **Prueba diferentes acciones** - cada una está logueada

## Logs Automáticos Implementados

### **Al Cargar la Aplicación:**
- Inicialización del sistema
- Carga de configuración
- Estado de conexión con backend

### **Al Usar el Modal:**
- Apertura/cierre del modal
- Carga de servicios
- Selección de servicios
- Errores de UI

### **Al Conectar con Backend:**
- Requests HTTP con detalles
- Respuestas del servidor
- Errores de conexión
- Reintentos automáticos

### **Al Procesar Pagos:**
- Creación de preferencias
- Redirección a MercadoPago
- Verificación de pagos
- Estados de transacción

## Debugging en Tiempo Real

### **Ver Estado Actual:**
```javascript
// En consola del navegador
AppState.getState();
```

### **Monitorear Errores:**
```javascript
// Ver errores acumulados
AppState.errors;

// Limpiar errores
AppState.clearErrors();
```

### **Seguimiento de Variables:**
```javascript
// El sistema logueará automáticamente cuando cambien:
AppState.selectedService;
AppState.selectedDate;
AppState.selectedTime;
AppState.clientData;
```

## Logs del Servidor

### **Backend Recibe Logs:**
- Los logs críticos se envían automáticamente al servidor
- El servidor los muestra en consola con el prefijo "Frontend Log:"
- Puedes verlos en la terminal donde ejecutas npm run start:dev

### **Ejemplo de Log del Servidor:**
```
Frontend Log: {
  timestamp: '2024-12-11T10:30:00.000Z',
  level: 'ERROR',
  message: 'Error conectando con el servidor',
  url: 'http://localhost:3000',
  data: { status: 500, endpoint: '/bookings/services' }
}
```

## Comandos Útiles para Debugging

### **En la Consola del Navegador:**
```javascript
// Ver logs de las últimas 2 horas
Logger.getLogs().filter(log => 
    new Date(log.timestamp) > new Date(Date.now() - 2*60*60*1000)
);

// Ver solo errores
Logger.getLogs().filter(log => log.level === 'ERROR');

// Exportar logs para análisis
JSON.stringify(Logger.getLogs(), null, 2);

// Cambiar nivel de logging (0=ERROR, 1=WARN, 2=INFO, 3=DEBUG)
Logger.currentLevel = 2; // Solo INFO y más críticos
```

## Identificar Problemas Comunes

### **Si el Modal No Abre:**
1. Abre consola y busca errores rojos
2. Verifica que Bootstrap esté cargado
3. Revisa si el elemento modal existe

### **Si No Se Conecta al Backend:**
1. Verifica que el servidor esté corriendo
2. Revisa logs de requests HTTP
3. Confirma que las URLs sean correctas

### **Si MercadoPago Falla:**
1. Verifica que la public key esté configurada
2. Revisa logs de creación de preferencias
3. Confirma que el monto sea válido

## Próximos Pasos

Con este sistema de logs podrás:
1. **Identificar problemas rápidamente** cuando conectemos el frontend al backend
2. **Monitorear el flujo de datos** en tiempo real
3. **Depurar errores** con información detallada
4. **Optimizar el rendimiento** viendo qué tarda más

¡Ahora tienes visibilidad completa de lo que pasa en tu aplicación! 