import { useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import RPSSimulatorTest from './RPSSimulator-TEST';

export const CHOICES = ['剪刀', '石頭', '布'] as const;
export type RPSChoice = (typeof CHOICES)[number];

const INITIAL_SCORE = { wins: 0, losses: 0, ties: 0 };

export default function RPSGame() {
  const [isOpen, setIsOpen] = useState(false);
  const [lastRound, setLastRound] = useState<{
    user: RPSChoice;
    comp: RPSChoice;
    result: string;
  } | null>(null);
  const [score, setScore] = useState(INITIAL_SCORE);

  const play = (user: RPSChoice) => {
    const comp = CHOICES[Math.floor(Math.random() * 3)];

    const win =
      (user === '剪刀' && comp === '布') ||
      (user === '石頭' && comp === '剪刀') ||
      (user === '布' && comp === '石頭');

    const key = user === comp ? 'ties' : win ? 'wins' : 'losses';
    const result = user === comp ? '平手' : win ? '你贏了！' : '你輸了！';

    setLastRound({ user, comp, result });
    setScore((s) => ({ ...s, [key]: s[key] + 1 }));
  };

  const resetScore = () => {
    setScore(INITIAL_SCORE);
    setLastRound(null);
  };

  if (!isOpen) {
    return (
      <View style={styles.container}>
        <Button title="開始猜拳遊戲" onPress={() => setIsOpen(true)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.title}>猜拳遊戲</Text>
        <Button title="收起" onPress={() => setIsOpen(false)} />
      </View>

      <View style={styles.row}>
        {CHOICES.map((choice) => (
          <Button key={choice} title={choice} onPress={() => play(choice)} />
        ))}
      </View>

      {lastRound && (
        <Text style={styles.text}>
          你出：{lastRound.user}｜電腦出：{lastRound.comp} → {lastRound.result}
        </Text>
      )}

      <View style={styles.row}>
        <Text style={styles.text}>
          {score.wins} 勝 / {score.losses} 負 / {score.ties} 平
        </Text>
        <Button title="重置" onPress={resetScore} />
      </View>

      {__DEV__ && (
        <RPSSimulatorTest onPlay={play} onResetScore={resetScore} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 14,
  },
});
