import Svg, { Path } from "react-native-svg";

type Props = { width?: number; height?: number; color?: string };
const DEFAULT_COLOR = "#8E8E93";
const STROKE_WIDTH = 1.66667;

export function IconChevronRight({
  width = 20,
  height = 20,
  color = DEFAULT_COLOR,
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <Path
        d="M7.91663 5L12.9166 10L7.91663 15"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
