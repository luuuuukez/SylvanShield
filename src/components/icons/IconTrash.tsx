import Svg, { Path } from "react-native-svg";

export function IconTrash({ color = "#EF4444", width = 20, height = 20 }: { color?: string; width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <Path d="M3 5H17" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M8 5V3H12V5" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 5L6 17H14L15 5" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 9V14" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M7.5 9L7.5 14" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M12.5 9L12.5 14" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}
