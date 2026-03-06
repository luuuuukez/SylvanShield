import Svg, { Path } from "react-native-svg";

type Props = { width?: number; height?: number; color?: string };

export function IconClock({
  width = 16,
  height = 16,
  color = "#333333",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
        stroke={color}
        strokeMiterlimit={10}
      />
      <Path
        d="M8 4.5V8H11.5"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
