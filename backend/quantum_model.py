import torch
import torch.nn as nn
import pennylane as qml

n_qubits = 4

dev = qml.device("default.qubit", wires=n_qubits)

@qml.qnode(dev, interface="torch")
def quantum_circuit(inputs, weights):

    for i in range(n_qubits):
        qml.RY(inputs[i], wires=i)

    for i in range(n_qubits):
        qml.RZ(weights[i], wires=i)

    for i in range(n_qubits - 1):
        qml.CNOT(wires=[i, i + 1])

    return [qml.expval(qml.PauliZ(i)) for i in range(n_qubits)]


class QuantumModel(nn.Module):

    def __init__(self):
        super().__init__()

        self.weights = nn.Parameter(torch.randn(n_qubits))
        self.fc = nn.Linear(n_qubits, 1)

    def forward(self, x):

        outputs = []

        for i in range(x.shape[0]):

            q_result = quantum_circuit(x[i], self.weights)

            q_tensor = torch.tensor(q_result, dtype=torch.float32)

            outputs.append(q_tensor)

        outputs = torch.stack(outputs)

        prediction = self.fc(outputs)

        return prediction