import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock } from 'lucide-react-native'; // Ensure this path is correct for your project

// Function to determine the current batch based on time
const getCurrentBatch = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // Evening Batch: 04:00 PM (16:00) to 11:58 PM (23:58)
  if (totalMinutes >= 960 && totalMinutes <= (23 * 60 + 58)) {
    const startDate = new Date(now);
    startDate.setHours(16, 0, 0, 0); // 4:00 PM
    const endDate = new Date(now);
    endDate.setHours(23, 58, 0, 0); // 11:58 PM
    return {
      title: 'Evening',
      start: startDate,
      end: endDate,
      timeRange: '04:00 PM - 11:58 PM',
    };
  }

  // Default to "Midnight Batch" if not in Evening batch
  let start = new Date(now);
  start.setHours(0, 1, 0, 0); // 12:01 AM
  let end = new Date(now);
  end.setHours(15, 59, 0, 0); // 03:59 PM

  return {
    title: 'Midnight Batch',
    start,
    end,
    timeRange: '12:01 AM - 03:59 PM',
  };
};

// Function to format remaining time from milliseconds to HH:MM:SS
const formatTimeLeft = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const BatchTimingCard = () => {
  const [currentBatchDetails, setCurrentBatchDetails] = useState(getCurrentBatch());
  const [timeLeftDisplay, setTimeLeftDisplay] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const batchNow = getCurrentBatch();
      setCurrentBatchDetails(batchNow);

      const msLeft = batchNow.end.getTime() - now.getTime();
      setTimeLeftDisplay(msLeft > 0 ? formatTimeLeft(msLeft) : '00:00:00');
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
    
      <View style={styles.iconBox}>
        <Clock size={22} color="#8B5CF6" /> 
      </View>


      <View style={styles.content}>
        <Text style={styles.label}>Current Batch</Text>
        <Text style={styles.title}>{currentBatchDetails.title}</Text>
        <Text style={styles.timeRange}>{currentBatchDetails.timeRange}</Text>
        
       
        <View style={styles.countdownWrapper}>
          <Clock size={14} color="#6D28D9" style={styles.countdownIcon} />
          <Text style={styles.countdownText}>Ends in {timeLeftDisplay}</Text>
        </View>
      </View>
    </View>
  );
};

export default BatchTimingCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB', // A very light gray, almost white, for a clean base
    borderRadius: 10, // Slightly softer rounding
    padding: 18, // Adjusted padding
    marginHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
    // Shadow with a hint of violet for subtlety (iOS)
    shadowColor: '#D1C4E9', // Lighter violet for shadow color
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, // More subtle opacity
    shadowRadius: 6,   // Softer spread
    // Elevation for Android shadow
    elevation: 4, // Reduced elevation for a lighter feel
    // Border for definition
    borderColor: '#EDE9FE', // Very light violet border
    borderWidth: 1,
  },
  iconBox: {
    backgroundColor: '#F5F3FF', // Light violet background for icon box
    padding: 12, 
    borderRadius: 8, 
    marginRight: 16,
    borderColor: '#DDD6FE', // Slightly more visible violet border
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // Adding a subtle inner shadow or highlight effect could be complex in RN without extra libs
    // Sticking to border for clean professionalism
  },
  content: {
    flex: 1,
    justifyContent: 'center', 
  },
  label: {
    fontFamily: 'Poppins_500Medium', 
    fontSize: 9, // Even smaller for a more delicate label
    color: '#A78BFA', // Muted violet for the label
    textTransform: 'uppercase',
    letterSpacing: 1, // Increased letter spacing for clarity
    marginBottom: 5, 
  },
  title: {
    fontFamily: 'Poppins_600SemiBold', // SemiBold for a strong but not overpowering title
    fontSize: 16, // Slightly reduced for balance
    color: '#4C1D95', // Retained deep violet for primary information
    marginBottom: 5, 
  },
  timeRange: {
    fontFamily: 'Poppins_400Regular', 
    fontSize: 12, // Slightly smaller for secondary info
    color: '#6B7280', // Neutral gray for good readability
    marginBottom: 12, // Increased space before countdown
  },
  countdownWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E7FF', // A very light, almost neutral blueish-violet
    borderRadius: 6,
    paddingVertical: 5, // Fine-tuned padding
    paddingHorizontal: 10,
    alignSelf: 'flex-start', 
    borderWidth: 1,
    borderColor: '#C7D2FE', // Subtle border for the countdown tag
  },
  countdownIcon: {
    marginRight: 5, // Slightly reduced margin
  },
  countdownText: {
    fontFamily: 'Poppins_500Medium', 
    fontSize: 12, // Matched with timeRange for consistency in secondary info
    color: '#5B21B6', 
  },
});
