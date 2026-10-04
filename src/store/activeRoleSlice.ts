import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// RTK's own docs recommend this exact `as T` pattern for a slice whose
// initial value is a literal (null, 0, "") that would otherwise infer too
// narrowly — a plain `: string | null` annotation on this variable still
// leaves createSlice's inferred State type as bare `null`.
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
