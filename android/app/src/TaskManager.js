import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importe AsyncStorage
import moment from 'moment'; 
import { Calendar } from 'react-native-calendars';
import styles from './Styles/TaskManagerStyle';

const App = () => {
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [priority, setPriority] = useState('');
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(moment().format('YYYY-MM-DD'));

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const tasksData = await AsyncStorage.getItem('tasks');
        if (tasksData !== null) {
          setTasks(JSON.parse(tasksData));
        }
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
      }
    };

    loadTasks();
  }, []);

  const saveTasksToStorage = async (tasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Erro ao salvar tarefas:', error);
    }
  };

  const handleAddTask = async () => {
    if (description && deadline && priority) {
      const newTask = { id: Date.now(), description, deadline, priority, completed: false };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      await saveTasksToStorage(updatedTasks);
      setDescription('');
      setPriority('');
      showAlert('Tarefa adicionada com sucesso!');
    } else {
      showAlert('Por favor, preencha todos os campos.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    await saveTasksToStorage(updatedTasks);
    showAlert('Tarefa excluída com sucesso!');
  };

  const showAlert = (message) => {
    Alert.alert('Alerta', message);
  };

  const showDatePicker = () => {
    setShowModal(true);
  };

  const hideDatePicker = () => {
    setShowModal(false);
  };

  const handleDateChange = (date) => {
    setDeadline(date);
    hideDatePicker();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Tarefas</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Descrição"
          value={description}
          onChangeText={setDescription}
        />
        <Button title="Selecionar Data de Término" onPress={showDatePicker} />
        <Modal
          animationType="slide"
          transparent={true}
          visible={showModal}
          onRequestClose={hideDatePicker}
        >
          <View style={styles.modalContainer}>
            <Calendar
              current={moment(deadline).format('YYYY-MM-DD')} 
              onDayPress={(day) => handleDateChange(day.dateString)}
            />
            <Button title="Cancelar" onPress={hideDatePicker} />
          </View>
        </Modal>
        <TextInput
          style={styles.input}
          placeholder="Prioridade"
          value={priority}
          onChangeText={setPriority}
          keyboardType="numeric"
        />
        <Button title="Adicionar Tarefa" onPress={handleAddTask} />
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(item, index) => {
          if (item && item.id) {
          return item.id.toString();
        } else {
          return index.toString(); 
        }
        }}
        renderItem={({ item }) => (
      <View style={styles.taskContainer}>
      <Text>{item.description}</Text>
      <Text>{moment(item.deadline).format('DD/MM/YYYY')}</Text>
      <Text>{item.priority}</Text>
      <Button title="Excluir" onPress={() => handleDeleteTask(item.id)} />
      </View>
        )}
          />
      </View>
  );
};

export default App;