import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { CHOICES, RPSChoice } from './RPSGame';

interface Props {
  onPlay: (choice: RPSChoice) => void;
  onResetScore?: () => void;
}

export default function RPSSimulatorTest({ onPlay, onResetScore }: Props) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState('');
  const stopRef = useRef(false);

  const startSimulation = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setProgress(0);
    setSummary('');
    stopRef.current = false;
    onResetScore?.();

    for (let i = 1; i <= 100; i++) {
      if (stopRef.current) break;
      const pick = CHOICES[Math.floor(Math.random() * CHOICES.length)];
      onPlay(pick);
      setProgress(i);
      // 每局間隔 0.01 秒 (10毫秒)
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    setSummary(`模擬結束 (共完成 ${progress > 0 ? progress : 100} 局)`);
    setIsRunning(false);
  };

  const stopSimulation = () => {
    stopRef.current = true;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>手機模擬點擊測試 (每局 0.01s)</Text>

      {isRunning ? (
        <View style={styles.row}>
          <Text style={styles.text}>進度: {progress} / 100</Text>
          <Button title="停止" onPress={stopSimulation} color="#e11d48" />
        </View>
      ) : (
        <Button title="模擬連續猜 100 次" onPress={startSimulation} />
      )}

      {summary ? <Text style={styles.text}>{summary}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 13,
  },
});
