import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  focused?: boolean;
  color?: string;
};
const DEFAULT_STROKE = "#999999";
const FOCUSED_STROKE = "#000000";
const FOCUSED_FILL = "#000000";

export function IconLayers({
  width = 24,
  height = 24,
  focused = false,
  color,
}: Props) {
  const stroke = color ?? (focused ? FOCUSED_STROKE : DEFAULT_STROKE);
  return (
    <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
      <Path
        d="M4 22L16 29L28 22"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 16L16 23L28 16"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 10L16 17L28 10L16 3L4 10Z"
        fill={focused ? FOCUSED_FILL : "none"}
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
