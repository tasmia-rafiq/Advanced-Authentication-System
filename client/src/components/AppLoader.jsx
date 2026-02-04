const AppLoader = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      {/* Spinner */}
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border-4 border-slate-200"></div>
        <div className="absolute w-14 h-14 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
      </div>

      {/* Text */}
      <p className="mt-6 text-sm font-medium text-slate-500 tracking-wide">
        Loading application…
      </p>
    </div>
  );
};

export default AppLoader;