import Svg, { G, Path, ClipPath, Defs, Rect } from "react-native-svg";

type Props = { width?: number; height?: number; color?: string };
export function IconSun({ width = 14, height = 14, color = "#EDA36E" }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 14 14" fill="none">
      <G clipPath="url(#clip0_sun)">
        <Path
          d="M2.66882 2.66895L3.31848 3.31861"
          stroke={color}
          strokeWidth={1.16667}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M0.875 7H1.79375"
          stroke={color}
          strokeWidth={1.16667}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M2.66882 11.3311L3.31848 10.6814"
          stroke={color}
          strokeWidth={1.16667}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M11.3311 11.3311L10.6814 10.6814"
          stroke={color}
          strokeWidth={1.16667}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M13.1249 7H12.2062"
          stroke={color}
          strokeWidth={1.16667}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M11.3311 2.66895L10.6814 3.31861"
          stroke={color}
          strokeWidth={1.16667}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M7 0.875V1.79375"
          stroke={color}
          strokeWidth={1.16667}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M7 10.5C8.93299 10.5 10.5 8.93299 10.5 7C10.5 5.06701 8.93299 3.5 7 3.5C5.06701 3.5 3.5 5.06701 3.5 7C3.5 8.93299 5.06701 10.5 7 10.5Z"
          stroke={color}
          strokeWidth={1.16667}
          strokeLinejoin="round"
        />
        <Path
          d="M7 13.125V12.2063"
          stroke={color}
          strokeWidth={1.16667}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_sun">
          <Rect width="14" height="14" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
