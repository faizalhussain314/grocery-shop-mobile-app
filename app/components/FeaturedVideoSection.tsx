// // src/components/FeaturedVideoSection.tsx
// import React, { useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Dimensions,
// } from 'react-native';
// import YoutubePlayer from 'react-native-youtube-iframe';

// const { width } = Dimensions.get('window');
// const VIDEO_CONTAINER_ASPECT_RATIO = 16 / 9;

// const FeaturedVideoSection = () => {
//   const [playing, setPlaying] = useState(false);
//   const videoId = "RHIKiSg-3qA"; // From http://www.youtube.com/watch?v=RHIKiSg-3qA
//                        // "Fresh Vegetables From Garden #satisfying #shortsvideo"
//                        // Note: react-native-youtube-iframe usually expects the 11-character standard YouTube ID.
//                        // If "3" doesn't work, you may need to find the standard ID for this video
//                        // or use a different video with a known standard ID. Example: "_g_hV59gR0Q"

//   const onStateChange = useCallback((state: string) => {
//     if (state === 'ended') {
//       setPlaying(false);
//       // Alert.alert('Video has finished playing!');
//     }
//     if (state === 'playing') {
//         setPlaying(true);
//     }
//     if (state === 'paused' && playing) { // If user manually pauses via any means
//         setPlaying(false);
//     }
//   }, [playing]);

//   // Calculate video height based on screen width and aspect ratio
//   // Assuming the video container in HomeScreen has 20px padding on each side
//   const videoPlayerWidth = width - 40; // (20px left padding + 20px right padding)
//   const videoPlayerHeight = videoPlayerWidth / VIDEO_CONTAINER_ASPECT_RATIO;

//   return (
//     <View style={styles.videoSectionContainer}>
//       {/* Using a local style for sectionTitle or you can pass it as a prop if it needs to be consistent with HomeScreen */}
//       <Text style={styles.customSectionTitle}>Featured Video</Text>
//       <View style={[styles.videoPlayerWrapper, {height: videoPlayerHeight}]}>
//         <YoutubePlayer
//           height={videoPlayerHeight}
//           width={videoPlayerWidth}
//           play={playing}
//           videoId={videoId}
//           onChangeState={onStateChange}
//           webViewStyle={{ opacity: 0.99 }} // Minor hack for some rendering issues on Android
//           webViewProps={{
//             allowsInlineMediaPlayback: true,
//             mediaPlaybackRequiresUserAction: false,
//           }}
//           initialPlayerParams={{
//             controls: false, // Use boolean false instead of number 0
//             rel: false,     // Use boolean false instead of number 0
//             modestbranding: false, // Use boolean false instead of number 1 or 0
//             loop: false,    // Use boolean false instead of number 0
//                      // This might still be a number depending on the library's type
//             iv_load_policy: 3, // This might still be a number depending on the library's type
//           }}
//         />
//         {!playing && (
//           <TouchableOpacity
//             style={styles.playButtonOverlay}
//             onPress={() => setPlaying(true)}
//             activeOpacity={0.7}
//           >
//             <View style={styles.playButtonIcon} />
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   videoSectionContainer: {
//     paddingHorizontal: 20, // Matches HomeScreen's padding
//     paddingVertical: 20,
//     alignItems: 'center',
//   },
//   customSectionTitle: { // Define sectionTitle style locally or adapt from HomeScreen
//     fontFamily: 'Poppins_600SemiBold', // Assuming Poppins fonts are globally available or imported if needed here
//     fontSize: 20,
//     color: '#1e293b',
//     marginBottom: 16, // Space between title and video
//     alignSelf: 'flex-start', // Align title to the left like other sections
//   },
//   videoPlayerWrapper: {
//     width: '100%', // Takes full width of its container (which has padding)
//     // height is set dynamically
//     borderRadius: 20,
//     overflow: 'hidden',
//     backgroundColor: '#000000',
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//   },
//   playButtonOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     zIndex: 1,
//   },
//   playButtonIcon: {
//     width: 0,
//     height: 0,
//     backgroundColor: 'transparent',
//     borderStyle: 'solid',
//     borderLeftWidth: 30,
//     borderRightWidth: 0,
//     borderTopWidth: 20,
//     borderBottomWidth: 20,
//     borderLeftColor: '#FFFFFF',
//     borderTopColor: 'transparent',
//     borderBottomColor: 'transparent',
//     marginLeft: 5,
//   },
// });

// export default FeaturedVideoSection;