import React, { useEffect, useMemo, useRef, useState } from "react";

const FLOW_BY_STAGE = {
  FETCH: ["memory", "bus", "ir"],
  DECODE: ["ir", "control", "alu"],
  EXECUTE: ["registers", "alu", "bus"],
  WRITEBACK: ["alu", "registers", "output"]
};

const STAGES = ["FETCH", "DECODE", "EXECUTE", "WRITEBACK"];

const initialCpu = {
  estado: "FETCH",
  PC: 0,
  IR: null,
  registros: { R0: 0, R1: 0, R2: 0, R3: 0 },
  memoria: Array.from({ length: 16 }, () => null),
  salida: null,
  halt: false
};

async function request(path, options) {
  const response = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} en ${path}`);
  }

  return response.json();
}

function parseInstruction(ir) {
  if (!ir || typeof ir !== "string") {
    return { op: "NOP", args: [] };
  }

  const [op, ...rest] = ir.split(/\s+/);
  const args = rest.join(" ").split(",").map((p) => p.trim()).filter(Boolean);
  return { op, args };
}

function DataPacket({ index }) {
  return (
    <div
      className="data-packet"
      style={{ animationDelay: `${index * 0.2}s` }}
    />
  );
}

function FlowRail({ active, children }) {
  return (
    <div className={`flow-rail ${active ? "active" : ""}`}>
      {active && (
        <>
          <DataPacket index={0} />
          <DataPacket index={1} />
        </>
      )}
      {children}
    </div>
  );
}

export function App() {
  const [cpu, setCpu] = useState(initialCpu);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const tickRef = useRef(null);

  const instruction = useMemo(() => parseInstruction(cpu.IR), [cpu.IR]);
  const activeFlow = FLOW_BY_STAGE[cpu.estado] ?? [];

  const canStep = !loading && !cpu.halt;

  async function refreshState() {
    setLoading(true);
    setError("");
    try {
      const [state, historyData] = await Promise.all([
        request("/cpu/state"),
        request("/cpu/history")
      ]);
      setCpu(state);
      setHistory(historyData.slice(-12).reverse());
    } catch (err) {
      setError(err.message || "No fue posible conectar con el backend");
    } finally {
      setLoading(false);
    }
  }

  async function loadProgram() {
    setLoading(true);
    setError("");
    try {
      await request("/program/load", { method: "POST" });
      await refreshState();
    } catch (err) {
      setError(err.message || "No fue posible cargar el programa");
      setLoading(false);
    }
  }

  async function stepCpu() {
    if (!canStep) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const state = await request("/cpu/step", { method: "POST" });
      setCpu(state);
      const historyData = await request("/cpu/history");
      setHistory(historyData.slice(-12).reverse());
    } catch (err) {
      setError(err.message || "No fue posible ejecutar el paso");
    } finally {
      setLoading(false);
    }
  }

  async function resetCpu() {
    setLoading(true);
    setError("");
    setRunning(false);
    try {
      await request("/cpu/reset", { method: "POST" });
      await refreshState();
    } catch (err) {
      setError(err.message || "No fue posible reiniciar la CPU");
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshState();
  }, []);

  useEffect(() => {
    if (!running || cpu.halt) {
      if (tickRef.current) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }

    tickRef.current = window.setInterval(() => {
      stepCpu();
    }, 900);

    return () => {
      if (tickRef.current) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [running, cpu.halt]);

  useEffect(() => {
    if (cpu.halt) {
      setRunning(false);
    }
  }, [cpu.halt]);

  return (
    <div className="app-shell">
      <div className="scanlines" />
      <header
        className="topbar"
      >
        <div>
          <p className="eyebrow">Sistema de Visualizacion</p>
          <h1>Laboratorio Ciberpunk: CPU de 8 bits</h1>
        </div>
        <div className="status-pill">
          <span>Estado</span>
          <strong>{cpu.estado}</strong>
        </div>
      </header>

      <main className="layout">
        <section className="panel command-panel">
          <h2>Terminal de Control</h2>
          <p className="panel-subtitle">Carga programa, ejecuta ciclos y observa el flujo interno.</p>

          <div className="command-grid">
            <button onClick={loadProgram} disabled={loading}>
              Cargar Programa
            </button>
            <button onClick={stepCpu} disabled={!canStep}>
              Paso ({cpu.estado})
            </button>
            <button onClick={() => setRunning((v) => !v)} disabled={cpu.halt || loading}>
              {running ? "Pausar" : "Auto Run"}
            </button>
            <button onClick={resetCpu} disabled={loading}>
              Reset
            </button>
            <button onClick={refreshState} disabled={loading}>
              Refrescar Estado
            </button>
          </div>

          {error && <p className="error-line">{error}</p>}

          <div className="register-grid">
            {Object.entries(cpu.registros).map(([key, value]) => (
              <div key={key} className="register-card">
                <span>{key}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <div className="meta-grid">
            <div>
              <span>PC</span>
              <strong>{cpu.PC}</strong>
            </div>
            <div>
              <span>IR</span>
              <strong>{cpu.IR ?? "(vacio)"}</strong>
            </div>
            <div>
              <span>Salida</span>
              <strong>{cpu.salida ?? "-"}</strong>
            </div>
            <div>
              <span>Halt</span>
              <strong>{cpu.halt ? "True" : "False"}</strong>
            </div>
          </div>
        </section>

        <section className="panel flow-panel">
          <h2>Data Bus y Operaciones</h2>
          <p className="panel-subtitle">Animacion en tiempo real del ciclo: FETCH -&gt; DECODE -&gt; EXECUTE -&gt; WRITEBACK.</p>

          <div className="stage-strip">
            {STAGES.map((stage) => (
              <div key={stage} className={`stage-chip ${cpu.estado === stage ? "active" : ""}`}>
                {stage}
              </div>
            ))}
          </div>

          <div className="flow-grid">
            <div className={`node ${activeFlow.includes("memory") ? "hot" : ""}`}>MEMORIA</div>
            <FlowRail active={activeFlow.includes("bus")} />
            <div className={`node ${activeFlow.includes("ir") ? "hot" : ""}`}>IR</div>

            <FlowRail active={activeFlow.includes("control")} />
            <div className={`node diamond ${activeFlow.includes("alu") ? "hot" : ""}`}>ALU</div>
            <FlowRail active={activeFlow.includes("registers")} />

            <div className={`node ${activeFlow.includes("registers") ? "hot" : ""}`}>REGISTROS</div>
            <FlowRail active={activeFlow.includes("output")} />
            <div className={`node ${activeFlow.includes("output") ? "hot success" : ""}`}>OUTPUT</div>
          </div>

          <div key={`${cpu.estado}-${cpu.IR}`} className="operation-box">
            <span>Operacion Actual</span>
            <strong>{instruction.op}</strong>
            <code>{instruction.args.join(" | ") || "Sin operandos"}</code>
          </div>
        </section>

        <section className="panel memory-panel">
          <h2>Memoria (16 celdas)</h2>
          <div className="memory-grid">
            {cpu.memoria.map((value, index) => (
              <div key={index} className={`memory-cell ${cpu.PC === index ? "pointer" : ""}`}>
                <span>0x{index.toString(16).toUpperCase()}</span>
                <code>{value ?? "--"}</code>
              </div>
            ))}
          </div>
        </section>

        <section className="panel history-panel">
          <h2>Bitacora de Ejecucion</h2>
          <div className="history-list">
            {history.length === 0 && <p className="empty">Sin historial aun.</p>}
            {history.map((item, idx) => (
              <div key={`${item.PC}-${idx}`} className="history-item">
                <span>{item.estado}</span>
                <code>PC {item.PC}</code>
                <code>{item.IR ?? "(vacio)"}</code>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
