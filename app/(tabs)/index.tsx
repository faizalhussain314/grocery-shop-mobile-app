import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { MapPin, Bell, Search } from 'lucide-react-native';
import { Link } from 'expo-router';

const categories = [
  { id: 1, name: 'Meats', icon: '🥩' },
  { id: 2, name: 'Fresh', icon: '🥬' },
  { id: 3, name: 'Bakery', icon: '🥖' },
  { id: 4, name: 'Grains', icon: '🌾' },
  { id: 5, name: 'Organic', icon: '🥗' },
];

const popularItems = [
  {
    id: 1,
    name: 'Farm Fresh Produce',
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=800',
    price: 10.00,
    rating: 3.5,
    deliveryTime: '10 min',
    discount: '5%'
  },
  {
    id: 2,
    name: 'Tender Fresh Meats',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=800',
    price: 15.00,
    rating: 4.2,
    deliveryTime: '15 min',
    discount: '10%'
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
        {/* <TouchableOpacity style={[styles.deliveryOption, styles.deliveryOptionInactive]}>
          <Text style={styles.deliveryOptionTextInactive}>Pickup</Text>
        </TouchableOpacity> */}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {categories.map((category) => (
          <TouchableOpacity key={category.id} style={styles.categoryItem}>
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.popularSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Items</Text>
          <Link href="/shop" style={styles.seeAllLink}>
            <Text style={styles.seeAllText}>See All</Text>
          </Link>
        </View>

        {popularItems.map((item) => (
          <Link key={item.id} href={`/product/${item.id}`} asChild>
            <TouchableOpacity style={styles.productCard}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <View style={styles.productDetails}>
                  <Text style={styles.productPrice}>₹{item.price.toFixed(2)}</Text>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.rating}>⭐ {item.rating}</Text>
                  </View>
                </View>
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryTime}>🕒 {item.deliveryTime}</Text>
                  <Text style={styles.discount}>🏷️ {item.discount} off</Text>
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
  locationAddress:{
    marginLeft: 8,
    fontFamily: 'Poppins_500Medium',
    fontSize: 8,
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
  deliveryOptionInactive: {
    backgroundColor: '#f1f5f9',
  },
  deliveryOptionText: {
    color: '#ffffff',
    fontFamily: 'Poppins_500Medium',
  },
  deliveryOptionTextInactive: {
    color: '#64748b',
    fontFamily: 'Poppins_500Medium',
  },
  categoriesContainer: {
    paddingLeft: 20,
    marginBottom: 24,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 24,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
  },
  popularSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#1e293b',
  },
  seeAllLink: {
    padding: 8,
  },
  seeAllText: {
    color: '#22c55e',
    fontFamily: 'Poppins_500Medium',
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 200,
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#22c55e',
  },
  ratingContainer: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: {
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
  },
  deliveryInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  deliveryTime: {
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
  },
  discount: {
    fontFamily: 'Poppins_400Regular',
    color: '#22c55e',
  },
});