import { useLocalSearchParams, Stack, useRouter, Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { getProductsBySubCat, Product } from '@/services/productService';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import { ArrowLeft, Search, ShoppingCart } from 'lucide-react-native';
import GlobalSearchOverlay from '../components/GlobalSearchOverlay';
import ProductCard from '../components/ProductCard';
import Toast from 'react-native-toast-message';

const ProductBySubCat = () => {
    const params = useLocalSearchParams();
    const subCategory = params.productBySubCat as string;
    const subCategoryName = params.subCategoryName as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false); // New state for load more
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
          setIsLoadingMore(true); // Use separate loading state
      
          const { results } = await getProductsBySubCat(subCategory, nextPage, ITEMS_PER_PAGE);
      
          setProducts(prev => [...prev, ...results]);
          setPage(nextPage);
        } catch (err) {
          console.error('Error loading more products:', err);
        } finally {
          setIsLoadingMore(false); // Reset load more loading state
        }
    };

    if (!fontsLoaded) {
        return null;
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
                    elevation: 50,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                }}
            >
                <Toast position="top" topOffset={60} />
            </View>
            
            <Stack.Screen
                options={{
                    title: subCategoryName,
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
                                <TouchableOpacity 
                                    style={[styles.loadMoreButton, isLoadingMore && styles.loadMoreButtonDisabled]} 
                                    onPress={loadMoreProducts}
                                    disabled={isLoadingMore}
                                >
                                    {isLoadingMore ? (
                                        <View style={styles.loadMoreContent}>
                                            <ActivityIndicator size="small" color="#fff" style={styles.loadMoreSpinner} />
                                            <Text style={styles.loadMoreText}>Loading...</Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.loadMoreText}>Load More</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </ScrollView>
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
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 10,
        backgroundColor: "#ffffff",
    },
    title: { 
        fontFamily: "Poppins_600SemiBold", 
        fontSize: 18, 
        color: "#1e293b", 
        justifyContent: "center" 
    },
    headerIcons: { 
        flexDirection: "row", 
        gap: 12 
    },
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
        color: '#ef4444',
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        paddingHorizontal: 5,
        paddingVertical: 10,
    },
    productItemWrapper: {
        width: '100%',
        marginBottom: 15,
    },
    emptyText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 50,
        width: '100%',
    },
    loadMoreButton: {
        alignSelf: 'center',
        backgroundColor: '#AC6CFF',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 20,
        marginBottom: 40,
        minHeight: 40,
    },
    loadMoreButtonDisabled: {
        opacity: 0.7,
    },
    loadMoreContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadMoreSpinner: {
        marginRight: 8,
    },
    loadMoreText: {
        color: '#fff',
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
    },
});

export default ProductBySubCat;