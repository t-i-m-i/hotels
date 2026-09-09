import { Image } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

export default function CarouselItem({
  imageUri,
  alt,
  index,
  itemSize,
  scrollX,
}: {
  imageUri: string;
  alt: string;
  index: number;
  itemSize: number;
  scrollX: SharedValue<number>;
}) {
  const stylez = useAnimatedStyle(() => {
    return {
      borderWidth: 4,
      borderColor: interpolateColor(
        scrollX.value,
        [index - 1, index, index + 1],
        ["transparent", "white", "transparent"],
      ),
      transform: [
        {
          translateY: interpolate(
            scrollX.value,
            [index - 1, index, index + 1],
            [itemSize / 4, 0, itemSize / 4],
          ),
        },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        {
          width: itemSize,
          height: itemSize,
          borderRadius: itemSize / 2,
        },
        stylez,
      ]}
    >
      <Image
        source={{ uri: imageUri }}
        accessibilityLabel={alt}
        style={{
          flex: 1,
          borderRadius: itemSize / 2,
        }}
      />
    </Animated.View>
  );
}
