function LineIcon({ size = 24, children, ...props }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="square"
      strokeLinejoin="miter"
      {...props}
    >
      {children}
    </svg>
  );
}

function BrandIcon({ size = 24, children, ...props }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ArrowRightIcon(props) {
  return (
    <LineIcon {...props}>
      <path d="M4 12h14" />
      <path d="m13 6 6 6-6 6" />
    </LineIcon>
  );
}

export function ArrowLeftIcon(props) {
  return (
    <LineIcon {...props}>
      <path d="M20 12H6" />
      <path d="m11 6-6 6 6 6" />
    </LineIcon>
  );
}

export function ExternalArrowIcon(props) {
  return (
    <LineIcon {...props}>
      <path d="M8 16 17 7" />
      <path d="M10 7h7v7" />
    </LineIcon>
  );
}

export function HomeIcon(props) {
  return (
    <LineIcon {...props}>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v10h12V10" />
      <path d="M10 20v-6h4v6" />
    </LineIcon>
  );
}

export function MailIcon(props) {
  return (
    <LineIcon {...props}>
      <path d="M4 6h16v12H4z" />
      <path d="m4 8 8 6 8-6" />
    </LineIcon>
  );
}

export function PhoneIcon(props) {
  return (
    <LineIcon {...props}>
      <path d="M7 4h4l1 5-2 1c1 2 3 4 5 5l1-2 5 1v4c0 1-1 2-2 2C11 20 4 13 4 6c0-1 1-2 3-2z" />
    </LineIcon>
  );
}

export function PinIcon(props) {
  return (
    <LineIcon {...props}>
      <path d="M12 21s6-6 6-11a6 6 0 0 0-12 0c0 5 6 11 6 11z" />
      <path d="M10 10h4v4h-4z" />
    </LineIcon>
  );
}

export function CalendarIcon(props) {
  return (
    <LineIcon {...props}>
      <path d="M5 5h14v15H5z" />
      <path d="M8 3v4M16 3v4M5 10h14" />
    </LineIcon>
  );
}

export function CvIcon(props) {
  return (
    <LineIcon {...props}>
      <path d="M7 3h8l4 4v14H7z" />
      <path d="M15 3v5h4" />
      <path d="M10 13h6M10 17h4" />
    </LineIcon>
  );
}

export function PdfFileIcon({ size = 40, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        stroke="#D5D7DA"
        strokeWidth="1.5"
        d="M7.75 4A3.25 3.25 0 0 1 11 .75h16c.121 0 .238.048.323.134l10.793 10.793a.46.46 0 0 1 .134.323v24A3.25 3.25 0 0 1 35 39.25H11A3.25 3.25 0 0 1 7.75 36z"
      />
      <path stroke="#D5D7DA" strokeWidth="1.5" d="M27 .5V8a4 4 0 0 0 4 4h7.5" />
      <rect width="26" height="16" x="1" y="18" fill="#D92D20" rx="2" />
      <path
        fill="#fff"
        d="M4.832 30v-7.273h2.87q.826 0 1.41.316.582.314.887.87.31.555.31 1.279t-.313 1.278q-.313.555-.906.863-.59.309-1.427.309h-1.83V26.41h1.581q.444 0 .732-.153.29-.156.433-.43.145-.276.145-.635 0-.363-.145-.632a.97.97 0 0 0-.433-.423q-.291-.153-.74-.153H6.37V30zm9.053 0h-2.578v-7.273h2.6q1.095 0 1.889.437.791.433 1.218 1.246.43.814.43 1.947 0 1.136-.43 1.953a2.95 2.95 0 0 1-1.226 1.253q-.795.437-1.903.437m-1.04-1.317h.976q.682 0 1.147-.242.47-.244.703-.756.238-.516.238-1.328 0-.807-.238-1.318a1.54 1.54 0 0 0-.7-.753q-.465-.24-1.146-.241h-.98zM18.582 30v-7.273h4.816v1.268H20.12v1.733h2.958v1.268H20.12V30z"
      />
    </svg>
  );
}

export function CodeBlockIcon(props) {
  return (
    <LineIcon {...props}>
      <path d="M4 5h16v14H4z" />
      <path d="m9 9-3 3 3 3M15 9l3 3-3 3" />
    </LineIcon>
  );
}

export function DataStackIcon(props) {
  return (
    <LineIcon {...props}>
      <path d="M5 6h14v4H5zM5 14h14v4H5z" />
      <path d="M8 8h.01M8 16h.01M12 8h4M12 16h4" />
    </LineIcon>
  );
}

export function ServiceBoxIcon(props) {
  return (
    <LineIcon {...props}>
      <path d="M5 7h6v6H5zM13 7h6v10h-6zM5 15h6v2H5z" />
    </LineIcon>
  );
}

export function ToolMarkIcon(props) {
  return (
    <LineIcon {...props}>
      <path d="M5 19 19 5" />
      <path d="M6 5h5v5H6zM13 14h5v5h-5z" />
    </LineIcon>
  );
}

export function StudySagaIcon(props) {
  return (
    <LineIcon {...props}>
      <path d="M5 5h10l4 4v10H5z" />
      <path d="M8 10h8M8 14h5" />
      <path d="M15 5v5h4" />
    </LineIcon>
  );
}

export function AcademyIcon(props) {
  return (
    <LineIcon {...props}>
      <path d="M4 9 12 5l8 4-8 4z" />
      <path d="M7 11v5c2 2 8 2 10 0v-5" />
    </LineIcon>
  );
}

export function HospitalityIcon(props) {
  return (
    <LineIcon {...props}>
      <path d="M7 4v7c0 2 2 3 5 3s5-1 5-3V4" />
      <path d="M12 14v6M8 20h8" />
    </LineIcon>
  );
}

export function GameIcon(props) {
  return (
    <LineIcon {...props}>
      <path d="M4 8h16v8H4z" />
      <path d="M8 10v4M6 12h4M15 11h.01M18 13h.01" />
    </LineIcon>
  );
}

export function SunIcon(props) {
  return (
    <LineIcon {...props}>
      <path d="M12 5v2M12 17v2M5 12h2M17 12h2M7 7l1.5 1.5M15.5 15.5 17 17M17 7l-1.5 1.5M8.5 15.5 7 17" />
      <path d="M9 9h6v6H9z" />
    </LineIcon>
  );
}

export function MoonIcon(props) {
  return (
    <LineIcon {...props}>
      <path d="M18 15c-5 1-9-3-8-8-3 1-5 4-5 7 0 4 3 7 7 7 3 0 6-2 6-6z" />
    </LineIcon>
  );
}

export function GitHubIcon(props) {
  return (
    <BrandIcon {...props}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </BrandIcon>
  );
}

export function LinkedInIcon(props) {
  return (
    <BrandIcon {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </BrandIcon>
  );
}
