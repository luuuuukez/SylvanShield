import Svg, { Path } from "react-native-svg";

type Props = { width?: number; height?: number; color?: string };
export function IconLocationPin({ width = 14, height = 14, color = "#333333" }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 14 14" fill="none">
      <Path
        d="M7 12.8333C7 12.8333 11.375 9.33329 11.375 5.54163C11.375 3.12537 9.41625 1.16663 7 1.16663C4.58375 1.16663 2.625 3.12537 2.625 5.54163C2.625 9.33329 7 12.8333 7 12.8333Z"
        stroke={color}
        strokeWidth={1.16667}
        strokeLinejoin="round"
      />
      <Path
        d="M7 7.29163C7.9665 7.29163 8.75 6.50812 8.75 5.54163C8.75 4.57513 7.9665 3.79163 7 3.79163C6.0335 3.79163 5.25 4.57513 5.25 5.54163C5.25 6.50812 6.0335 7.29163 7 7.29163Z"
        stroke={color}
        strokeWidth={1.16667}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
