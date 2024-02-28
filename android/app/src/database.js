import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveTask = async (task) => {
  try {
    let tasks = await AsyncStorage.getItem('tasks');
    if (!tasks) {
      tasks = [];
    } else {
      tasks = JSON.parse(tasks);
    }
    tasks.push(task);
    await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
  } catch (error) {
    throw new Error('Erro ao salvar a tarefa: ' + error.message);
  }
};

export const getTasks = async () => {
  try {
    const tasks = await AsyncStorage.getItem('tasks');
    if (tasks) {
      return JSON.parse(tasks);
    }
    return [];
  } catch (error) {
    throw new Error('Erro ao carregar as tarefas: ' + error.message);
  }
};

export const deleteTask = async (taskId) => {
  try {
    await AsyncStorage.removeItem(`task_${taskId}`);
    console.log('Tarefa excluída com sucesso:', taskId);
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
  }
};