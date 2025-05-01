// components/avatar-selector.tsx
import Image from 'next/image';
import { getAvatarPresetsList, type AvatarId } from '@/lib/avatars';
import { cn } from '@/lib/utils';

interface AvatarSelectorProps {
  currentAvatarId?: AvatarId | string | null;
  onSelect?: (id: AvatarId) => void;
}

export function AvatarSelector({ currentAvatarId, onSelect }: AvatarSelectorProps) {
  // Get the list of all preset avatars
  const avatarList = getAvatarPresetsList();

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-foreground">Please select an avatar:</p>
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {avatarList.map((avatar) => (
          <div
            key={avatar.id}
            className={cn(
              'p-1 rounded-full border-2 cursor-pointer',
              currentAvatarId === avatar.id ? 'border-primary' : 'border-transparent',
              'hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
            role="radio"
            aria-checked={currentAvatarId === avatar.id}
            tabIndex={0}
            onClick={() => onSelect?.(avatar.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect?.(avatar.id)}}
          >
            <Image
              src={avatar.url}
              alt={`Avatar ${avatar.id}`}
              width={64}
              height={64}
              className="rounded-full aspect-square object-cover"
              priority={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}