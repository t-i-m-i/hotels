import { Dimensions, View, StyleSheet } from "react-native";
import CarouselItem from "./CarouselItem";
import Animated, {
  clamp,
  FadeIn,
  FadeOut,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useState } from "react";
import { scheduleOnRN } from "react-native-worklets";

const images = [
  "http://localhost:3000/static/images/paolo-nicolello-2gOxKj594nM-unsplash.jpg",
  "http://localhost:3000/static/images/jeffrey-francisco-_Ei9f33bQ1A-unsplash.jpg",
  "http://localhost:3000/static/images/sasha-kaunas-TAgGZWz6Qg8-unsplash.jpg",
  "http://localhost:3000/static/images/francesca-saraco-_dS27XGgRyQ-unsplash.jpg",
  "http://localhost:3000/static/images/cory-bjork-D1yT791Nf9A-unsplash.jpg",
  "http://localhost:3000/static/images/brett-campbell-k1OlQaEK2qI-unsplash.jpg",
  "http://localhost:3000/static/images/vojtech-bruzek-Yrxr3bsPdS0-unsplash.jpg",
  "http://localhost:3000/static/images/frames-for-your-heart-FqqiAvJejto-unsplash.jpg",
];

const { width } = Dimensions.get("screen");
const _itemSize = width * 0.24;
const _spacing = 12;
const _itemTotalSize = _itemSize + _spacing;

export default function ImagesSlider() {
  const scrollX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = clamp(
      e.contentOffset.x / _itemTotalSize,
      0,
      images.length - 1,
    );
    const newActiveIndex = Math.round(scrollX.value);
    if (activeIndex !== newActiveIndex) {
      scheduleOnRN(setActiveIndex, newActiveIndex);
    }
  });
  return (
    <View
      style={{
        flex: 1,
        marginTop: 16,
        justifyContent: "flex-end",
      }}
    >
      <View style={StyleSheet.absoluteFill}>
        <Animated.Image
          entering={FadeIn.duration(500)}
          exiting={FadeOut.duration(500)}
          key={`image-${activeIndex}`}
          source={{ uri: images[activeIndex] }}
          style={{ flex: 1 }}
        />
      </View>
      <Animated.FlatList
        data={images}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => {
          return (
            <CarouselItem
              imageUri={item}
              index={index}
              itemSize={_itemSize}
              scrollX={scrollX}
            />
          );
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          flexGrow: 0,
          height: _itemSize * 1.3,
        }}
        contentContainerStyle={{
          paddingHorizontal: (width - _itemSize) / 2,
          gap: _spacing,
        }}
        // Scrolling
        onScroll={onScroll}
        scrollEventThrottle={16} // 1000 / 60 = 16ms
        snapToInterval={_itemTotalSize}
        decelerationRate="fast"
      />
    </View>
  );
}
