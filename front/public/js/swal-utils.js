
/**
 * Muestra un error
 * @param {string} title - Título del error
 * @param {string} message - Mensaje del error
 */
function showError(title = 'Error', message = 'Ha ocurrido un error') {
    return Swal.fire({
        icon: 'error',
        title: title,
        text: message,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Aceptar'
    });
}

/**
 * Muestra un éxito
 * @param {string} title - Título del éxito
 * @param {string} message - Mensaje del éxito
 */
function showSuccess(title = 'Éxito', message = 'Operación realizada correctamente') {
    return Swal.fire({
        icon: 'success',
        title: title,
        text: message,
        confirmButtonColor: '#28a745',
        confirmButtonText: 'Aceptar',
        timer: 2000
    });
}

/**
 * Muestra una advertencia
 * @param {string} title - Título de la advertencia
 * @param {string} message - Mensaje de la advertencia
 */
function showWarning(title = 'Advertencia', message = 'Por favor, verifica tu información') {
    return Swal.fire({
        icon: 'warning',
        title: title,
        text: message,
        confirmButtonColor: '#ffc107',
        confirmButtonText: 'Aceptar'
    });
}

/**
 * Muestra información
 * @param {string} title - Título de la información
 * @param {string} message - Mensaje de información
 */
function showInfo(title = 'Información', message = 'Información importante') {
    return Swal.fire({
        icon: 'info',
        title: title,
        text: message,
        confirmButtonColor: '#17a2b8',
        confirmButtonText: 'Aceptar'
    });
}

/**
 * Muestra una confirmación
 * @param {string} title - Título de la confirmación
 * @param {string} message - Mensaje de confirmación
 * @param {string} confirmText - Texto del botón confirmar
 * @param {string} cancelText - Texto del botón cancelar
 */
function showConfirm(title = '¿Está seguro?', message = '', confirmText = 'Sí, continuar', cancelText = 'Cancelar') {
    return Swal.fire({
        icon: 'question',
        title: title,
        text: message,
        showCancelButton: true,
        confirmButtonColor: '#007bff',
        cancelButtonColor: '#6c757d',
        confirmButtonText: confirmText,
        cancelButtonText: cancelText
    });
}

/**
 * Muestra un loading
 * @param {string} title - Título del loading
 * @param {string} message - Mensaje durante la carga
 */
function showLoading(title = 'Cargando...', message = 'Por favor espere') {
    return Swal.fire({
        title: title,
        text: message,
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: (modal) => {
            Swal.showLoading();
        }
    });
}

/**
 * Valida que un campo no esté vacío
 * @param {string} value - Valor del campo
 * @param {string} fieldName - Nombre del campo para mostrar en el mensaje
 */
function validateNotEmpty(value, fieldName = 'Este campo') {
    if (!value || value.trim() === '') {
        showError('Campo requerido', `${fieldName} es obligatorio`);
        return false;
    }
    return true;
}

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Email inválido', 'Por favor ingresa un email válido');
        return false;
    }
    return true;
}

/**
 * Valida contraseña fuerte
 * @param {string} password - Contraseña a validar
 */
function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        showError('Contraseña débil', 
            'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
        return false;
    }
    return true;
}

/**
 * Valida que un archivo sea del tipo especificado
 * @param {File} file - Archivo a validar
 * @param {Array} allowedTypes - Tipos MIME permitidos (ej: ['application/pdf', 'image/jpeg'])
 */
function validateFileType(file, allowedTypes = []) {
    if (!file) return true;
    
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        showError('Tipo de archivo no válido', 
            `Solo se permiten archivos: ${allowedTypes.join(', ')}`);
        return false;
    }
    return true;
}

/**
 * Valida el tamaño de un archivo (en MB)
 * @param {File} file - Archivo a validar
 * @param {number} maxSizeMB - Tamaño máximo en MB
 */
function validateFileSize(file, maxSizeMB = 10) {
    if (!file) return true;
    
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        showError('Archivo muy grande', 
            `El archivo no debe exceder ${maxSizeMB}MB. Tu archivo pesa ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        return false;
    }
    return true;
}

/**
 * Valida que un número esté en un rango
 * @param {number} value - Valor a validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @param {string} fieldName - Nombre del campo
 */
function validateRange(value, min = 0, max = 100, fieldName = 'Este valor') {
    const num = parseFloat(value);
    if (isNaN(num) || num < min || num > max) {
        showError('Valor inválido', 
            `${fieldName} debe estar entre ${min} y ${max}`);
        return false;
    }
    return true;
}

/**
 * Valida que una fecha sea válida y futura
 * @param {string} dateString - Fecha en formato YYYY-MM-DD o YYYY-MM-DDTHH:mm
 * @param {boolean} mustBeFuture - Si debe ser fecha futura
 */
function validateDate(dateString, mustBeFuture = true) {
    if (!dateString) {
        showError('Fecha requerida', 'Por favor selecciona una fecha y hora');
        return false;
    }
    

    const [dateOnly, timeOnly] = dateString.split('T');
    const [year, month, day] = dateOnly.split('-');
    const [hours, minutes] = timeOnly.split(':');
    const selectedDate = new Date(year, month - 1, day, hours, minutes, 0);
    const now = new Date();
    
    if (mustBeFuture && selectedDate <= now) {
        showError('Fecha inválida', 'La fecha y hora de entrega debe ser posterior a la actual');
        return false;
    }
    
    return true;
}

/**
 * Muestra una alerta con HTML personalizado
 * @param {string} title - Título
 * @param {string} htmlContent - Contenido HTML
 * @param {string} icon - Icono (success, error, warning, info, question)
 */
function showCustomAlert(title, htmlContent, icon = 'info') {
    return Swal.fire({
        icon: icon,
        title: title,
        html: htmlContent,
        confirmButtonColor: '#007bff',
        confirmButtonText: 'Aceptar'
    });
}
