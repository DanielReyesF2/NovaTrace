declare module "react-simple-maps" {
  import { ComponentType, ReactNode, CSSProperties } from "react";

  interface ProjectionConfig {
    center?: [number, number];
    scale?: number;
    rotate?: [number, number, number];
    parallels?: [number, number];
  }

  interface ComposableMapProps {
    projection?: string;
    projectionConfig?: ProjectionConfig;
    width?: number;
    height?: number;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
  }

  interface GeographiesChildrenArgs {
    geographies: GeographyType[];
  }

  interface GeographiesProps {
    geography: string | Record<string, unknown>;
    children: (args: GeographiesChildrenArgs) => ReactNode;
  }

  interface GeographyType {
    rsmKey: string;
    properties: Record<string, unknown>;
    geometry: Record<string, unknown>;
    type: string;
  }

  interface GeographyStyleProps {
    default?: CSSProperties;
    hover?: CSSProperties;
    pressed?: CSSProperties;
  }

  interface GeographyProps {
    geography: GeographyType;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: GeographyStyleProps;
    className?: string;
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
    onClick?: (event: React.MouseEvent) => void;
  }

  interface MarkerProps {
    coordinates: [number, number];
    children?: ReactNode;
    className?: string;
    style?: GeographyStyleProps;
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
  }

  interface LineProps {
    from: [number, number];
    to: [number, number];
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
    strokeLinecap?: string;
    className?: string;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
  export const Marker: ComponentType<MarkerProps>;
  export const Line: ComponentType<LineProps>;
}
