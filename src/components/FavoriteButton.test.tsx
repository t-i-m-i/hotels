import { render, fireEvent } from "@testing-library/react-native";
import FavoriteButton from "./FavoriteButton";
import { Hotel } from "@/api/hotels";
import { favoritesReducer } from "@/store/favoritesSlice";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

const mockHotel: Hotel = {
  id: "1",
  name: "Hotel Barcino Central",
  description: "A boutique hotel...",
  location: "Barcelona, Spain",
  geo: { latitude: 41.3851, longitude: 2.1734 },
  images: [],
};

describe("FavoriteButton", () => {
  it("toggles the accessible label when pressed twice", async () => {
    const { getByTestId } = await render(
      <Provider
        store={configureStore({ reducer: { favorites: favoritesReducer } })}
      >
        <FavoriteButton hotel={mockHotel} />
      </Provider>,
    );
    const button = getByTestId("favorite-button");
    expect(button.props.accessibilityLabel).toBe("Add to favorites");

    await fireEvent.press(button);

    const buttonAfterFirstTap = getByTestId("favorite-button");
    expect(buttonAfterFirstTap.props.accessibilityLabel).toBe(
      "Remove from favorites",
    );

    await fireEvent.press(buttonAfterFirstTap);

    const buttonAfterSecondTap = getByTestId("favorite-button");
    expect(buttonAfterSecondTap.props.accessibilityLabel).toBe(
      "Add to favorites",
    );
  });
});
