import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

const OrganizationChartD3 = ({
  organizationData,
  isEditMode = false,
  onNodeEdit,
  onSave
}) => {
  const svgRef = useRef();
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!organizationData) return;

    const nodeData = [];
    const linkData = [];

    let yOffset = 100;
    const columnWidth = 250;

    organizationData.structure?.bod?.forEach((item, index) => {
      nodeData.push({
        id: item.id,
        ...item,
        x: 100,
        y: yOffset + (index * 120),
        fx: 100,
        fy: yOffset + (index * 120),
        category: 'bod'
      });
    });

    let mgmtYOffset = 300;
    organizationData.structure?.management?.forEach((item, index) => {
      if (item.code !== 'MDO2.0') {
        nodeData.push({
          id: item.id,
          ...item,
          x: columnWidth + 100,
          y: mgmtYOffset + (index * 140),
          fx: columnWidth + 100,
          fy: mgmtYOffset + (index * 140),
          category: 'management'
        });
      }
    });

    let deptYOffset = 500;
    organizationData.structure?.departments?.forEach((item, index) => {
      nodeData.push({
        id: item.id,
        ...item,
        x: (columnWidth * 3) + 100,
        y: deptYOffset + (index * 120),
        fx: (columnWidth * 3) + 100,
        fy: deptYOffset + (index * 120),
        category: 'departments'
      });
    });

    let sectYOffset = 100;
    organizationData.structure?.sections?.forEach((item, index) => {
      nodeData.push({
        id: item.id,
        ...item,
        x: (columnWidth * 4) + 100,
        y: sectYOffset + (index * 100),
        fx: (columnWidth * 4) + 100,
        fy: sectYOffset + (index * 100),
        category: 'sections'
      });
    });

    setNodes(nodeData);
    setLinks(linkData);
  }, [organizationData]);

  useEffect(() => {
    if (!nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1400;
    const height = 1000;

    svg.attr('width', width).attr('height', height);

    const container = svg.append('g');

    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));

    const linkPath = d3.linkVertical()
      .x(d => d.x)
      .y(d => d.y);

    const link = container.selectAll('.link')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#3B82F6')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

    const defs = svg.append('defs');
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#3B82F6')
      .style('stroke', 'none');

    const nodeGroup = container.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', isEditMode ? 'move' : 'default');

    nodeGroup.append('rect')
      .attr('width', 200)
      .attr('height', 80)
      .attr('x', -100)
      .attr('y', -40)
      .attr('rx', 8)
      .attr('fill', d => d.isCustom ? '#f3e8ff' : '#ffffff')
      .attr('stroke', d => d.isCustom ? '#a855f7' : '#6b7280')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))');

    nodeGroup.append('rect')
      .attr('width', 30)
      .attr('height', 80)
      .attr('x', -100)
      .attr('y', -40)
      .attr('rx', 8)
      .attr('fill', d => d.isCustom ? '#e9d5ff' : '#f3f4f6')
      .attr('stroke', d => d.isCustom ? '#a855f7' : '#6b7280')
      .attr('stroke-width', 1);

    nodeGroup.append('text')
      .attr('x', -85)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('fill', '#000')
      .text(d => d.code || 'CODE');

    nodeGroup.append('text')
      .attr('x', -20)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('fill', '#000')
      .each(function (d) {
        const text = d3.select(this);
        const words = (d.title || '').split(' ');
        text.text('');

        let line = [];
        let lineNumber = 0;
        const lineHeight = 1.1;
        const x = text.attr('x');
        const y = text.attr('y');

        words.forEach(word => {
          line.push(word);
          text.text(line.join(' '));
          if (text.node().getComputedTextLength() > 120) {
            line.pop();
            text.text(line.join(' '));
            text.append('tspan')
              .attr('x', x)
              .attr('y', y)
              .attr('dy', lineNumber * lineHeight + 'em')
              .text(line.join(' '));
            line = [word];
            lineNumber++;
          }
        });

        text.append('tspan')
          .attr('x', x)
          .attr('y', y)
          .attr('dy', lineNumber * lineHeight + 'em')
          .text(line.join(' '));
      });

    nodeGroup.append('text')
      .attr('x', -20)
      .attr('y', 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '9px')
      .style('fill', '#000')
      .text(d => d.name || '');

    nodeGroup.append('text')
      .attr('x', -20)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .style('font-size', '8px')
      .style('fill', '#666')
      .text(d => d.empId ? `(${d.empId})` : '');

    nodeGroup.filter(d => d.isCustom)
      .append('circle')
      .attr('cx', 90)
      .attr('cy', -30)
      .attr('r', 8)
      .attr('fill', 'red')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        setNodes(prev => prev.filter(n => n.id !== d.id));
        setLinks(prev => prev.filter(l => l.source !== d.id && l.target !== d.id));
      });

    nodeGroup.filter(d => d.isCustom)
      .append('text')
      .attr('x', 90)
      .attr('y', -26)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', 'white')
      .style('pointer-events', 'none')
      .text('×');

    if (isEditMode) {
      const drag = d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
        });

      nodeGroup.call(drag);
    }

    nodeGroup.on('click', (event, d) => {
      if (!isEditMode) return;

      if (isConnecting && selectedNode && selectedNode.id !== d.id) {
        const newLink = {
          source: selectedNode.id,
          target: d.id,
          id: `link-${Date.now()}`
        };
        setLinks(prev => [...prev, newLink]);
        setIsConnecting(false);
        setSelectedNode(null);
      } else if (!isConnecting) {
        setSelectedNode(d);
        setIsConnecting(true);
      } else {
        setIsConnecting(false);
        setSelectedNode(null);
      }
    });

    svg.on('dblclick', (event) => {
      if (!isEditMode) return;

      const [x, y] = d3.pointer(event, container.node());
      const newNode = {
        id: `custom-${Date.now()}`,
        code: 'NEW',
        title: 'New Position',
        name: 'To Be Assigned',
        empId: '',
        x,
        y,
        fx: x,
        fy: y,
        isCustom: true,
        category: 'custom'
      };

      setNodes(prev => [...prev, newNode]);
    });

    simulation.on('tick', () => {
      link.attr('d', d => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy);

        const sweep = dx > 0 ? 1 : 0;
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,${sweep} ${d.target.x},${d.target.y}`;
      });

      nodeGroup.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };

  }, [nodes, links, isEditMode, isConnecting, selectedNode]);

  const handleSave = useCallback(() => {
    const layoutData = {
      nodes: nodes.map(node => ({
        id: node.id,
        x: node.x,
        y: node.y,
        ...node
      })),
      links: links
    };
    onSave?.(layoutData);
  }, [nodes, links, onSave]);

  return (
    <div className="relative w-full h-[800px] border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
      <svg ref={svgRef} className="w-full h-full bg-white"></svg>

      {/* Control Panel */}
      {isEditMode && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
          <div className="space-y-2">
            <p className="text-sm font-semibold">Edit Mode Active</p>
            <p className="text-xs text-gray-600">• Drag nodes to reposition</p>
            <p className="text-xs text-gray-600">• Click nodes to connect them</p>
            <p className="text-xs text-gray-600">• Double-click empty space for new node</p>
            <p className="text-xs text-gray-600">• Scroll to zoom, drag to pan</p>
            {isConnecting && (
              <p className="text-xs text-blue-600 font-semibold">
                Connecting from: {selectedNode?.title}
              </p>
            )}
            <button
              onClick={handleSave}
              className="w-full bg-green-600 text-white text-sm py-2 px-3 rounded hover:bg-green-700"
            >
              Save Layout
            </button>
            {isConnecting && (
              <button
                onClick={() => {
                  setIsConnecting(false);
                  setSelectedNode(null);
                }}
                className="w-full bg-red-600 text-white text-sm py-2 px-3 rounded hover:bg-red-700"
              >
                Cancel Connection
              </button>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
        <h4 className="font-bold text-sm mb-2">Controls:</h4>
        <div className="text-xs space-y-1">
          <p>🖱️ Scroll: Zoom in/out</p>
          <p>✋ Drag background: Pan view</p>
          <p>🔗 Curved connections supported</p>
          <p>📱 Full drag & drop enabled</p>
        </div>
      </div>
    </div>
  );
};

export default OrganizationChartD3;