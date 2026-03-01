const PostModel = require('../model/postModel');

exports.createPost = async (req, res) => {
    try {
        const { data, error } = await PostModel.create(req.body);
        if (error) return res.status(400).json({ error: error.message });
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(500).json({ error: "Error al publicar aviso" });
    }
};

exports.getPostsByClass = async (req, res) => {
    const { claseId } = req.params;
    const { data, error } = await PostModel.getByClass(claseId);
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};