const Loading = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" />
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        Please wait…
      </p>
    </div>
  );
};

export default Loading;