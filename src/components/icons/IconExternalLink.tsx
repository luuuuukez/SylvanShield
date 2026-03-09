import Svg, { Path } from "react-native-svg";

export function IconExternalLink({ color = "#B0B3BA", width = 16, height = 16 }: { color?: string; width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Path
        d="M14.0001 8.66667V13C14.0001 13.5523 13.5524 14 13.0001 14C9.66677 14 6.33347 14 3.00018 14C2.44783 14 2.00009 13.5522 2.00017 12.9998C2.00065 9.66663 2.00078 6.33343 2.0002 3.00022C2.0001 2.44785 2.44785 2 3.00022 2H7.3334"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M13.7656 2.66699L5.76563 10.667"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
