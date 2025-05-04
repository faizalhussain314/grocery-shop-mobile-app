import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import { MapPin, Bell, Search, Star, TrendingUp, ShoppingCart } from 'lucide-react-native';
import { Link, useRouter } from 'expo-router'; // Import useRouter
import { useEffect, useState, useRef } from 'react';
import { BestSelling, getBestSelling } from '@/services/bestSellingService';
// Assuming you have a categoryService
import { Category, getCategories } from '@/services/categroyService'; // Adjust import path/name as needed

import GlobalSearchOverlay from '../components/GlobalSearchOverlay';
import { getQuickPicks, Product, QuickPicks } from '@/services/productService';
import ProductCard from '../components/ProductCard';
import Toast from 'react-native-toast-message';
// import VideoCard from '../components/VideoCard';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image:
      'https://images.pexels.com/photos/8105066/pexels-photo-8105066.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Fresh & Healthy',
    subtitle: 'Get fresh vegetables delivered to your doorstep',
  },
  {
    id: '2',
    image:
      'https://images.pexels.com/photos/4871119/pexels-photo-4871119.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Organic Products',
    subtitle: 'Handpicked organic produce for your family',
  },
  {
    id: '3',
    image:
      'https://images.pexels.com/photos/8105078/pexels-photo-8105078.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Farm Fresh',
    subtitle: 'Direct from farms to your kitchen',
  },
];

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [bestSelling, setBestSelling] = useState<Product[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  // State for categories - ADDED
  const [quickPicks, setquickPicks] = useState<QuickPicks[]>([]);
 
  const [isquickPicksLoading, setIquickPicksLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [isSearchOverlayVisible, setIsSearchOverlayVisible] = useState(false);
  const [cart, setCart] = useState<Product[]>([]);

  const router = useRouter(); 

 
  useEffect(() => {
    const interval = setInterval(() => {
      const nextSlide = (currentSlide + 1) % slides.length;
      setCurrentSlide(nextSlide);
      scrollViewRef.current?.scrollTo({
        x: nextSlide * width,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentSlide]);

  // Effect to load Best Selling products (Keep and optionally add loading/error states)
  useEffect(() => {
    const loadBestSelling = async () => {
     
      try {
        const data = await getBestSelling();
        setBestSelling(data);
      } catch (error) {
        console.error('Failed to load best selling products:', error);
        // Set error state if needed
      } finally {
        // setIsLoadingBestSelling(false);
      }
    };
    loadBestSelling();
  }, []);

  // Effect to load Categories - ADDED
  useEffect(() => {
    const loadQuickPicks = async () => {
      try {
        setIquickPicksLoading(true);
        setCategoriesError(null);
       
        const data = await getQuickPicks(); 
        setquickPicks(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setCategoriesError('Failed to load categories.');
      } finally {
        setIquickPicksLoading(false);
      }
    };
    loadQuickPicks();
  }, []);



  const handleCategoryClick = (category: Category) => {
    console.log('Category clicked:', category.name);

    router.push({
      pathname: '/subcategories/[categoryName]',
      params: { categoryName: category.name }, 
    });
  };

  const openSearchOverlay = () => {
    setIsSearchOverlayVisible(true);
  };

  const closeSearchOverlay = () => {
    setIsSearchOverlayVisible(false);
  };

  // Show loading indicator if fonts or categories are loading
  if (!fontsLoaded || isquickPicksLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
       <View style={styles.toastWrapper}>
    <Toast position="top" topOffset={90} />
  </View>
   
    <ScrollView  showsVerticalScrollIndicator={false}>
      
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <MapPin size={20} color="#22c55e" />
          <Text style={styles.locationText}>K-Truck</Text>
        </View>
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

      {/* Hero Slider - ORIGINAL CODE */}
      <View style={styles.sliderContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const slideIndex = Math.round(
              event.nativeEvent.contentOffset.x / width
            );
            setCurrentSlide(slideIndex);
          }}
        >
          {slides.map((slide, index) => (
            <View key={index} style={styles.slide}>
              <Image source={{ uri: slide.image }} style={styles.slideImage} />
              <View style={styles.slideContent}>
                <Text style={styles.slideTitle}>{slide.title}</Text>
                <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                currentSlide === index && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Best Selling Section - MODIFIED TO BE SLIDABLE */}
      <View style={styles.bestSellingSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <TrendingUp size={24} color="#22c55e" />
            <Text style={styles.sectionTitle}>Best Selling</Text>
          </View>
          {/* <TouchableOpacity>
            <Text style={styles.seeAllButton}>See All</Text>
          </TouchableOpacity> */}
        </View>

        {/* Wrap best selling items in a horizontal ScrollView */}
        <View
          // horizontal // Make it horizontal
          // showsHorizontalScrollIndicator={false}
          style={styles.bestSellingList} // Apply horizontal padding and gap
        >
          {/* Render best selling items here */}
          {Array.isArray(bestSelling) && bestSelling.length > 0 ? (
            
            bestSelling.map((product, index) => (
            
              <Link key={index} href={`/product/${product._id}`} asChild>

                <TouchableOpacity style={styles.bestSellingCard}>
                
                  {/* Use a specific style for horizontal list items */}
                  <Image
                    source={{ uri: `${product.image}` }}
                    style={styles.productImage}
                  />
                  {/* Add organic badge or other product info as needed */}
                  <View style={styles.productInfo}>
                   
                    {/* Re-using productInfo style */}
                    <Text style={styles.productName} numberOfLines={1}>
                      {product.name}
                    </Text>
                    {/* Re-using productName style */}
                    {/* Add price, unit, rating etc. here */}
                    <View style={styles.productDetails}>
                      <Text style={styles.productPrice}>
                        ₹{product.price?.toFixed(2) ?? 'N/A'}
                      </Text>
                      {product.unit && (
                        <Text style={styles.productUnit}>/ {product.unit}</Text>
                      )}
                    </View>
                    {product.rating !== undefined &&
                      product.rating !== null && (
                        <View style={styles.ratingContainer}>
                         
                          {/* Re-using ratingContainer style */}
                          <Text style={styles.rating}>
                            ⭐ {product.rating?.toFixed(1) ?? 'N/A'}
                          </Text>
                          {/* Re-using rating style */}
                        </View>
                      )}
                  </View>
                </TouchableOpacity>
                
              </Link>
            ))
          ) : (
          
            <View
              style={{
                width: width - 40,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
             
              {/* Give it some width */}
              <Text style={{ padding: 20, color: '#94a3b8' }}>
                No best selling products found.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* <View> */}
      {/* <VideoCard
  source="https://youtu.be/mlTS0EiWCjY?si=Ylhj58WZkxWiyDtn"
  poster="https://images.unsplash.com/photo-1597362925123-77861d3fbac7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  duration="11:25"
  title="Farm‑Fresh Vegetables"
/> */}

      {/* </View> */}

      {/* Categories Section - Displayed as a list/grid */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Quick Picks</Text>
        {/* Use sectionTitle style */}

       
        {categoriesError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{categoriesError}</Text>
          </View>
        )}
        <View   style={{ flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
               
                paddingVertical: 20,}}>
        {Array.isArray(quickPicks) && quickPicks.length > 0 ? (
            quickPicks.map((item, index) => (

              
              <ProductCard key={index} product={item} />
            
            
            ))
          ) : (
          
            <View
              style={{
                width: width - 40,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
             
              {/* Give it some width */}
              <Text style={{ padding: 20, color: '#94a3b8' }}>
                No best selling products found.
              </Text>
            </View>
          )}
          </View>


      </View>

      {/* Global Search Overlay (Keep) */}
      <GlobalSearchOverlay
        isVisible={isSearchOverlayVisible}
        onClose={closeSearchOverlay}
      />
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  toastWrapper: {
    position: 'absolute', // Make sure it stays on top
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999, // This will set the highest z-index
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#1e293b',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  sliderContainer: {
    height: 200,
    marginBottom: 24,
  },
  slide: {
    width: width,
    height: 200,
  },
  slideImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  slideContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  slideTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 4,
  },
  slideSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#f8fafc',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginHorizontal: 4,
    opacity: 0.5,
  },
  paginationDotActive: {
    opacity: 1,
    width: 20,
  },
  bestSellingSection: {
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: '#1e293b',
  },
  seeAllButton: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#22c55e',
  },

  bestSellingList: {
    paddingHorizontal: 20,
    paddingVertical:20,
    gap: 16, 
    flexDirection: 'row', 
    flexWrap: "wrap",
    
  },
  bestSellingCard: {
   
    width: 150, 
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
 
  productImage: {
    // Used for both Best Selling and potentially other product cards
    width: '100%',
    height: 100, // Reduced height for horizontal card
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 8, // Reduced padding
  },
  productName: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13, // Reduced font size
    color: '#1e293b',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
    backgroundColor: '#f1f5f9', // Light background for rating
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  rating: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10, // Reduced font size
    color: '#475569',
  },
  productDetails: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4, // Reduced margin
  },
  productPrice: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14, // Reduced font size
    color: '#22c55e',
    marginRight: 4,
  },
  productUnit: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10, // Reduced font size
    color: '#64748b',
  },
  organicBadge: {
    position: 'absolute',
    top: 4, // Adjusted position
    right: 4, // Adjusted position
    backgroundColor: 'rgba(34, 197, 94, 0.9)', // Slightly transparent green
    paddingHorizontal: 6, // Reduced padding
    paddingVertical: 2, // Reduced padding
    borderRadius: 8, // Reduced border radius
  },
  organicText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 9, // Reduced font size
    color: '#ffffff',
  },

  // Styles for the vertical Categories list/grid
  categoriesSection: {
    paddingVertical: 20, // Add vertical padding
    paddingHorizontal: 20, // Add horizontal padding
  },
  // Re-using sectionTitle for category title
  categoriesGrid: {
    // Container for the category items (grid/list)
    // No gap here if using marginBottom on categoryCard
  },
  categoryCard: {
    // Style for individual category items
    flexDirection: 'row', // Image and text side by side
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12, // Space between category cards
    overflow: 'hidden',
    alignItems: 'center', // Vertically center content
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    paddingRight: 12, // Add padding on the right
  },
  categoryImage: {
    // Style for category image
    width: 80, // Fixed image width
    height: 80, // Fixed image height
    resizeMode: 'cover',
    marginRight: 12, // Space between image and text
  },
  categoryInfo: {
    // Container for category name/items
    flex: 1, // Allow text to take remaining space
    justifyContent: 'center', // Vertically center text
  },
  categoryName: {
    // Style for category name
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
  },
  categoryItems: {
    // Style for optional category item count/status
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#64748b',
  },

  // Keep loader and error styles
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
  errorContainer: {
    // Style for error message container
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    // Style for error message text
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#ef4444', // Red color
    textAlign: 'center',
  },
});
