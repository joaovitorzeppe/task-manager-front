const Button = ({ label, onClick, type = 'submit', disabled = false, loading = false }: { label: string, onClick: () => void, type: 'submit' | 'button', disabled: boolean, loading: boolean }) => {
  return (
    <button 
        type={type} 
        onClick={onClick}
        disabled={disabled}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
        {loading ? 'Carregando...' : label}
    </button>
  )
}

export default Button