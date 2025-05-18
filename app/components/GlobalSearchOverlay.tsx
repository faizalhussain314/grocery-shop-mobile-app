// src/components/GlobalSearchOverlay.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Modal,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import { X, Search as SearchIcon } from 'lucide-react-native';

import { Product } from '@/services/productService';
import { searchProductsByName } from '@/services/searchService';
import { debounce } from 'lodash';
import { useRouter } from 'expo-router';


interface GlobalSearchOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

const GlobalSearchOverlay: React.FC<GlobalSearchOverlayProps> = ({ isVisible, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Removed BASE_URL state

  // Initialize the router hook - ADDED
  const router = useRouter();


  // Debounced search function (no changes needed here)
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      // ... (keep existing debounce logic) ...
        if (!query.trim()) {
        setSearchResults([]);
        setIsLoading(false);
        setError(null);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const results = await searchProductsByName(query);
        setSearchResults(results);
      } catch (err) {
        setError('Failed to fetch search results.');
        setSearchResults([]); // Clear results on error
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    []
  );

  // useEffect hook (no changes needed here)
  useEffect(() => {
    // ... (keep existing useEffect logic) ...
      if (isVisible && searchQuery) {
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
      setIsLoading(false);
      setError(null);
      debouncedSearch.cancel();
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, isVisible, debouncedSearch]);

  // handleClose function (no changes needed here)
    const handleClose = () => {
    Keyboard.dismiss();
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
    setIsLoading(false);
    onClose(); // Call the parent's onClose function to hide the modal
  };

  // Updated render function for search result item - MODIFIED NAVIGATION
  const renderSearchResultItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
        style={styles.resultItem}
        onPress={() => {
            // console.log("Navigating to product:", item._id); // Removed console.log
            handleClose(); // Close the modal first
            // Use router.push to navigate to the product page - MODIFIED
            router.push(`/product/${item._id}`);
        }}
    >
      <View style={styles.resultTextContainer}>
        <Text style={styles.resultName}>{item.name}</Text>
        {/* Display price and unit */}
        <Text style={styles.resultPrice}>
            {`₹${item.price?.toFixed(2) ?? 'N/A'} / ${item.unit ?? 'N/A'}`} {/* Add nullish coalescing for safety */}
        </Text>
       
        {/* <Text style={styles.resultCategory}>{item.category}</Text> */}
      </View>
      
      {item.image ? ( 
          <Image
              source={{ uri: item.image }} 
              style={styles.resultImage}
              resizeMode="cover"
          />
        ) : (
          <View style={[styles.resultImage, styles.imagePlaceholder]} /> // Placeholder if no image
        )}
    </TouchableOpacity>
  );

    // renderListHeader (no changes needed)
    const renderListHeader = () => (
      // ... (keep existing renderListHeader logic) ...
      <Text style={styles.resultsCountText}>
        { !isLoading && searchQuery && searchResults.length > 0 ? `${searchResults.length} total results` : ''}
      </Text>
    );


  // renderEmptyComponent (no changes needed)
  const renderEmptyComponent = () => {
    // ... (keep existing renderEmptyComponent logic) ...
      if (isLoading) return null;
    if (error) return <Text style={styles.emptyText}>{error}</Text>;
    if (!searchQuery) return <Text style={styles.emptyText}>Start typing to search products...</Text>;
    if (searchResults.length === 0 && searchQuery.length > 0) return <Text style={styles.emptyText}>No products found for "{searchQuery}".</Text>; // Only show "No products found" if there's a query
    return null; // Don't show anything if no query and not loading/error
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header (no changes needed) */}
          <View style={styles.header}>
               <View style={styles.searchContainer}>
               <SearchIcon size={20} color="#64748b" style={styles.searchIcon} />
               <TextInput
                 style={styles.input}
                 placeholder="Search products..."
                 placeholderTextColor="#94a3b8"
                 value={searchQuery}
                 onChangeText={setSearchQuery}
                 autoFocus={true}
                 returnKeyType="search"
               />
             </View>
             <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
               <X size={24} color="#475569" />
             </TouchableOpacity>
           </View>

          {/* Updated FlatList */}
          <FlatList
            data={searchResults}
            renderItem={renderSearchResultItem}
            keyExtractor={(item) => item._id} // Use _id as key
            style={styles.resultsList}
            ListHeaderComponent={renderListHeader}
            ListEmptyComponent={renderEmptyComponent}
            contentContainerStyle={styles.resultsListContent}
            keyboardShouldPersistTaps="handled"
          />

          {/* Loading Indicator (no changes needed) */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// --- Styles --- (Add placeholder style)
const styles = StyleSheet.create({
    // ... (keep existing styles) ...
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAF7FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    height: '100%',
  },
  closeButton: {
    paddingLeft: 15,
    paddingVertical: 5,
  },
  resultsList: {
    flex: 1,
  },
    resultsListContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
    resultsCountText: {
    fontSize: 14,
    color: '#475569',
    paddingVertical: 15,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  resultTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  resultName: {
    fontSize: 15,
    color: '#1e293b',
    marginBottom: 4,
    fontWeight: '500', // Make name slightly bolder
  },
  resultPrice: {
      fontSize: 14, // Slightly larger price
      color: '#059669', // Keep green color
      marginTop: 2,
  },
  resultCategory: { // Optional style for category
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
    imagePlaceholder: { // Style for placeholder when image is missing
      backgroundColor: '#e2e8f0',
      alignItems: 'center',
      justifyContent: 'center',
      // Optionally add an icon here
    },
  loadingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 100,
    alignItems: 'center',
    zIndex: 10, // Ensure loading indicator is above list
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#64748b',
    paddingHorizontal: 20,
  },
});

export default GlobalSearchOverlay;