import { THEMES } from '@/src/constants/themes';
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

const SKIN_THEME = THEMES.DERMA_AI;
const { COLORS, RADIUS, SHADOWS } = SKIN_THEME;

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
        console.error("Error loading clinical profile:", e);
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
        avatar_url: profile.avatar_url || `https://ui-avatars.com/api/?background=FF7A6D&color=fff&name=${profile.first_name || 'U'}`,
      });
    }
  }, [profile]);

  const handleInputChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Access Denied', 'Gallery permissions are required for clinical identification.');
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
      if (status !== 'granted') return Alert.alert('Permission Denied', 'Location access required.');
      
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
        handleInputChange('address', formatted.toUpperCase());
      }
    } catch (error) {
      Alert.alert('Error', 'Could not sync geographic data.');
    } finally {
      setIsLocating(false);
    }
  };

  const showOptionPicker = (title: string, options: string[], field: string) => {
    Alert.alert(title, "Select Option", [
      ...options.map((option) => ({
        text: option.toUpperCase(),
        onPress: () => handleInputChange(field, option === "None" ? "" : option),
      })),
      { text: "CANCEL", style: "cancel" },
    ]);
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) handleInputChange('date_of_birth', selectedDate.toISOString().split('T')[0]);
  };

  const handleComplete = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      return Alert.alert("Missing Data", "First and Last names are mandatory.");
    }
    const success = await saveFullProfile(form);
    if (success) router.replace('/(tabs)/home');
  };

  if (isInitialLoading) {
    return (
      <View style={styles.loaderCenter}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>EDIT CLINICAL PROFILE</Text>
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
                      <Ionicons name="person" size={40} color={COLORS.TEXT_SECONDARY} />
                   </View>
                )}
                <View style={styles.editBadge}>
                  <Ionicons name="camera" size={16} color="#FFF" />
                </View>
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Update Identification Image</Text>
          </View>

          <View style={styles.formPadding}>
            <Text style={styles.sectionTitle}>Identity Registry</Text>
            
            <View style={styles.inputCard}>
              <View style={styles.inputField}>
                <Text style={styles.floatingLabel}>First Name</Text>
                <TextInput 
                  style={styles.textInput} 
                  value={form.first_name} 
                  onChangeText={(v) => handleInputChange('first_name', v)} 
                  placeholder="e.g. JANE"
                  placeholderTextColor={COLORS.TEXT_SECONDARY} 
                />
              </View>

              <View style={styles.inputField}>
                <Text style={styles.floatingLabel}>Middle Name</Text>
                <TextInput 
                  style={styles.textInput} 
                  value={form.middle_name} 
                  onChangeText={(v) => handleInputChange('middle_name', v)} 
                  placeholder="OPTIONAL"
                  placeholderTextColor={COLORS.TEXT_SECONDARY} 
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputField, { flex: 2, marginRight: 12 }]}>
                  <Text style={styles.floatingLabel}>Last Name</Text>
                  <TextInput 
                    style={styles.textInput} 
                    value={form.last_name} 
                    onChangeText={(v) => handleInputChange('last_name', v)} 
                    placeholder="e.g. DOE"
                    placeholderTextColor={COLORS.TEXT_SECONDARY} 
                  />
                </View>
                <View style={[styles.inputField, { flex: 1 }]}>
                  <Text style={styles.floatingLabel}>Suffix</Text>
                  <TouchableOpacity style={styles.selectInput} onPress={() => showOptionPicker("Suffix", SUFFIX_OPTIONS, "suffix")}>
                    <Text style={styles.selectText} numberOfLines={1}>{form.suffix || "N/A"}</Text>
                    <Ionicons name="chevron-down" size={14} color={COLORS.PRIMARY} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Clinical Data & Contact</Text>
            
            <View style={styles.inputCard}>
              <View style={styles.inputField}>
                <Text style={styles.floatingLabel}>Biological Sex</Text>
                <TouchableOpacity style={styles.selectInput} onPress={() => showOptionPicker("Gender", GENDER_OPTIONS, "gender")}>
                  <Text style={styles.selectText}>{form.gender.toUpperCase() || "SELECT..."}</Text>
                  <Ionicons name="person-outline" size={18} color={COLORS.PRIMARY} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputField}>
                <Text style={styles.floatingLabel}>Date of Birth</Text>
                <TouchableOpacity style={styles.selectInput} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.selectText}>{form.date_of_birth}</Text>
                  <Ionicons name="calendar-outline" size={18} color={COLORS.PRIMARY} />
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
                    accentColor={COLORS.PRIMARY}
                  />
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity style={styles.dateDoneBtn} onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.dateDoneText}>CONFIRM DATE</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <View style={styles.inputField}>
                <Text style={styles.floatingLabel}>Mobile Line</Text>
                <TextInput 
                  style={styles.textInput} 
                  keyboardType="phone-pad" 
                  value={form.phone_number} 
                  onChangeText={(v) => handleInputChange('phone_number', v)} 
                  placeholder="+63 --- --- ----"
                  placeholderTextColor={COLORS.TEXT_SECONDARY} 
                />
              </View>

              <View style={styles.inputField}>
                <Text style={styles.floatingLabel}>Registry Address</Text>
                {form.address ? (
                  <View style={styles.addressActive}>
                    <Text style={styles.addressValue} numberOfLines={2}>{form.address.toUpperCase()}</Text>
                    <TouchableOpacity onPress={fetchCurrentLocation} style={styles.addressRetry}>
                      {isLocating ? <ActivityIndicator size="small" color={COLORS.PRIMARY} /> : <Ionicons name="refresh" size={18} color={COLORS.PRIMARY} />}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.gpsButton} onPress={fetchCurrentLocation} disabled={isLocating}>
                    {isLocating ? (
                      <ActivityIndicator color={COLORS.PRIMARY} />
                    ) : (
                      <>
                        <Ionicons name="location-outline" size={20} color={COLORS.PRIMARY} />
                        <Text style={styles.gpsButtonText}>AUTO-SYNC LOCATION</Text>
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
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainButtonText}>CONFIRM CHANGES</Text>}
          </TouchableOpacity>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  loaderCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.BACKGROUND },
  navHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 15, 
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    ...SHADOWS.SOFT
  },
  navTitle: { fontSize: 12, fontWeight: '900', color: COLORS.TEXT_PRIMARY, letterSpacing: 2 },
  backButton: { 
    width: 40, 
    height: 40, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderRadius: RADIUS.S,
    borderWidth: 1,
    borderColor: COLORS.BORDER
  },
  
  scrollContent: { paddingBottom: 40 },
  
  avatarSection: { 
    alignItems: 'center', 
    paddingVertical: 40, 
    backgroundColor: COLORS.WHITE, 
    borderBottomLeftRadius: RADIUS.L, 
    borderBottomRightRadius: RADIUS.L,
    ...SHADOWS.SOFT
  },
  imageContainer: { position: 'relative' },
  avatarImage: { 
    width: 120, height: 120, 
    borderRadius: RADIUS.L, 
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 3,
    borderColor: COLORS.PRIMARY
  },
  editBadge: { 
    position: 'absolute', bottom: -5, right: -5, 
    backgroundColor: COLORS.PRIMARY, 
    width: 36, height: 36, 
    borderRadius: 10, 
    alignItems: 'center', justifyContent: 'center', 
    borderWidth: 3, borderColor: COLORS.WHITE 
  },
  avatarHint: { marginTop: 15, fontSize: 11, color: COLORS.TEXT_SECONDARY, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  
  formPadding: { paddingHorizontal: 20 },
  sectionTitle: { 
    fontSize: 10, fontWeight: '900', 
    color: COLORS.TEXT_SECONDARY, textTransform: 'uppercase', 
    letterSpacing: 1.5, marginBottom: 12, marginTop: 30, marginLeft: 5 
  },
  
  inputCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.M,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.SOFT
  },
  inputField: { marginBottom: 18 },
  floatingLabel: { fontSize: 9, fontWeight: '900', color: COLORS.TEXT_SECONDARY, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4, letterSpacing: 1 },
  textInput: { 
    backgroundColor: COLORS.BACKGROUND, 
    padding: 16, borderRadius: RADIUS.S, 
    fontSize: 15, color: COLORS.TEXT_PRIMARY, 
    borderWidth: 1, borderColor: COLORS.BORDER, fontWeight: '700' 
  },
  row: { flexDirection: 'row' },
  selectInput: { 
    backgroundColor: COLORS.BACKGROUND, 
    padding: 16, borderRadius: RADIUS.S, 
    flexDirection: 'row', justifyContent: 'space-between', 
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.BORDER 
  },
  selectText: { fontSize: 15, color: COLORS.TEXT_PRIMARY, fontWeight: '700' },
  
  gpsButton: { 
    height: 56, borderRadius: RADIUS.S, 
    borderStyle: 'dashed', borderWidth: 1.5, 
    borderColor: COLORS.PRIMARY, backgroundColor: COLORS.BACKGROUND, 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 
  },
  gpsButtonText: { fontSize: 12, color: COLORS.PRIMARY, fontWeight: '900', letterSpacing: 1 },
  
  addressActive: { 
    backgroundColor: COLORS.BACKGROUND, borderRadius: RADIUS.S, 
    padding: 16, borderWidth: 1, borderColor: COLORS.PRIMARY, 
    flexDirection: 'row', alignItems: 'center' 
  },
  addressValue: { flex: 1, fontSize: 13, color: COLORS.TEXT_PRIMARY, fontWeight: '700', lineHeight: 18 },
  addressRetry: { 
    marginLeft: 12, width: 36, height: 36, 
    backgroundColor: COLORS.WHITE, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.BORDER
  },
  
  datePickerCard: { backgroundColor: COLORS.WHITE, borderRadius: RADIUS.M, padding: 12, marginVertical: 10, borderWidth: 1, borderColor: COLORS.BORDER },
  dateDoneBtn: { padding: 14, alignItems: 'center', backgroundColor: COLORS.PRIMARY, borderRadius: RADIUS.S, marginTop: 10 },
  dateDoneText: { color: '#FFF', fontWeight: '900', fontSize: 12, letterSpacing: 1 },
  
  mainButton: { 
    backgroundColor: COLORS.PRIMARY, 
    marginHorizontal: 20, padding: 20, 
    borderRadius: RADIUS.M, alignItems: 'center', 
    marginTop: 40,
    ...SHADOWS.SOFT
  },
  mainButtonDisabled: { backgroundColor: COLORS.BORDER, shadowOpacity: 0 },
  mainButtonText: { color: '#FFF', fontWeight: '900', fontSize: 14, letterSpacing: 2 }
});