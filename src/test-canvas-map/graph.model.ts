export interface GraphNode {
  id: string;
  x: number;
  y: number;
  label?: string;
  color?: string;
  colorBorder?: string;
}

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  thickness?: number;
  color?: string;
}
