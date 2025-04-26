import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Minus, Plus } from 'lucide-react-native';

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onIncrement,
  onDecrement,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={onDecrement}
        activeOpacity={0.7}
      >
        <Minus size={16} color="#22c55e" />
      </TouchableOpacity>
      
      <View style={styles.quantityContainer}>
        <Text style={styles.quantityText}>{quantity}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={onIncrement}
        activeOpacity={0.7}
      >
        <Plus size={16} color="#22c55e" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    padding: 4,
    overflow: 'hidden',
  },
  button: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2f8ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  quantityText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#1e293b',
  },
});

export default QuantitySelector;