const express = require('express');
const router = express.Router();
const tarefaController = require('../controllers/tarefaController');

router.get('/', tarefaController.listarTarefas);
router.post('/incluir', tarefaController.incluirTarefa);
router.put('/editar/:id', tarefaController.editarTarefa);
router.delete('/excluir/:id', tarefaController.excluirTarefa);
router.patch('/reordenar', tarefaController.reordenarTarefas);

module.exports = router;
