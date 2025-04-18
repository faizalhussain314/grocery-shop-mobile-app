import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import {
  Bell,
  HelpCircle,
  LogOut,
  Settings,
} from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';

const menuItems = [
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Bell,
    color: '#3b82f6',
  },
  {
    id: 'help',
    title: 'Help Center',
    icon: HelpCircle,
    color: '#10b981',
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings,
    color: '#6b7280',
  },
];

export default function AccountScreen() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<{
    phoneNumber: string;
    role: string;
    isActive: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        setProfile(response.data);
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleMenuPress = (route?: string) => {
    if (route) {
      router.push(route);
    }
  };

  if (!fontsLoaded) return null;

  const initials = profile
    ? `${profile.role[0].toUpperCase()}${profile.phoneNumber.slice(-2)}`
    : 'U';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Account</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Settings size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <View style={styles.profile}>
        <View style={styles.profileHeader}>
          <View style={styles.initialsCircle}>
            <Text style={styles.initialsText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile?.role?.toUpperCase() || 'Customer'}
            </Text>
            <Text style={styles.profileEmail}>
              {profile?.phoneNumber || 'Phone not available'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item.route)}
          >
            <View
              style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}
            >
              <item.icon size={20} color={item.color} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <ActivityIndicator color="#ef4444" />
        ) : (
          <>
            <LogOut size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Log Out</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 24,
    color: '#1e293b',
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  profile: {
    backgroundColor: '#ffffff',
    marginTop: 20,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  initialsCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  initialsText: {
    fontSize: 24,
    color: '#1e293b',
    fontFamily: 'Poppins_600SemiBold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#64748b',
  },
  editButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#1e293b',
  },
  menu: {
    backgroundColor: '#ffffff',
    marginTop: 20,
    marginHorizontal: 20,
    padding: 8,
    borderRadius: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#1e293b',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 16,
    borderRadius: 16,
  },
  logoutText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#ef4444',
    marginLeft: 8,
  },
});
