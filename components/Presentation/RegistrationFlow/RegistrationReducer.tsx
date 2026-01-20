import { RegistrationRequest } from "@/app/api/register-song/route";

export type RegistrationState = {
  step: number;
  formData: RegistrationRequest;
  fieldErrors: Partial<Record<keyof RegistrationRequest, string>>;
  isError: string | null;
  isLoading: boolean;
};

type RegistrationAction =
  | { type: "UPDATE_FIELD"; field: keyof RegistrationRequest; value: string }
  | { type: "SET_FIELD_ERRORS"; fieldErrors: Partial<Record<keyof RegistrationRequest, string>> }
  | { type: "CLEAR_FIELD_ERRORS" }
  | { type: "SET_STEP"; step: number }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; message: string | null };

export function registrationReducer(state: RegistrationState, action: RegistrationAction): RegistrationState {
  switch (action.type) {
    case "UPDATE_FIELD": {
      const updatedFormData = { ...state.formData, [action.field]: action.value };

      if (!state.fieldErrors[action.field]) {
        return { ...state, formData: updatedFormData };
      }

      const fieldErrors = { ...state.fieldErrors };
      delete fieldErrors[action.field];

      return { ...state, formData: updatedFormData, fieldErrors };
    }
    case "SET_FIELD_ERRORS":
      return { ...state, fieldErrors: action.fieldErrors };
    case "CLEAR_FIELD_ERRORS":
      return { ...state, fieldErrors: {} };
    case "SET_STEP":
      return { ...state, step: action.step };
    case "SET_LOADING":
      return { ...state, isLoading: action.loading };
    case "SET_ERROR":
      return { ...state, isError: action.message };
    default:
      return state;
  }
}
