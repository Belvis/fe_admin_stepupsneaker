import Icon from "@ant-design/icons";

const ReturnSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <defs>
          <style>{`.cls-1 { fill: #000000; } .cls-2 { fill: #000000; }`}</style>
        </defs>
        <g data-name="9. Return" id="_9._Return">
          <path
            className="cls-1"
            d="M14,10h4a0,0,0,0,1,0,0v3a1,1,0,0,1-1,1H15a1,1,0,0,1-1-1V10A0,0,0,0,1,14,10Z"
          ></path>
          <path
            className="cls-2"
            d="M20,23H12a3,3,0,0,1-3-3V12a3,3,0,0,1,3-3h8a3,3,0,0,1,3,3v8A3,3,0,0,1,20,23ZM12,11a1,1,0,0,0-1,1v8a1,1,0,0,0,1,1h8a1,1,0,0,0,1-1V12a1,1,0,0,0-1-1Z"
          ></path>
          <path
            className="cls-2"
            d="M15,19H14a1,1,0,0,1,0-2h1a1,1,0,0,1,0,2Z"
          ></path>
          <path
            className="cls-2"
            d="M30,24.24l-1,4a1,1,0,0,1-.7.72A.84.84,0,0,1,28,29a1,1,0,0,1-.71-.29L26.57,28a15.53,15.53,0,0,1-2.68,1.93l-.51.27A15.85,15.85,0,0,1,16,32,16,16,0,0,1,0,16a15.82,15.82,0,0,1,.44-3.71,1,1,0,0,1,1.94.46A14.16,14.16,0,0,0,2,16,14,14,0,0,0,22.91,28.18l.09-.06a13.31,13.31,0,0,0,2.16-1.54l-.87-.87a1,1,0,0,1-.25-1,1,1,0,0,1,.72-.7l4-1A1,1,0,0,1,30,24.24Z"
          ></path>
          <path
            className="cls-2"
            d="M32,16a15.82,15.82,0,0,1-.44,3.71,1,1,0,0,1-1,.77.85.85,0,0,1-.23,0,1,1,0,0,1-.74-1.2A14.16,14.16,0,0,0,30,16,14,14,0,0,0,9.09,3.82,13.42,13.42,0,0,0,6.84,5.43l.87.86a1,1,0,0,1,.25,1,1,1,0,0,1-.72.7l-4,1L3,9a1,1,0,0,1-.71-.29,1,1,0,0,1-.26-1l1-4A1,1,0,0,1,3.73,3a1,1,0,0,1,1,.25L5.42,4A16.16,16.16,0,0,1,8.11,2.08,16,16,0,0,1,32,16Z"
          ></path>
        </g>
      </g>
    </svg>
  );
};

export const ReturnIcon = (props: React.ComponentProps<typeof Icon>) => (
  <Icon component={ReturnSVG} {...props} />
);
