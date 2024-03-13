import React from 'react';
import { View } from 'react-native';
import TaskManager from './android/app/src/TaskManager'; 
import styles from './android/app/src/styles/TaskManagerStyle';

const App = () => {
    return (
        <View style={styles.container}>            
            <TaskManager />
        </View>
    );
};

export default App;