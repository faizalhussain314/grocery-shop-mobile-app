import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
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
  NotebookPen,
  Phone,
  Settings,
} from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { Link, RelativePathString, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { getProfile } from '@/services/profile';


type ProfileResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: 'customer' | string;
    isActive: boolean;
    vendorId?: string;
    isVeg?: boolean;
  };
  vendorUser?: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: 'vendor' | string;
    isActive: boolean;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  vendorCode?: string;
  serviceLocations?: string[];
  rating?: number;
  status?: string;
  mapUrl?: string;
};

const menuItems = [
  {
    id: 'notifications',
    title: 'Change Address',
    icon: NotebookPen,
    color: '#3b82f6',
    route: `/HelpCenter?type=${encodeURIComponent('Change Address')}` as RelativePathString,
  },
  {
    id: 'help',
    title: 'Help Center',
    icon: HelpCircle,
    color: '#10b981',
    route:"/HelpCenter" as RelativePathString
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
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const userInitials = profile?.user?.name
  ? profile.user.name
      .split(' ')
      .slice(0, 2)
      .map(p => p[0])
      .join('')
      .toUpperCase()
  : 'U';

const vendorInitials =
  profile?.vendorUser?.name
    ?.split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || 'V';


  useEffect(() => {
    (async () => {
      try {
        setLoadingProfile(true);
        const  data  = await getProfile();
      
        console.log("data",data)
        setProfile(data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
      finally{
        setLoadingProfile(false);
      }
    })(); 
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

  const handleMenuPress = (route?: RelativePathString) => {
    if (route) {
    
      router.push(route);
    }
  };

  if (!fontsLoaded || loadingProfile) {
        return (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loaderText}>Loading profile…</Text>
          </View>
        );
      }

  // const initials = profile
  //   ? `${profile.role[0].toUpperCase()}${profile.phoneNumber.slice(-2)}`
  //   : 'U';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Account</Text>
        {/* <TouchableOpacity style={styles.iconButton}>
          <Settings size={20} color="#64748b" />
        </TouchableOpacity> */}
      </View>
     
      <View style={styles.profile}>
  <View style={styles.profileHeader}>
    <View style={styles.initialsCircle}>
      <Text style={styles.initialsText}>{userInitials}</Text>
    </View>

    <View style={styles.profileInfo}>
    <Text style={styles.profileName}>{profile?.user?.name ?? '—'}</Text>
<Text style={styles.profileEmail}>{profile?.user?.email ?? '—'}</Text>
<Text style={styles.profileEmail}>{profile?.user?.phoneNumber ?? '—'}</Text>

    </View>
  </View>

  <TouchableOpacity style={styles.editButton}>
    <Link href="/edit-profile">
      <Text style={styles.editButtonText}>Edit Profile</Text>
    </Link>
  </TouchableOpacity>
</View>


{!!profile?.vendorUser && (
  <>
    <Text style={styles.sectionHeader}>Know Your Vendor</Text>

    <View style={styles.vendorCard}>
      <View style={styles.profileHeader}>
        <View style={styles.initialsCircle}>
          <Text style={styles.initialsText}>{vendorInitials}</Text>
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.vendorRow}>
            <Text style={styles.profileName}>
              {profile.vendorUser.name}
            </Text>

            {profile.status === 'active' && (
              <View style={styles.verifiedChip}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
          </View>

          <Text style={styles.profileEmail}>
            {profile.vendorUser.phoneNumber}
          </Text>

          {profile.vendorCode && (
            <Text style={styles.vendorCodeText}>
              Code: {profile.vendorCode}
            </Text>
          )}

          {profile.serviceLocations?.length ? (
            <Text style={styles.vendorCodeText}>
              Serves: {profile.serviceLocations.join(', ')}
            </Text>
          ) : null}
        </View>
      </View>

      <TouchableOpacity
        style={styles.callButton}
        onPress={() =>
          Linking?.openURL(`tel:${profile?.vendorUser?.phoneNumber}`)
        }
      >
        <Phone size={18} color="#fff" />
        <Text style={styles.callButtonText}>Call Now</Text>
      </TouchableOpacity>
    </View>
  </>
)}


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
    backgroundColor: '#FAF7FF',
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF7FF',
  },
  loaderText: {
    marginTop: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#94a3b8',
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
  sectionHeader: {
    marginTop: 24,
    marginHorizontal: 20,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#C191FF',
  },
  vendorText:{
    fontSize: 16,
    color: '#C191FF',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom:20,
  },
  vendorCard: {
    backgroundColor: '#F7F4FF',
    marginTop: 12,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9DFFF',
  },

  /* row that holds name + verified badge */
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  vendorCodeText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  

  verifiedChip: {
    marginLeft: 8,
    backgroundColor: '#E9DFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 10,
    fontFamily: 'Poppins_500Medium',
    color: '#7C3AED',
  },

  /* --- big purple call button --- */
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
  },
  callButtonText: {
    marginLeft: 8,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#ffffff',
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
  // callButton:{
  //   backgroundColor: '#AC6CFF',
  //   paddingVertical: 8,
  //   paddingHorizontal: 16,
  //   borderRadius: 12,
  //   width:"100%",
  //   alignSelf: 'center',
  //   borderWidth:2,
  // },
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
