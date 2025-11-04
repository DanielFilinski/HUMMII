/**
 * Figma API Types - extracted from Figma REST API documentation
 */

export interface FigmaFile {
  document: FigmaNode;
  components: Record<string, FigmaComponent>;
  styles: Record<string, FigmaStyle>;
  name: string;
  lastModified: string;
  version: string;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: NodeType;
  children?: FigmaNode[];
  visible?: boolean;
  
  // Layout properties
  absoluteBoundingBox?: Rectangle;
  constraints?: LayoutConstraint;
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  layoutAlign?: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH';
  
  // Padding (Auto Layout)
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  
  // Spacing (Auto Layout)
  itemSpacing?: number;
  counterAxisSpacing?: number;
  
  // Style properties
  fills?: Paint[];
  strokes?: Paint[];
  strokeWeight?: number;
  strokeAlign?: 'INSIDE' | 'OUTSIDE' | 'CENTER';
  cornerRadius?: number;
  
  // Typography
  style?: TypeStyle;
  characters?: string;
  
  // Effects
  effects?: Effect[];
  
  // Blend mode
  blendMode?: BlendMode;
  opacity?: number;
}

export type NodeType =
  | 'DOCUMENT'
  | 'CANVAS'
  | 'FRAME'
  | 'GROUP'
  | 'VECTOR'
  | 'BOOLEAN_OPERATION'
  | 'STAR'
  | 'LINE'
  | 'ELLIPSE'
  | 'REGULAR_POLYGON'
  | 'RECTANGLE'
  | 'TEXT'
  | 'SLICE'
  | 'COMPONENT'
  | 'COMPONENT_SET'
  | 'INSTANCE';

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Paint {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND' | 'IMAGE' | 'EMOJI';
  visible?: boolean;
  opacity?: number;
  color?: RGBA;
  blendMode?: BlendMode;
  gradientStops?: ColorStop[];
  scaleMode?: string;
  imageRef?: string;
}

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface ColorStop {
  position: number;
  color: RGBA;
}

export interface TypeStyle {
  fontFamily: string;
  fontPostScriptName?: string;
  fontWeight: number;
  fontSize: number;
  textAlignHorizontal: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  textAlignVertical: 'TOP' | 'CENTER' | 'BOTTOM';
  letterSpacing: number;
  lineHeightPx: number;
  lineHeightPercent?: number;
  lineHeightUnit?: 'PIXELS' | 'FONT_SIZE_%' | 'INTRINSIC_%';
  textCase?: 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE';
  textDecoration?: 'NONE' | 'STRIKETHROUGH' | 'UNDERLINE';
  italic?: boolean;
}

export interface Effect {
  type: 'INNER_SHADOW' | 'DROP_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  visible?: boolean;
  radius: number;
  color?: RGBA;
  blendMode?: BlendMode;
  offset?: Vector;
  spread?: number;
}

export interface Vector {
  x: number;
  y: number;
}

export type BlendMode =
  | 'PASS_THROUGH'
  | 'NORMAL'
  | 'DARKEN'
  | 'MULTIPLY'
  | 'LINEAR_BURN'
  | 'COLOR_BURN'
  | 'LIGHTEN'
  | 'SCREEN'
  | 'LINEAR_DODGE'
  | 'COLOR_DODGE'
  | 'OVERLAY'
  | 'SOFT_LIGHT'
  | 'HARD_LIGHT'
  | 'DIFFERENCE'
  | 'EXCLUSION'
  | 'HUE'
  | 'SATURATION'
  | 'COLOR'
  | 'LUMINOSITY';

export interface LayoutConstraint {
  vertical: 'TOP' | 'BOTTOM' | 'CENTER' | 'TOP_BOTTOM' | 'SCALE';
  horizontal: 'LEFT' | 'RIGHT' | 'CENTER' | 'LEFT_RIGHT' | 'SCALE';
}

export interface FigmaComponent {
  key: string;
  name: string;
  description: string;
  componentSetId?: string;
}

export interface FigmaStyle {
  key: string;
  name: string;
  styleType: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
  description: string;
}

