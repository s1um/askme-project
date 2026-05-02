export default function UserProfile({ displayName, username }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
        <span className="text-2xl font-bold text-indigo-500">
          {displayName.charAt(0).toUpperCase()}
        </span>
      </div>
      <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
      <p className="text-sm text-gray-400 mt-1">@{username}</p>
    </div>
  );
}
