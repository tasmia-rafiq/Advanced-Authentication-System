const Input = ({ label, loading, children, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-600">{label}</label>
    <div className="relative">
      <input
        {...props}
        className="input"
        disabled={loading}
      />
      {children}
    </div>
  </div>
);

export default Input;