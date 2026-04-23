import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionMode,
  MarkerType,
  Position,
  Handle,
  getBezierPath
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useNavigate } from 'react-router-dom';

const OrganizationNode = ({ data, id }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState({});

  const handleEdit = (field, value) => {
    data.onEdit?.(id, field, value);
    setIsEditing(prev => ({ ...prev, [field]: false }));
  };

  const handleBoxClick = (e) => {
    if (data.isEditMode) return;

    if (data.clickable && data.route) {
      navigate(data.route);
    }
  };

  const renderEditableField = (field, value, placeholder = "") => {
    if (isEditing[field] && data.isEditMode) {
      return (
        <input
          type="text"
          defaultValue={value}
          className="w-full px-1 py-0.5 text-xs border rounded bg-yellow-50"
          placeholder={placeholder}
          autoFocus
          onBlur={(e) => handleEdit(field, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleEdit(field, e.target.value);
            } else if (e.key === 'Escape') {
              setIsEditing(prev => ({ ...prev, [field]: false }));
            }
          }}
        />
      );
    }

    return (
      <span
        onClick={(e) => {
          e.stopPropagation();
          if (data.isEditMode) {
            setIsEditing(prev => ({ ...prev, [field]: true }));
          }
        }}
        className={data.isEditMode ? 'cursor-pointer hover:bg-yellow-100 rounded px-1' : ''}
        title={data.isEditMode ? 'Click to edit' : ''}
      >
        {value || placeholder}
      </span>
    );
  };

  const nodeStyle = {
    background: data.isCustom ? '#f3e8ff' : '#ffffff',
    border: data.isCustom ? '2px solid #a855f7' : '2px solid #6b7280',
    borderRadius: '8px',
    minWidth: '200px',
    minHeight: '80px',
    fontSize: '12px',
    cursor: data.clickable && !data.isEditMode ? 'pointer' : 'default'
  };

  return (
    <div style={nodeStyle} className="shadow-lg" onClick={handleBoxClick}>
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Left}
        className="w-3 h-3 !bg-blue-500"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-blue-500"
        isConnectable={true}
      />

      <div className="flex h-full">
        {/* Code Column */}
        <div className={`${data.isCustom ? 'bg-purple-100' : 'bg-gray-100'} p-2 text-center border-r border-gray-400 w-12 flex items-center justify-center`}>
          <p className="text-xs font-bold">
            {renderEditableField('code', data.code, 'CODE')}
          </p>
        </div>

        {/* Content Column */}
        <div className="p-2 flex-1 text-center flex flex-col justify-center relative">
          {/* Delete button for custom nodes */}
          {data.isCustom && data.onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onDelete(id);
              }}
              className="absolute top-0 right-0 text-red-500 hover:text-red-700 text-xs w-4 h-4 flex items-center justify-center"
            >
              ×
            </button>
          )}

          <p className="text-xs font-semibold mb-1 leading-tight">
            {renderEditableField('title', data.title, 'Title')}
          </p>

          {(data.name || data.isEditMode) && (
            <>
              <hr className="my-1 border-gray-300" />
              <p className="text-xs leading-tight">
                {renderEditableField('name', data.name, 'Name')}
              </p>
              {(data.empId || data.isEditMode) && (
                <p className="text-xs leading-tight">
                  ({renderEditableField('empId', data.empId, 'ID')})
                </p>
              )}
            </>
          )}

          {/* Status indicators */}
          {data.clickable && !data.isEditMode && (
            <p className="text-xs text-blue-600 mt-1 font-semibold">Click to view details →</p>
          )}
          {data.isEditMode && (
            <p className="text-xs text-gray-500 mt-1">Click fields to edit</p>
          )}
          {data.isCustom && (
            <p className="text-xs text-purple-600 mt-1 font-semibold">Custom Box</p>
          )}
        </div>
      </div>
    </div>
  );
};

