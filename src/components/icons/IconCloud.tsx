import Svg, { Path } from "react-native-svg";

type Props = { width?: number; height?: number; color?: string };
export function IconCloud({ width = 14, height = 14, color = "#8AA2D7" }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 14 14" fill="none">
      <Path
        d="M1.16663 5.79982C1.16663 3.56317 2.94731 1.75 5.14391 1.75C6.98053 1.75 8.52643 3.01764 8.98373 4.74055C9.34359 4.55464 9.75067 4.44987 10.1818 4.44987C11.6462 4.44987 12.8333 5.65865 12.8333 7.14977C12.8333 8.2122 12.2306 9.13132 11.3544 9.57197C11.2814 9.60867 11.2002 9.625 11.1185 9.625H4.37496"
        stroke={color}
        strokeWidth={1.16667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.37504 9.625H3.50004C2.85571 9.625 2.33337 10.1473 2.33337 10.7917C2.33337 11.436 2.85571 11.9583 3.50004 11.9583H4.37504"
        stroke={color}
        strokeWidth={1.16667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.41667 5.25H5.54167C4.89735 5.25 4.375 5.77235 4.375 6.41667C4.375 7.06099 4.89735 7.58333 5.54167 7.58333H6.41667"
        stroke={color}
        strokeWidth={1.16667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.54163 7.58337H9.33329"
        stroke={color}
        strokeWidth={1.16667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
