const db = require('../config/db');

exports.listarTarefas = (req, res) => {
    db.query('SELECT * FROM Tarefas ORDER BY Ordem_Apresentacao', (err, results) => {
        if (err) throw err;
        res.render('tarefas', { tarefas: results, error: '' });
    });
};

exports.incluirTarefa = (req, res) => {
    const { Nome_Tarefa, Custo, Data_Limite } = req.body;

    const checkDuplicateQuery = 'SELECT COUNT(*) AS count FROM Tarefas WHERE Nome_Tarefa = ?';
    db.query(checkDuplicateQuery, [Nome_Tarefa], (err, results) => {
        if (err) throw err;

        if (results[0].count > 0) {
            return res.status(400).json({ error: 'Tarefa com o mesmo nome já existe.' });
        }

        const getMaxOrderQuery = 'SELECT IFNULL(MAX(Ordem_Apresentacao), 0) + 1 AS NovaOrdem FROM Tarefas';
        db.query(getMaxOrderQuery, (err, results) => {
            if (err) throw err;

            const NovaOrdem = results[0].NovaOrdem;
            const insertQuery = 'INSERT INTO Tarefas (Nome_Tarefa, Custo, Data_Limite, Ordem_Apresentacao) VALUES (?, ?, ?, ?)';

            db.query(insertQuery, [Nome_Tarefa, Custo, Data_Limite, NovaOrdem], (err, results) => {
                if (err) throw err;
                res.status(200).json({ success: 'Tarefa incluída com sucesso.' });
            });
        });
    });
};




exports.editarTarefa = (req, res) => {
    const { id } = req.params;
    const { Nome_Tarefa, Custo, Data_Limite } = req.body;

    const checkDuplicateQuery = 'SELECT COUNT(*) AS count FROM Tarefas WHERE Nome_Tarefa = ? AND ID_Tarefa != ?';
    db.query(checkDuplicateQuery, [Nome_Tarefa, id], (err, results) => {
        if (err) throw err;

        if (results[0].count > 0) {
            return res.render('tarefas', { tarefas: [], error: 'Tarefa com o mesmo nome já existe.' });
        }

        const updateQuery = 'UPDATE Tarefas SET Nome_Tarefa = ?, Custo = ?, Data_Limite = ? WHERE ID_Tarefa = ?';
        db.query(updateQuery, [Nome_Tarefa, Custo, Data_Limite, id], (err, results) => {
            if (err) throw err;
            res.redirect('/');
        });
    });
};


exports.excluirTarefa = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM Tarefas WHERE ID_Tarefa = ?', [id], (err, results) => {
        if (err) throw err;
        res.redirect('/');
    });
};

exports.reordenarTarefas = async (req, res) => {
    const { ordem } = req.body; // 'ordem' é um array de IDs de tarefas na nova ordem
    if (!ordem) {
        return res.status(400).send('Ordem não fornecida');
    }

    try {
        // Iniciar a transação
        await new Promise((resolve, reject) => {
            db.query('START TRANSACTION', (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        // Etapa 1: Atualizar cada tarefa com uma ordem temporária
        for (let index = 0; index < ordem.length; index++) {
            const id = ordem[index];
            await new Promise((resolve, reject) => {
                db.query('UPDATE Tarefas SET Ordem_Apresentacao = ? WHERE ID_Tarefa = ?', [index + 100, id], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });
        }

        // Etapa 2: Atualizar cada tarefa com a nova ordem correta
        for (let index = 0; index < ordem.length; index++) {
            const id = ordem[index];
            await new Promise((resolve, reject) => {
                db.query('UPDATE Tarefas SET Ordem_Apresentacao = ? WHERE ID_Tarefa = ?', [index + 1, id], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });
        }

        // Commit a transação
        await new Promise((resolve, reject) => {
            db.query('COMMIT', (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        res.status(200).send('Ordem atualizada com sucesso');
    } catch (err) {
        // Rollback em caso de erro
        await new Promise((resolve, reject) => {
            db.query('ROLLBACK', (rollbackErr) => {
                if (rollbackErr) return reject(rollbackErr);
                resolve();
            });
        });
        res.status(500).send('Erro ao atualizar a ordem');
    }
};