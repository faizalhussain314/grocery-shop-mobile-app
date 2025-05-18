import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface WeightSelectorProps {
  selectedWeight: '250g' | '500g';
  onSelectWeight: (weight: '250g' | '500g') => void;
}

const WeightSelector: React.FC<WeightSelectorProps> = ({
  selectedWeight,
  onSelectWeight,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.weightOption,
          selectedWeight === '250g' && styles.selectedOption
        ]}
        onPress={() => onSelectWeight('250g')}
        activeOpacity={0.7}
      >
        <Text 
          style={[
            styles.weightText,
            selectedWeight === '250g' && styles.selectedText
          ]}
        >
          250g
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.weightOption,
          selectedWeight === '500g' && styles.selectedOption
        ]}
        onPress={() => onSelectWeight('500g')}
        activeOpacity={0.7}
      >
        <Text 
          style={[
            styles.weightText,
            selectedWeight === '500g' && styles.selectedText
          ]}
        >
          500g
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weightOption: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: '#f1f5f9',
  },
  selectedOption: {
    backgroundColor: '#9747FF',
  },
  weightText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#689F38',
  },
  selectedText: {
    color: '#ffffff',
    fontFamily: 'Poppins_500Medium',
  },
});

export default WeightSelector;