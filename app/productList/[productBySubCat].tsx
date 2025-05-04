import { useLocalSearchParams, Stack, useRouter, Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { getProductsBySubCat, Product } from '@/services/productService';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { ArrowLeft, Search, ShoppingCart } from 'lucide-react-native';
import GlobalSearchOverlay from '../components/GlobalSearchOverlay';
import ProductCard from '../components/ProductCard';
import Toast from 'react-native-toast-message';

const ProductBySubCat = () => {

    const params = useLocalSearchParams();
    const subCategory = params.productBySubCat as string;
    const subCategoryName =  params.subCategoryName as string;

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [products, setProducts] = useState<Product[]>([]); 

    const [isSearchOverlayVisible, setIsSearchOverlayVisible] = useState(false);
    
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
                const data = await getProductsBySubCat(subCategory);

                if (Array.isArray(data)) {
                    setProducts(data); 
                } else {
                    setProducts([]); 
                    setError('Invalid response data.');
                }
            } catch (err) {
                console.error(`Error fetching products for subcategory ${subCategory}:`, err);
                setError('Failed to load products.');
                setProducts([]);
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

    const handleProductList = () => {
        // Your navigation logic if necessary
    };

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
           elevation: 50,
           shadowColor: '#000',
           shadowOffset: { width: 0, height: 2 },
         }}
       >
         <Toast position="top" topOffset={60} />
       </View>
            <Stack.Screen
                options={{
                    title: subCategory,
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
                    <ActivityIndicator size="large" color="#22c55e" />
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
                        products.map((product, index) => (
                            <View key={index}>
                            <ProductCard product={product}  />
                           
                            </View>
                        ))
                    )}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toastWrapper: {
        position: 'absolute', // Make sure it stays on top
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999, // This will set the highest z-index
      },
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
        padding: 10,
    },
    scrollViewContent: {
        paddingBottom: 20,
    },
    emptyText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 50,
    },
});

export default ProductBySubCat;
