// import { View, Text, StyleSheet, ImageBackground, Dimensions } from 'react-native';
// import { Video } from 'expo-av';                
// import { TouchableOpacity } from 'react-native-gesture-handler';

// const { width } = Dimensions.get('window');

// interface VideoCardProps {
//   /** Video stream / file URL */
//   source: string;
//   /** Thumbnail URL to show before playback */
//   poster: string;
//   /** Duration label – e.g. “11:25” */
//   duration: string;
//   /** Optional title */
//   title?: string;
// }

// const VideoCard = ({
//   source,
//   poster,
//   duration,
//   title,
// }: VideoCardProps) => {
//   return (
//     <TouchableOpacity style={styles.card}>
//       {/* poster image with duration badge */}
//       <ImageBackground
//         source={{ uri: poster }}
//         style={styles.thumbnail}
//         resizeMode="cover"
//       >
//         <View style={styles.durationBadge}>
//           <Text style={styles.durationText}>{duration}</Text>
//         </View>
//       </ImageBackground>

//       {/* lazy‑loaded video; set `shouldPlay` after press for perf */}
//       <Video
//         source={{ uri: source }}
//         style={styles.video}
//         usePoster
//         posterSource={{ uri: poster }}
//         // resizeMode="cover"
//         isMuted
//         shouldPlay={false}
//         // …other props (onLoad, onError, etc.)
//       />

//       {title && <Text style={styles.title}>{title}</Text>}
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     width: '100%',
//     marginBottom: 20,
//   },

//   /* === 16 : 9 thumbnail === */
//   thumbnail: {
//     width: '100%',
//     aspectRatio: 16 / 9,     // keeps correct proportion on every device
//     borderRadius: 12,
//     overflow: 'hidden',
//     justifyContent: 'flex-end',
//   },

//   durationBadge: {
//     alignSelf: 'flex-end',
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 4,
//     margin: 6,
//   },
//   durationText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '600',
//   },

//   /* Video element hidden until played; occupies same space */
//   video: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     width: '100%',
//     aspectRatio: 16 / 9,
//     borderRadius: 12,
//   },

//   title: {
//     marginTop: 8,
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1e293b',
//   },
// });


// export default VideoCard;