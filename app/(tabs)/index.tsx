import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { MapPin, Bell, Search } from 'lucide-react-native';
import { Link } from 'expo-router';

const subcategories = [
  {
    "id": 1,
    "name": "potato",
    "image": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "category": "Fresh",
    "count": "50 items"
  },
  {
    "id": 2,
    "name": "Brinjal",
    "image": "https://images.unsplash.com/photo-1613881553903-4543f5f2cac9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "category": "Fresh",
    "count": "60 items"
  },
  {
    "id": 3,
    "name": "Bitter Gourd",
    "image": "https://images.unsplash.com/photo-1588391453522-a8b470845269?q=80&w=2126&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "category": "Fresh",
    "count": "40 items"
  },
  {
    "id": 4,
    "name": "tomato",
    "image": "https://images.unsplash.com/photo-1561136594-7f68413baa99?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "category": "Fresh",
    "count": "30 items"
  },
  {
    "id": 5,
    "name": "Pumpkin",
    "image": "https://images.unsplash.com/photo-1695590683093-a1aada150ed9?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "category": "Fresh",
    "count": "25 items"
  },
  {
    "id": 6,
    "name": "Broad Beans",
    "image": "https://images.unsplash.com/photo-1609820323628-621956856049?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "category": "Fresh",
    "count": "40 items"
  },
];



export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <MapPin size={20} color="#64748b" />
          <Text style={styles.locationText}>GK apparments</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={20} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.deliveryOptions}>
        <TouchableOpacity style={styles.deliveryOption}>
          <Text style={styles.deliveryOptionText}>6 AM delivery</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Fresh & Healthy</Text>
        <Text style={styles.welcomeSubtitle}>Discover fresh items for your daily needs</Text>
      </View>

      <View style={styles.subcategoriesGrid}>
        {subcategories.map((subcat) => (
          <Link key={subcat.id} href={`/category/${subcat.id}`} asChild>
            <TouchableOpacity style={styles.subcategoryCard}>
              <Image source={{ uri: subcat.image }} style={styles.subcategoryImage} />
              <View style={styles.subcategoryOverlay}>
                <View style={styles.subcategoryContent}>
                  <Text style={styles.subcategoryName}>{subcat.name}</Text>
                  <Text style={styles.subcategoryCount}>{subcat.count}</Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{subcat.category}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>
        ))}
      </View>
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#1e293b',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  deliveryOptions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  deliveryOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#22c55e',
    borderRadius: 20,
  },
  deliveryOptionText: {
    color: '#ffffff',
    fontFamily: 'Poppins_500Medium',
  },
  welcomeSection: {
    padding: 20,
    paddingTop: 0,
  },
  welcomeTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 24,
    color: '#1e293b',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#64748b',
  },
  subcategoriesGrid: {
    padding: 20,
    gap: 16,
  },
  subcategoryCard: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  subcategoryImage: {
    width: '100%',
    height: '100%',
  },
  subcategoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 16,
    justifyContent: 'space-between',
  },
  subcategoryContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  subcategoryName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 4,
  },
  subcategoryCount: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#f1f5f9',
  },
  categoryBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryBadgeText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#1e293b',
  },
});