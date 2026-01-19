type InputFieldProps = {
  required?: boolean;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
};

export default function InputField({ required = false, label, value, onChange, placeholder, error, type = "text" }: InputFieldProps) {
  return (
    <label className="block text-left">
      <span className="text-sm font-semibold text-gray-900">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none ring-offset-2 transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/30"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </label>
  );
}
