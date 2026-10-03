import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = null as string | null;

const activeRoleSlice = createSlice({
  name: "activeRole",
  initialState,
  reducers: {
    setActiveRole: (_state, action: PayloadAction<string | null>) => {
      return action.payload;
    },
  },
});

export const { reducer: activeRoleReducer, actions: activeRoleActions } =
  activeRoleSlice;
