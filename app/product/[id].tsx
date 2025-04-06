import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { ArrowLeft, Share2 } from 'lucide-react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { TextInput } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';



const products = {
  1: {
    id: 1,
    name: 'Fresh Broccoli',
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?q=80&w=800',
    price: 40,
    unit: 'kg',
    rating: 4.5,
    organic: true,
    description: 'Farm-fresh broccoli, picked at peak ripeness. Rich in vitamins and minerals, perfect for steaming, roasting, or adding to your favorite recipes.',
    nutrition: {
      calories: 55,
      protein: '3.7g',
      carbs: '11.2g',
      fiber: '5.2g'
    }
  },
  // Add other products here
};

export default function ProductScreen() {
  const [quantity, setQuantity] = useState('');
  const [isQuantityOpen, setIsQuantityOpen] = useState(false);

  const { id } = useLocalSearchParams();
  const product = products[Number(id)];

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });
  

  if (!fontsLoaded || !product) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Link href=".." asChild>
            <TouchableOpacity style={styles.iconButton}>
              <ArrowLeft size={20} color="#64748b" />
            </TouchableOpacity>
          </Link>
          <TouchableOpacity style={styles.iconButton}>
            <Share2 size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <Image source={{ uri: product.image }} style={styles.productImage} />

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>₹{product.price.toFixed(2)}</Text>
              <Text style={styles.unit}>/ {product.unit}</Text>
            </View>
          </View>

          {product.organic && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Organic</Text>
            </View>
          )}

          <View style={styles.ratingSection}>
            <Text style={styles.rating}>⭐ {product.rating}</Text>
            <Text style={styles.reviews}>Based on 128 reviews</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

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
        </View>
      </ScrollView>
      <View style={styles.quantityContainer}>
  <TouchableOpacity
    onPress={() => setIsQuantityOpen((prev) => !prev)}
    style={styles.quantityToggle}
  >
    <Text style={styles.quantityLabel}>Quantity (kg)</Text>
    {isQuantityOpen ? (
      <ChevronUp size={20} color="#1e293b" />
    ) : (
      <ChevronDown size={20} color="#1e293b" />
    )}
  </TouchableOpacity>

  {isQuantityOpen && (
    <>
      <TextInput
        style={styles.quantityInput}
        placeholder="e.g. 1.5"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="decimal-pad"
      />

      <View style={styles.quickButtons}>
        {['0.25', '0.5', '0.75', '1'].map((val) => (
          <TouchableOpacity
            key={val}
            style={styles.quickButton}
            onPress={() =>
              setQuantity((prev) =>
                (parseFloat(prev || '0') + parseFloat(val)).toString()
              )
            }
          >
            <Text style={styles.quickButtonText}>+{val}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  )}
</View>


      <View style={styles.footer}>
        <TouchableOpacity style={styles.addToCartButton}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
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
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  addToCartButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  addToCartText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  quantityContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  
  quantityLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 8,
  },
  
  quantityInput: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    marginBottom: 12,
    color: '#1e293b',
  },
  
  quickButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  
  quickButton: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 8,
  },
  
  quickButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#1e293b',
  },
  
  
  quantityToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  
 
  
});