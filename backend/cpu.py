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

    def cargar_programa(self, programa):
        for i, instruccion in enumerate(programa):
            self.memoria[i] = instruccion

    def step(self):
        if self.halt:
            return

        if self.estado == "FETCH":
            self.IR = self.memoria[self.PC]
            self.estado = "DECODE"

        elif self.estado == "DECODE":
            self.estado = "EXECUTE"

        elif self.estado == "EXECUTE":
            self.ejecutar(self.IR)
            self.estado = "WRITEBACK"

        elif self.estado == "WRITEBACK":
            self.PC += 1
            self.estado = "FETCH"

    def ejecutar(self, instruccion):
        partes = instruccion.split()
        op = partes[0]

        if op == "LOAD":
            reg = partes[1].strip(",")
            val = int(partes[2])
            self.registros[reg] = val

        elif op == "ADD":
            r1 = partes[1].strip(",")
            r2 = partes[2]
            self.registros[r1] += self.registros[r2]

        elif op == "SUB":
            r1 = partes[1].strip(",")
            r2 = partes[2]
            self.registros[r1] -= self.registros[r2]

        elif op == "MOV":
            r1 = partes[1].strip(",")
            r2 = partes[2]
            self.registros[r1] = self.registros[r2]

        elif op == "PRINT":
            r = partes[1]
            self.salida = self.registros[r]

        elif op == "HALT":
            self.halt = True
