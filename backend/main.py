from cpu import CPU

cpu = CPU()

programa = [
    "LOAD R0, 5",
    "LOAD R1, 3",
    "ADD R0, R1",
    "PRINT R0",
    "HALT"
]

cpu.cargar_programa(programa)

while not cpu.halt:
    cpu.step()
    print("Estado:", cpu.estado)
    print("Registros:", cpu.registros)
    print("Salida:", cpu.salida)
    print("-----------")
