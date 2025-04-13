import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import { Search, SlidersHorizontal } from "lucide-react-native";
import { useState, useEffect } from "react";
import { Category, getCategories } from "@/services/categroyService";
import { Product, getProducts } from "@/services/productService";
import Constants from "expo-constants";
import { Link } from "expo-router";
import { ActivityIndicator } from 'react-native';


export default function ProductsScreen() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const BASE_URL = Constants?.expoConfig?.extra?.VITE_WEB_URL ?? "";
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryData, productData] = await Promise.all([
          getCategories(),
          getProducts(),
        ]);
        setCategories(categoryData);
        setProducts(productData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, []);
  

 

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data); // ✅ already the array
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]); // fallback
    }
  };

  fetchProducts();
}, []);


if (!fontsLoaded || isLoading) {
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#22c55e" />
      <Text style={styles.loadingText}>Loading products...</Text>
    </View>
  );
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          <View style={{ flexDirection: "row" }}>
            {categories.map((category) => (
              <TouchableOpacity key={category.id} style={styles.categoryCard}>
                <Image
                  source={{ uri: `${BASE_URL}${category.image}` }}
                  style={styles.categoryImage}
                />
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryItems}>
                    {category.isActive ? "Active" : "Inactive"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.productsSection}>
        <Text style={styles.sectionTitle}>All Products</Text>
        <View style={styles.productsGrid}>
        {Array.isArray(products) && products.length > 0 ? (
  products.map((product) => (
    <Link key={product.id} href={`/product/${product.id}`} asChild>
      <TouchableOpacity style={styles.productCard}>
        <Image source={{ uri: `${BASE_URL}${product.image}` }} style={styles.productImage} />
        {product.organic && (
          <View style={styles.organicBadge}>
            <Text style={styles.organicText}>Organic</Text>
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.productDetails}>
            <Text style={styles.productPrice}>
              ₹{product.price.toFixed(2)}
            </Text>
            <Text style={styles.productUnit}>/ {product.unit}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {product?.rating}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  ))
) : (
  <Text style={{ padding: 20, color: "#94a3b8" }}>No products found.</Text>
)}

        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#ffffff",
  },
  title: { fontFamily: "Poppins_600SemiBold", fontSize: 24, color: "#1e293b" },
  headerIcons: { flexDirection: "row", gap: 12 },
  iconButton: {
    padding: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
  },
  categoriesSection: { paddingTop: 24 },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: "#1e293b",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoriesContainer: { paddingLeft: 20, marginBottom: 24 },
  categoryCard: {
    width: 160,
    marginRight: 16,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
  },
  categoryImage: { width: "100%", height: 100 },
  categoryInfo: { padding: 12 },
  categoryName: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: "#1e293b",
    marginBottom: 4,
  },
  categoryItems: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#64748b",
  },
  productsSection: { paddingBottom: 24 },
  productsGrid: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  productImage: { width: "100%", height: 140 },
  organicBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#22c55e",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  organicText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 10,
    color: "#ffffff",
  },
  productInfo: { padding: 12 },
  productName: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: "#1e293b",
    marginBottom: 4,
  },
  productDetails: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  productPrice: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#22c55e",
    marginRight: 4,
  },
  productUnit: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#64748b",
  },
  ratingContainer: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  rating: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#64748b",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#94a3b8',
  },
  
});
