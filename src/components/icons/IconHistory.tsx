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

export function IconHistory({
  width = 24,
  height = 24,
  focused = false,
  color,
}: Props) {
  const stroke = color ?? (focused ? FOCUSED_STROKE : DEFAULT_STROKE);

  if (focused) {
    return (
      <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
        <Path
          d="M25 4.00098C25.5304 4.00098 26.039 4.21184 26.4141 4.58691C26.7891 4.96198 27 5.4706 27 6.00098V25.001C26.9999 26.0618 26.5782 27.079 25.8281 27.8291C25.078 28.5792 24.0608 29.001 23 29.001H9C7.93919 29.001 6.92201 28.5792 6.17188 27.8291C5.42179 27.079 5.00006 26.0618 5 25.001V6.00098C5 5.4706 5.21094 4.96197 5.58594 4.58691C5.96101 4.21184 6.46957 4.00098 7 4.00098H25ZM12 19.001C11.4477 19.001 11 19.4487 11 20.001C11.0001 20.5531 11.4478 21.001 12 21.001H20C20.5522 21.001 20.9999 20.5531 21 20.001C21 19.4487 20.5523 19.001 20 19.001H12ZM12 15.001C11.4477 15.001 11 15.4487 11 16.001C11.0001 16.5531 11.4478 17.001 12 17.001H18C18.5522 17.001 18.9999 16.5531 19 16.001C19 15.4487 18.5523 15.001 18 15.001H12Z"
          fill={color ?? FOCUSED_FILL}
        />
        <Path
          d="M10 3.00073V7.00073"
          stroke={stroke}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M16 3.00073V7.00073"
          stroke={stroke}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M22 3.00073V7.00073"
          stroke={stroke}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
      <Path
        d="M12 16.0007H18"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 20.0007H20"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7 5.00073H25C25.2652 5.00073 25.5196 5.10609 25.7071 5.29363C25.8946 5.48116 26 5.73552 26 6.00073V25.0007C26 25.7964 25.6839 26.5594 25.1213 27.1221C24.5587 27.6847 23.7956 28.0007 23 28.0007H9C8.20435 28.0007 7.44129 27.6847 6.87868 27.1221C6.31607 26.5594 6 25.7964 6 25.0007V6.00073C6 5.73552 6.10536 5.48116 6.29289 5.29363C6.48043 5.10609 6.73478 5.00073 7 5.00073Z"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 3.00073V7.00073"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 3.00073V7.00073"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22 3.00073V7.00073"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
