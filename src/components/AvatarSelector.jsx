import React, { useState } from 'react';
import { User, Upload } from 'lucide-react';

const AVATAR_OPTIONS = [
  { id: 1, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
  { id: 2, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
  { id: 3, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna' },
  { id: 4, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max' },
  { id: 5, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver' },
  { id: 6, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie' },
  { id: 7, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie' },
  { id: 8, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
  { id: 9, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack' },
  { id: 10, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily' },
  { id: 11, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah' },
  { id: 12, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia' },
  { id: 13, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan' },
  { id: 14, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ava' },
  { id: 15, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas' },
  { id: 16, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe' },
  { id: 17, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mason' },
  { id: 18, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria' },
];

const AvatarSelector = ({ currentAvatar, onSelect }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);

  const handleSelect = (avatarUrl) => {
    setSelectedAvatar(avatarUrl);
    onSelect(avatarUrl);
  };

  return (
    <div className="space-y-4">
      {/* Current Avatar Display */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center border-4 border-zinc-700">
          {selectedAvatar ? (
            <img src={selectedAvatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className="w-12 h-12 text-zinc-500" />
          )}
        </div>
        <div className="text-center">
          <p className="text-sm text-zinc-400 mb-3">Not ready with a photo? Use an avatar instead</p>
          <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
            {AVATAR_OPTIONS.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => handleSelect(avatar.url)}
                className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${
                  selectedAvatar === avatar.url
                    ? 'border-blue-500 ring-2 ring-blue-500/50'
                    : 'border-zinc-600 hover:border-zinc-500'
                }`}
              >
                <img src={avatar.url} alt={`Avatar ${avatar.id}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelector;
