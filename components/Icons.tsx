
import React from 'react';

// Defines a reusable type for component props that include a className.
type IconProps = {
  className?: string;
};

export const BrandIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="48" height="48" rx="12" fill="#111827"/>
    <path d="M24 10C26 23 38 23 38 24C38 25 26 25 24 38C22 25 10 25 10 24C10 23 22 23 24 10Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M33 13V17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M35 15L31 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="16" cy="32" r="2" stroke="white" strokeWidth="2"/>
  </svg>
);

export const UserIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
  </svg>
);

export const BotIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 5C13 11.5 19 11.5 19 12C19 12.5 13 12.5 12 19C11 12.5 5 12.5 5 12C5 11.5 11 11.5 12 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16.5 6.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M17.5 7.5L15.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="16" r="1" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
);

export const SendIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

// FIX: Added all missing icon components to resolve import errors.
export const PlusIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
  </svg>
);

export const CameraIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V6c0-.414.336-.75.75-.75h16.5c.414 0 .75.336.75.75v10.06l-4.137-4.137a.75.75 0 00-1.06 0l-3.001 3.002-1.52-1.52a.75.75 0 00-1.06 0l-4.439 4.44zM12 10.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
  </svg>
);

export const LightbulbIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M9.043 2.06a.75.75 0 011.056 0 8.25 8.25 0 014.212 9.282c.421.94.882 1.838 1.393 2.701.54 1.127.8 2.31.8 3.457 0 1.657-1.343 3-3 3h-6c-1.657 0-3-1.343-3-3 0-1.146.26-2.33.8-3.457.51-1.026.972-1.924 1.393-2.701A8.25 8.25 0 019.043 2.06zM11.25 21a.75.75 0 011.5 0c0 .414-.336.75-.75.75s-.75-.336-.75-.75z" />
  </svg>
);

export const BookIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M3.75 5.25a3 3 0 013-3h10.5a3 3 0 013 3v13.5a3 3 0 01-3 3H6.75a3 3 0 01-3-3V5.25zm3-1.5a1.5 1.5 0 00-1.5 1.5v13.5a1.5 1.5 0 001.5 1.5h10.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H6.75z" clipRule="evenodd" />
  </svg>
);

export const InfoIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
  </svg>
);

export const SearchIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
  </svg>
);

export const ArrowUpIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l3.75 3.75a.75.75 0 01-1.06 1.06l-2.97-2.97V21a.75.75 0 01-1.5 0V4.31l-2.97 2.97a.75.75 0 01-1.06-1.06l3.75-3.75z" clipRule="evenodd" />
  </svg>
);

export const PaperclipIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.12 10.12a2.25 2.25 0 000 3.182c.878.878 2.304.878 3.182 0l7.78-7.78a.75.75 0 011.06 1.06l-7.78 7.78a3.75 3.75 0 01-5.304-5.304l10.12-10.12a3.75 3.75 0 015.304 5.304l-7.98 7.98a.75.75 0 01-1.06-1.06l7.98-7.98a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
  </svg>
);

export const CloseIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);

export const DownloadIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
  </svg>
);

export const MenuIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
  </svg>
);

export const SidebarIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M2.25 3.75A1.5 1.5 0 013.75 2.25h6A1.5 1.5 0 0111.25 3.75v16.5A1.5 1.5 0 019.75 21.75h-6A1.5 1.5 0 012.25 20.25V3.75zM12.75 3.75a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5h-7.5zM12.75 9a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5h-7.5zM12.75 14.25a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5h-7.5z" />
  </svg>
);

export const RefreshIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-4.5a.75.75 0 00-.75.75v4.5l-1.903-1.903a4.5 4.5 0 10-7.096 3.364 4.5 4.5 0 007.096-3.364l2.554 2.554a7.5 7.5 0 11-12.548-3.364z" clipRule="evenodd" />
  </svg>
);

export const TrashIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.006a.75.75 0 01-.749.658h-7.5a.75.75 0 01-.749-.658L5.27 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452z" clipRule="evenodd" />
  </svg>
);

export const MicrophoneIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
    <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.75 6.75 0 11-13.5 0v-1.5A.75.75 0 016 10.5z" />
  </svg>
);

export const StopIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3-3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
  </svg>
);

export const SpeakerIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.348 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
    <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
  </svg>
);

export const BookmarkIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
  </svg>
);

export const BookOpenIcon = ({ className }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M.75 5.636a.75.75 0 01.75-.75h1.5A.75.75 0 013.75 5.636v12.728c0 .414.336.75.75.75h6.75a.75.75 0 00.75-.75V17.25a.75.75 0 011.5 0v1.136c0 1.24-1.01 2.25-2.25 2.25H4.5A2.25 2.25 0 012.25 18.364V5.636a.75.75 0 01.75-.75h-1.5A.75.75 0 01.75 4.136V5.636zM21 4.136a.75.75 0 01.75.75v12.728A2.25 2.25 0 0119.5 20.25h-6.75a.75.75 0 01-.75-.75V17.25a.75.75 0 00-1.5 0v1.136c0 1.24 1.01 2.25 2.25 2.25H19.5a3.75 3.75 0 003.75-3.75V4.886A3.75 3.75 0 0019.5 1.136h-6.75a.75.75 0 00-.75.75v1.5c0 .414.336.75.75.75h6.75z" />
    </svg>
);

export const GearIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 5.85c-.09.55-.443.99-.99 1.13l-2.52.504c-.94.187-1.555 1.116-1.262 2.043l1.263 3.89c.27.834 1.12.137 1.12.137l2.095-.349c.553-.092 1.062.24 1.22.793l.813 2.846c.254.887 1.27.887 1.524 0l.813-2.846c.158-.553.667-.885 1.22-.793l2.095.349c1.008.168 1.857-.655 1.587-1.489l-1.263-3.89c-.293-.927-.92-1.856-1.262-2.043l-2.52-.504c-.547-.14-.9-.58-.99-1.13l-.178-2.033A1.875 1.875 0 0011.078 2.25zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
    <path d="M12 17.25a5.25 5.25 0 100-10.5 5.25 5.25 0 000 10.5z" />
  </svg>
);
