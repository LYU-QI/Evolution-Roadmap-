import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, ArrowUpRight, Box, Settings2, Layers, 
  CheckCircle2, Zap, Clock, ChevronUp, Save, Download, 
  Calendar, Info, LayoutGrid, Database, Tag, List, Target,
  SlidersHorizontal, Eye, EyeOff, Search, ChevronRight, ChevronDown,
  Package, ShieldCheck, Maximize2, Minimize2, X, Activity,
  TrendingUp, Compass, Github, Moon, Sun, Monitor
} from 'lucide-react';

/**
 * 核心业务数据 - 演示用例汉化
 */
const INITIAL_DATA = {
  startYear: 2026,
  startMonth: 1,
  projects: [
    { 
      id: 'proj-1', 
      name: '核心架构 4.0 重构', 
      start: 0, 
      end: 330, 
      color: '#6366f1',
      subProjects: [
        { id: 'sub-1-1', name: '底层服务拆分', start: 0, end: 150 },
        { id: 'sub-1-2', name: '平台网关升级', start: 120, end: 300 }
      ]
    },
    { 
      id: 'proj-2', 
      name: 'AI 自动化执行引擎', 
      start: 90, 
      end: 420, 
      color: '#818cf8',
      subProjects: [
        { id: 'sub-2-1', name: '推理编排核心', start: 90, end: 270 }
      ]
    },
    { id: 'proj-3', name: '全球合规化管理中心', start: 210, end: 510, color: '#4f46e5', subProjects: [] },
  ],
  products: [
    { 
      id: 'prod-1', 
      name: '智能助手 App', 
      color: '#10b981',
      versions: [
        { id: 'v-1-1', label: 'V1.0 灯塔版', time: 30, features: ["核心语义理解", "多轮对话引擎"] },
        { id: 'v-1-2', label: 'V1.5 专业版', time: 180, features: ["知识库深度检索", "插件化架构"] },
        { id: 'v-1-3', label: 'V2.0 旗舰版', time: 300, features: ["跨端实时同步", "企业安全大脑"] }
      ]
    },
    { 
      id: 'prod-2', 
      name: '云端协作工作台', 
      color: '#059669',
      versions: [
        { id: 'v-2-1', label: '预览版 0.8', time: 90, features: ["实时协作基座", "基础看板配置"] },
        { id: 'v-2-2', label: '正式版 1.2', time: 240, features: ["自动化工作流", "深度集成生态"] }
      ]
    }
  ],
  feedbacks: [
    { id: 'f-1', versionId: 'v-1-1', projectId: 'proj-1', subProjectId: 'sub-1-1', deliveryScope: '鉴权插件 SDK', deliveryQuality: 'SOP', deliveryDate: '2026-03-15' },
    { id: 'f-2', versionId: 'v-2-1', projectId: 'proj-1', subProjectId: 'sub-1-2', deliveryScope: '多租户架构模板', deliveryQuality: 'POC', deliveryDate: '2026-05-18' },
    { id: 'f-3', versionId: 'v-1-2', projectId: 'proj-2', subProjectId: 'sub-2-1', deliveryScope: 'NLP 逻辑接口', deliveryQuality: 'SOP', deliveryDate: '2026-08-05' },
    { id: 'f-4', versionId: 'v-2-2', projectId: 'proj-2', subProjectId: null, deliveryScope: '动态扩容脚本', deliveryQuality: 'SOP', deliveryDate: '2026-10-12' },
    { id: 'f-5', versionId: 'v-1-3', projectId: 'proj-3', subProjectId: null, deliveryScope: 'GDPR 审计框架', deliveryQuality: 'SOP', deliveryDate: '2027-01-25' }
  ]
};

