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
import type { HotelImage } from "@/api/hotels";
import { storageAsset } from "@/api/storage";

const { width } = Dimensions.get("screen");
const _itemSize = width * 0.24;
const _spacing = 12;
const _itemTotalSize = _itemSize + _spacing;

export default function ImagesSlider({ images }: { images: HotelImage[] }) {
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

  if (!images.length) return null;

  const activeImage = images[activeIndex];

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
          source={{ uri: storageAsset(activeImage.path) }}
          accessibilityLabel={activeImage.alt}
          style={{ flex: 1 }}
        />
      </View>
      <Animated.FlatList
        data={images}
        keyExtractor={(item) => item.path}
        renderItem={({ item, index }) => {
          return (
            <CarouselItem
              imageUri={storageAsset(item.path)}
              alt={item.alt}
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
