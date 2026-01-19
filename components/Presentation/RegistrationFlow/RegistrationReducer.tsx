import { RegistrationRequest } from "@/app/api/register-song/route";

export type RegistrationState = {
  step: number;
  formData: RegistrationRequest;
  errors: Partial<Record<keyof RegistrationRequest, string>>;
  submissionError: string | null;
  isLoading: boolean;
};

type RegistrationAction =
  | { type: "UPDATE_FIELD"; field: keyof RegistrationRequest; value: string }
  | { type: "SET_FIELD_ERRORS"; errors: Partial<Record<keyof RegistrationRequest, string>> }
  | { type: "CLEAR_ERRORS" }
  | { type: "SET_STEP"; step: number }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; message: string | null };

export function registrationReducer(state: RegistrationState, action: RegistrationAction): RegistrationState {
  switch (action.type) {
    case "UPDATE_FIELD": {
      const updatedFormData = { ...state.formData, [action.field]: action.value };

      if (!state.errors[action.field]) {
        return { ...state, formData: updatedFormData };
      }

      const pendingErrors = { ...state.errors };
      delete pendingErrors[action.field];

      return { ...state, formData: updatedFormData, errors: pendingErrors };
    }
    case "SET_FIELD_ERRORS":
      return { ...state, errors: action.errors };
    case "CLEAR_ERRORS":
      return { ...state, errors: {} };
    case "SET_STEP":
      return { ...state, step: action.step };
    case "SET_LOADING":
      return { ...state, isLoading: action.loading };
    case "SET_ERROR":
      return { ...state, submissionError: action.message };
    default:
      return state;
  }
}
