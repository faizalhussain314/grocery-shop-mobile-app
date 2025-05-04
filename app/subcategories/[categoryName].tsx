// app/subcategories/[categoryName].tsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import Constants from "expo-constants";
import { getSubcategoriesByCategoryName, Subcategory } from '@/services/subcategoryService'; // Import the new service
import { ArrowLeft, Search } from 'lucide-react-native'; // Import back icon
import GlobalSearchOverlay from '../components/GlobalSearchOverlay';

const BASE_URL = Constants?.expoConfig?.extra?.VITE_WEB_URL ?? "";
const { width } = Dimensions.get('window'); // Get screen width for responsive grid

export default function SubcategoryListPage() {
    // Get parameters from the route
    const params = useLocalSearchParams();
    const categoryName = params.categoryName as string; // The name of the parent category

    const router = useRouter();

    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_500Medium,
        Poppins_600SemiBold,
    });

    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSearchOverlayVisible, setIsSearchOverlayVisible] = useState(false);

    useEffect(() => {
        const fetchSubcategories = async () => {
            if (!categoryName) {
                setError('Category name is missing.');
                setIsLoading(false);
                return;
            }
            try {
                setIsLoading(true);
                setError(null);
                const data = await getSubcategoriesByCategoryName(categoryName);
                setSubcategories(data);
            } catch (err) {
                console.error(`Error fetching subcategories for ${categoryName}:`, err);
                setError(`Failed to load subcategories for "${categoryName}".`);
                setSubcategories([]); // Clear any previous results on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubcategories();
    }, [categoryName]); // Re-fetch if categoryName changes

    if (!fontsLoaded) {
        return null; // Or a loading indicator
    }

    const closeSearchOverlay = () => {
        setIsSearchOverlayVisible(false);
    };

    const openSearchOverlay = () => {
        setIsSearchOverlayVisible(true);
    };

    const handleProductList = (subcategory: Subcategory) => {
        console.log('Subcategory clicked:', subcategory?.name, subcategory._id);

        router.push({
            pathname: '/productList/[productBySubCat]',
            params: {
              // 👇 key must match your [productBySubCat] segment
              productBySubCat: subcategory._id,
              subCategoryName: subcategory.name,  
            },
          });
    };

    return (
        <View style={styles.container}>
            {/* --- Header (Keep as is) --- */}
            <View style={styles.header}>
                 <Text style={styles.title}>Sub Category</Text>
                 <View style={styles.headerIcons}>

                   <TouchableOpacity
                     style={styles.iconButton}
                     onPress={openSearchOverlay}
                   >
                     <Search size={20} color="#64748b" />
                   </TouchableOpacity>

                 </View>
               </View>

            {/* --- Stack Screen Options (Keep as is) --- */}
            <Stack.Screen
                options={{
                    title: categoryName || 'Subcategories',
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

            {/* --- Search Overlay (Keep as is) --- */}
            <GlobalSearchOverlay isVisible={isSearchOverlayVisible} onClose={closeSearchOverlay} />

            {/* --- Loading State (Keep as is) --- */}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#22c55e" />
                    <Text style={styles.loadingText}>Loading subcategories...</Text>
                </View>
            )}

            {/* --- Error State (Keep as is) --- */}
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* --- Subcategory Grid --- */}
            {!isLoading && !error && (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent} // Use new grid styles
                >
                    {subcategories.length === 0 ? (
                        <Text style={styles.emptyText}>No subcategories found for "{categoryName}".</Text>
                    ) : (
                        subcategories.map((subcategory, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.subcategoryCard} // Use new card styles
                                onPress={() => handleProductList(subcategory)}
                            >
                                <Image
                                    source={{ uri: `${BASE_URL}${subcategory.image}` }}
                                    style={styles.subcategoryImage} // Use new image styles
                                    resizeMode='cover' // Changed resizeMode slightly for better fit sometimes
                                />
                                <View style={styles.subcategoryInfo}>
                                    <Text style={styles.subcategoryName} numberOfLines={2} ellipsizeMode="tail">
                                        {subcategory.name}
                                    </Text>
                                    {/* Optional status text can be added here if needed */}
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            )}
        </View>
    );
}

// --- Styles (Updated for Grid Layout) ---

 // Calculate width for 2 columns with margins
const numColumns = 2;
const cardMargin = 20; 
const cardWidth = (width / 2) - (cardMargin * 2);
const horizontalGap = 16; // The desired space between columns (adjust as needed)
const verticalGap = 16; 

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    // --- Header styles (Keep as is) ---
     header: {
         flexDirection: "row",
         justifyContent: "space-between",
         alignItems: "center",
         paddingHorizontal: 20,
         paddingTop: 60, // Adjust as needed for status bar height
         paddingBottom: 15, // Reduced bottom padding a bit
         backgroundColor: "#ffffff",
         // Add a subtle shadow/border if needed
         borderBottomWidth: 1,
         borderBottomColor: '#e2e8f0',
       },
       title: {
        fontFamily: "Poppins_600SemiBold",
        fontSize: 20, // Slightly smaller title for balance
        color: "#1e293b"
      },
       headerIcons: { flexDirection: "row", gap: 12 },
       iconButton: {
         padding: 8,
         backgroundColor: "#f1f5f9",
         borderRadius: 20, // Make it circular
       },
    // --- Loading and Error styles (Keep as is) ---
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    emptyText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 50,
        width: '100%' // Ensure it takes full width in the flex container
    },
    // --- ScrollView and Content styles (Updated for Grid) ---
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        flexDirection: 'row',       // Arrange items horizontally
        flexWrap: 'wrap',         // Allow items to wrap to the next line
        justifyContent: 'flex-start', // Align items to the start
        paddingHorizontal: cardMargin,  // Add horizontal padding to the container
        paddingTop: 15,             // Add padding at the top of the grid
        paddingBottom: 20,
    },
    // --- Subcategory Card styles (Updated for Grid) ---
    subcategoryCard: {
        // Calculate % width, subtract a bit for spacing
                                           // Adjust the '- 5%' based on desired gap
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginHorizontal: `1%`, // e.g. Small horizontal margin (1% left + 1% right = 2% total horizontal space per card)
        // (48% + 2%) * 2 columns = 100%
        width: `48%`,
marginBottom: verticalGap,
       // Vertical space between rows
        // marginHorizontal: cardMargin , // Let justifyContent handle horizontal spacing
        overflow: 'hidden',
        alignItems: 'center',       // Center items horizontally in the card
        paddingBottom: 12,         // Padding below the text
        shadowColor: '#94a3b8',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    subcategoryImage: {
        width: '100%',              // Image takes full width of the card
        height: cardWidth * 0.8,   // Adjust height relative to width (e.g., 80% of width)
        marginBottom: 10,          // Space between image and text
    },
    subcategoryInfo: {
        alignItems: 'center',       // Center text block itself
        paddingHorizontal: 8,      // Add horizontal padding for text if it wraps
    },
    subcategoryName: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,             // Slightly smaller font for grid items
        color: '#1e293b',
        textAlign: 'center',      // Center the text
    },
    // Optional: Add styles for subcategoryStatus if you uncomment it later
    // subcategoryStatus: {
    //     fontFamily: 'Poppins_400Regular',
    //     fontSize: 12,
    //     color: '#64748b',
    //     textAlign: 'center',
    //     marginTop: 2,
    // },
});