import { useLocalSearchParams, Stack, useRouter, Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { getProductsBySubCat, Product } from '@/services/productService'; // Ensure Product type is correctly defined
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native'; // Added Dimensions
import { ArrowLeft, Search, ShoppingCart } from 'lucide-react-native';
import GlobalSearchOverlay from '../components/GlobalSearchOverlay';
import ProductCard from '../components/ProductCard';
import Toast from 'react-native-toast-message';

// Assuming Product type is something like this (adjust based on your actual Product type)
// interface Product {
//   id: string | number; // Or whatever unique identifier you have
//   name: string;
//   price: number;
//   imageUrl: string;
//   // ... other properties
// }


const ProductBySubCat = () => {
    const params = useLocalSearchParams();
    const subCategory = params.productBySubCat as string;
    const subCategoryName = params.subCategoryName as string;

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [products, setProducts] = useState<Product[]>([]);

    const [isSearchOverlayVisible, setIsSearchOverlayVisible] = useState(false);
    
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const ITEMS_PER_PAGE = 10;



    const router = useRouter();

    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_500Medium,
        Poppins_600SemiBold,
    });


    useEffect(() => {
        const fetchProduct = async () => {
          if (!subCategory) {
            setError('Subcategory ID is missing.');
            setIsLoading(false);
            return;
          }
      
          try {
            setIsLoading(true);
            setError(null);
      
            setProducts([]);
            setPage(1);
      
            const { results, totalPages } = await getProductsBySubCat(subCategory, 1, ITEMS_PER_PAGE);
      
            setProducts(results);
            setTotalPages(totalPages);
          } catch (err) {
            console.error(`Error fetching products for subcategory ${subCategory}:`, err);
            setError('Failed to load products.');
          } finally {
            setIsLoading(false);
          }
        };
      
        fetchProduct();
      }, [subCategory]);
      
    

    const closeSearchOverlay = () => {
        setIsSearchOverlayVisible(false);
    };

    const openSearchOverlay = () => {
        setIsSearchOverlayVisible(true);
    };

    const loadMoreProducts = async () => {
        const nextPage = page + 1;
        if (nextPage > totalPages) return;
      
        try {
          setIsLoading(true);
      
          const { results } = await getProductsBySubCat(subCategory, nextPage, ITEMS_PER_PAGE);
      
          setProducts(prev => [...prev, ...results]);
          setPage(nextPage);
        } catch (err) {
          console.error('Error loading more products:', err);
        } finally {
          setIsLoading(false);
        }
      };
      
      

    // const handleProductList = () => { // This function seems unused
    //     // Your navigation logic if necessary
    // };

    if (!fontsLoaded) {
        return null; // Or a loading indicator
    }

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <Text style={styles.title}>{subCategoryName}</Text>
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
            <View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 9999,
                    elevation: 50, // Ensure this works as expected on Android
                    shadowColor: '#000', // For iOS shadow
                    shadowOffset: { width: 0, height: 2 }, // For iOS shadow
                    shadowOpacity: 0.1, // For iOS shadow
                    shadowRadius: 3, // For iOS shadow
                }}
            >
                <Toast position="top" topOffset={60} />
            </View>
            <Stack.Screen
                options={{
                    title: subCategoryName, // Changed from subCategory to subCategoryName for better UX
                    headerTitleStyle: {
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18,
                        color: '#1e293b',
                    },
                    headerStyle: {
                        backgroundColor: '#ffffff',
                    },
                    headerTintColor: '#1e293b',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10, padding: 5 }}>
                            <ArrowLeft size={24} color="#1e293b" />
                        </TouchableOpacity>
                    ),
                    headerShadowVisible: false,
                }}
            />

            <GlobalSearchOverlay isVisible={isSearchOverlayVisible} onClose={closeSearchOverlay} />

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#9747FF" />
                    <Text style={styles.loadingText}>Loading products...</Text>
                </View>
            )}

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {!isLoading && !error && (
              <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
              {products.length === 0 ? (
                <Text style={styles.emptyText}>No products found for this subcategory.</Text>
              ) : (
                <>
                  {products.map((product) => (
                    <ProductCard product={product} key={product._id} />
                  ))}
            
            {page < totalPages && (
  <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreProducts}>
    <Text style={styles.loadMoreText}>Load More</Text>
  </TouchableOpacity>
)}

                </>
              )}
            </ScrollView>
            
            )}
            {products.length < products.length && (
  <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreProducts}>
    <Text style={styles.loadMoreText}>Load More</Text>
  </TouchableOpacity>
)}

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF7FF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // toastWrapper style was defined but not used, Toast component is positioned directly.
    // If you intended to use toastWrapper, apply it to the View wrapping Toast.
    // For now, it's removed to avoid confusion as Toast has its own positioning.
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20, // Adjusted padding, Stack.Screen provides its own header space
        paddingBottom: 20,
        backgroundColor: "#ffffff", // This header might conflict with Stack.Screen header
                                   // Consider if this custom header is still needed or if Stack.Screen options are enough
    },
    title: { fontFamily: "Poppins_600SemiBold", fontSize: 24, color: "#1e293b" },
    headerIcons: { flexDirection: "row", gap: 12 },
    iconButton: {
        padding: 8,
        backgroundColor: "#f1f5f9",
        borderRadius: 12,
    },
    loadingText: {
        marginTop: 12,
        fontFamily: 'Poppins_400Regular',
        fontSize: 16,
        color: '#94a3b8',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 16,
        color: '#ef4444', // Red color for error
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
       
    },
    scrollViewContent: {
        flexDirection: 'row', // Arrange children in a row
        flexWrap: 'wrap',     // Allow items to wrap to the next line
        justifyContent: 'space-around', // Distribute space around items
        paddingHorizontal: 5, // Add some horizontal padding to the container
        paddingVertical: 10,  // Add some vertical padding
         
    },
    productItemWrapper: {
        width: '100%', // Each item takes up slightly less than half the width to allow for space between
        marginBottom: 15, // Add some margin at the bottom of each item
        // You can add padding here if ProductCard itself doesn't have enough
        // e.g., padding: 5,
    },
    emptyText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 50,
        width: '100%', // Ensure it takes full width if it's the only item
    },
    loadMoreButton: {
        alignSelf: 'center',
        backgroundColor: '#AC6CFF',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 20,
        marginBottom: 40,
      },
      loadMoreText: {
        color: '#fff',
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
      },
      
});

export default ProductBySubCat;