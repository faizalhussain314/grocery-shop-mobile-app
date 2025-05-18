
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Pressable,
  } from 'react-native';
  import {
    useFonts,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  } from '@expo-google-fonts/poppins';
  import { ChevronDown, Send } from 'lucide-react-native';
  import { useState } from 'react';
  import { router, useLocalSearchParams } from 'expo-router';
import { createComplaint } from '@/services/complaintService';
import { Alert } from 'react-native';
  
  const QUERY_TYPES = [
    'Issue with Order',
    'Complain on Vendor',
    'Damaged Product',
    'Change Address',
    'Others',
  ];
  
  export default function HelpCenterScreen() {
    const [fontsLoaded] = useFonts({
      Poppins_400Regular,
      Poppins_500Medium,
      Poppins_600SemiBold,
    });
  
    const { type } = useLocalSearchParams<{ type?: string }>();
    const [queryType, setQueryType] = useState<string | null>(
      QUERY_TYPES.includes(type ?? '') ? (type as string) : null
    );
    const [message, setMessage] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const [submitting, setSubmitting] = useState(false);
const [showSuccess, setShowSuccess] = useState(false); 
    
  
    if (!fontsLoaded) return null;
  
     const handleSubmit = async () => {
         try {
           setSubmitting(true);
           await createComplaint({
             complaintType: queryType!,          // non-null because button disabled otherwise
             complaintDetails: message.trim(),
          });
     
          setShowSuccess(true);
          
             // Auto-close after 3 s and go to /account
             setTimeout(() => {
               setShowSuccess(false);
               router.replace('/account');   // or router.back() if you prefer
             }, 3000);
        } catch (error) {
          console.error('Complaint error:', error);
          Alert.alert('Oops', 'Something went wrong. Please try again.');
        } finally {
          setSubmitting(false);
        }
      };
  
    return (
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {/* ---------- HEADER ---------- */}
        <View style={styles.header}>
          <Text style={styles.title}>Help Center</Text>
        </View>
  
        {/* ---------- CARD ---------- */}
        <View style={styles.card}>
          {/* --- Query Type Picker --- */}
          <Text style={styles.label}>What’s the issue?</Text>
  
          <Pressable
            style={styles.pickerButton}
            onPress={() => setShowPicker(true)}
          >
            <Text style={queryType ? styles.pickerText : styles.placeholderText}>
              {queryType || 'Select an option'}
            </Text>
            <ChevronDown size={18} color="#64748b" />
          </Pressable>
  
          {/* --- Detail Message --- */}
          <Text style={[styles.label, { marginTop: 20 }]}>Detailed message</Text>
  
          <TextInput
            style={styles.textArea}
            multiline
            value={message}
            onChangeText={setMessage}
            placeholder="Tell us more so we can help you quickly..."
            placeholderTextColor="#94a3b8"
          />
  
          {/* --- Submit --- */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!(queryType && message.trim()) || submitting) && { opacity: 0.4 },
            ]}
            disabled={!(queryType && message.trim()) || submitting}
            onPress={handleSubmit}
          >
            <Send size={18} color="#fff" />
            <Text style={styles.submitText}>Send</Text>
          </TouchableOpacity>
        </View>
  
        {/* ---------- MODAL PICKER ---------- */}
      {/* ---------- SUCCESS POP-UP ---------- */}
<Modal visible={showSuccess} transparent animationType="fade">
  <View style={styles.successBackdrop}>
    <View style={styles.successCard}>
      {/* icon */}
      <View style={styles.successIconCircle}>
        <Text style={styles.successIcon}>✓</Text>
      </View>

      {/* text */}
      <Text style={styles.successTitle}>Submitted!</Text>
      <Text style={styles.successSubtitle}>
        Your query has been received. Our customer executive will contact you shortly.
      </Text>
    </View>
  </View>
</Modal>
{/* ---------- QUERY TYPE PICKER ---------- */}
<Modal
  transparent
  animationType="slide"
  visible={showPicker}
  onRequestClose={() => setShowPicker(false)}
>
  <Pressable
    style={styles.modalBackdrop}
    onPress={() => setShowPicker(false)}
  >
    <View style={styles.modalSheet}>
      {QUERY_TYPES.map((t) => (
        <TouchableOpacity
          key={t}
          style={styles.modalOption}
          onPress={() => {
            setQueryType(t);
            setShowPicker(false);
          }}
        >
          <Text style={styles.modalText}>{t}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </Pressable>
</Modal>
      

      </ScrollView>
    );
  }
  
  const styles = StyleSheet.create({
    /* --- layout --- */
    container: {
      flex: 1,
      backgroundColor: '#FAF7FF',
    },
    header: {
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 20,
      backgroundColor: '#ffffff',
    },
    title: {
      fontFamily: 'Poppins_600SemiBold',
      fontSize: 24,
      color: '#1e293b',
    },
  
    /* --- card --- */
    card: {
      backgroundColor: '#ffffff',
      marginTop: 24,
      marginHorizontal: 20,
      padding: 20,
      borderRadius: 16,
    },
  
    /* labels & text */
    label: {
      fontFamily: 'Poppins_500Medium',
      fontSize: 14,
      color: '#1e293b',
      marginBottom: 8,
    },
  
    /* picker button */
    pickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderRadius: 12,
    },
    pickerText: {
      fontFamily: 'Poppins_500Medium',
      fontSize: 14,
      color: '#1e293b',
    },
    placeholderText: {
      fontFamily: 'Poppins_400Regular',
      fontSize: 14,
      color: '#94a3b8',
    },
  
    /* textarea */
    textArea: {
      minHeight: 120,
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderRadius: 12,
      padding: 16,
      fontFamily: 'Poppins_400Regular',
      fontSize: 14,
      color: '#1e293b',
      textAlignVertical: 'top',
    },
  
    /* submit */
    submitButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 24,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: '#7C3AED',
    },
    submitText: {
      marginLeft: 8,
      fontFamily: 'Poppins_600SemiBold',
      fontSize: 14,
      color: '#ffffff',
    },
  
    /* --- modal picker --- */
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: '#fff',
      paddingVertical: 12,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    modalOption: {
      paddingVertical: 14,
      paddingHorizontal: 24,
    },
    modalText: {
      fontFamily: 'Poppins_500Medium',
      fontSize: 16,
      color: '#1e293b',
    },
    successBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    successCard: {
      width: '80%',
      backgroundColor: '#fff',
      borderRadius: 20,
      paddingVertical: 30,
      paddingHorizontal: 24,
      alignItems: 'center',
    },
    successIconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#7C3AED20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    successIcon: {
      fontSize: 32,
      color: '#7C3AED',
      fontWeight: '700',
    },
    successTitle: {
      fontFamily: 'Poppins_600SemiBold',
      fontSize: 18,
      color: '#1e293b',
      marginBottom: 8,
    },
    successSubtitle: {
      fontFamily: 'Poppins_400Regular',
      fontSize: 14,
      color: '#475569',
      textAlign: 'center',
    },
    
  });
  