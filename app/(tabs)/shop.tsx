import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { Link } from 'expo-router';

const categories = [
  {
    id: 1,
    name: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?q=80&w=800',
    items: 45
  },
  {
    id: 2,
    name: 'Fruits',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=800',
    items: 32
  },
  {
    id: 3,
    name: 'Leafy Greens',
    image: 'https://images.unsplash.com/photo-1574316071802-0d684b3c01b8?q=80&w=800',
    items: 28
  },
  {
    id: 4,
    name: 'Organic',
    image: 'https://images.unsplash.com/photo-1594057687713-5fd14eed1c17?q=80&w=800',
    items: 16
  }
];

const products = [
  {
    id: 1,
    name: 'Fresh Broccoli',
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?q=80&w=800',
    price: 2.99,
    unit: 'bunch',
    rating: 4.5,
    organic: true
  },
  {
    id: 2,
    name: 'Red Bell Peppers',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?q=80&w=800',
    price: 1.49,
    unit: 'piece',
    rating: 4.2,
    organic: false
  },
  {
    id: 3,
    name: 'Fresh Carrots',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=800',
    price: 1.99,
    unit: 'bunch',
    rating: 4.8,
    organic: true
  },
  {
    id: 4,
    name: 'Cherry Tomatoes',
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?q=80&w=800',
    price: 3.49,
    unit: 'basket',
    rating: 4.6,
    organic: true
  }
];

export default function ShopScreen() {
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
        <Text style={styles.title}>Shop</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={20} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <SlidersHorizontal size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity key={category.id} style={styles.categoryCard}>
              <Image source={{ uri: category.image }} style={styles.categoryImage} />
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryItems}>{category.items} items</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.productsSection}>
        <Text style={styles.sectionTitle}>All Products</Text>
        <View style={styles.productsGrid}>
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} asChild>
              <TouchableOpacity style={styles.productCard}>
                <Image source={{ uri: product.image }} style={styles.productImage} />
                {product.organic && (
                  <View style={styles.organicBadge}>
                    <Text style={styles.organicText}>Organic</Text>
                  </View>
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <View style={styles.productDetails}>
                    <Text style={styles.productPrice}>₹{product.price.toFixed(2)}</Text>
                    <Text style={styles.productUnit}>/ {product.unit}</Text>
                  </View>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.rating}>⭐ {product.rating}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
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
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 24,
    color: '#1e293b',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  categoriesSection: {
    paddingTop: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#1e293b',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingLeft: 20,
    marginBottom: 24,
  },
  categoryCard: {
    width: 160,
    marginRight: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: 100,
  },
  categoryInfo: {
    padding: 12,
  },
  categoryName: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 4,
  },
  categoryItems: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#64748b',
  },
  productsSection: {
    paddingBottom: 24,
  },
  productsGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 140,
  },
  organicBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  organicText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: '#ffffff',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 4,
  },
  productDetails: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  productPrice: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#22c55e',
    marginRight: 4,
  },
  productUnit: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#64748b',
  },
  ratingContainer: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  rating: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#64748b',
  },
});