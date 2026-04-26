from fastapi import FastAPI
from cpu import CPU

app = FastAPI()
cpu = CPU()


@app.get("/")
def inicio():
    return {"mensaje": "Backend del simulador funcionando"}


@app.post("/program/load")
def cargar_programa():
    programa = [
        "LOAD R0, 5",
        "LOAD R1, 3",
        "ADD R0, R1",
        "STORE R0, 10",
        "PRINT R0",
        "HALT"
    ]

    cpu.cargar_programa(programa)

    return {
        "mensaje": "Programa cargado correctamente",
        "programa": programa
    }


@app.post("/cpu/step")
def ejecutar_paso():
    cpu.step()

    return {
        "estado": cpu.estado,
        "PC": cpu.PC,
        "IR": cpu.IR,
        "registros": cpu.registros,
        "memoria": cpu.memoria,
        "salida": cpu.salida,
        "halt": cpu.halt
    }


@app.get("/cpu/state")
def obtener_estado():
    return {
        "estado": cpu.estado,
        "PC": cpu.PC,
        "IR": cpu.IR,
        "registros": cpu.registros,
        "memoria": cpu.memoria,
        "salida": cpu.salida,
        "halt": cpu.halt
    }


@app.get("/cpu/history")
def obtener_historial():
    return cpu.historial


@app.post("/cpu/reset")
def reiniciar_cpu():
    global cpu
    cpu = CPU()

    return {"mensaje": "CPU reiniciada correctamente"}
