import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Text, StyleSheet } from "react-native";
import { useHotels } from "@/api/hooks/useHotels";
import HotelList from "@/components/HotelList";
import { SafeAreaView } from "react-native-safe-area-context";

export function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function SearchIndex() {
  const [inputText, setInputText] = useState("");
  const debouncedSearch = useDebouncedValue(inputText, 500);
  const trimmedSearch = debouncedSearch.trim();
  const hasSearchQuery = trimmedSearch.length > 0;
  const {
    data: hotels,
    isLoading,
    isError,
  } = useHotels(trimmedSearch, { enabled: hasSearchQuery });

  if (!hasSearchQuery) {
    return (
      <>
        <Stack.Title>Search</Stack.Title>
        <Stack.SearchBar
          placement="automatic"
          placeholder="Search"
          onChangeText={(e) => setInputText(e.nativeEvent.text)}
        />
        <SafeAreaView style={styles.center} edges={["top"]}>
          <Text>Start typing to search hotels.</Text>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Title>Search</Stack.Title>
      <Stack.SearchBar
        placement="automatic"
        placeholder="Search"
        onChangeText={(e) => setInputText(e.nativeEvent.text)}
      />
      <HotelList
        hotels={hotels}
        isLoading={isLoading}
        isError={isError}
        showMapLink={false}
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