const TraditionalDashboardView = ({
  organizationData,
  isEditMode,
  onNodeEdit,
  onSave,
  customNodes = [],
  onCustomNodeAdd,
  onCustomNodeDelete
}) => {
  const navigate = useNavigate();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newBoxes, setNewBoxes] = useState(customNodes);

  const EditableBox = ({ item, category, className = "", style = {} }) => {
    const [isEditing, setIsEditing] = useState({});

    const startEdit = (field) => {
      if (isEditMode) {
        setIsEditing(prev => ({ ...prev, [field]: true }));
      }
    };

    const finishEdit = (field, value) => {
      onNodeEdit(item.id, field, value);
      setIsEditing(prev => ({ ...prev, [field]: false }));
    };

    const handleBoxClick = (e) => {
      if (item.clickable && item.route && !isEditMode) {
        navigate(item.route);
      }
    };

    const renderEditableField = (field, value, placeholder = "") => {
      if (isEditing[field]) {
        return (
          <input
            type="text"
            defaultValue={value}
            className="w-full px-1 py-0.5 text-xs border rounded bg-yellow-50"
            placeholder={placeholder}
            autoFocus
            onBlur={(e) => finishEdit(field, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                finishEdit(field, e.target.value);
              } else if (e.key === 'Escape') {
                setIsEditing(prev => ({ ...prev, [field]: false }));
              }
            }}
          />
        );
      }

      return (
        <span
          onClick={() => startEdit(field)}
          className={isEditMode ? 'cursor-pointer hover:bg-yellow-100 rounded px-1' : ''}
          title={isEditMode ? 'Click to edit' : ''}
        >
          {value || placeholder}
        </span>
      );
    };

    const getBoxStyle = () => {
      let baseClasses = `bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] ${className}`;

      if (isEditMode) {
        baseClasses += ' ring-2 ring-blue-200';
      } else if (item.clickable) {
        baseClasses += ' cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200';
      }

      return baseClasses;
    };

    return (
      <div
        className={getBoxStyle()}
        style={style}
        onClick={handleBoxClick}
      >
        <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
          <p className="text-xs font-bold">
            {renderEditableField('code', item.code, 'CODE')}
          </p>
        </div>
        <div className="p-2 flex-1 text-center flex flex-col justify-center">
          <p className="text-xs font-semibold mb-1 leading-tight">
            {renderEditableField('title', item.title, 'Title')}
          </p>
          {(item.name || isEditMode) && (
            <>
              <hr className="my-1 border-gray-300" />
              <p className="text-xs leading-tight">
                {renderEditableField('name', item.name, 'Name')}
              </p>
              {(item.empId || isEditMode) && (
                <p className="text-xs leading-tight">
                  ({renderEditableField('empId', item.empId, 'ID')})
                </p>
              )}
            </>
          )}
          {item.clickable && !isEditMode && (
            <p className="text-xs text-blue-600 mt-1 font-semibold">Click to view details →</p>
          )}
          {isEditMode && (
            <p className="text-xs text-gray-500 mt-1">Click fields to edit</p>
          )}
        </div>
      </div>
    );
  };

  const saveLayout = () => {
    onSave?.();
    setShowSaveDialog(true);
    setTimeout(() => {
      setShowSaveDialog(false);
    }, 3000);
  };

  return (
    <div className="w-full min-h-[800px] bg-white rounded-lg p-6 overflow-x-auto">
      {/* Header Section - identical to DashboardEditor */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="w-24 h-24 flex items-center justify-center mr-4 p-2">
            <img
              src="/logo/Logo DG New 2022.png"
              alt="Dharma Group Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 mb-1">
              {organizationData?.header?.title || "ORGANIZATION STRUCTURE"}
            </h1>
            <h2 className="text-lg font-semibold text-gray-700">
              {organizationData?.header?.company || "PT DHARMA CONTROLCABLE INDONESIA"}
            </h2>
            <p className="text-sm text-gray-500">
              Effective Date: {organizationData?.header?.effectiveDate || "08/09/2025"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="grid grid-cols-3 gap-4 border border-gray-400 p-4 bg-white">
            <div className="text-center border-r border-gray-400 pr-4">
              <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">Prepared By :</p>
              <div className="border-b border-gray-300 mx-auto w-20 mb-16"></div>
              <p className="text-xs font-semibold underline mb-1">Diki Wahyudi</p>
              <p className="text-xs text-gray-500">Prep Date : 08/09/2025</p>
            </div>
            <div className="text-center border-r border-gray-400 pr-4">
              <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">Approved By :</p>
              <div className="border-b border-gray-300 mx-auto w-20 mb-16"></div>
              <p className="text-xs font-semibold underline mb-1">Bambang Wuryanto</p>
              <p className="text-xs text-gray-500">Prepared Date : 08/09/2025</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">Approved By :</p>
              <div className="border-b border-gray-300 mx-auto w-20 mb-16"></div>
              <p className="text-xs font-semibold underline mb-1">Eko Maryanto</p>
              <p className="text-xs text-gray-500">Prepared Date : 08/09/2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Board of Commissioners */}
      <div className="mb-8">
        <div className="bg-blue-300 p-4 rounded text-center max-w-md mx-auto mb-6">
          <h3 className="font-bold text-sm text-white">BOARD OF COMMISSIONERS</h3>
        </div>

        <div className="flex justify-center gap-6 mb-6">
          <div className="bg-white border border-gray-400 rounded shadow-sm w-48 text-center min-h-[100px]">
            <div className="p-2 bg-gray-100 border-b border-gray-300">
              <p className="text-sm font-semibold">
                {organizationData?.commissioners?.president?.title || "PRESIDENT COMMISIONER"}
              </p>
            </div>
            <div className="p-4 flex items-center justify-center h-16">
              <p className="text-xs font-medium">
                {organizationData?.commissioners?.president?.name || "IRIANTO SANTOSO"}
              </p>
            </div>
          </div>
          <div className="bg-white border border-gray-400 p-4 rounded shadow-sm w-48 text-center min-h-[100px] flex flex-col justify-center">
            <p className="text-sm font-semibold mb-3">COMMISSIONERS</p>
            {(organizationData?.commissioners?.commissioners || ["SUBAGIO", "HONG KUO MING", "LIAO CHIN HSIEN"]).map((name, index) => (
              <React.Fragment key={index}>
                <hr className="my-1 border-gray-300" />
                <p className="text-xs mb-1">{name}</p>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="mb-6">
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-blue-300 p-3 rounded text-center">
            <h3 className="font-bold text-xs text-white">BOARD OF DIRECTOR</h3>
          </div>
          <div className="p-3 rounded text-center">
            <h3 className="font-bold text-xs text-transparent">&nbsp;</h3>
          </div>
          <div className="bg-blue-300 p-3 rounded text-center">
            <h3 className="font-bold text-xs text-white">DIVISION HEAD</h3>
          </div>
          <div className="bg-blue-300 p-3 rounded text-center">
            <h3 className="font-bold text-xs text-white">DEPARTMENT HEAD</h3>
          </div>
          <div className="bg-blue-300 p-3 rounded text-center">
            <h3 className="font-bold text-xs text-white leading-tight">SECTION HEAD / ENGINEERING PRODUCT LEADER</h3>
          </div>
        </div>
      </div>

      {/* Main Content Grid - 5 Columns */}
      <div className="mb-6">
        <div className="grid grid-cols-5 gap-4">

          {/* Column 1 - Board of Directors */}
          <div className="space-y-3">
            {organizationData?.structure?.bod?.map((item) => (
              <EditableBox key={item.id} item={item} category="bod" />
            ))}
          </div>

          {/* Column 2 - Management Functions */}
          <div className="space-y-4">
            <div className="min-h-[180px]"></div>
            {organizationData?.structure?.management?.map((item) => {
              if (item.code === 'MDO1.0') {
                const mdo2 = organizationData.structure.management.find(m => m.code === 'MDO2.0');
                return (
                  <div key="mdo-combined" className={`bg-white border border-gray-400 rounded shadow-sm min-h-[170px] ${isEditMode ? 'ring-2 ring-blue-200' : ''
                    } ${mdo2?.clickable && !isEditMode ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200' : ''}`}
                    onClick={() => {
                      if (mdo2?.clickable && mdo2?.route && !isEditMode) {
                        navigate(mdo2.route);
                      }
                    }}>
                    <div className="flex flex-col h-full">
                      <div className="flex border-b border-gray-300">
                        <div className="p-2 flex-1 text-center bg-gray-100">
                          <p className="text-xs font-semibold leading-tight">MANAGEMENT DEVELOPMENT/PDCA</p>
                        </div>
                      </div>
                      <div className="flex border-b border-gray-300 flex-1">
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-14 flex items-center justify-center">
                          <p className="text-xs font-bold">{item.code}</p>
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <p className="text-xs leading-tight">{item.name}</p>
                          <p className="text-xs leading-tight">({item.empId})</p>
                        </div>
                      </div>
                      <div className="flex flex-1">
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-14 flex items-center justify-center">
                          <p className="text-xs font-bold">{mdo2?.code}</p>
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <p className="text-xs leading-tight">{mdo2?.name}</p>
                          <p className="text-xs leading-tight">({mdo2?.empId})</p>
                          {mdo2?.clickable && !isEditMode && (
                            <p className="text-xs text-blue-600 mt-1 font-semibold">Click to view details →</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } else if (item.code === 'MDO2.0') {
                return null;
              } else {
                return <EditableBox key={item.id} item={item} category="management" />;
              }
            })}
          </div>

          {/* Column 3 - Division Head */}
          <div className="space-y-3">
            <div className="min-h-[110px]"></div>
            <div className="min-h-[120px]"></div>
            <div className="min-h-[200px]"></div>
            <div className="min-h-[120px]"></div>
            <div className="min-h-[130px]"></div>

            {organizationData?.structure?.divisions?.map((div, index) => (
              <React.Fragment key={div.id}>
                {index > 0 && <div className={index === 1 ? "min-h-[100px]" : "min-h-[570px]"}></div>}
                <div className={`bg-gray-200 p-3 rounded text-center font-bold text-xs min-h-${index === 0 ? '[100px]' : '[80px]'} flex items-center justify-center`}>
                  <span className="leading-tight">{div.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Column 4 - Department Head */}
          <div className="space-y-3">
            <div className="min-h-[110px]"></div>
            <div className="min-h-[150px]"></div>
            <div className="min-h-[190px]"></div>

            {organizationData?.structure?.departments?.map((item, index) => (
              <React.Fragment key={item.id}>
                {index === 1 && <div className="min-h-[10px]"></div>}
                {index === 3 && <div className="min-h-[1px]"></div>}
                {index === 4 && <div className="min-h-[105px]"></div>}
                {index === 5 && <div className="min-h-[110px]"></div>}
                {index === 6 && <div className="min-h-[250px]"></div>}
                <EditableBox item={item} category="departments" />
                {index === 6 && <div className="min-h-[1px]"></div>}
              </React.Fragment>
            ))}
          </div>

          {/* Column 5 - Section Head */}
          <div className="space-y-3">
            {organizationData?.structure?.sections?.map((item, index) => (
              <React.Fragment key={item.id}>
                {index === 3 && <div className="min-h-[435px]"></div>}
                {index === 4 && <div className="min-h-[10px]"></div>}
                {index === 5 && <div className="min-h-[10px]"></div>}
                <EditableBox item={item} category="sections" />
              </React.Fragment>
            ))}
          </div>

        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-400 max-w-sm">
        <h4 className="font-bold text-sm mb-2">NOTE:</h4>
        <div className="text-xs space-y-1">
          <p><span className="font-bold">*</span> CONCURE</p>
          <p><span className="font-bold">**</span> ACTING</p>
          <p><span className="font-bold">(INC.)</span> INCUMBENT</p>
          <p><span className="font-bold">TBR</span> TO BE RECRUIT</p>
          <p><span className="font-bold">TBD</span> TO BE DEVELOP</p>
        </div>
      </div>

      {/* Save confirmation */}
      {showSaveDialog && (
        <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg z-50">
          <p className="text-green-800 font-semibold">✅ Layout saved successfully!</p>
        </div>
      )}
    </div>
  );
};

const FlowChartView = ({
  organizationData,
  isEditMode,
  onNodeEdit,
  onSave,
  customNodes = [],
  onCustomNodeAdd,
  onCustomNodeDelete
}) => {
  const initialNodes = useMemo(() => {
    const nodes = [];
    let yOffset = 100;
    const columnWidth = 250;

    // Board of Directors - Column 1
    organizationData?.structure?.bod?.forEach((item, index) => {
      nodes.push({
        id: item.id,
        type: 'organizationNode',
        position: { x: 50, y: yOffset + (index * 120) },
        data: {
          ...item,
          isEditMode,
          onEdit: onNodeEdit
        }
      });
    });

    // Management - Column 2
    let mgmtYOffset = 300;
    organizationData?.structure?.management?.forEach((item, index) => {
      if (item.code !== 'MDO2.0') {
        nodes.push({
          id: item.id,
          type: 'organizationNode',
          position: { x: columnWidth + 50, y: mgmtYOffset + (index * 140) },
          data: {
            ...item,
            isEditMode,
            onEdit: onNodeEdit
          }
        });
      }
    });

    // Departments - Column 4
    let deptYOffset = 500;
    organizationData?.structure?.departments?.forEach((item, index) => {
      nodes.push({
        id: item.id,
        type: 'organizationNode',
        position: { x: (columnWidth * 3) + 50, y: deptYOffset + (index * 120) },
        data: {
          ...item,
          isEditMode,
          onEdit: onNodeEdit
        }
      });
    });

    // Sections - Column 5
    let sectYOffset = 100;
    organizationData?.structure?.sections?.forEach((item, index) => {
      nodes.push({
        id: item.id,
        type: 'organizationNode',
        position: { x: (columnWidth * 4) + 50, y: sectYOffset + (index * 100) },
        data: {
          ...item,
          isEditMode,
          onEdit: onNodeEdit
        }
      });
    });

    // Add custom nodes
    customNodes.forEach((node) => {
      nodes.push({
        id: node.id,
        type: 'organizationNode',
        position: node.position,
        data: {
          ...node,
          isEditMode,
          isCustom: true,
          onEdit: onNodeEdit,
          onDelete: onCustomNodeDelete
        }
      });
    });

    return nodes;
  }, [organizationData, isEditMode, onNodeEdit, customNodes, onCustomNodeDelete]);

  const initialEdges = [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd }) => {
    const [edgePath] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      curvature: 0.3,
    });

    return (
      <>
        <path
          id={id}
          style={style}
          className="react-flow__edge-path"
          d={edgePath}
          markerEnd={markerEnd}
        />
      </>
    );
  };

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        type: 'custom',
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#3B82F6',
        },
        style: {
          stroke: '#3B82F6',
          strokeWidth: 3,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const nodeTypes = useMemo(
    () => ({
      organizationNode: OrganizationNode,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      custom: CustomEdge,
    }),
    []
  );

  const onPaneClick = useCallback(
    (event) => {
      if (!isEditMode) return;

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 40,
      };

      const newNode = {
        id: `custom-${Date.now()}`,
        type: 'organizationNode',
        position,
        data: {
          code: 'NEW',
          title: 'New Position',
          name: 'To Be Assigned',
          empId: '',
          isCustom: true,
          isEditMode,
          onEdit: onNodeEdit,
          onDelete: onCustomNodeDelete,
        },
      };

      setNodes((nds) => nds.concat(newNode));
      onCustomNodeAdd?.(newNode);
    },
    [isEditMode, onNodeEdit, onCustomNodeDelete, onCustomNodeAdd, setNodes]
  );

  const handleSave = () => {
    const layoutData = {
      nodes: nodes.map(node => ({
        id: node.id,
        position: node.position,
        data: node.data
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        style: edge.style
      }))
    };

    onSave?.(layoutData);
  };

  return (
    <div className="w-full h-[800px] border border-gray-300 rounded-lg bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        attributionPosition="bottom-left"
        className="bg-white"
        defaultEdgeOptions={{
          type: 'custom',
          style: {
            strokeWidth: 3,
            stroke: '#3B82F6',
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#3B82F6',
          },
        }}
      >
        <Controls />
        <MiniMap
          className="!bg-gray-100"
          nodeColor={(node) => node.data.isCustom ? '#a855f7' : '#3B82F6'}
        />
        <Background variant="dots" gap={20} size={1} />
      </ReactFlow>

      {/* Toolbar */}
      {isEditMode && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
          <div className="space-y-2">
            <p className="text-sm font-semibold">Edit Mode Active</p>
            <p className="text-xs text-gray-600">• Drag nodes to reposition</p>
            <p className="text-xs text-gray-600">• Click empty space to add new box</p>
            <p className="text-xs text-gray-600">• Drag from connection points to create links</p>
            <button
              onClick={handleSave}
              className="w-full bg-green-600 text-white text-sm py-2 px-3 rounded hover:bg-green-700"
            >
              Save Layout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const OrganizationChart = ({
  organizationData,
  isEditMode = false,
  onNodeEdit,
  onSave,
  customNodes = [],
  onCustomNodeAdd,
  onCustomNodeDelete,
  viewMode = 'traditional'
}) => {
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);

  return (
    <div className="w-full">
      {/* View Mode Toggle */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">View Mode:</span>
          <button
            onClick={() => setCurrentViewMode('traditional')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${currentViewMode === 'traditional'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            📋 Traditional Layout
          </button>
          <button
            onClick={() => setCurrentViewMode('flowchart')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${currentViewMode === 'flowchart'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            🚀 Flow Chart
          </button>
        </div>

        <div className="text-sm text-gray-600">
          {currentViewMode === 'traditional'
            ? 'Showing exact dashboard layout - perfect for final presentation'
            : 'Interactive flow chart - drag, connect, and customize freely'}
        </div>
      </div>

      {/* Render appropriate view */}
      {currentViewMode === 'traditional' ? (
        <TraditionalDashboardView
          organizationData={organizationData}
          isEditMode={isEditMode}
          onNodeEdit={onNodeEdit}
          onSave={onSave}
          customNodes={customNodes}
          onCustomNodeAdd={onCustomNodeAdd}
          onCustomNodeDelete={onCustomNodeDelete}
        />
      ) : (
        <FlowChartView
          organizationData={organizationData}
          isEditMode={isEditMode}
          onNodeEdit={onNodeEdit}
          onSave={onSave}
          customNodes={customNodes}
          onCustomNodeAdd={onCustomNodeAdd}
          onCustomNodeDelete={onCustomNodeDelete}
        />
      )}
    </div>
  );
};

export default OrganizationChart;