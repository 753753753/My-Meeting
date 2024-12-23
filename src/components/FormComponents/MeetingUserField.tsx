import Select from "react-select";

function MeetingUserField({
  label,
  isInvalid,
  error,
  options,
  onChange,
  selectedOptions,
  singleSelection = false,
  placeholder,
}: {
  label: string;
  isInvalid: boolean;
  error: Array<string>;
  options: Array<{ label: string; value: string }>;
  onChange: (selected: any) => void;
  selectedOptions: any;
  singleSelection?: boolean;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block font-medium text-gray-700">{label}</label>
      <Select
        options={options}
        value={selectedOptions}
        onChange={onChange}
        isMulti={!singleSelection}
        placeholder={placeholder}
        className={`react-select-container ${isInvalid ? "border-red-500" : ""}`}
        classNamePrefix="react-select"
      />
      {isInvalid && error && (
        <div className="text-red-500 text-sm mt-1">{error.join(", ")}</div>
      )}
    </div>
  );
}

export default MeetingUserField;
