import React, { useEffect, useMemo, useRef, useState } from "react";

const FLOW_BY_STAGE = {
  FETCH: ["memory-core", "core-ir"],
  DECODE: ["ir-core", "core-alu"],
  EXECUTE: ["registers-alu", "alu-outputbus"],
  WRITEBACK: ["alu-registers", "alu-crt"]
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

export function App() {
  const [cpu, setCpu] = useState(initialCpu);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const tickRef = useRef(null);

  const instruction = useMemo(() => parseInstruction(cpu.IR), [cpu.IR]);
  const activeTraces = FLOW_BY_STAGE[cpu.estado] ?? [];
  const opcodeClass = `op-${instruction.op.toLowerCase()}`;

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
      <header className="topbar">
        <div>
          <p className="eyebrow">Laboratorio Ciberpunk · Arquitectura en Vivo</p>
          <h1>Data Bus Grid / Computador de 8 bits</h1>
        </div>
        <div className="status-pill">
          <span>Ciclo Activo</span>
          <strong>{cpu.estado}</strong>
        </div>
      </header>

      <main className="machine-layout">
        <section className="panel terminal-rack">
          <h2>Consola de Operacion</h2>
          <p className="panel-subtitle">Control manual de reloj, carga de programa y monitoreo en caliente.</p>

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

          <div className="register-bank">
            <p className="subhead">Banco de Registros</p>
            {Object.entries(cpu.registros).map(([key, value]) => (
              <div key={key} className="register-card">
                <span>{key}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <div className="meta-grid rack-metrics">
            <div>
              <span>Program Counter</span>
              <strong>{cpu.PC}</strong>
            </div>
            <div>
              <span>Instruction Register</span>
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

        <section className="panel motherboard-panel">
          <h2>Chasis de Computo</h2>
          <p className="panel-subtitle">Vista fisica de modulos, buses y transito de datos durante cada etapa.</p>

          <div className="machine-bay">
            <div className="bay-grid" />
            <div className={`motherboard ${opcodeClass}`}>
              <svg className="bus-svg" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
                <path className="trace-base" d="M 292 148 L 496 148 L 496 250" />
                <path className={`trace-active ${activeTraces.includes("memory-core") ? "on" : ""}`} d="M 292 148 L 496 148 L 496 250" />

                <path className="trace-base" d="M 592 148 L 700 148" />
                <path className={`trace-active ${activeTraces.includes("core-ir") ? "on" : ""}`} d="M 592 148 L 700 148" />

                <path className="trace-base" d="M 796 148 L 496 148 L 496 250" />
                <path className={`trace-active ${activeTraces.includes("ir-core") ? "on" : ""}`} d="M 796 148 L 496 148 L 496 250" />

                <path className="trace-base" d="M 496 196 L 496 250" />
                <path className={`trace-active ${activeTraces.includes("core-alu") ? "on" : ""}`} d="M 496 196 L 496 250" />

                <path className="trace-base" d="M 296 400 L 496 400 L 496 350" />
                <path className={`trace-active ${activeTraces.includes("registers-alu") ? "on" : ""}`} d="M 296 400 L 496 400 L 496 350" />

                <path className="trace-base" d="M 496 350 L 496 400 L 696 400" />
                <path className={`trace-active ${activeTraces.includes("alu-outputbus") ? "on" : ""}`} d="M 496 350 L 496 400 L 696 400" />

                <path className={`trace-active ${activeTraces.includes("alu-registers") ? "on" : ""}`} d="M 496 350 L 496 400 L 296 400" />
                <path className={`trace-active ${activeTraces.includes("alu-crt") ? "on" : ""}`} d="M 496 350 L 496 400 L 696 400" />
              </svg>

              <div className="chip-module module-memory">
                <h3>Memory Array</h3>
                <p>Addr 0x{cpu.PC.toString(16).toUpperCase().padStart(2, "0")}</p>
                <span>{cpu.memoria[cpu.PC] ?? "-- empty --"}</span>
              </div>

              <div className="chip-module module-control">
                <h3>Control Unit</h3>
                <p>Stage</p>
                <span>{cpu.estado}</span>
              </div>

              <div className="chip-module module-ir">
                <h3>Instruction Latch</h3>
                <p>IR</p>
                <span>{cpu.IR ?? "NOP"}</span>
              </div>

              <div className="chip-module module-alu diamond-core">
                <h3>ALU Core</h3>
                <p>OpCode</p>
                <span>{instruction.op}</span>
              </div>

              <div className="chip-module module-registers">
                <h3>Register Stack</h3>
                <p>
                  R0:{cpu.registros.R0} R1:{cpu.registros.R1}
                </p>
                <span>
                  R2:{cpu.registros.R2} R3:{cpu.registros.R3}
                </span>
              </div>

              <div className="chip-module module-output crt">
                <h3>CRT Output</h3>
                <p>Signal</p>
                <span>{cpu.salida ?? "NO SIGNAL"}</span>
              </div>
            </div>
          </div>

          <div key={`${cpu.estado}-${cpu.IR}`} className={`operation-box ${opcodeClass}`}>
            <span>Operacion en Ejecucion</span>
            <strong>{instruction.op}</strong>
            <code>{instruction.args.join(" | ") || "Sin operandos"}</code>
          </div>

          <div className="stage-strip">
            {STAGES.map((stage) => (
              <div key={stage} className={`stage-chip ${cpu.estado === stage ? "active" : ""}`}>
                {stage}
              </div>
            ))}
          </div>
        </section>

        <section className="panel memory-drawer">
          <h2>Bandeja de Memoria</h2>
          <div className="memory-grid chip-grid">
            {cpu.memoria.map((value, index) => (
              <div key={index} className={`memory-cell ${cpu.PC === index ? "pointer" : ""}`}>
                <span>0x{index.toString(16).toUpperCase()}</span>
                <code>{value ?? "--"}</code>
              </div>
            ))}
          </div>
        </section>

        <section className="panel telemetry-panel">
          <h2>Telemetria de Bus</h2>
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
