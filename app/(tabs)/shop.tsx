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
import { Product, getProducts, ProductsResponse } from "@/services/productService";
import Constants from "expo-constants";
import { Link, useRouter } from "expo-router";
import ProductCard from "../components/ProductCard";
import GlobalSearchOverlay from "../components/GlobalSearchOverlay";
import Toast from "react-native-toast-message";
import CartIconWithBadge from "../components/CartIconWithBadge";
import { useBackRedirect } from "@/hooks/useBackRedirect";

export default function ProductsScreen() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearchOverlayVisible, setIsSearchOverlayVisible] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const router = useRouter();


 

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        const [categoryData, productsData] = await Promise.all([
          getCategories(),
          getProducts(1, ITEMS_PER_PAGE), // Fetch first page
        ]);

        setCategories(categoryData);
        setProducts(productsData.results);
        setCurrentPage(productsData.pagination.page);
        setTotalPages(productsData.pagination.totalPages);
        setTotalResults(productsData.pagination.totalResults);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const openSearchOverlay = () => {
    setIsSearchOverlayVisible(true);
  };

  const closeSearchOverlay = () => {
    setIsSearchOverlayVisible(false);
  };

  const handleCategoryClick = (category: Category) => {
    console.log('Category clicked:',category.name ,  category.id);
    router.push({
      pathname: '/subcategories/[categoryId]',
      params: { categoryId: category.id , categoryName: category.name },
    });
  };

  const loadMoreProducts = async () => {
    if (currentPage >= totalPages || isLoadingMore) {
      return; 
    }

    try { 
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      
      const productsData = await getProducts(nextPage, ITEMS_PER_PAGE);
      
      // Append new products to existing ones
      setProducts(prevProducts => [...prevProducts, ...productsData.results]);
      setCurrentPage(productsData.pagination.page);
      setTotalPages(productsData.pagination.totalPages);
      setTotalResults(productsData.pagination.totalResults);
    } catch (error) {
      console.error("Failed to load more products:", error);
      // You could show a toast error message here
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (!fontsLoaded || isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#9747FF" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toastWrapper}>
        <Toast position="top" topOffset={90} />
      </View>

      <ScrollView>
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
              <CartIconWithBadge />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <Text style={styles.marketNote}>Prices may vary depending on market demand</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            <View style={{ flexDirection: "row" }}>
              {Array.isArray(categories) && categories.length > 0 ? (
                categories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.categoryCard}
                    onPress={() => handleCategoryClick(category)}
                  >
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
                ))
              ) : (
                <Text style={{ padding: 20, color: '#94a3b8' }}>
                  No categories found.
                </Text>
              )}
            </View>
          </ScrollView>
        </View>

        <View style={styles.productsSection}>
          <View style={styles.productsSectionHeader}>
            <Text style={styles.sectionTitle}>All Products</Text>
            <Text style={styles.productsCount}>
              Showing {products.length} of {totalResults} products
            </Text>
          </View>
          
          <View style={styles.productsGrid}>
            {Array.isArray(products) && products.length > 0 ? (
              products.map((product, index) => (
                <ProductCard
                  key={`${product._id}-${index}`} // Use product ID for better key
                  product={product}
                />
              ))
            ) : (
              <Text style={{ padding: 20, color: "#94a3b8" }}>
                No products found.
              </Text>
            )}
          </View>

          {/* Load More Button */}
          {currentPage < totalPages && (
            <TouchableOpacity
              style={[
                styles.loadMoreButton,
                isLoadingMore && styles.loadMoreButtonDisabled
              ]}
              onPress={loadMoreProducts}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <View style={styles.loadMoreLoadingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.loadMoreText}>Loading...</Text>
                </View>
              ) : (
                <Text style={styles.loadMoreText}>
                  Load More 
                </Text>
              )}
            </TouchableOpacity>
          )}

          {/* End of products message */}
          {currentPage >= totalPages && products.length > 0 && (
            <View style={styles.endOfProductsContainer}>
              <Text style={styles.endOfProductsText}>
                You've reached the end! All  products loaded.
              </Text>
            </View>
          )}
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
  container: { flex: 1, backgroundColor: "#FAF7FF" },
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  title: { fontFamily: "Poppins_600SemiBold", fontSize: 24, color: "#1e293b" },
  headerIcons: { flexDirection: "row", gap: 12 },
  iconButton: {
    padding: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
  },
  marketNote: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#64748b',
    paddingHorizontal: 20,
    marginBottom: 12,
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
  productsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  productsCount: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#64748b",
  },
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
    backgroundColor: '#FAF7FF',
  },
  loadingText: {
    marginTop: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#94a3b8',
  },
  loadMoreButton: {
    alignSelf: 'center',
    backgroundColor: '#AC6CFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadMoreButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  loadMoreText: {
    color: '#fff',
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
  },
  loadMoreLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  endOfProductsContainer: {
    alignSelf: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  endOfProductsText: {
    color: '#64748b',
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },
});