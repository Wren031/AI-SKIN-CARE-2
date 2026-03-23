import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from '../hooks/useProfile';

// Oasis Theme Palette
const SAGE = '#8FA08E';
const SAND = '#FCFAF7';
const DEEP_SAGE = '#3A4D39';
const SOFT_CORAL = '#E67E6E';
const MIST = '#F0F4F0';

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];
const SUFFIX_OPTIONS = ["None", "Jr.", "Sr.", "II", "III", "IV", "V"];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { saveFullProfile, profile, loading, fetchProfile } = useProfile();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [form, setForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    gender: '',
    phone_number: '',
    address: '',
    date_of_birth: new Date(2000, 0, 1).toISOString().split('T')[0],
    avatar_url: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        if (fetchProfile) await fetchProfile();
      } catch (e) {
        console.error("Error loading profile:", e);
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        middle_name: profile.middle_name || '',
        last_name: profile.last_name || '',
        suffix: profile.suffix || '',
        gender: profile.gender || '',
        phone_number: profile.phone_number || '',
        address: profile.address || '',
        date_of_birth: profile.date_of_birth || '2000-01-01',
        avatar_url: profile.avatar_url || `https://ui-avatars.com/api/?background=8FA08E&color=fff&name=${profile.first_name || 'U'}`,
      });
    }
  }, [profile]);

  const handleInputChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery access is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) handleInputChange('avatar_url', result.assets[0].uri);
  };

  const fetchCurrentLocation = async () => {
    setIsLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return Alert.alert('Permission Denied', 'Location required.');
      
      let location = await Location.getCurrentPositionAsync({});
      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const item = reverseGeocode[0];
        const formatted = [item.name, item.street, item.city, item.region]
          .filter(Boolean)
          .join(', ');
        handleInputChange('address', formatted);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not fetch location.');
    } finally {
      setIsLocating(false);
    }
  };

  const showOptionPicker = (title: string, options: string[], field: string) => {
    Alert.alert(title, "Choose an option", [
      ...options.map((option) => ({
        text: option,
        onPress: () => handleInputChange(field, option === "None" ? "" : option),
      })),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) handleInputChange('date_of_birth', selectedDate.toISOString().split('T')[0]);
  };

  const handleComplete = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      return Alert.alert("Required Fields", "Please enter your first and last name.");
    }
    const success = await saveFullProfile(form);
    if (success) router.replace('/(tabs)/home');
  };

  if (isInitialLoading) {
    return (
      <View style={styles.loaderCenter}>
        <ActivityIndicator size="large" color={SAGE} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={DEEP_SAGE} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Edit Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.9}>
              <View style={styles.imageContainer}>
                {form.avatar_url ? (
                  <Image source={{ uri: form.avatar_url }} style={styles.avatarImage} />
                ) : (
                   <View style={[styles.avatarImage, { justifyContent: 'center', alignItems: 'center' }]}>
                      <Ionicons name="person" size={40} color={SAGE} />
                   </View>
                )}
                <View style={styles.editBadge}>
                  <Ionicons name="camera" size={16} color="#FFF" />
                </View>
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Change your botanical avatar</Text>
          </View>

          <View style={styles.formPadding}>
            <Text style={styles.sectionTitle}>Identity</Text>
            
            <View style={styles.inputCard}>
              <View style={styles.inputField}>
                <Text style={styles.floatingLabel}>First Name</Text>
                <TextInput 
                  style={styles.textInput} 
                  value={form.first_name} 
                  onChangeText={(v) => handleInputChange('first_name', v)} 
                  placeholder="e.g. Jane"
                  placeholderTextColor="#94a3b8" 
                />
              </View>

              <View style={styles.inputField}>
                <Text style={styles.floatingLabel}>Middle Name (Optional)</Text>
                <TextInput 
                  style={styles.textInput} 
                  value={form.middle_name} 
                  onChangeText={(v) => handleInputChange('middle_name', v)} 
                  placeholder="e.g. Marie"
                  placeholderTextColor="#94a3b8" 
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputField, { flex: 2, marginRight: 12 }]}>
                  <Text style={styles.floatingLabel}>Last Name</Text>
                  <TextInput 
                    style={styles.textInput} 
                    value={form.last_name} 
                    onChangeText={(v) => handleInputChange('last_name', v)} 
                    placeholder="e.g. Doe"
                    placeholderTextColor="#94a3b8" 
                  />
                </View>
                <View style={[styles.inputField, { flex: 1 }]}>
                  <Text style={styles.floatingLabel}>Suffix</Text>
                  <TouchableOpacity style={styles.selectInput} onPress={() => showOptionPicker("Suffix", SUFFIX_OPTIONS, "suffix")}>
                    <Text style={styles.selectText} numberOfLines={1}>{form.suffix || "None"}</Text>
                    <Ionicons name="chevron-down" size={14} color={SAGE} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Details & Contact</Text>
            
            <View style={styles.inputCard}>
              <View style={styles.inputField}>
                <Text style={styles.floatingLabel}>Gender identity</Text>
                <TouchableOpacity style={styles.selectInput} onPress={() => showOptionPicker("Gender", GENDER_OPTIONS, "gender")}>
                  <Text style={styles.selectText}>{form.gender || "Choose..."}</Text>
                  <Ionicons name="leaf-outline" size={18} color={SAGE} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputField}>
                <Text style={styles.floatingLabel}>Birthday</Text>
                <TouchableOpacity style={styles.selectInput} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.selectText}>{form.date_of_birth}</Text>
                  <Ionicons name="calendar-clear-outline" size={18} color={SAGE} />
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <View style={styles.datePickerCard}>
                  <DateTimePicker 
                    value={new Date(form.date_of_birth)} 
                    mode="date" 
                    display={Platform.OS === 'ios' ? 'inline' : 'default'} 
                    onChange={onDateChange} 
                    maximumDate={new Date()} 
                    accentColor={SAGE}
                  />
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity style={styles.dateDoneBtn} onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.dateDoneText}>Set Date</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <View style={styles.inputField}>
                <Text style={styles.floatingLabel}>Mobile Number</Text>
                <TextInput 
                  style={styles.textInput} 
                  keyboardType="phone-pad" 
                  value={form.phone_number} 
                  onChangeText={(v) => handleInputChange('phone_number', v)} 
                  placeholder="+63 --- --- ----"
                  placeholderTextColor="#94a3b8" 
                />
              </View>

              <View style={styles.inputField}>
                <Text style={styles.floatingLabel}>Current Location</Text>
                {form.address ? (
                  <View style={styles.addressActive}>
                    <Text style={styles.addressValue} numberOfLines={2}>{form.address}</Text>
                    <TouchableOpacity onPress={fetchCurrentLocation} style={styles.addressRetry}>
                      {isLocating ? <ActivityIndicator size="small" color={SAGE} /> : <Ionicons name="refresh" size={18} color={SAGE} />}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.gpsButton} onPress={fetchCurrentLocation} disabled={isLocating}>
                    {isLocating ? (
                      <ActivityIndicator color={SAGE} />
                    ) : (
                      <>
                        <Ionicons name="location-outline" size={20} color={SAGE} />
                        <Text style={styles.gpsButtonText}>Auto-fill via GPS</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.mainButton, (loading || !form.first_name) && styles.mainButtonDisabled]} 
            onPress={handleComplete} 
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainButtonText}>Confirm Changes</Text>}
          </TouchableOpacity>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SAND },
  loaderCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: SAND },
  navHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  navTitle: { fontSize: 18, fontWeight: '300', color: DEEP_SAGE, letterSpacing: 0.5 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  
  scrollContent: { paddingBottom: 40 },
  
  avatarSection: { 
    alignItems: 'center', 
    paddingVertical: 32, 
    backgroundColor: '#FFF', 
    borderBottomLeftRadius: 40, 
    borderBottomRightRadius: 40,
    shadowColor: SAGE,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  },
  imageContainer: { position: 'relative' },
  avatarImage: { 
    width: 110, height: 110, 
    borderRadius: 40, 
    backgroundColor: MIST,
    borderWidth: 3,
    borderColor: '#FFF'
  },
  editBadge: { 
    position: 'absolute', bottom: 0, right: 0, 
    backgroundColor: SAGE, 
    width: 34, height: 34, 
    borderRadius: 12, 
    alignItems: 'center', justifyContent: 'center', 
    borderWidth: 3, borderColor: '#FFF' 
  },
  avatarHint: { marginTop: 14, fontSize: 13, color: '#94A3B8', fontWeight: '500', fontStyle: 'italic' },
  
  formPadding: { paddingHorizontal: 20 },
  sectionTitle: { 
    fontSize: 11, fontWeight: '800', 
    color: SAGE, textTransform: 'uppercase', 
    letterSpacing: 1.5, marginBottom: 12, marginTop: 24, marginLeft: 8 
  },
  
  inputCard: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  inputField: { marginBottom: 16 },
  floatingLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  textInput: { 
    backgroundColor: SAND, 
    padding: 16, borderRadius: 18, 
    fontSize: 16, color: DEEP_SAGE, 
    borderWidth: 1, borderColor: '#E2E8F0', fontWeight: '500' 
  },
  row: { flexDirection: 'row' },
  selectInput: { 
    backgroundColor: SAND, 
    padding: 16, borderRadius: 18, 
    flexDirection: 'row', justifyContent: 'space-between', 
    alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' 
  },
  selectText: { fontSize: 16, color: DEEP_SAGE, fontWeight: '500' },
  
  gpsButton: { 
    height: 56, borderRadius: 18, 
    borderStyle: 'dashed', borderWidth: 1.5, 
    borderColor: SAGE, backgroundColor: MIST, 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 
  },
  gpsButtonText: { fontSize: 15, color: SAGE, fontWeight: '700' },
  
  addressActive: { 
    backgroundColor: SAND, borderRadius: 18, 
    padding: 16, borderWidth: 1, borderColor: SAGE, 
    flexDirection: 'row', alignItems: 'center' 
  },
  addressValue: { flex: 1, fontSize: 14, color: DEEP_SAGE, fontWeight: '500', lineHeight: 20 },
  addressRetry: { 
    marginLeft: 12, width: 36, height: 36, 
    backgroundColor: MIST, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center'
  },
  
  datePickerCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 12, marginVertical: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  dateDoneBtn: { padding: 14, alignItems: 'center', backgroundColor: MIST, borderRadius: 16, marginTop: 10 },
  dateDoneText: { color: SAGE, fontWeight: '700' },
  
  mainButton: { 
    backgroundColor: SOFT_CORAL, 
    marginHorizontal: 20, padding: 20, 
    borderRadius: 22, alignItems: 'center', 
    marginTop: 32,
    shadowColor: SOFT_CORAL, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 
  },
  mainButtonDisabled: { backgroundColor: '#CBD5E1', shadowOpacity: 0 },
  mainButtonText: { color: '#FFF', fontWeight: '700', fontSize: 17, letterSpacing: 0.5 }
});