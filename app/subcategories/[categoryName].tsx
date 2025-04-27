// app/subcategories/[categoryName].tsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import Constants from "expo-constants";
import { getSubcategoriesByCategoryName, Subcategory } from '@/services/subcategoryService'; // Import the new service
import { ArrowLeft } from 'lucide-react-native'; // Import back icon


const BASE_URL = Constants?.expoConfig?.extra?.VITE_WEB_URL ?? "";


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


    return (
        <View style={styles.container}>
            {/* Configure the header dynamically */}
            <Stack.Screen
                options={{
                    title: categoryName || 'Subcategories', // Use category name as title
                    headerTitleStyle: {
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18,
                        color: '#1e293b',
                    },
                     headerStyle: {
                        backgroundColor: '#ffffff',
                     },
                     headerTintColor: '#1e293b', // Color of the back button icon
                     headerLeft: () => ( // Custom back button
                         <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10, padding: 5 }}>
                             <ArrowLeft size={24} color="#1e293b" />
                         </TouchableOpacity>
                     ),
                     headerShadowVisible: false, // Hide the header shadow line
                }}
            />

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#22c55e" />
                    <Text style={styles.loadingText}>Loading subcategories...</Text>
                </View>
            )}

            {error && (
                 <View style={styles.errorContainer}>
                     <Text style={styles.errorText}>{error}</Text>
                 </View>
            )}


            {!isLoading && !error && (
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
                    {subcategories.length === 0 ? (
                        <Text style={styles.emptyText}>No subcategories found for "{categoryName}".</Text>
                    ) : (
                        subcategories.map(subcategory => (
                            // Link to a products list page for this subcategory (optional next step)
                            // <Link key={subcategory.id} href={`/products?subcategoryId=${subcategory.id}`} asChild>
                                <TouchableOpacity
                                     key={subcategory.id}
                                     style={styles.subcategoryCard}
                                     // TODO: Implement navigation to products list for this subcategory if needed
                                     onPress={() => {
                                         console.log("Clicked subcategory:", subcategory.name);
                                         // Example navigation to a generic product list page filtered by subcategory
                                         // router.push(`/products?subcategoryId=${subcategory.id}&subcategoryName=${subcategory.name}`);
                                     }}
                                >
                                    <Image
                                        source={{ uri: `${BASE_URL}${subcategory.image}` }}
                                        style={styles.subcategoryImage}
                                        onError={(e) => console.log('Image load error:', e.nativeEvent.error, subcategory.image)} // Log image errors
                                    />
                                    <View style={styles.subcategoryInfo}>
                                        <Text style={styles.subcategoryName}>{subcategory.name}</Text>
                                        {/* Optionally add more details like isActive status or item count */}
                                        {/* <Text style={styles.subcategoryStatus}>{subcategory.isActive ? 'Active' : 'Inactive'}</Text> */}
                                    </View>
                                </TouchableOpacity>
                            // </Link>
                        ))
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc', // Light background
    },
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
        color: '#ef4444', // Red color for error
        textAlign: 'center',
     },
    scrollView: {
        flex: 1,
        padding: 10, // Add padding around the list
    },
    scrollViewContent: {
         paddingBottom: 20, // Add padding at the bottom
    },
    emptyText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 50,
    },
    subcategoryCard: {
        flexDirection: 'row', // Image and text side by side
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 12, // Space between items
        overflow: 'hidden',
        alignItems: 'center', // Vertically center content
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
         paddingRight: 12, // Add padding on the right
    },
    subcategoryImage: {
        width: 80, // Fixed image width
        height: 80, // Fixed image height
        resizeMode: 'cover',
         marginRight: 12, // Space between image and text
    },
    subcategoryInfo: {
        flex: 1, // Allow text to take remaining space
        justifyContent: 'center', // Vertically center text
    },
    subcategoryName: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 16,
        color: '#1e293b',
        marginBottom: 4,
    },
     subcategoryStatus: { // Style for optional status text
         fontFamily: 'Poppins_400Regular',
         fontSize: 12,
         color: '#64748b',
     },
});