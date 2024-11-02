const db = require('../config/db');

exports.listarTarefas = (req, res) => {
    db.query('SELECT * FROM Tarefas ORDER BY Ordem_Apresentacao', (err, results) => {
        if (err) throw err;
        res.render('tarefas', { tarefas: results });
    });
};

exports.incluirTarefa = (req, res) => {
    const { Nome_Tarefa, Custo, Data_Limite } = req.body;
    const query = 'INSERT INTO Tarefas (Nome_Tarefa, Custo, Data_Limite, Ordem_Apresentacao) VALUES (?, ?, ?, (SELECT IFNULL(MAX(Ordem_Apresentacao), 0) + 1 FROM Tarefas))';
    db.query(query, [Nome_Tarefa, Custo, Data_Limite], (err, results) => {
        if (err) throw err;
        res.redirect('/');
    });
};

exports.editarTarefa = (req, res) => {
    const { id } = req.params;
    const { Nome_Tarefa, Custo, Data_Limite } = req.body;
    const query = 'UPDATE Tarefas SET Nome_Tarefa = ?, Custo = ?, Data_Limite = ? WHERE ID_Tarefa = ?';
    db.query(query, [Nome_Tarefa, Custo, Data_Limite, id], (err, results) => {
        if (err) throw err;
        res.redirect('/');
    });
};

exports.excluirTarefa = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM Tarefas WHERE ID_Tarefa = ?', [id], (err, results) => {
        if (err) throw err;
        res.redirect('/');
    });
};

exports.reordenarTarefas = (req, res) => {
    // Lógica para reordenar as tarefas
    res.redirect('/');
};
