import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, Modal } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import moment from 'moment';
import { LogBox } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { inicializarBancoDeDados, getAllTransactions, salvarTarefas } from './database';
import styles from './styles/TaskManagerStyle';

const db = SQLite.openDatabase({ name: 'tarefas.db', location: 'default' });

const App = () => {
  const [descricao, setDescricao] = useState('');
  const [prazo, setPrazo] = useState(new Date());
  const [prioridade, setPrioridade] = useState('');
  const [tarefas, setTarefas] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);  
  const [editarModo, setEditarModo] = useState(false);
  const [idTarefaEditando, setIdTarefaEditando] = useState(null);  
  const [edicaoRealizada, setEdicaoRealizada] = useState(false);  
  const [databaseInitialized, setDatabaseInitialized] = useState(false);

  const inicializarBancoDeDados = () => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS tarefas (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT, prazo TEXT, prioridade TEXT, concluido INTEGER)',
          [],
          () => {
            console.log('Banco de dados inicializado com sucesso.');
            resolve();
          },
          (_, error) => {
            console.error('Erro ao inicializar o banco de dados:', error);
            reject(error);
          }
        );
      });
    });
  };  

  useEffect(() => {
    inicializarBancoDeDados()
      .then(() => {
        setDatabaseInitialized(true);
        carregarTarefas();
      })
      .catch(error => {
        console.error('Erro ao inicializar o banco de dados:', error);
      });
  }, []); 

  useEffect(() => {
    if (edicaoRealizada) {
      salvarTarefasNoBancoDeDados(tarefas);
      mostrarAlerta('Tarefa editada com sucesso!');
      setEdicaoRealizada(false);
    }
  }, [edicaoRealizada]);

  const carregarTarefas = async () => {
    try {
      const tarefasFromDB = await getAllTransactions();
      setTarefas(tarefasFromDB);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    }
  };
  
  const salvarTarefasNoBancoDeDados = (tarefas) => {
    db.transaction((tx) => {
        tarefas.forEach(tarefa => {
            const { id, descricao, prazo, prioridade, concluido } = tarefa;
            const prazoString = JSON.stringify(prazo);  
            const concluidoInt = concluido ? 1 : 0;
            if (id) {          
                tx.executeSql(
                    'UPDATE tarefas SET descricao=?, prazo=?, prioridade=?, concluido=? WHERE id=?',
                    [descricao, prazoString, prioridade, concluidoInt, id], 
                    () => console.log('Tarefa atualizada no banco de dados:', tarefa),
                    (tx, error) => console.error('Erro ao atualizar tarefa no banco de dados:', error)
                );
            } else {          
                tx.executeSql(
                    'INSERT INTO tarefas (descricao, prazo, prioridade, concluido) VALUES (?, ?, ?, ?)',
                    [descricao, prazoString, prioridade, concluidoInt], 
                    () => console.log('Tarefa inserida no banco de dados:', tarefa),
                    (tx, error) => console.error('Erro ao inserir tarefa no banco de dados:', error)
                );
            }
        });
    });
};  

  const HandleAdicionarTarefa = () => {
    if (descricao && prazo && prioridade && databaseInitialized) {
      const novaTarefa = { descricao, prazo, prioridade, completed: false }; 
      const tarefasAtualizadas = [...(tarefas || []), novaTarefa]; 
      setTarefas(tarefasAtualizadas);
      salvarTarefas(tarefasAtualizadas);
      salvarTarefasNoBancoDeDados(tarefasAtualizadas);
      setDescricao('');
      setPrioridade('');
      mostrarAlerta('Tarefa adicionada com sucesso!');
    } else {
      mostrarAlerta('Por favor, preencha todos os campos.');
    }
  };  

  const HandleDeletarTarefa = (idTarefa) => {
    const tarefasAtualizadas = tarefas.filter(tarefa => tarefa.id !== idTarefa);
    setTarefas(tarefasAtualizadas);
    salvarTarefasNoBancoDeDados(tarefasAtualizadas);
    mostrarAlerta('Tarefa excluída  sucesso!');
  };

  const HandleEditarTarefa = (idTarefa) => {  
    const tarefaEditar = tarefas.find(tarefa => tarefa.id === idTarefa);
      
    if (!tarefaEditar) {
      mostrarAlerta('Tarefa não encontrada para edição.');
      return;
    }
        
    setEditarModo(true);
    setIdTarefaEditando(idTarefa);
        
    setDescricao(tarefaEditar.descricao);
    setPrazo(new Date(tarefaEditar.prazo));
    setPrioridade(tarefaEditar.prioridade);
  };  

  const HandleSalvarEdicao = () => {
    if (descricao && prazo && prioridade) {      
      const tarefasAtualizadas = tarefas.map(tarefa => {
        if (tarefa.id === idTarefaEditando) {
          return { ...tarefa, descricao, prazo, prioridade };
        }
        return tarefa;
      });
        
      setTarefas(tarefasAtualizadas);    
      setEdicaoRealizada(true);
        
      setEditarModo(false);
      setIdTarefaEditando(null);
      setDescricao('');
      setPrioridade('');

      salvarTarefas(tarefasAtualizadas);
    } else {
      mostrarAlerta('Por favor, preencha todos os campos.');
    }
  }; 

  const botaoSalvarEdicao = (
    <Button title="Salvar Edição" onPress={HandleSalvarEdicao} />
  );  

  const HandleContinuarTarefa = (idTarefa) => {
    const tarefasAtualizadas = tarefas.map(tarefa => {
      if (tarefa.id === idTarefa) {
        return { ...tarefa, completed: false };
      }
      return tarefa;
    });
    setTarefas(tarefasAtualizadas);    
    mostrarAlerta('Tarefa continuada  sucesso!');
  };

  const HandleFinalizarTarefa = (idTarefa) => {
    const tarefasAtualizadas = tarefas.map(tarefa => {
      if (tarefa.id === idTarefa) {
        return { ...tarefa, completed: true };
      }
      return tarefa;
    });
    setTarefas(tarefasAtualizadas);
    salvarTarefasNoBancoDeDados(tarefasAtualizadas);
    mostrarAlerta('Tarefa finalizada  sucesso!');
  };  

  const mostrarAlerta = (mensagem) => {
    Alert.alert('Alerta', mensagem);
  };

  const mostrarSelecionadorDeData = () => {
    setMostrarModal(true);
  };

  const esconderSelecionadorDeData = () => {
    setMostrarModal(false);
  };

  const HandleMudancaDeData = (data) => {
    setPrazo(data);
    esconderSelecionadorDeData();
  };

  LogBox.ignoreAllLogs();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Tarefas</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Descrição"
          value={descricao}
          onChangeText={setDescricao}
        />
        <Button title="Selecionar Prazo" onPress={mostrarSelecionadorDeData} />
        <Modal
          animationType="slide"
          transparent={true}
          visible={mostrarModal}
          onRequestClose={esconderSelecionadorDeData}
        >
          <View style={styles.containerModal}>
            <Calendar
              current={moment(prazo).format('YYYY-MM-DD')} 
              onDayPress={(dia) => HandleMudancaDeData(dia.dateString)}
            />
            <Button title="Cancelar" onPress={esconderSelecionadorDeData} />
          </View>
        </Modal>
        <TextInput
          style={styles.input}
          placeholder="Prioridade"
          value={prioridade}
          onChangeText={setPrioridade}
          keyboardType="numeric"
        />        
        {!editarModo && (
          <Button title="Adicionar Tarefa" onPress={HandleAdicionarTarefa} />
        )}
      </View> 
      <FlatList
        data={tarefas}
        keyExtractor={(item, index) => (item && item.id ? item.id.toString() : index.toString())}
        renderItem={({ item }) => (
          <View style={[styles.taskContainer, item.completed && styles.completedTask]}>
            <View>
              <Text style={styles.taskDescription}>Descrição: {item.descricao}</Text>
              <Text style={[styles.taskDescription ]}>Data: {moment(item.prazo).format('DD/MM/YYYY')}</Text>
              <Text style={[styles.taskDescription ]}>Prioridade: {item.prioridade}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <Button title="Excluir" onPress={() => HandleDeletarTarefa(item.id)} />   
              {!editarModo && <Button title="Editar" onPress={() => HandleEditarTarefa(item.id)} />}
              {editarModo && botaoSalvarEdicao}                   
              {!item.completed ? (            
                <Button title="Finalizar" onPress={() => HandleFinalizarTarefa(item.id)} />  
              ) : (          
                <Button title="Continuar" onPress={() => HandleContinuarTarefa(item.id)} />           
              )}        
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default App;