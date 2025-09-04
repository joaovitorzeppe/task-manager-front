const InputField = ({type = 'text', label, name, required, value, onChange}: {type: string, label: string, name: string, required: boolean, value: string, onChange: (value: string) => void}) => {
  return (
    <div>
        <label 
            htmlFor={name} 
            className="block mb-2 text-sm font-medium text-gray-900"
        >
            {label}
        </label>
        <input 
            type={type} 
            id={name} 
            placeholder={label} 
            required={required} 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
        />
    </div>
  )
};

export default InputField;