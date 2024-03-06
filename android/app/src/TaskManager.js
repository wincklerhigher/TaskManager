import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, Modal } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import moment from 'moment';
import { Calendar } from 'react-native-calendars';
import styles from './Styles/TaskManagerStyle';

const db = SQLite.openDatabase({ name: 'tarefas.db', location: 'default' });

const App = () => {
  const [descricao, setDescricao] = useState('');
  const [prazo, setPrazo] = useState(new Date());
  const [prioridade, setPrioridade] = useState('');
  const [tarefas, setTarefas] = useState([
    { id: 1, descricao: 'Fazer compras', prazo: '2024-03-10', prioridade: 'Alta', completed: false },
  ]);  
  const [mostrarModal, setMostrarModal] = useState(false);  
  const [editarModo, setEditarModo] = useState(false);
  const [idTarefaEditando, setIdTarefaEditando] = useState(null);  
  const [edicaoRealizada, setEdicaoRealizada] = useState(false);  

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS tarefas (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT, prazo TEXT, prioridade TEXT, completed INTEGER)',
        [],
        () => {
          carregarTarefas();
        },
        (_, error) => {
          console.error('Erro ao criar tabela de tarefas:', error);
        }
      );
    });
  }, []);

  useEffect(() => {
    if (edicaoRealizada) {
      salvarTarefasNoBancoDeDados(tarefas);
      mostrarAlerta('Tarefa editada com sucesso!');
      setEdicaoRealizada(false);
    }
  }, [edicaoRealizada]);

  const carregarTarefas = () => {
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

  const salvarTarefasNoBancoDeDados = (tarefas) => {
    db.transaction((tx) => {
      tx.executeSql('DELETE FROM tarefas');
      tarefas.forEach(tarefa => {
        const { descricao, prazo, prioridade, completed } = tarefa;
        const completedInt = completed ? 1 : 0;
        tx.executeSql(
          'INSERT INTO tarefas (descricao, prazo, prioridade, completed) VALUES (?, ?, ?, ?)',
          [String(descricao), String(prazo), String(prioridade), String(completedInt)]
        );
      });
    });
  };  

  const HandleAdicionarTarefa = () => {
    if (descricao && prazo && prioridade) {
      const novaTarefa = { id: tarefas.length + 1, descricao, prazo, prioridade, completed: false }; 
      const tarefasAtualizadas = [...tarefas, novaTarefa];
      setTarefas(tarefasAtualizadas);
      salvarTarefasNoBancoDeDados(tarefasAtualizadas);
      setDescricao('');
      setPrioridade('');
      mostrarAlerta('Tarefa adicionada  sucesso!');
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
      // Atualizar a tarefa com os novos detalhes
      const tarefasAtualizadas = tarefas.map(tarefa => {
        if (tarefa.id === idTarefaEditando) {
          return { ...tarefa, descricao, prazo, prioridade };
        }
        return tarefa;
      });
  
      // Atualizar o estado das tarefas
      setTarefas(tarefasAtualizadas);
  
      // Marcar que a edição foi realizada
      setEdicaoRealizada(true);
  
      // Desativar o modo de edição e limpar os campos
      setEditarModo(false);
      setIdTarefaEditando(null);
      setDescricao('');
      setPrioridade('');
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