import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({ name: 'tarefas.db', location: 'default' });

const inicializarBancoDeDados = () => {
  db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tarefas (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT, prazo TEXT, prioridade TEXT, concluido INTEGER)',
      [],
      () => {
        console.log('Banco de dados inicializado com sucesso.');
      },
      (_, error) => {
        console.error('Erro ao inicializar o banco de dados:', error);
      }
    );
  });
};

const carregarTarefas = (setTarefas) => {
  db.transaction((tx) => {
    tx.executeSql(
      'SELECT * FROM tarefas',
      [],
      (_, { rows }) => {
        const dadosTarefas = rows.raw();
        console.log('Tarefas carregadas:', dadosTarefas);
        setTarefas(dadosTarefas);
      },
      (_, error) => {
        console.error('Erro ao carregar tarefas:', error);
      }
    );
  });
};

const salvarTarefas = (tarefas) => {
  db.transaction((tx) => {
    tarefas.forEach(tarefa => {
      const { id, descricao, prazo, prioridade, concluido } = tarefa;
      const concluidoInt = concluido ? 1 : 0;
      if (id) {        
        tx.executeSql(
          'UPDATE tarefas SET descricao=?, prazo=?, prioridade=?, concluido=? WHERE id=?',
          [descricao, prazo, prioridade, concluidoInt, id],
          () => console.log('Tarefa atualizada no banco de dados:', tarefa),
          (tx, error) => console.error('Erro ao atualizar tarefa no banco de dados:', error)
        );
      } else {        
        tx.executeSql(
          'INSERT INTO tarefas (descricao, prazo, prioridade, concluido) VALUES (?, ?, ?, ?)',
          [descricao, prazo, prioridade, concluidoInt],
          () => console.log('Tarefa inserida no banco de dados:', tarefa),
          (tx, error) => console.error('Erro ao inserir tarefa no banco de dados:', error)
        );
      }
    });
  });
};


export { inicializarBancoDeDados, carregarTarefas, salvarTarefas };