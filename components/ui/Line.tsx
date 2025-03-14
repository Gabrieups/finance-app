import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from "../../context/ThemeContext"
import { Colors } from 'react-native/Libraries/NewAppScreen';

const Linha = ({ text = '', thickness = 1, marginVertical = 10 }) => {
  const { colors } = useTheme()  
  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: colors.text + "80", height: thickness }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    flex: 1,
  },
});

export default Linha