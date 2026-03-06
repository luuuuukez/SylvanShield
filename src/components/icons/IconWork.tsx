import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  focused?: boolean;
  color?: string;
};
const DEFAULT_STROKE = "#999999";
const FOCUSED_FILL = "#000000";
const FOCUSED_STROKE = "#000000";
const CHECK_WHITE = "#FFFFFF";

export function IconWork({
  width = 24,
  height = 24,
  focused = false,
  color,
}: Props) {
  const stroke = color ?? (focused ? FOCUSED_STROKE : DEFAULT_STROKE);
  const fill = focused ? FOCUSED_FILL : "none";
  return (
    <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
      <Path
        d="M5 13.3333V6C5 5.73478 5.10536 5.48043 5.29289 5.29289C5.48043 5.10536 5.73478 5 6 5H26C26.2652 5 26.5196 5.10536 26.7071 5.29289C26.8946 5.48043 27 5.73478 27 6V13.3333C27 23.8352 18.0868 27.3146 16.307 27.9047C16.1081 27.9731 15.8919 27.9731 15.693 27.9047C13.9133 27.3146 5 23.8352 5 13.3333Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21.5 12L14.1666 19L10.5 15.5"
        stroke={focused ? CHECK_WHITE : stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
