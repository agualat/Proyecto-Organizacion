class CPU:
    def __init__(self):
        self.registros = {
            "R0": 0,
            "R1": 0,
            "R2": 0,
            "R3": 0
        }

        self.memoria = [None] * 16
        self.PC = 0
        self.IR = None
        self.salida = None
        self.estado = "FETCH"
        self.halt = False
        self.historial = []

    def cargar_programa(self, programa):
        self.memoria = [None] * 16
        for i, instruccion in enumerate(programa):
            if i < len(self.memoria):
                self.memoria[i] = instruccion

        self.PC = 0
        self.IR = None
        self.salida = None
        self.estado = "FETCH"
        self.halt = False
        self.historial = []

    def guardar_estado(self):
        estado_actual = {
            "PC": self.PC,
            "IR": self.IR,
            "registros": self.registros.copy(),
            "memoria": self.memoria.copy(),
            "estado": self.estado,
            "salida": self.salida,
            "halt": self.halt
        }
        self.historial.append(estado_actual)

    def step(self):
        if self.halt:
            return

        self.guardar_estado()

        if self.estado == "FETCH":
            self.IR = self.memoria[self.PC]
            self.estado = "DECODE"

        elif self.estado == "DECODE":
            self.estado = "EXECUTE"

        elif self.estado == "EXECUTE":
            if self.IR is not None:
                self.ejecutar(self.IR)
            self.estado = "WRITEBACK"

        elif self.estado == "WRITEBACK":
            if not self.halt:
                self.PC += 1
                self.estado = "FETCH"

    def ejecutar(self, instruccion):
        partes = instruccion.split()
        op = partes[0]

        if op == "LOAD":
            reg = partes[1].strip(",")
            val = int(partes[2])
            self.registros[reg] = val

        elif op == "MOV":
            r1 = partes[1].strip(",")
            r2 = partes[2]
            self.registros[r1] = self.registros[r2]

        elif op == "ADD":
            r1 = partes[1].strip(",")
            r2 = partes[2]
            self.registros[r1] = self.registros[r1] + self.registros[r2]

        elif op == "SUB":
            r1 = partes[1].strip(",")
            r2 = partes[2]
            self.registros[r1] = self.registros[r1] - self.registros[r2]

        elif op == "AND":
            r1 = partes[1].strip(",")
            r2 = partes[2]
            self.registros[r1] = self.registros[r1] & self.registros[r2]

        elif op == "OR":
            r1 = partes[1].strip(",")
            r2 = partes[2]
            self.registros[r1] = self.registros[r1] | self.registros[r2]

        elif op == "STORE":
            r = partes[1].strip(",")
            direccion = int(partes[2])
            self.memoria[direccion] = self.registros[r]

        elif op == "PRINT":
            r = partes[1]
            self.salida = self.registros[r]

        elif op == "HALT":
            self.halt = True
