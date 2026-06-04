import {Component, ElementRef, Input, SimpleChanges, ViewChild} from '@angular/core';
import {GraphEdge, GraphNode} from "./graph.model";

@Component({
  selector: 'app-test-canvas-map',
  standalone: true,
  imports: [],
  templateUrl: './test-canvas-map.component.html',
  styleUrl: './test-canvas-map.component.scss'
})
export class TestCanvasMapComponent {
  @ViewChild('graphCanvas') graphCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() width: number = 900;
  @Input() height: number = 800;
  @Input() nodes: GraphNode[] = [
    { id: '1', x: 100, y: 100, label: 'Milano', color: '#FF0000', colorBorder: '#000000'},
    { id: '2', x: 300, y: 100, label: 'Roma' },
    { id: '3', x: 200, y: 300, label: 'Torino' },
    { id: '4', x: 500, y: 300, label: 'Venezia' }
  ];
  @Input() edges: GraphEdge[] = [
    { sourceId: '1', targetId: '2', thickness: 4, color: 'green'},
    { sourceId: '1', targetId: '3' },
    { sourceId: '2', targetId: '4' }
  ];

  defaultColorBorder = '#388E3C';
  defaultColor = '#4CAF50';
  defaultThickness = 2;
  defaultLineColor = '#999999';

  private ctx!: CanvasRenderingContext2D;
  internalEdges: GraphEdge[] = [];
  internalNodes: GraphNode[] = [];

  ngAfterViewInit(): void {
    this.internalEdges = this.edges;
    this.internalNodes = this.nodes;
    const canvas = this.graphCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.drawGraph();
  }

  private drawGraph(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.drawEdges();

    this.drawNodes();
  }

  private drawEdges(): void {


    this.internalEdges.forEach(edge => {
      const source = this.internalNodes.find(n => n.id === edge.sourceId);
      const target = this.internalNodes.find(n => n.id === edge.targetId);

      if (source && target) {
        this.ctx.strokeStyle = this.defaultLineColor;
        this.ctx.lineWidth = this.defaultThickness;
        if(edge.thickness) {
          this.ctx.lineWidth = edge.thickness;
        }
        if(edge.color) {
          this.ctx.strokeStyle = edge.color;
        }
        this.ctx.beginPath();
        this.ctx.moveTo(source.x, source.y);
        this.ctx.lineTo(target.x, target.y);
        this.ctx.stroke();
      }
    });
  }

  private drawNodes(): void {
    const radius = 30;

    this.internalNodes.forEach(node => {
      // Draw the circle
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
      if (node.color) {
        this.ctx.fillStyle = node.color;
      } else {
        this.ctx.fillStyle = this.defaultColor;
      }
      this.ctx.fill();
      this.ctx.lineWidth = 2;
      if (node.colorBorder) {
        this.ctx.strokeStyle = node.colorBorder;
      } else {
        this.ctx.strokeStyle = this.defaultColorBorder;
      }
      this.ctx.stroke();

      // Draw the label if it exists
      if (node.label) {
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        // Offset the text slightly above the node
        this.ctx.fillText(node.label, node.x, node.y - radius - 10);
      }
    });
  }

  protected addCity(city: string, x: number, y: number, color?: string, colorBorder?: string) {
    if (!this.internalNodes.find(n => n.id === 'id_' + city)) {
      this.internalNodes.push({
        id: 'id_' + city,
        x: x,
        y: y,
        label: city,
        color: color,
        colorBorder: colorBorder,
      });
      this.drawGraph();
    } else {
      alert(`City '${city}' already exists in the graph.`);
    }
  }
}
