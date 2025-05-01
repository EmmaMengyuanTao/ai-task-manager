// Define avatar IDs and their corresponding url
export const AVATAR_PRESETS = {
    'deer': '/avatars/deer.png',
    'tiger': '/avatars/tiger.png',
    'bear-face': '/avatars/bear-face.png',
    'seals': '/avatars/seals.png',
    'panda': '/avatars/panda.png',
    'dog': '/avatars/dog.png',
    'cow': '/avatars/cow.png',
    'tomcat': '/avatars/tomcat.png',
    'pig': '/avatars/pig.png',
    'kitty': '/avatars/kitty.png',
    'default': '/avatars/default.png',
} as const;

export type AvatarId = keyof typeof AVATAR_PRESETS;

export function getAvatarUrl(id: string | null | undefined): string {
    const defaultAvatarId: AvatarId = 'default';
    if (id && isValidAvatarId(id)) {
        return AVATAR_PRESETS[id];
      }
      return AVATAR_PRESETS[defaultAvatarId];
}

export function isValidAvatarId(id: string): id is AvatarId {
    return id in AVATAR_PRESETS;
}

export function getAvatarPresetsList(): { id: AvatarId; url: string }[] {
    return (Object.keys(AVATAR_PRESETS) as AvatarId[]).map(id => ({
        id: id,
        url: AVATAR_PRESETS[id],
    }));
}


