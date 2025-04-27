import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator 
} from 'react-native';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import { MapPin, Bell, Search, Star, TrendingUp } from 'lucide-react-native';
import { Link } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { BestSelling, getBestSelling } from '@/services/bestSellingService';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import Constants from "expo-constants";

import GlobalSearchOverlay from "../components/GlobalSearchOverlay"; 


const { width } = Dimensions.get('window');
const BASE_URL = Constants?.expoConfig?.extra?.VITE_WEB_URL ?? "";

const slides = [
  {
    id: '1',
    image: 'https://images.pexels.com/photos/8105066/pexels-photo-8105066.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Fresh & Healthy',
    subtitle: 'Get fresh vegetables delivered to your doorstep',
  },
  {
    id: '2',
    image: 'https://images.pexels.com/photos/4871119/pexels-photo-4871119.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Organic Products',
    subtitle: 'Handpicked organic produce for your family',
  },
  {
    id: '3',
    image: 'https://images.pexels.com/photos/8105078/pexels-photo-8105078.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
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
  const [bestSelling, setBestSelling] = useState<BestSelling[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);


  const [isSearchOverlayVisible, setIsSearchOverlayVisible] = useState(false);


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

  useEffect(() => {
    const loadBestSelling = async () => {
      const data = await getBestSelling();
      setBestSelling(data);
    };
    loadBestSelling();
  }, []);

 
  const openSearchOverlay = () => {
    setIsSearchOverlayVisible(true);
  };


  const closeSearchOverlay = () => {
    setIsSearchOverlayVisible(false);
  };


  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <MapPin size={20} color="#22c55e" />
          <Text style={styles.locationText}>GK apparments</Text>
        </View>
        <View style={styles.headerIcons}>
         
          <TouchableOpacity
            style={styles.iconButton}
            onPress={openSearchOverlay}
          >
            <Search size={20} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={20} color="#64748b" />
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

      {/* Best Selling Section - ORIGINAL CODE */}
      <View style={styles.bestSellingSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <TrendingUp size={24} color="#22c55e" />
            <Text style={styles.sectionTitle}>Best Selling</Text>
          </View>
          <TouchableOpacity>
            {/* <Text style={styles.seeAllButton}>See All</Text> */}
          </TouchableOpacity>
        </View>

        <ScrollView
          
         >
           <View style={styles.productsGrid}> 
               {Array.isArray(bestSelling) && bestSelling.length > 0 ? (
           bestSelling.map((product) => ( 
             <Link key={product.id} href={`/product/${product.id}`} asChild>
                <TouchableOpacity style={styles.productCard}>
                    <Image source={{ uri: `${BASE_URL}${product.image}` }} style={styles.productImage} />
                   
                      <View style={styles.organicBadge}>
                        <Text style={styles.organicText}>Organic</Text>
                      </View>
                   
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
         </ScrollView>
      </View>

    
      <View style={styles.categoriesSection}>
       
        <View style={styles.categoriesGrid}>
         
        </View>
      </View>

      
      <GlobalSearchOverlay
        isVisible={isSearchOverlayVisible}
        onClose={closeSearchOverlay} 
      />

    </ScrollView>
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
    gap: 16,
  },
  bestSellingCard: {
    width: 200,
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
 
  productCard: { 
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },

  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },

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

  productInfo: {
    padding: 12,
  },
  productName: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  rating: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#64748b',
  },
  soldCount: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#94a3b8',
  },
  price: { 
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#22c55e',
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

  categoriesSection: {
    padding: 20,
  },
  categoriesTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: '#1e293b',
    marginBottom: 16,
  },
  categoriesGrid: { 
    gap: 16,
  },
  
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
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#94a3b8',
  },

});