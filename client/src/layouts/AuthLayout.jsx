const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen px-6 flex items-center justify-center bg-linear-to-br from-indigo-100 via-purple-200 to-indigo-300">
      <div className="mt-24 w-full max-w-md bg-white/95 backdrop-blur rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">{title}</h1>
        <p className="text-gray-500 text-center text-sm">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;