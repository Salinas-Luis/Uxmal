const express = require('express');
const router = express.Router();
const unitsController = require('../controllers/unitsController');

// Crear una nueva unidad
router.post('/', unitsController.createUnit);

// Obtener unidades por clase
router.get('/class/:claseId', unitsController.getUnitsByClass);

// Actualizar una unidad
router.put('/:id', unitsController.updateUnit);

// Eliminar una unidad
router.delete('/:id', unitsController.deleteUnit);

module.exports = router;
