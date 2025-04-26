import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Share as RNShare,
  Platform,
} from 'react-native';
import { useLocalSearchParams, Link, useRouter } from 'expo-router';
import { getProductById, Product } from '@/services/productService';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import { ArrowLeft, Share2, Minus, Plus } from 'lucide-react-native';
import Constants from 'expo-constants';
import { useDispatch } from 'react-redux';
import { addItemToCartThunk } from '@/thunks/cartActions';
import Toast from 'react-native-toast-message';
import { ActivityIndicator } from 'react-native';
import { useAppDispatch } from '@/lib/hook';

export default function ProductScreen() {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [cartAdded, setCartAdded] = useState(false);
  const router = useRouter();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const dispatch = useAppDispatch();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });
  const BASE_URL = Constants?.expoConfig?.extra?.VITE_WEB_URL ?? '';

 

  const handleShare = useCallback(async () => {
    if (!product) return;

    try {
      const result = await RNShare.share({
        message: Platform.OS === 'ios' ? '' : `Check out ${product.name}!`,
        url: Platform.OS === 'ios' ? `${BASE_URL}/product/${product.id}` : undefined,
        title: `Check out ${product.name}!`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [product]);

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setIsAddingToCart(true);
      await dispatch(addItemToCartThunk(product.id, quantity.toString()));
      setCartAdded(true);
      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: `${product.name} has been added successfully!`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Add to Cart Failed',
        text2: 'Please try again.',
      });
    } finally {
      setIsAddingToCart(false);
      setTimeout(() => setCartAdded(false), 3000);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, 10)); // Max 10 items
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1)); // Min 1 item
  };

  const handleQuickQuantity = (amount: number) => {
    setQuantity(prev => prev + amount);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  if (!fontsLoaded || !product || loading) return null;

  return (
    <View style={styles.container}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999, elevation: 50, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 } }}>
        <Toast position="top" topOffset={60} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Link href=".." asChild>
            <TouchableOpacity style={styles.iconButton}>
              <ArrowLeft size={20} color="#64748b" />
            </TouchableOpacity>
          </Link>
          <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
            <Share2 size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <Image
          source={{ uri: `${BASE_URL}${product.image}` }}
          style={styles.productImage}
        />

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>₹{product.price.toFixed(2)}</Text>
              <Text style={styles.unit}>/ {product.unit}</Text>
            </View>
          </View>

          {product.active && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Available</Text>
            </View>
          )}

          <View style={styles.ratingSection}>
            <Text style={styles.rating}>⭐ {product.rating ?? 4.5}</Text>
            <Text style={styles.reviews}>Based on 128 reviews</Text>
          </View>

          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]} 
                onPress={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus size={20} color={quantity <= 1 ? "#94a3b8" : "#64748b"} />
              </TouchableOpacity>
              
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantity}</Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.quantityButton, quantity >= 10 && styles.quantityButtonDisabled]}
                onPress={incrementQuantity}
                disabled={quantity >= 10}
              >
                <Plus size={20} color={quantity >= 10 ? "#94a3b8" : "#64748b"} />
              </TouchableOpacity>
            </View>

            <View style={styles.quickQuantityButtons}>
              <TouchableOpacity
                style={[styles.quickQuantityButton, quantity === 0.25 && styles.quickQuantityButtonActive]}
                onPress={() => handleQuickQuantity(0.25)}
              >
                <Text style={[styles.quickQuantityText, quantity === 0.25 && styles.quickQuantityTextActive]}>250g</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickQuantityButton, quantity === 0.5 && styles.quickQuantityButtonActive]}
                onPress={() => handleQuickQuantity(0.5)}
              >
                <Text style={[styles.quickQuantityText, quantity === 0.5 && styles.quickQuantityTextActive]}>500g</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {product.description ?? 'No description available.'}
            </Text>
          </View>

          {product.nutrition && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nutrition Facts</Text>
              <View style={styles.nutritionGrid}>
                {Object.entries(product.nutrition).map(([key, value]) => (
                  <View key={key} style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{value}</Text>
                    <Text style={styles.nutritionLabel}>{key}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.addToCartButton, isAddingToCart && { opacity: 0.6 }]}
          onPress={handleAddToCart}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addToCartText}>Add to Cart</Text>
          )}
        </TouchableOpacity>

        <Link href="/cart" asChild>
          <TouchableOpacity style={styles.cartIcon}>
            <Text>🛒</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  iconButton: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 400,
  },
  content: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 16,
  },
  productName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 24,
    color: '#1e293b',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 24,
    color: '#22c55e',
    marginRight: 4,
  },
  unit: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#64748b',
  },
  badge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  badgeText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#ffffff',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  rating: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#1e293b',
    marginRight: 8,
  },
  reviews: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#64748b',
  },
  quantitySection: {
    marginBottom: 24,
  },
  quantityLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  quantityButton: {
    padding: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityButtonDisabled: {
    backgroundColor: '#f1f5f9',
    shadowOpacity: 0,
    elevation: 0,
  },
  quantityDisplay: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  quantityText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#1e293b',
  },
  quickQuantityButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quickQuantityButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickQuantityButtonActive: {
    backgroundColor: '#22c55e15',
    borderColor: '#22c55e',
  },
  quickQuantityText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#64748b',
  },
  quickQuantityTextActive: {
    color: '#22c55e',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  nutritionItem: {
    width: '25%',
    padding: 8,
  },
  nutritionValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#64748b',
    textTransform: 'capitalize',
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginRight: 12,
  },
  addToCartText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  cartIcon: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});