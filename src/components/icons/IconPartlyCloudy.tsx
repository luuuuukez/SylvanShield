import Svg, { Path } from "react-native-svg";

type Props = { width?: number; height?: number };

export function IconPartlyCloudy({ width = 14, height = 14 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 14 14" fill="none">
      {/* Sun rays */}
      <Path
        d="M4.35658 3.10244L4.12866 1.80988"
        stroke="#EDA36E"
        strokeWidth={1.17}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.66254 4.18129L1.5874 3.42847"
        stroke="#EDA36E"
        strokeWidth={1.17}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.22737 6.14209L0.934814 6.37"
        stroke="#EDA36E"
        strokeWidth={1.17}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.31738 3.53748L7.0702 2.46234"
        stroke="#EDA36E"
        strokeWidth={1.17}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Partial sun arc */}
      <Path
        d="M2.82426 7.40214C2.57797 7.11665 2.39607 6.78145 2.29092 6.41936C2.18577 6.05727 2.15985 5.67678 2.21492 5.30377C2.26998 4.93076 2.40475 4.57399 2.61004 4.25773C2.81533 3.94147 3.08634 3.67314 3.40462 3.47099C3.7229 3.26884 4.08098 3.13762 4.45452 3.08625C4.82805 3.03488 5.20827 3.06457 5.5693 3.1733C5.93033 3.28203 6.26371 3.46724 6.54675 3.71635C6.82979 3.96545 7.05586 4.2726 7.20957 4.6169"
        stroke="#EDA36E"
        strokeWidth={1.17}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cloud */}
      <Path
        d="M4.81255 8.09375C4.81255 7.35825 5.03066 6.63927 5.43928 6.02772C5.8479 5.41618 6.42869 4.93954 7.1082 4.65807C7.78771 4.37661 8.53543 4.30297 9.2568 4.44646C9.97816 4.58995 10.6408 4.94412 11.1609 5.4642C11.6809 5.98427 12.0351 6.64689 12.1786 7.36826C12.3221 8.08963 12.2484 8.83734 11.967 9.51686C11.6855 10.1964 11.2089 10.7772 10.5973 11.1858C9.98579 11.5944 9.2668 11.8125 8.5313 11.8125H4.1563C3.80693 11.8122 3.46181 11.7358 3.14492 11.5887C2.82804 11.4416 2.547 11.2272 2.32134 10.9605C2.09568 10.6937 1.93081 10.3811 1.83818 10.0442C1.74555 9.70732 1.7274 9.35431 1.78497 9.00971C1.84255 8.66511 1.97448 8.33718 2.17159 8.04872C2.36869 7.76025 2.62626 7.51817 2.92637 7.33929C3.22648 7.16042 3.56195 7.04904 3.90945 7.01291C4.25696 6.97677 4.60816 7.01674 4.93865 7.13004"
        stroke="#87C5EC"
        strokeWidth={1.17}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
