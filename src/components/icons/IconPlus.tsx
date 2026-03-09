import Svg, { G, Path } from "react-native-svg";

export function IconPlus({ color = "#B0B3BA", width = 36, height = 36 }: { color?: string; width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 36 36" fill="none">
      <G opacity={0.6}>
        <Path
          d="M9 18H27"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M18 9V27"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}
