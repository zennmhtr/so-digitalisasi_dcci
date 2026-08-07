import { useState, useEffect, useRef } from "react";
import { soBagianDepartmentsAPI } from "../services/api";
import StaticSoBagianChart from "../components/StaticSoBagianChart";

const SOBagianStructurePreviewModal = ({
  bagianId,
  departmentName,
  changeType,
  newName,
  currentSnapshot,
  proposedData,
  currentData,
  singleSide = null, 
  onClose,
}) => {
  const [deptRecord, setDeptRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(0.6);
  const scrollRef = useRef(null);
  const dragState = useRef({ isDown: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e) => {
    const el = scrollRef.current;
    if (!el) return;
    dragState.current = {
      isDown: true,
      startX: e.pageX,
      startY: e.pageY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
    };
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    const el = scrollRef.current;
    const ds = dragState.current;
    if (!ds.isDown || !el) return;
    e.preventDefault();
    const dx = e.pageX - ds.startX;
    const dy = e.pageY - ds.startY;
    el.scrollLeft = ds.scrollLeft - dx;
    el.scrollTop = ds.scrollTop - dy;
  };

  const stopDragging = () => {
    dragState.current.isDown = false;
    setIsDragging(false);
  };

  const zoomIn = () => setZoomLevel((z) => Math.min(1.2, +(z + 0.1).toFixed(2)));
  const zoomOut = () => setZoomLevel((z) => Math.max(0.2, +(z - 0.1).toFixed(2)));
  const zoomReset = () => setZoomLevel(0.6);

  useEffect(() => {
    if (changeType === "update") {
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const res = await soBagianDepartmentsAPI.getAll();
        const list = res.data?.data || res.data || [];
        const found = list.find(
          (d) => d.id === bagianId || d._id === bagianId || d.bagianId === bagianId
        );
        setDeptRecord(found || null);
      } catch (err) {
        console.error("Error loading SO Bagian preview:", err);
        setDeptRecord(null);
      } finally {
        setLoading(false);
      }
    };
    if (bagianId) load();
  }, [bagianId]);

  const source = deptRecord || currentSnapshot || null;
  const isNew = changeType === "department-add";
  const isUpdate = changeType === "update";

  const extractStructure = (data) => {
    if (!data) return { header: {}, positions: [] };
    const structure = data.organizationData?.structure || data.structure || data;
    return {
      header: structure?.header || {},
      positions: Array.isArray(structure?.positions) ? structure.positions : [],
    };
  };

  const oldStructureData = extractStructure(currentData);
  const newStructureData = extractStructure(proposedData);
  const oldPositionsCount = oldStructureData.positions.filter((p) => p.pendingAction !== "delete").length;
  const newPositionsCount = newStructureData.positions.filter((p) => p.pendingAction !== "delete").length;
  const computeDiffStatuses = () => {
    const statuses = {};
    const oldMap = new Map(oldStructureData.positions.map((p) => [p.id, p]));
    const newMap = new Map(newStructureData.positions.map((p) => [p.id, p]));

    newStructureData.positions.forEach((p) => {
      const old = oldMap.get(p.id);
      if (p.pendingAction === "delete") {
        statuses[p.id] = "removed";
      } else if (!old) {
        statuses[p.id] = "added";
      } else if (old.name !== p.name || old.title !== p.title || old.empId !== p.empId) {
        statuses[p.id] = "modified";
      }
    });
    oldStructureData.positions.forEach((p) => {
      if (!newMap.has(p.id) && !statuses[p.id]) {
        statuses[p.id] = "removed";
      }
    });
    return statuses;
  };
  const diffStatuses = isUpdate ? computeDiffStatuses() : {};
  const hasAnyDiff = Object.keys(diffStatuses).length > 0;
  const positionsDiff = newPositionsCount - oldPositionsCount;
  const headName = source?.head || source?.headName || null;
  const positionCount =
    source?.positionsCount ?? source?.positions?.length ?? source?.totalPositions ?? null;
  const currentName = source?.name || departmentName || "-";
  const isLive = !!deptRecord;

  const DashboardStyleCard = ({ variant, title, deleted }) => (
    <div
      className={`bg-white rounded-lg border-2 shadow-sm p-5 ${deleted
        ? "border-red-400 bg-red-50 opacity-90"
        : variant === "after"
          ? "border-green-400 bg-green-50"
          : "border-gray-200"
        }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full text-white ${variant === "after" ? (deleted ? "bg-red-500" : "bg-green-500") : "bg-gray-500"
            }`}
        >
          {variant === "after" ? "AFTER" : "BEFORE"}
        </span>
      </div>
      <h3 className={`font-bold text-gray-900 text-lg mb-2 ${deleted ? "line-through" : ""}`}>
        {title}
      </h3>
      {deleted ? (
        <p className="text-sm text-red-600 font-medium">Departemen akan dihapus dari daftar</p>
      ) : (
        <>
          <p className={`text-sm text-gray-600 ${deleted ? "line-through" : ""}`}>
            {headName || "Belum ada head"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {positionCount !== null ? `${positionCount} positions` : "- positions"}
          </p>
        </>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[95vw] xl:max-w-7xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900">SO Bagian Preview</h2>
            <p className="text-sm text-gray-500 mt-0.5">Departemen : {departmentName || bagianId}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {singleSide ? (
            <div className={`border-2 rounded-lg overflow-hidden ${singleSide === "before" ? "border-red-400" : "border-green-400"}`}>
              <div className={`px-3 py-2 flex items-center justify-between ${singleSide === "before" ? "bg-red-500" : "bg-green-500"}`}>
                <span className="text-white text-sm font-bold">
                  {singleSide === "before" ? "SEBELUM" : "SESUDAH"}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={zoomOut}
                    title="Perkecil"
                    className="w-7 h-7 flex items-center justify-center rounded bg-white/20 hover:bg-white/30 text-white font-bold"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={zoomReset}
                    title="Reset zoom"
                    className="px-2 h-7 flex items-center justify-center rounded bg-white/20 hover:bg-white/30 text-white text-xs font-semibold"
                  >
                    {Math.round(zoomLevel * 100)}%
                  </button>
                  <button
                    type="button"
                    onClick={zoomIn}
                    title="Perbesar"
                    className="w-7 h-7 flex items-center justify-center rounded bg-white/20 hover:bg-white/30 text-white font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
              <div
                ref={scrollRef}
                className={`overflow-auto bg-gray-50 select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                style={{ height: "70vh" }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={stopDragging}
                onMouseLeave={stopDragging}
              >
                <div style={{ zoom: zoomLevel, transformOrigin: "top left" }}>
                  <StaticSoBagianChart
                    structureData={singleSide === "before" ? oldStructureData : newStructureData}
                    deptName={departmentName}
                    deptId={bagianId}
                    diffStatuses={isUpdate ? diffStatuses : {}}
                    compareHeader={singleSide === "before" ? newStructureData.header : oldStructureData.header}
                  />
                </div>
              </div>
              <div className="px-3 py-1.5 bg-gray-100 border-t text-[11px] text-gray-500">
                Tip: klik &amp; tahan lalu geser untuk menggulir, atau gunakan scrollbar / tombol zoom di atas.
              </div>
            </div>
          ) : loading ? (
            <p className="text-center py-10 text-gray-500">Memuat data departemen...</p>
          ) : (
            <>
              {!isLive && !isNew && !isUpdate && (
                <div className="mb-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Departemen ini sudah tidak ada di data aktif (kemungkinan permintaan ini sudah diproses sebelumnya). Menampilkan berdasarkan data terakhir yang tercatat.
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {changeType === "department-delete" && (
                  <>
                    <DashboardStyleCard variant="before" title={currentName} />
                    <DashboardStyleCard variant="after" title={currentName} deleted />
                  </>
                )}

                {changeType === "department-rename" && (
                  <>
                    <DashboardStyleCard variant="before" title={currentName} />
                    <DashboardStyleCard variant="after" title={newName || "-"} />
                  </>
                )}

                {isNew && (
                  <>
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-5 flex flex-col items-center justify-center text-center">
                      <span className="px-3 py-1 text-xs font-bold rounded-full text-white bg-gray-400 mb-3">
                        BEFORE
                      </span>
                      <p className="text-sm text-gray-400 italic">Departemen belum dibuat</p>
                    </div>
                    <DashboardStyleCard variant="after" title={currentName} />
                  </>
                )}

                {isUpdate && (
                  <>
                    <div className="bg-white rounded-lg border-2 border-gray-200 shadow-sm p-5">
                      <span className="px-3 py-1 text-xs font-bold rounded-full text-white bg-gray-500 mb-3 inline-block">
                        BEFORE
                      </span>
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{departmentName}</h3>
                      <p className="text-xs text-gray-400">{oldPositionsCount} positions</p>
                    </div>
                    <div className="bg-green-50 rounded-lg border-2 border-green-400 shadow-sm p-5">
                      <span className="px-3 py-1 text-xs font-bold rounded-full text-white bg-green-500 mb-3 inline-block">
                        AFTER
                      </span>
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{departmentName}</h3>
                      <p className="text-xs text-gray-600">
                        {newPositionsCount} positions
                        {positionsDiff !== 0 && (
                          <span className={`ml-2 font-semibold ${positionsDiff > 0 ? "text-green-600" : "text-red-600"}`}>
                            ({positionsDiff > 0 ? "+" : ""}{positionsDiff})
                          </span>
                        )}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {isUpdate && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900">Perubahan Layout/Posisi Box</h3>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Box Ditambahkan
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> Box Dihapus
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" /> Box/TTD Diubah
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border-2 border-red-400 rounded-lg overflow-hidden">
                      <div className="bg-red-500 px-3 py-1.5">
                        <span className="text-white text-xs font-bold">SEBELUM</span>
                      </div>
                      <div className="overflow-auto bg-gray-50" style={{ height: "480px" }}>
                        <div style={{ zoom: 0.4, width: `${100 / 0.4}%`, transformOrigin: "top left", pointerEvents: "none" }}>
                          <StaticSoBagianChart
                            structureData={oldStructureData}
                            deptName={departmentName}
                            deptId={bagianId}
                            diffStatuses={diffStatuses}
                            compareHeader={newStructureData.header}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="border-2 border-green-400 rounded-lg overflow-hidden">
                      <div className="bg-green-500 px-3 py-1.5">
                        <span className="text-white text-xs font-bold">SESUDAH</span>
                      </div>
                      <div className="overflow-auto bg-gray-50" style={{ height: "480px" }}>
                        <div style={{ zoom: 0.4, width: `${100 / 0.4}%`, transformOrigin: "top left", pointerEvents: "none" }}>
                          <StaticSoBagianChart
                            structureData={newStructureData}
                            deptName={departmentName}
                            deptId={bagianId}
                            diffStatuses={diffStatuses}
                            compareHeader={oldStructureData.header}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end p-4 border-t">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default SOBagianStructurePreviewModal;