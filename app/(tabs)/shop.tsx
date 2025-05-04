import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import { Search, ShoppingCart, SlidersHorizontal } from "lucide-react-native";
import { useState, useEffect } from "react";
import { Category, getCategories } from "@/services/categroyService";
import { Product, getProducts } from "@/services/productService";
import Constants from "expo-constants";
import { Link, useRouter } from "expo-router";
import ProductCard from "../components/ProductCard"; 
import GlobalSearchOverlay from "../components/GlobalSearchOverlay"; 
import Toast from "react-native-toast-message";

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
 
  const [isSearchOverlayVisible, setIsSearchOverlayVisible] = useState(false);
   const router = useRouter(); 


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


  const openSearchOverlay = () => {
    setIsSearchOverlayVisible(true);
  };

 
  const closeSearchOverlay = () => {
    setIsSearchOverlayVisible(false);
  };
  const handleCategoryClick = (category: Category) => {
    console.log('Category clicked:', category.name);
    // Navigate to the subcategory list page, passing category name
    // The route is /subcategories/[categoryName]
    router.push({
      pathname: '/subcategories/[categoryName]',
      params: { categoryName: category.name }, // Pass category name as parameter
    });
  };


  if (!fontsLoaded || isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (

    <View style={styles.container}>
        <View style={styles.toastWrapper}>
          <Toast position="top" topOffset={90} />
        </View>
   
    <ScrollView >
      <View style={styles.header}>
        <Text style={styles.title}>Shop</Text>
        <View style={styles.headerIcons}>
         
          <TouchableOpacity
            style={styles.iconButton}
            onPress={openSearchOverlay} 
          >
            <Search size={20} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
          <Link href={"/cart"} > <ShoppingCart size={20} color="#64748b" /></Link>
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
            {categories.map((category , index) => (
             
              <TouchableOpacity key={index} style={styles.categoryCard} onPress={() => handleCategoryClick(category)} >
                <Image
                  source={{ uri: `${category.image}` }}
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
            products.map((product , index) => (
              <ProductCard
                key={index} 
                product={product}
              />
            ))
          ) : (
            <Text style={{ padding: 20, color: "#94a3b8" }}>No products found.  </Text>
          )}
        </View>
      </View>

     
      <GlobalSearchOverlay
        isVisible={isSearchOverlayVisible}
        onClose={closeSearchOverlay} 
      />

    </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F8E9" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#ffffff",
  },
  toastWrapper: {
    position: 'absolute', // Make sure it stays on top
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999, // This will set the highest z-index
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
    color: "#212121",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  categoryImage: { width: "100%", height: 100, resizeMode: 'cover' },
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc', // Match container background
  },
  loadingText: {
    marginTop: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#94a3b8', 
  },
});