const App = () => {
  const [data, setData] = useState(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState('projects');
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const svgRef = useRef(null);
  
  // 视觉参数
  const [monthWidth, setMonthWidth] = useState(14);
  const [hiddenProjectIds, setHiddenProjectIds] = useState([]);
  const [collapsedChartProjectIds, setCollapsedChartProjectIds] = useState([]);
  const [timeScale, setTimeScale] = useState('week');
  const [hoveredFeedbackId, setHoveredFeedbackId] = useState(null);
  const [projectFilterIds, setProjectFilterIds] = useState([]);
  const [isProjectFilterOpen, setIsProjectFilterOpen] = useState(false);
  const [productFilterIds, setProductFilterIds] = useState([]);
  const [isProductFilterOpen, setIsProductFilterOpen] = useState(false);
  const projectFilterRef = useRef(null);
  const productFilterRef = useRef(null);

  // 布局常量
  const SIDEBAR_WIDTH = 300;    
  const TIMELINE_HEADER_H = 60; 
  const SECTION_HEADER_H = 64;  
  const PROJECT_ROW_H = 120;    
  const NEXUS_H = 70;           
  const PRODUCT_ROW_H = 130;    
  const TOTAL_MONTHS = 36;
  const DAY_MS = 24 * 60 * 60 * 1000;

  const normalizedProjects = useMemo(() => 
    data.projects.map(p => ({ ...p, subProjects: p.subProjects || [] }))
  , [data.projects]);

  const visibleProjects = useMemo(() => 
    normalizedProjects.filter(p => {
      if (hiddenProjectIds.includes(p.id)) return false;
      if (projectFilterIds.length === 0) return true;
      return projectFilterIds.includes(p.id);
    })
  , [normalizedProjects, hiddenProjectIds, projectFilterIds]);

  const visibleProducts = useMemo(() =>
    data.products.filter(p => productFilterIds.length === 0 || productFilterIds.includes(p.id))
  , [data.products, productFilterIds]);

  const updateData = (newData) => setData({ ...data, ...newData });

  const isChartCollapsed = (projectId) => collapsedChartProjectIds.includes(projectId);
  const toggleChartCollapse = (projectId) => {
    setCollapsedChartProjectIds(prev => prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]);
  };

  useEffect(() => {
    const validIds = new Set(data.projects.map(p => p.id));
    setHiddenProjectIds(prev => prev.filter(id => validIds.has(id)));
  }, [data.projects]);

  useEffect(() => {
    const validIds = new Set(data.projects.map(p => p.id));
    setCollapsedChartProjectIds(prev => prev.filter(id => validIds.has(id)));
  }, [data.projects]);

  useEffect(() => {
    const validIds = new Set(data.projects.map(p => p.id));
    setProjectFilterIds(prev => prev.filter(id => validIds.has(id)));
  }, [data.projects]);

  useEffect(() => {
    const validIds = new Set(data.products.map(p => p.id));
    setProductFilterIds(prev => prev.filter(id => validIds.has(id)));
  }, [data.products]);

  useEffect(() => {
    const onDocMouseDown = (event) => {
      const t = event.target;
      if (isProjectFilterOpen && projectFilterRef.current && !projectFilterRef.current.contains(t)) {
        setIsProjectFilterOpen(false);
      }
      if (isProductFilterOpen && productFilterRef.current && !productFilterRef.current.contains(t)) {
        setIsProductFilterOpen(false);
      }
    };

    const onEsc = (event) => {
      if (event.key === 'Escape') {
        setIsProjectFilterOpen(false);
        setIsProductFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [isProjectFilterOpen, isProductFilterOpen]);

  const timelineStartDate = useMemo(
    () => new Date(data.startYear, data.startMonth - 1, 1),
    [data.startYear, data.startMonth]
  );

  const TOTAL_DAYS = useMemo(() => {
    const end = new Date(timelineStartDate);
    end.setMonth(end.getMonth() + TOTAL_MONTHS);
    return Math.ceil((end.getTime() - timelineStartDate.getTime()) / DAY_MS);
  }, [timelineStartDate]);

  const formatMonthLabel = (dayOffset) => {
    const date = new Date(timelineStartDate.getTime() + dayOffset * DAY_MS);
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const timelineTicks = useMemo(() => {
    if (timeScale === 'week') {
      const ticks = [];
      for (let i = 0; i < TOTAL_DAYS; i += 7) {
        const date = new Date(timelineStartDate.getTime() + i * DAY_MS);
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        ticks.push({ offset: i, label: `W${Math.floor(i / 7) + 1} ${m}-${d}` });
      }
      return ticks;
    }

    if (timeScale === 'month') {
      const ticks = [];
      for (let i = 0; i < TOTAL_DAYS; i++) {
        const date = new Date(timelineStartDate.getTime() + i * DAY_MS);
        if (i === 0 || date.getDate() === 1) {
          const y = date.getFullYear();
          const m = (date.getMonth() + 1).toString().padStart(2, '0');
          ticks.push({ offset: i, label: `${y}-${m}` });
        }
      }
      return ticks;
    }

    return [...Array(TOTAL_DAYS)].map((_, i) => ({
      offset: i,
      label: formatMonthLabel(i),
    }));
  }, [timeScale, TOTAL_DAYS, timelineStartDate]);

  const offsetToDateInput = (offsetDays) => {
    const date = new Date(timelineStartDate.getTime() + offsetDays * DAY_MS);
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const dateInputToOffset = (value) => {
    if (!value) return 0;
    const target = new Date(`${value}T00:00:00`);
    if (Number.isNaN(target.getTime())) return 0;
    return Math.floor((target.getTime() - timelineStartDate.getTime()) / DAY_MS);
  };

  const getXFromDate = (dateStr) => {
    if (!dateStr) return 0;
    const target = new Date(`${dateStr}T00:00:00`);
    const offsetDays = Math.floor((target.getTime() - timelineStartDate.getTime()) / DAY_MS);
    return offsetDays * monthWidth;
  };

  const projectRenderItems = useMemo(() => {
    let currentTop = SECTION_HEADER_H;
    return visibleProjects.map((p) => {
      const chartSubs = isChartCollapsed(p.id) ? [] : (p.subProjects || []);
      const rowHeight = PROJECT_ROW_H * (chartSubs.length + 1);
      const mainY = currentTop + (PROJECT_ROW_H / 2);
      const item = { ...p, chartSubs, rowHeight, mainY };
      currentTop += rowHeight;
      return item;
    });
  }, [visibleProjects, collapsedChartProjectIds]);

  const projectYMap = useMemo(
    () => Object.fromEntries(projectRenderItems.map((item) => [item.id, item.mainY])),
    [projectRenderItems]
  );

  const subProjectYMap = useMemo(() => {
    const entries = [];
    projectRenderItems.forEach((item) => {
      const subSpacing = PROJECT_ROW_H;
      const subStartY = 28;
      item.chartSubs.forEach((sub, sIdx) => {
        const y = item.mainY + subStartY + sIdx * subSpacing;
        entries.push([`${item.id}::${sub.id}`, y]);
      });
    });
    return Object.fromEntries(entries);
  }, [projectRenderItems]);

  /**
   * 🚀 强化版中文导出：确保中文字体、背景和所有名称标签完整显示
   */
  const handleExportSVG = () => {
    if (!svgRef.current) return;

    const svgClone = svgRef.current.cloneNode(true);
    const canvasH = projectAreaH + NEXUS_H + productAreaH + 100;
    const totalCanvasW = totalTimelineWidth + SIDEBAR_WIDTH;

    // 1. 注入汉化样式
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      text { font-family: "PingFang SC", "Microsoft YaHei", sans-serif; dominant-baseline: middle; fill: #ffffff !important; }
      .export-label { font-weight: 900; font-size: 14px; fill: #ffffff !important; }
      .export-sub { font-weight: 700; font-size: 9px; fill: #94a3b8 !important; }
      .time-label { font-family: ui-monospace, monospace; font-size: 11px; font-weight: 900; fill: #ffffff !important; }
    `;
    svgClone.insertBefore(styleElement, svgClone.firstChild);

    const mainGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    
    // 全局深色底色
    const globalBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    globalBg.setAttribute("x", `-${SIDEBAR_WIDTH}`);
    globalBg.setAttribute("y", `-${TIMELINE_HEADER_H}`);
    globalBg.setAttribute("width", totalCanvasW);
    globalBg.setAttribute("height", canvasH + TIMELINE_HEADER_H);
    globalBg.setAttribute("fill", "#0f172a");
    mainGroup.appendChild(globalBg);

    // 绘制顶部时间轴镜像
    const timeHeaderGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    timeHeaderGroup.setAttribute("transform", `translate(0, -${TIMELINE_HEADER_H})`);
    
    timelineTicks.forEach((tick, idx) => {
        const x = tick.offset * monthWidth;
        const nextOffset = idx < timelineTicks.length - 1 ? timelineTicks[idx + 1].offset : TOTAL_DAYS;
        const cellW = Math.max((nextOffset - tick.offset) * monthWidth - 2, 2);
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", x + 1); rect.setAttribute("y", 10);
        rect.setAttribute("width", cellW); rect.setAttribute("height", 40);
        rect.setAttribute("rx", "12"); rect.setAttribute("fill", "#1e293b");
        timeHeaderGroup.appendChild(rect);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x + cellW / 2); text.setAttribute("y", 30);
        text.setAttribute("text-anchor", "middle"); text.setAttribute("class", "time-label");
        text.textContent = tick.label;
        timeHeaderGroup.appendChild(text);
    });
    mainGroup.appendChild(timeHeaderGroup);

    // 绘制侧边栏中文标签镜像
    const sidebarGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    sidebarGroup.setAttribute("transform", `translate(-${SIDEBAR_WIDTH}, 0)`);

    projectRenderItems.forEach((p) => {
        const y = p.mainY;
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", "50"); text.setAttribute("y", y - 8);
        text.setAttribute("class", "export-label"); text.textContent = p.name;
        sidebarGroup.appendChild(text);

        const subText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        subText.setAttribute("x", "50"); subText.setAttribute("y", y + 14);
        subText.setAttribute("class", "export-sub"); subText.textContent = "项目执行管线";
        sidebarGroup.appendChild(subText);
    });

    visibleProducts.forEach((prod, i) => {
        const y = projectAreaH + NEXUS_H + SECTION_HEADER_H + (i * PRODUCT_ROW_H) + (PRODUCT_ROW_H / 2);
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", "50"); text.setAttribute("y", y - 8);
        text.setAttribute("class", "export-label"); text.textContent = prod.name;
        sidebarGroup.appendChild(text);

        const subText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        subText.setAttribute("x", "50"); subText.setAttribute("y", y + 14);
        subText.setAttribute("class", "export-sub"); subText.textContent = "产品演进序列";
        sidebarGroup.appendChild(subText);
    });
    mainGroup.appendChild(sidebarGroup);

    // 将画布内容转移到镜像组
    while (svgClone.childNodes.length > 0) {
        const node = svgClone.firstChild;
        if (node.nodeName !== 'style' && node.nodeName !== 'defs') {
            mainGroup.appendChild(node);
        } else {
            svgClone.removeChild(node);
        }
    }
    svgClone.appendChild(mainGroup);

    svgClone.setAttribute("viewBox", `-${SIDEBAR_WIDTH} -${TIMELINE_HEADER_H} ${totalCanvasW} ${canvasH + TIMELINE_HEADER_H}`);
    svgClone.setAttribute("width", totalCanvasW);
    svgClone.setAttribute("height", canvasH + TIMELINE_HEADER_H);

    const serializer = new XMLSerializer();
    let source = '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(svgClone);
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
    const link = document.createElement("a");
    link.href = url;
    link.download = `项目产品协同演进全景看板_${new Date().toISOString().slice(0,10)}.svg`;
    link.click();
  };

  const projectAreaH = SECTION_HEADER_H + projectRenderItems.reduce((sum, item) => sum + item.rowHeight, 0);
  const productAreaH = SECTION_HEADER_H + (visibleProducts.length * PRODUCT_ROW_H);
  const totalViewHeight = projectAreaH + NEXUS_H + productAreaH + 100;
  const totalTimelineWidth = TOTAL_DAYS * monthWidth;

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* 1. 配置侧边栏 */}
      <div className={`transition-all duration-500 ease-in-out border-r border-slate-800 bg-slate-900/60 backdrop-blur-2xl flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.3)] z-50 ${isConfigOpen && !isFocusMode ? 'w-[420px]' : 'w-0 overflow-hidden opacity-0'}`}>
        <div className="p-8 space-y-2 shrink-0 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg"><Settings2 size={20} className="text-white"/></div>
             <div>
                <h1 className="text-lg font-black tracking-tight text-white leading-none">看板配置引擎</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Roadmap Manager v8.5</p>
             </div>
          </div>
        </div>

        <div className="px-6 py-4 flex gap-1 shrink-0">
          {[
            { id: 'projects', icon: Layers, label: '项目管线' },
            { id: 'products', icon: Box, label: '产品迭代' },
            { id: 'feedbacks', icon: Activity, label: '反哺配置' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? 'bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20 shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}>
              <tab.icon size={16} /><span className="text-[11px] font-black">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
           {activeTab === 'projects' && (
             <div className="space-y-4">
                <button onClick={() => updateData({projects: [...data.projects, {id: `p-${Date.now()}`, name: '新研发项目轨道', start: 0, end: 180, color: '#818cf8', subProjects: []}]})} className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest">+ 新增项目维度</button>
                {data.projects.map((p, idx) => (
                  <div key={p.id} className={`p-5 rounded-2xl border transition-all ${hiddenProjectIds.includes(p.id) ? 'opacity-40 grayscale border-slate-800' : 'bg-slate-800/40 border-slate-700/50 shadow-sm hover:border-indigo-500/30'}`}>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <button onClick={() => setHiddenProjectIds(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])} className="text-slate-500 hover:text-indigo-400">
                             {hiddenProjectIds.includes(p.id) ? <EyeOff size={16}/> : <Eye size={16}/>}
                          </button>
                          <input className="bg-transparent border-none p-0 focus:ring-0 font-black text-sm text-slate-100" value={p.name} onChange={e => { const n = [...data.projects]; n[idx].name = e.target.value; updateData({projects: n}); }}/>
                       </div>
                       <button onClick={() => updateData({projects: data.projects.filter(x => x.id !== p.id)})} className="text-slate-600 hover:text-rose-500"><Trash2 size={14}/></button>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-wider">
                        开始
                        <input
                          type="date"
                          min={offsetToDateInput(0)}
                          max={offsetToDateInput(TOTAL_DAYS - 1)}
                          className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-2 py-1 text-slate-200"
                          value={offsetToDateInput(p.start)}
                          onChange={e => {
                            const n = [...data.projects];
                            const nextStart = dateInputToOffset(e.target.value);
                            n[idx].start = Math.max(0, Math.min(nextStart, n[idx].end - 1));
                            updateData({ projects: n });
                          }}
                        />
                      </label>
                      <label className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-wider">
                        结束
                        <input
                          type="date"
                          min={offsetToDateInput(1)}
                          max={offsetToDateInput(TOTAL_DAYS)}
                          className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-2 py-1 text-slate-200"
                          value={offsetToDateInput(p.end)}
                          onChange={e => {
                            const n = [...data.projects];
                            const nextEnd = dateInputToOffset(e.target.value);
                            n[idx].end = Math.max(n[idx].start + 1, Math.min(nextEnd, TOTAL_DAYS));
                            updateData({ projects: n });
                          }}
                        />
                      </label>
                    </div>
                    <div className="mt-4 rounded-xl border border-slate-700/60 bg-slate-900/30 p-3">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">子项目配置 ({(p.subProjects || []).length})</p>
                        <button
                          onClick={() => {
                            const n = [...data.projects];
                            const currentSubs = n[idx].subProjects || [];
                            const defaultStart = n[idx].start;
                            const defaultEnd = Math.min(n[idx].end, defaultStart + 90);
                            n[idx].subProjects = [
                              ...currentSubs,
                              { id: `sub-${Date.now()}`, name: `子项目 ${(currentSubs.length || 0) + 1}`, start: defaultStart, end: defaultEnd }
                            ];
                            updateData({ projects: n });
                          }}
                          className="px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-[10px] font-black hover:bg-indigo-500/30"
                        >
                          + 子项目
                        </button>
                      </div>
                      <div className="space-y-2">
                        {(p.subProjects || []).map((sub, sIdx) => (
                          <div key={sub.id} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                            <div className="flex items-center gap-2">
                              <input
                                className="flex-1 bg-transparent border-none p-0 text-xs text-slate-200 focus:ring-0 font-bold"
                                value={sub.name}
                                onChange={e => {
                                  const n = [...data.projects];
                                  n[idx].subProjects[sIdx].name = e.target.value;
                                  updateData({ projects: n });
                                }}
                              />
                              <button
                                onClick={() => {
                                  const n = [...data.projects];
                                  n[idx].subProjects = (n[idx].subProjects || []).filter((x, i) => i !== sIdx);
                                  updateData({ projects: n });
                                }}
                                className="text-slate-600 hover:text-rose-400"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              <input
                                type="date"
                                min={offsetToDateInput(p.start)}
                                max={offsetToDateInput(Math.max(p.start, p.end - 1))}
                                className="w-full bg-slate-900/60 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-300"
                                value={offsetToDateInput(sub.start)}
                                onChange={e => {
                                  const n = [...data.projects];
                                  const nextStart = Math.max(
                                    p.start,
                                    Math.min(dateInputToOffset(e.target.value), n[idx].subProjects[sIdx].end - 1)
                                  );
                                  n[idx].subProjects[sIdx].start = nextStart;
                                  updateData({ projects: n });
                                }}
                              />
                              <input
                                type="date"
                                min={offsetToDateInput(Math.max(p.start + 1, sub.start + 1))}
                                max={offsetToDateInput(p.end)}
                                className="w-full bg-slate-900/60 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-300"
                                value={offsetToDateInput(sub.end)}
                                onChange={e => {
                                  const n = [...data.projects];
                                  const nextEnd = Math.min(
                                    p.end,
                                    Math.max(dateInputToOffset(e.target.value), n[idx].subProjects[sIdx].start + 1)
                                  );
                                  n[idx].subProjects[sIdx].end = nextEnd;
                                  updateData({ projects: n });
                                }}
                              />
                            </div>
                          </div>
                        ))}
                        {(p.subProjects || []).length === 0 && (
                          <p className="text-[10px] text-slate-600 italic">当前项目还没有子项目</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
             </div>
           )}
           {activeTab === 'products' && (
             <div className="space-y-4">
               <button
                 onClick={() => updateData({
                   products: [
                     ...data.products,
                     { id: `prod-${Date.now()}`, name: '新产品线', color: '#10b981', versions: [] }
                   ]
                 })}
                 className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
               >
                 + 新增产品线
               </button>
               {data.products.map((prod, pIdx) => (
                 <div key={prod.id} className="p-5 rounded-2xl border bg-slate-800/40 border-slate-700/50 shadow-sm">
                   <div className="flex items-center justify-between gap-3">
                     <input
                       className="flex-1 bg-transparent border-none p-0 focus:ring-0 font-black text-sm text-slate-100"
                       value={prod.name}
                       onChange={e => {
                         const n = [...data.products];
                         n[pIdx].name = e.target.value;
                         updateData({ products: n });
                       }}
                     />
                     <button
                       onClick={() => updateData({ products: data.products.filter((_, i) => i !== pIdx) })}
                       className="text-slate-600 hover:text-rose-500"
                     >
                       <Trash2 size={14} />
                     </button>
                   </div>
                   <div className="mt-3 space-y-2">
                     <div className="flex items-center justify-between">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">版本配置 ({prod.versions.length})</p>
                       <button
                         onClick={() => {
                           const n = [...data.products];
                           n[pIdx].versions = [
                             ...n[pIdx].versions,
                             { id: `v-${Date.now()}`, label: `V${n[pIdx].versions.length + 1}.0`, time: 0, features: ['新能力'] }
                           ];
                           updateData({ products: n });
                         }}
                         className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-black hover:bg-emerald-500/30"
                       >
                         + 版本
                       </button>
                     </div>
                     {prod.versions.map((v, vIdx) => (
                       <div key={v.id} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 space-y-2">
                         <div className="flex items-center gap-2">
                           <input
                             className="flex-1 bg-transparent border-none p-0 text-xs text-slate-200 focus:ring-0 font-bold"
                             value={v.label}
                             onChange={e => {
                               const n = [...data.products];
                               n[pIdx].versions[vIdx].label = e.target.value;
                               updateData({ products: n });
                             }}
                           />
                          <input
                            type="number"
                            min="0"
                            max={TOTAL_DAYS - 1}
                            className="w-20 bg-slate-900/60 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-300"
                            value={v.time}
                            onChange={e => {
                              const n = [...data.products];
                              n[pIdx].versions[vIdx].time = Math.max(0, Math.min(Number(e.target.value), TOTAL_DAYS - 1));
                              updateData({ products: n });
                            }}
                          />
                           <button
                             onClick={() => {
                               const n = [...data.products];
                               n[pIdx].versions = n[pIdx].versions.filter((_, i) => i !== vIdx);
                               updateData({ products: n });
                             }}
                             className="text-slate-600 hover:text-rose-400"
                           >
                             <Trash2 size={12} />
                           </button>
                         </div>
                       </div>
                     ))}
                     {prod.versions.length === 0 && <p className="text-[10px] text-slate-600 italic">暂无版本</p>}
                   </div>
                 </div>
               ))}
             </div>
           )}
           {activeTab === 'feedbacks' && (
             <div className="space-y-4">
                <button
                  onClick={() => {
                    const firstProd = data.products[0];
                    const firstVersion = firstProd?.versions?.[0];
                    const firstProject = data.projects[0];
                    if (!firstProd || !firstVersion || !firstProject) return;
                    updateData({
                      feedbacks: [
                        ...data.feedbacks,
                        {
                          id: `f-${Date.now()}`,
                          versionId: firstVersion.id,
                          projectId: firstProject.id,
                          subProjectId: null,
                          deliveryScope: '新交付范围',
                          deliveryQuality: 'SOP',
                          deliveryDate: `${data.startYear}-01-15`
                        }
                      ]
                    });
                  }}
                  className="w-full py-4 rounded-2xl bg-cyan-600 text-white font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
                >
                  + 新增反哺项
                </button>
                {data.feedbacks.map((fb, fbIdx) => {
                  const versionOptions = data.products.flatMap(prod =>
                    prod.versions.map(v => ({ id: v.id, label: `${prod.name} / ${v.label}` }))
                  );
                  return (
                    <div key={fb.id} className="p-4 rounded-2xl border bg-slate-800/40 border-slate-700/50 shadow-sm space-y-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">交付范围</p>
                      <textarea
                        className="w-full bg-slate-900/60 border border-slate-700 rounded px-3 py-2 text-slate-100 text-xs font-bold"
                        rows={2}
                        placeholder="交付范围"
                        value={fb.deliveryScope || fb.deliverable || ''}
                        onChange={e => {
                          const n = [...data.feedbacks];
                          n[fbIdx].deliveryScope = e.target.value;
                          updateData({ feedbacks: n });
                        }}
                      />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          className="bg-slate-900/60 border border-slate-700 rounded px-2 py-2 text-slate-200"
                          value={fb.subProjectId ? `${fb.projectId}::${fb.subProjectId}` : fb.projectId}
                          onChange={e => {
                            const n = [...data.feedbacks];
                            const value = e.target.value;
                            const [projectId, subProjectId] = value.includes('::') ? value.split('::') : [value, null];
                            n[fbIdx].projectId = projectId;
                            n[fbIdx].subProjectId = subProjectId || null;
                            updateData({ feedbacks: n });
                          }}
                        >
                          {data.projects.map(p => (
                            <React.Fragment key={p.id}>
                              <option value={p.id}>{p.name}（项目）</option>
                              {(p.subProjects || []).map(sub => (
                                <option key={`${p.id}-${sub.id}`} value={`${p.id}::${sub.id}`}>{p.name} / {sub.name}</option>
                              ))}
                            </React.Fragment>
                          ))}
                        </select>
                        <select
                          className="bg-slate-900/60 border border-slate-700 rounded px-2 py-2 text-slate-200"
                          value={fb.versionId}
                          onChange={e => {
                            const n = [...data.feedbacks];
                            n[fbIdx].versionId = e.target.value;
                            updateData({ feedbacks: n });
                          }}
                        >
                          {versionOptions.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          交付质量
                          <select
                            className="mt-1 w-full bg-slate-900/60 border border-slate-700 rounded px-2 py-2 text-slate-200"
                            value={fb.deliveryQuality || fb.quality || 'SOP'}
                            onChange={e => {
                              const n = [...data.feedbacks];
                              n[fbIdx].deliveryQuality = e.target.value;
                              updateData({ feedbacks: n });
                            }}
                          >
                            <option value="SOP">SOP</option>
                            <option value="POC">POC</option>
                            <option value="OTA">OTA</option>
                          </select>
                        </label>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          交付时间
                          <input
                            type="date"
                            className="mt-1 w-full bg-slate-900/60 border border-slate-700 rounded px-2 py-2 text-slate-200"
                            value={fb.deliveryDate || fb.targetDate || ''}
                            onChange={e => {
                              const n = [...data.feedbacks];
                              n[fbIdx].deliveryDate = e.target.value;
                              updateData({ feedbacks: n });
                            }}
                          />
                        </label>
                      </div>
                      <button
                        onClick={() => updateData({ feedbacks: data.feedbacks.filter((_, i) => i !== fbIdx) })}
                        className="text-rose-400 hover:text-rose-300 text-[11px] font-black"
                      >
                        删除该反哺项
                      </button>
                    </div>
                  );
                })}
                {data.feedbacks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-700">
                    <ShieldCheck size={42} className="mb-3 opacity-20"/>
                    <p className="text-xs font-black tracking-widest italic text-center">暂无反哺项，点击上方按钮创建</p>
                  </div>
                )}
             </div>
           )}
        </div>
      </div>

      {/* 2. 主展示视口 */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0f172a] relative">
        {/* 汉化顶栏 */}
        <header className={`transition-all duration-700 flex items-center justify-between px-10 shrink-0 z-50 border-b border-slate-800/50 bg-slate-900/40 backdrop-blur-xl ${isFocusMode ? 'h-0 opacity-0 pointer-events-none overflow-hidden' : 'h-24 opacity-100 overflow-visible'}`}>
          <div className="flex items-center gap-8">
            <button onClick={() => setIsConfigOpen(!isConfigOpen)} className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-xl ${isConfigOpen ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}><Settings2 size={20} /></button>
            <div>
               <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3 uppercase tracking-wider">
                 <Zap className="text-indigo-400 fill-indigo-400/20" size={24}/> 项目-产品协同演进看板
               </h2>
               <div className="flex gap-6 mt-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-500 uppercase tracking-widest"><Activity size={14}/> 战略对齐图谱</div>
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-500 uppercase tracking-widest"><Compass size={14}/> 资源价值流转</div>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="relative" ref={projectFilterRef}>
               <button
                 onClick={() => setIsProjectFilterOpen(v => !v)}
                 className="flex items-center gap-2 bg-slate-800/50 px-4 py-3 rounded-2xl border border-slate-700/50 shadow-inner text-[11px] font-black text-slate-200"
               >
                 项目筛选
                 <ChevronDown size={14} className={`transition-transform ${isProjectFilterOpen ? 'rotate-180' : ''}`} />
               </button>
               {isProjectFilterOpen && (
                 <div className="absolute right-0 mt-2 w-[280px] max-h-[300px] overflow-auto custom-scrollbar rounded-2xl border border-slate-700/70 bg-slate-900/95 backdrop-blur-xl shadow-2xl p-2 z-[70]">
                   <button
                     onClick={() => setProjectFilterIds([])}
                     className={`w-full text-left px-3 py-2 rounded-xl text-[11px] font-black transition-all ${projectFilterIds.length === 0 ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-300 hover:bg-slate-800'}`}
                   >
                     全部项目
                   </button>
                   {data.projects.map((p) => {
                     const selected = projectFilterIds.length === 0 || projectFilterIds.includes(p.id);
                     return (
                       <button
                         key={p.id}
                         onClick={() => {
                           setProjectFilterIds(prev => {
                             const isAllMode = prev.length === 0;
                             if (isAllMode) return data.projects.filter(x => x.id !== p.id).map(x => x.id);
                             return prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id];
                           });
                         }}
                         className={`w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between ${selected ? 'bg-indigo-500/15 text-indigo-200' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                       >
                         <span className="truncate pr-3">{p.name}</span>
                         <span className={`text-[10px] ${selected ? 'text-indigo-300' : 'text-slate-600'}`}>{selected ? '已选' : '未选'}</span>
                       </button>
                     );
                   })}
                 </div>
               )}
             </div>
             <div className="relative" ref={productFilterRef}>
               <button
                 onClick={() => setIsProductFilterOpen(v => !v)}
                 className="flex items-center gap-2 bg-slate-800/50 px-4 py-3 rounded-2xl border border-slate-700/50 shadow-inner text-[11px] font-black text-slate-200"
               >
                 产品筛选
                 <ChevronDown size={14} className={`transition-transform ${isProductFilterOpen ? 'rotate-180' : ''}`} />
               </button>
               {isProductFilterOpen && (
                 <div className="absolute right-0 mt-2 w-[280px] max-h-[300px] overflow-auto custom-scrollbar rounded-2xl border border-slate-700/70 bg-slate-900/95 backdrop-blur-xl shadow-2xl p-2 z-[70]">
                   <button
                     onClick={() => setProductFilterIds([])}
                     className={`w-full text-left px-3 py-2 rounded-xl text-[11px] font-black transition-all ${productFilterIds.length === 0 ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-300 hover:bg-slate-800'}`}
                   >
                     全部产品
                   </button>
                   {data.products.map((p) => {
                     const selected = productFilterIds.length === 0 || productFilterIds.includes(p.id);
                     return (
                       <button
                         key={p.id}
                         onClick={() => {
                           setProductFilterIds(prev => {
                             const isAllMode = prev.length === 0;
                             if (isAllMode) return data.products.filter(x => x.id !== p.id).map(x => x.id);
                             return prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id];
                           });
                         }}
                         className={`w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between ${selected ? 'bg-emerald-500/15 text-emerald-200' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                       >
                         <span className="truncate pr-3">{p.name}</span>
                         <span className={`text-[10px] ${selected ? 'text-emerald-300' : 'text-slate-600'}`}>{selected ? '已选' : '未选'}</span>
                       </button>
                     );
                   })}
                 </div>
               )}
             </div>
             <div className="flex items-center gap-4 bg-slate-800/50 px-6 py-3 rounded-2xl border border-slate-700/50 shadow-inner">
                <SlidersHorizontal size={14} className="text-slate-500"/>
                <input type="range" min="1" max="96" step="1" className="w-32 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" value={monthWidth} onChange={(e) => setMonthWidth(Number(e.target.value))}/>
                <span className="text-[11px] font-mono font-black text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">缩放: {Math.round((monthWidth/14)*100)}%</span>
             </div>
             <div className="flex items-center gap-1 bg-slate-800/50 px-2 py-2 rounded-2xl border border-slate-700/50 shadow-inner">
               {[
                 { id: 'week', label: '周' },
                 { id: 'month', label: '月' },
               ].map(s => (
                 <button
                   key={s.id}
                   onClick={() => setTimeScale(s.id)}
                   className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${timeScale === s.id ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30' : 'text-slate-400 hover:text-slate-200'}`}
                 >
                   {s.label}
                 </button>
               ))}
             </div>
             <div className="flex gap-3">
                <button onClick={() => setIsFocusMode(true)} className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-900 rounded-2xl text-xs font-black hover:bg-white active:scale-95 transition-all shadow-xl"><Maximize2 size={16}/> 演示模式</button>
                <button onClick={handleExportSVG} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"><Download size={16}/> 导出图片</button>
             </div>
          </div>
        </header>

        {/* 右侧悬浮面板 (汉化) */}
        {isFocusMode && (
          <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[60] animate-in slide-in-from-right-full duration-700">
             <div className="bg-slate-900/80 backdrop-blur-3xl px-2 py-5 rounded-l-[1.5rem] border border-white/10 border-r-0 shadow-[-10px_0_30px_rgba(0,0,0,0.4)] flex flex-col items-center gap-5 group transition-all hover:px-4">
                <div className="flex flex-col items-center gap-1.5"><Zap size={14} className="text-indigo-400 opacity-80"/><div className="w-0.5 h-4 rounded-full bg-indigo-500/20"></div></div>
                <div className="flex flex-col items-center gap-3">
                   <div className="relative h-24 flex items-center justify-center"><input type="range" min="1" max="96" step="1" orient="vertical" style={{ appearance: 'slider-vertical', height: '100%', width: '3px' }} className="cursor-pointer accent-indigo-400 bg-slate-800 rounded-full" value={monthWidth} onChange={(e) => setMonthWidth(Number(e.target.value))}/></div>
                   <span className="text-[9px] font-black font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded uppercase">{Math.round((monthWidth/14)*100)}%</span>
                </div>
                <div className="w-4 h-[1px] bg-white/5"></div>
                <button onClick={handleExportSVG} className="w-8 h-8 flex items-center justify-center bg-indigo-500/10 text-indigo-400 rounded-full hover:bg-indigo-500/20 transition-all mb-1" title="导出图片"><Download size={14}/></button>
                <button onClick={() => setIsFocusMode(false)} className="w-8 h-8 flex items-center justify-center bg-rose-500/10 text-rose-500 rounded-full hover:bg-rose-500/20 transition-all group-hover:scale-105" title="退出演示"><Minimize2 size={14}/></button>
             </div>
          </div>
        )}

        {/* 看板容器 */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          <div className="flex-1 overflow-auto custom-scrollbar relative scroll-smooth bg-slate-950/20">
            
            {/* 时间轴锁定 */}
            <div className="sticky top-0 z-40 flex bg-slate-950/40 backdrop-blur-lg border-b border-slate-800/50 min-w-max shadow-lg">
               <div className="sticky left-0 z-50 bg-slate-950 flex items-center justify-center border-r border-slate-800 shadow-[20px_0_40px_rgba(0,0,0,0.4)]" style={{ width: SIDEBAR_WIDTH, height: TIMELINE_HEADER_H }}>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">演进时间轴</span>
               </div>
               <div className="flex transition-all duration-200">
                  {timelineTicks.map((tick, idx) => {
                    const nextOffset = idx < timelineTicks.length - 1 ? timelineTicks[idx + 1].offset : TOTAL_DAYS;
                    const tickW = Math.max((nextOffset - tick.offset) * monthWidth, monthWidth);
                    return (
                    <div key={tick.offset} className="shrink-0 flex items-center justify-center font-mono text-[10px] font-black text-slate-500 border-r border-slate-900/50 bg-transparent" style={{ width: tickW, height: TIMELINE_HEADER_H }}>
                      <span className="px-2 py-1 rounded-lg bg-slate-900/50 border border-slate-800/30 font-mono tracking-tight text-white text-[9px]">{tick.label}</span>
                    </div>
                    );
                  })}
               </div>
            </div>

            <div className="relative min-w-max flex">
              <div className="sticky left-0 z-30 pointer-events-none shrink-0" style={{ width: SIDEBAR_WIDTH, height: totalViewHeight }}>
                 <div className="bg-[#0f172a]/95 backdrop-blur-md border-r border-slate-800 pointer-events-auto transition-all duration-500" style={{ width: SIDEBAR_WIDTH, height: projectAreaH }}>
                    <div className="px-10 font-black text-[11px] uppercase text-indigo-400 flex items-center gap-3 tracking-widest border-b border-slate-800/10 shadow-sm" style={{ height: SECTION_HEADER_H }}><Activity size={14}/> 业务执行逻辑</div>
                    {projectRenderItems.map(p => (
                      <div key={p.id} className="px-10 flex items-center border-b border-slate-900/30" style={{ height: p.rowHeight }}>
                        <div className="flex items-center gap-5 transition-all">
                           <div className="w-1.5 h-12 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.25)]" style={{ backgroundColor: p.color }}></div>
                           <button onClick={() => toggleChartCollapse(p.id)} className="text-slate-500 hover:text-indigo-400 pointer-events-auto" title={isChartCollapsed(p.id) ? '展开子项目图' : '收起子项目图'}>
                             {isChartCollapsed(p.id) ? <ChevronRight size={14}/> : <ChevronUp size={14}/>}
                           </button>
                           <div className="max-w-[190px]">
                             <p className="text-sm font-black text-slate-100 truncate leading-tight text-white uppercase">{p.name}</p>
                             <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">项目运营轨道 · {(p.subProjects || []).length} 个子项目 · {isChartCollapsed(p.id) ? '已收起' : '已展开'}</p>
                             {!isChartCollapsed(p.id) && (p.subProjects || []).length > 0 && (
                               <div className="mt-3 flex flex-col gap-2.5">
                                 {(p.subProjects || []).slice(0, 4).map(sub => (
                                   <span key={sub.id} className="px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[12px] font-bold text-indigo-200 leading-none">
                                     {sub.name}
                                   </span>
                                 ))}
                               </div>
                             )}
                           </div>
                        </div>
                      </div>
                    ))}
                 </div>
                 <div className="bg-slate-950 border-r border-slate-800 pointer-events-auto flex items-center px-10 shadow-2xl transition-all duration-300" style={{ width: SIDEBAR_WIDTH, height: NEXUS_H }}><div className="flex items-center gap-4"><Zap size={18} className="text-indigo-500 animate-pulse"/><span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">价值协同中枢</span></div></div>
                 <div className="bg-[#0f172a]/95 backdrop-blur-md border-r border-slate-800 pointer-events-auto transition-all duration-500" style={{ width: SIDEBAR_WIDTH, height: productAreaH }}>
                    <div className="px-10 font-black text-[11px] uppercase text-emerald-400 flex items-center gap-3 tracking-widest border-b border-slate-800/10 shadow-sm" style={{ height: SECTION_HEADER_H }}><Compass size={14}/> 产品演进节点</div>
                    {visibleProducts.map(prod => (
                      <div key={prod.id} className="px-10 flex items-center border-b border-slate-900/30" style={{ height: PRODUCT_ROW_H }}>
                        <div className="flex items-center gap-5"><div className="w-1.5 h-12 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.25)]" style={{ backgroundColor: prod.color }}></div><div><p className="text-sm font-black text-slate-100 truncate max-w-[180px] leading-tight text-white uppercase">{prod.name}</p><p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">核心路线演进</p></div></div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* 核心 SVG */}
              <div className="relative transition-all duration-300 shrink-0" style={{ width: totalTimelineWidth, height: totalViewHeight }}>
                 <svg ref={svgRef} width={totalTimelineWidth} height={totalViewHeight} className="absolute inset-0 overflow-visible transition-all duration-200">
                    <defs><filter id="eliteShadow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="12" /><feOffset dx="0" dy="15" result="offsetblur" /><feComponentTransfer><feFuncA type="linear" slope="0.4"/></feComponentTransfer><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
                    {timelineTicks.map((tick) => (
                      <line
                        key={tick.offset}
                        x1={tick.offset * monthWidth}
                        y1={0}
                        x2={tick.offset * monthWidth}
                        y2={totalViewHeight}
                        stroke="#1e293b"
                        strokeWidth="1"
                        strokeDasharray={timeScale === 'day' ? '4 8' : '2 0'}
                        opacity={timeScale === 'day' ? 0.75 : 0.95}
                      />
                    ))}
                    {projectRenderItems.map((p, pi) => {
                       const yCenter = p.mainY;
                       const subs = p.chartSubs;
                       const subSpacing = PROJECT_ROW_H;
                       const subStartY = 28;
                       const rowTop = yCenter - (PROJECT_ROW_H / 2);
                       const bgPalette = ['#2563eb', '#16a34a', '#ea580c', '#dc2626', '#7c3aed', '#0f766e', '#ca8a04'];
                       const bgColor = bgPalette[pi % bgPalette.length];
                       return (
                         <g key={p.id} transform={`translate(0, ${yCenter})`}>
                           <rect
                             x={0}
                             y={rowTop - yCenter}
                             width={totalTimelineWidth}
                             height={p.rowHeight}
                             fill={bgColor}
                             fillOpacity="0.2"
                             stroke={bgColor}
                             strokeOpacity="0.5"
                             strokeWidth="1"
                           />
                           {subs.map((sub, sIdx) => (
                             <g key={sub.id}>
                               <line
                                 x1={sub.start * monthWidth}
                                 y1={subStartY + sIdx * subSpacing}
                                 x2={sub.end * monthWidth}
                                 y2={subStartY + sIdx * subSpacing}
                                 stroke={p.color}
                                 strokeOpacity="0.9"
                                 strokeWidth="10"
                                 strokeLinecap="round"
                               />
                               <text
                                 x={sub.start * monthWidth + 6}
                                 y={subStartY + sIdx * subSpacing - 4}
                                 textAnchor="start"
                                 className="text-[12px] font-black fill-slate-100"
                               >
                                 {sub.name}
                               </text>
                             </g>
                           ))}
                         </g>
                       );
                    })}
                    <g transform={`translate(0, ${projectAreaH})`} className="transition-all duration-300"><rect width="100%" height={NEXUS_H} fill="#020617" fillOpacity="0.6" /><line x1="0" y1={NEXUS_H/2} x2="100%" y2={NEXUS_H/2} stroke="#334155" strokeWidth="1" strokeDasharray="30 15" /></g>
                    {visibleProducts.map((prod, pi) => {
                       const yCenter = projectAreaH + NEXUS_H + SECTION_HEADER_H + (pi * PRODUCT_ROW_H) + (PRODUCT_ROW_H / 2);
                       const vT = prod.versions.map(v => v.time), pS = vT.length > 0 ? Math.min(...vT) : 0, pE = vT.length > 0 ? Math.max(...vT) : 0;
                       return (<g key={prod.id} transform={`translate(0, ${yCenter})`} className="transition-all duration-300"><rect x={pS * monthWidth} y={-14} width={(pE - pS) * monthWidth} height={28} fill={prod.color} fillOpacity="0.06" rx="14" stroke={prod.color} strokeOpacity="0.1" strokeWidth="1" /><line x1={pS * monthWidth} y1={0} x2={pE * monthWidth} y2={0} stroke={prod.color} strokeWidth="4" strokeLinecap="round" strokeOpacity="0.8" /><line x1={0} y1={0} x2="100%" y2={0} stroke={prod.color} strokeWidth="1" strokeDasharray="15 15" strokeOpacity="0.1" />{prod.versions.map(v => (<g key={v.id} transform={`translate(${v.time * monthWidth}, 0)`}><circle r="14" fill="#0f172a" stroke={prod.color} strokeWidth="3" className="shadow-lg shadow-black" /><circle r="6" fill={prod.color} className="animate-pulse" /><text y={35} textAnchor="middle" className="text-[11px] font-black uppercase tracking-tighter" style={{ fill: prod.color }}>{v.label}</text>{v.features && v.features.map((feat, fIdx) => (<text key={fIdx} x="0" y={52 + fIdx * 14} textAnchor="middle" className="text-[9px] fill-slate-500 font-bold tracking-tight italic opacity-70">/ {feat}</text>))}</g>))}</g>);
                    })}
                    {data.feedbacks.map(fb => {
                       const prodIdx = visibleProducts.findIndex(p => p.versions.some(v => v.id === fb.versionId));
                       if (prodIdx === -1) return null;
                       if (isChartCollapsed(fb.projectId)) return null;
                       const prodLine = visibleProducts[prodIdx], version = prodLine.versions.find(v => v.id === fb.versionId);
                       const endY = fb.subProjectId
                         ? subProjectYMap[`${fb.projectId}::${fb.subProjectId}`]
                         : projectYMap[fb.projectId];
                       if (endY === undefined) return null;
                       const deliveryScope = fb.deliveryScope || fb.deliverable || '';
                       const deliveryQuality = fb.deliveryQuality || fb.quality || 'SOP';
                       const deliveryDate = fb.deliveryDate || fb.targetDate || '';
                       const qualityColor = deliveryQuality === 'SOP' ? '#10b981' : (deliveryQuality === 'POC' ? '#fbbf24' : '#60a5fa');
                       const qualityBg = deliveryQuality === 'SOP' ? '#10b98115' : (deliveryQuality === 'POC' ? '#f59e0b15' : '#3b82f615');
                       const qualityStroke = deliveryQuality === 'SOP' ? '#10b98144' : (deliveryQuality === 'POC' ? '#f59e0b44' : '#3b82f644');
                       const startX = version.time * monthWidth, startY = projectAreaH + NEXUS_H + SECTION_HEADER_H + (prodIdx * PRODUCT_ROW_H) + (PRODUCT_ROW_H / 2), endX = getXFromDate(deliveryDate);
                       const isHovered = hoveredFeedbackId === fb.id;
                       return (
                         <g
                           key={fb.id}
                           className="animate-in fade-in zoom-in-95 duration-700"
                           onMouseEnter={() => setHoveredFeedbackId(fb.id)}
                           onMouseLeave={() => setHoveredFeedbackId(null)}
                         >
                           <path
                             d={`M ${startX} ${startY} C ${startX + (endX - startX)/2} ${startY - 50} ${endX - (endX - startX)/2} ${endY + 50} ${endX} ${endY}`}
                             fill="none"
                             stroke={prodLine.color}
                             strokeWidth={isHovered ? "4" : "3"}
                             strokeDasharray="12 6"
                             strokeOpacity={isHovered ? "0.65" : "0.35"}
                           />
                           <circle
                             cx={endX}
                             cy={endY}
                             r={isHovered ? "8" : "6"}
                             fill={prodLine.color}
                             stroke="#0f172a"
                             strokeWidth="2"
                             className="shadow-2xl shadow-black"
                           />
                           <g transform={`translate(${endX + 12}, ${endY - 14})`}>
                             <rect width="54" height="20" rx="10" fill={qualityBg} stroke={qualityStroke} strokeWidth="1" />
                             <text x="27" y="14" textAnchor="middle" className="text-[11px] font-black" style={{ fill: qualityColor }}>
                               {deliveryQuality}
                             </text>
                           </g>
                          {isHovered && (
                            <g transform={`translate(${endX + 18}, ${endY - 48})`} filter="url(#eliteShadow)">
                              <rect width="340" height="126" rx="22" fill="#0b1220" fillOpacity="0.98" stroke="#ffffff20" strokeWidth="1" />
                              <rect x="1" y="1" width="338" height="34" rx="21" fill="#111a2b" />
                              <rect x="0" y="0" width="8" height="126" rx="8" fill={prodLine.color} />

                              <text x="18" y="22" className="text-[11px] fill-slate-400 font-black uppercase tracking-[0.16em]">反哺信息卡片</text>
                              <text x="322" y="22" textAnchor="end" className="text-[10px] fill-indigo-300 font-black uppercase tracking-[0.08em]">{prodLine.name}</text>

                              <g transform="translate(18, 44)">
                                <text x="0" y="0" className="text-[10px] fill-slate-500 font-black uppercase tracking-[0.12em]">交付范围</text>
                                <rect x="0" y="8" width="302" height="28" rx="10" fill="#141e30" stroke="#ffffff12" strokeWidth="1" />
                                <text x="10" y="26" className="text-[12px] font-black fill-white tracking-tight">{deliveryScope || '-'}</text>

                                <text x="0" y="54" className="text-[10px] fill-slate-500 font-black uppercase tracking-[0.12em]">交付质量</text>
                                <rect x="68" y="42" width="62" height="20" rx="10" fill={qualityBg} stroke={qualityStroke} strokeWidth="1" />
                                <text x="99" y="56" textAnchor="middle" className="text-[10px] font-black" style={{ fill: qualityColor }}>{deliveryQuality}</text>

                                <text x="160" y="54" className="text-[10px] fill-slate-500 font-black uppercase tracking-[0.12em]">交付时间</text>
                                <rect x="214" y="42" width="92" height="20" rx="10" fill="#0f172a" stroke="#ffffff18" strokeWidth="1" />
                                <text x="260" y="56" textAnchor="middle" className="text-[10px] font-mono font-black fill-white tracking-tight">{deliveryDate || '-'}</text>
                              </g>
                            </g>
                          )}
                         </g>
                       );
                    })}
                 </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 汉化页脚 */}
        <footer className={`transition-all duration-700 overflow-hidden bg-slate-950/80 border-t border-slate-800/50 flex items-center justify-between px-10 shrink-0 z-50 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] shadow-2xl ${isFocusMode ? 'h-0 opacity-0' : 'h-16 opacity-100'}`}>
          <div className="flex gap-12">
            <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]"></div><span>业务执行周期</span></div>
            <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div><span>产品迭代节点</span></div>
            <div className="flex items-center gap-4 text-slate-400 group cursor-help transition-all hover:text-indigo-400"><ShieldCheck size={16} className="group-hover:scale-110 transition-transform"/><span className="tracking-widest uppercase">战略决策矩阵 v8.5 精英版</span></div>
          </div>
          <div className="flex items-center gap-8"><div className="flex items-center gap-2 opacity-50"><Monitor size={14}/> 4K 演示级画质</div><p className="opacity-40 font-mono tracking-tighter uppercase">© 2026 演进智控全景看板</p></div>
        </footer>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: #6366f1; cursor: pointer; border: 2px solid #0f172a; box-shadow: 0 0 10px rgba(99,102,241,0.3); }
        input[type="range"][orient="vertical"] { writing-mode: bt-lr; -webkit-appearance: slider-vertical; width: 4px; height: 100%; padding: 0 5px; }
      `}</style>
    </div>
  );
};

export default App;
