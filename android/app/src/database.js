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
      tx.executeSql('DELETE FROM tarefas');
      tarefas.forEach(tarefa => {
        tx.executeSql(
          'INSERT INTO tarefas (descricao, prazo, prioridade, concluido) VALUES (?, ?, ?, ?)',
          [tarefa.descricao, tarefa.prazo, tarefa.prioridade, tarefa.concluido ? 1 : 0]
        );
      });
    });
  };  

  
export { inicializarBancoDeDados, carregarTarefas, salvarTarefas };