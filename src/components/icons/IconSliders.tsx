import Svg, { Path } from "react-native-svg";

type Props = { width?: number; height?: number; color?: string };

export function IconSliders({
  width = 24,
  height = 24,
  color = "#333333",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 10.125L12 20.25"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 3.75L12 6.375"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 10.125C13.0355 10.125 13.875 9.28553 13.875 8.25C13.875 7.21447 13.0355 6.375 12 6.375C10.9645 6.375 10.125 7.21447 10.125 8.25C10.125 9.28553 10.9645 10.125 12 10.125Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.75 17.625L18.7501 20.25"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.7501 3.75L18.75 13.875"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.75 17.625C19.7855 17.625 20.625 16.7855 20.625 15.75C20.625 14.7145 19.7855 13.875 18.75 13.875C17.7145 13.875 16.875 14.7145 16.875 15.75C16.875 16.7855 17.7145 17.625 18.75 17.625Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.25006 14.625L5.25 20.25"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.25 3.75L5.25006 10.875"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.25 14.625C6.28553 14.625 7.125 13.7855 7.125 12.75C7.125 11.7145 6.28553 10.875 5.25 10.875C4.21447 10.875 3.375 11.7145 3.375 12.75C3.375 13.7855 4.21447 14.625 5.25 14.625Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
