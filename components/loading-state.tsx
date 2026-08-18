export default function LoadingState() {
  return (
    <div className="p-4 sm:p-6">
      <div className="animate-pulse space-y-5">
        <div className="h-8 w-48 rounded-lg bg-[#dceff1]" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-28 rounded-2xl bg-[#dceff1]" />
          ))}
        </div>

        <div className="h-72 rounded-2xl bg-[#dceff1]" />
      </div>
    </div>
  );
}
