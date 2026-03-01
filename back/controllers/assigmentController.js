const AssignmentModel = require('../model/assignmentModel');

exports.createAssignment = async (req, res) => {
    try {
        const { data, error } = await AssignmentModel.create(req.body);
        if (error) return res.status(400).json({ error: error.message });
        res.status(201).json({ message: "Tarea publicada", tarea: data[0] });
    } catch (err) {
        res.status(500).json({ error: "Error al crear tarea" });
    }
};

exports.getAssignmentsByClass = async (req, res) => {
    const { claseId } = req.params;
    const { data, error } = await AssignmentModel.getByClass(claseId);
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

exports.deleteAssignment = async (req, res) => {
    const { id } = req.params;
    const { error } = await AssignmentModel.delete(id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Tarea eliminada correctamente" });
};