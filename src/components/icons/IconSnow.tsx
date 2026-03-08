import Svg, { Path } from "react-native-svg";

type Props = { width?: number; height?: number; color?: string };

export function IconSnow({ width = 14, height = 14, color = "#87C5EC" }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 14 14" fill="none">
      <Path d="M7 3.5V10.5" stroke={color} strokeWidth={1.17} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5.6875 2.1875L7 3.5L8.3125 2.1875" stroke={color} strokeWidth={1.17} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5.6875 11.8125L7 10.5L8.3125 11.8125" stroke={color} strokeWidth={1.17} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3.96887 5.25L10.0311 8.75" stroke={color} strokeWidth={1.17} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M2.17603 5.73042L3.9689 5.24999L3.48853 3.45706" stroke={color} strokeWidth={1.17} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10.5115 10.5429L10.0311 8.74999L11.824 8.26956" stroke={color} strokeWidth={1.17} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3.96887 8.75L10.0311 5.25" stroke={color} strokeWidth={1.17} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3.48853 10.5429L3.9689 8.74999L2.17603 8.26956" stroke={color} strokeWidth={1.17} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M11.824 5.73042L10.0311 5.24999L10.5115 3.45706" stroke={color} strokeWidth={1.17} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
