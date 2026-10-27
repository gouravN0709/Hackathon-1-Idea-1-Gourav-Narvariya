import type { ReactNode } from "react";

export type IconName =
  | "arrow-down"
  | "arrow-left"
  | "arrow-right"
  | "arrow-up-right"
  | "bolt"
  | "car"
  | "chevron-down"
  | "download"
  | "edit"
  | "help"
  | "pin"
  | "receipt"
  | "restaurant"
  | "search"
  | "send"
  | "snowflake"
  | "users"
  | "bee"
  | "calendar"
  | "check"
  | "clock"
  | "bubbles"
  | "chevron-right"
  | "close"
  | "droplet"
  | "eco"
  | "external"
  | "flower"
  | "grill"
  | "hand"
  | "handshake"
  | "hearth"
  | "history"
  | "mail"
  | "map-pin"
  | "menu"
  | "mountain"
  | "parking"
  | "phone"
  | "press"
  | "sparkle"
  | "stewards"
  | "verified"
  | "waves"
  | "wine"
  | "wine-glass";

const icons: Record<IconName, ReactNode> = {
  "arrow-down": (
    <>
      <path d="M12 5v14" />
      <path d="M6 13l6 6 6-6" />
    </>
  ),
  "arrow-left": (
    <>
      <path d="M19 12H5" />
      <path d="M11 6 5 12l6 6" />
    </>
  ),
  "arrow-right": (
    <>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </>
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />,
  car: (
    <>
      <path d="M4 15.5h16" />
      <path d="M6 15.5 7.5 10h9L18 15.5" />
      <path d="M5 15.5v2.5h2v-2.5" />
      <path d="M17 15.5v2.5h2v-2.5" />
      <circle cx="7.5" cy="16.2" r="0.8" />
      <circle cx="16.5" cy="16.2" r="0.8" />
    </>
  ),
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  download: (
    <>
      <path d="M12 4v10" />
      <path d="m8 10 4 4 4-4" />
      <path d="M5 19h14" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4l11-11-4-4L4 16v4z" />
      <path d="m13 7 4 4" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.2 2.4c-.8.4-1.2.9-1.2 1.6" />
      <path d="M12 17h.01" />
    </>
  ),
  pin: (
    <>
      <rect x="7" y="3" width="10" height="6" rx="1" />
      <path d="M12 9v12" />
    </>
  ),
  receipt: (
    <>
      <path d="M7 3h10v18l-2.5-1.5L12 21l-2.5-1.5L7 21z" />
      <path d="M9.5 8h5" />
      <path d="M9.5 12h5" />
    </>
  ),
  restaurant: (
    <>
      <path d="M6 3v8a2 2 0 0 0 4 0V3" />
      <path d="M8 11v10" />
      <path d="M16 3c-1.5 2-1.5 4 0 6s1.5 4 0 6" />
      <path d="M16 3v18" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </>
  ),
  send: (
    <>
      <path d="M4 12 20 4l-6 16-2.5-6.5L4 12z" />
    </>
  ),
  snowflake: (
    <>
      <path d="M12 3v18" />
      <path d="m5 7 14 10" />
      <path d="m19 7-14 10" />
      <path d="m8 4 4 3 4-3" />
      <path d="m8 20 4-3 4 3" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="9" r="2.2" />
      <circle cx="16" cy="10" r="1.7" />
      <path d="M4.8 18.5c.6-2.4 2.2-3.7 4.2-3.7s3.6 1.3 4.2 3.7" />
      <path d="M13.5 18.5c.3-1.6 1.3-2.7 2.7-2.7 1.3 0 2.2.9 2.6 2.7" />
    </>
  ),
  "arrow-up-right": (
    <>
      <path d="M7 17L17 7" />
      <path d="M9 7h8v8" />
    </>
  ),
  calendar: (
    <>
      <path d="M7 4.5V7" />
      <path d="M17 4.5V7" />
      <path d="M5 8h14" />
      <path d="M6.5 5.5h11A1.5 1.5 0 0 1 19 7v11.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18.5V7a1.5 1.5 0 0 1 1.5-1.5z" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 12.2 11 14.5l4.5-5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5l3 2" />
    </>
  ),
  bee: (
    <>
      <path d="M9 13.5a3 3 0 1 0 6 0 3 3 0 0 0-6 0z" />
      <path d="M9.2 12.2h5.6" />
      <path d="M9.2 14.6h5.6" />
      <path d="M9 11c-2.2-1.6-3.2-.4-3.2 1.2" />
      <path d="M15 11c2.2-1.6 3.2-.4 3.2 1.2" />
      <path d="M10 10.2 8.2 7" />
      <path d="M14 10.2 15.8 7" />
    </>
  ),
  bubbles: (
    <>
      <circle cx="9" cy="14" r="3.2" />
      <circle cx="15.5" cy="9.5" r="2.1" />
      <circle cx="16.2" cy="16" r="1.3" />
    </>
  ),
  "chevron-right": <path d="M9 6l6 6-6 6" />,
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),
  droplet: (
    <path d="M12 3s7 7.2 7 11.2A7 7 0 1 1 5 14.2C5 10.2 12 3 12 3z" />
  ),
  eco: (
    <>
      <path d="M4 19c8-1 12-7 13-14 0 0-8 1-13 9" />
      <path d="M9 14c1-4 5-7 9-8" />
    </>
  ),
  external: (
    <>
      <path d="M14 5h5v5" />
      <path d="M10 14L19 5" />
      <path d="M17 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h5" />
    </>
  ),
  flower: (
    <>
      <circle cx="12" cy="12" r="1.7" />
      <path d="M12 7.2c.8-1.8 2.8-1.8 2.8.2 0 1.4-1.6 2-2.8 1.2" />
      <path d="M12 16.8c.8 1.8 2.8 1.8 2.8-.2 0-1.4-1.6-2-2.8-1.2" />
      <path d="M7.2 12c-1.8-.8-1.8-2.8.2-2.8 1.4 0 2 1.6 1.2 2.8" />
      <path d="M16.8 12c1.8-.8 1.8-2.8-.2-2.8-1.4 0-2 1.6-1.2 2.8" />
    </>
  ),
  grill: (
    <>
      <path d="M4 10h16" />
      <path d="M6 10v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7" />
      <path d="M8 6c.5 1 1.5 1 2 0s1.5-1 2 0 1.5 1 2 0 1.5-1 2 0" />
    </>
  ),
  hand: (
    <>
      <path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12" />
      <path d="M11 11.5V5.5a1.5 1.5 0 0 1 3 0V12" />
      <path d="M14 12V7.5a1.5 1.5 0 0 1 3 0V14c0 3-2 5-5.5 5S6 17 6 14v-2.5a1.5 1.5 0 0 1 3 0V13" />
    </>
  ),
  handshake: (
    <>
      <path d="M8 13.5 11 11l2 1.5 3-2.5" />
      <path d="M4.5 14.5 8 18l2.2-2" />
      <path d="M14 10.2 19 15" />
      <path d="M16.5 17.5 14 15" />
      <path d="M9 8.5 7 7" />
      <path d="M15 8.5 17 7" />
    </>
  ),
  hearth: (
    <>
      <path d="M5 20h14" />
      <path d="M7 20V9.5h10V20" />
      <path d="M6 9.5h12" />
      <path d="M12 16.5c1.3-1.4 2.1-2.4 2.1-3.5a2.1 2.1 0 0 0-4.2 0c0 1.1.8 2.1 2.1 3.5z" />
    </>
  ),
  history: (
    <>
      <path d="M6 5.5h8.5A2.5 2.5 0 0 1 17 8v11H8.5A2.5 2.5 0 0 0 6 21.5z" />
      <path d="M6 5.5v16" />
      <path d="M9.5 9.5h5" />
      <path d="M9.5 13h3.5" />
    </>
  ),
  mail: (
    <>
      <path d="M4 7h16v10H4z" />
      <path d="M4 7l8 6 8-6" />
    </>
  ),
  "map-pin": (
    <>
      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  mountain: (
    <>
      <path d="M3 18.5 9 7l4 6.5 2.2-3.2L21 18.5z" />
    </>
  ),
  parking: (
    <>
      <path d="M7 19V5h6.5a4 4 0 0 1 0 8H7" />
      <path d="M7 13h6" />
    </>
  ),
  phone: (
    <path d="M7 3h4l1 4-2 2a12 12 0 0 0 5 5l2-2 4 1v4c0 1-1 2-2 2C10 19 5 14 5 5c0-1 1-2 2-2z" />
  ),
  press: (
    <>
      <path d="M7 4h10" />
      <path d="M8 4v5h8V4" />
      <path d="M12 9v3" />
      <path d="M6 16h12v4H6z" />
      <path d="M9 16v-2h6v2" />
    </>
  ),
  sparkle: (
    <>
      <path d="M8 8c6-1 9-5 10-10 0 0-7 2-10 8" />
      <path d="M5 19c1-4 4-7 8-8" />
    </>
  ),
  stewards: (
    <>
      <circle cx="9" cy="8" r="2" />
      <circle cx="16" cy="9" r="1.5" />
      <path d="M4.8 19c.5-2.6 2.2-4 4.2-4s3.7 1.4 4.2 4" />
      <path d="M13.2 19c.3-1.8 1.4-3 3-3 1.5 0 2.5 1 2.8 3" />
    </>
  ),
  waves: (
    <>
      <path d="M3 9.5c1.6 0 1.6-2 3.4-2s1.8 2 3.6 2 1.8-2 3.6-2 1.8 2 3.6 2 1.8-2 3.8-2" />
      <path d="M3 14.5c1.6 0 1.6-2 3.4-2s1.8 2 3.6 2 1.8-2 3.6-2 1.8 2 3.6 2 1.8-2 3.8-2" />
    </>
  ),
  verified: (
    <>
      <path d="M12 3l2.1 1.6L16.8 4l.7 2.6L19.8 8l-1.2 2.4.4 2.7-2.5.9-1.3 2.4-2.5-1.1-2.5 1.1-1.3-2.4-2.5-.9.4-2.7L4.2 8l2.3-1.4L7.2 4l2.7.6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  wine: (
    <>
      <path d="M8 4h8l-1 7a3 3 0 1 1-6 0z" />
      <path d="M12 14v6" />
      <path d="M9 20h6" />
    </>
  ),
  "wine-glass": (
    <>
      <path d="M7 4h10l-1.2 8.2A3.8 3.8 0 0 1 12 16a3.8 3.8 0 0 1-3.8-3.8z" />
      <path d="M12 16v4" />
      <path d="M9 20h6" />
    </>
  ),
};

type IconProps = {
  name: IconName;
  className?: string;
};

export function Icon({ name, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {icons[name]}
    </svg>
  );
}
