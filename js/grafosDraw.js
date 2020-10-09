// Aca ira el codigo para trabajar con los grafos
// Var de nosotros
var nodes = null;
var edges = null;
var network = null;

/*Funciones del programa y variables de la matriz*/

var aristas = [];
var vertices = [];
var arista_origen = [];
var arista_llegada = [];



var peso = [];
var pesoAux = [];
var mAdyacencia = [];
var mCaminos = []
var a_desde = [];
var a_hacia = [];
var contador = 1;

// Funcion de Dibujo 
var data = getScaleFreeNetwork(25);
var seed = 2;
var defaultLocal = navigator.language;
var select = document.getElementById('locale');

function destroy() {
    if (network !== null) {
        network.destroy();
        network = null;
    }
}

function draw() {
    destroy();
    nodes = [];
    edges = [];
    // create a network
    var container = document.getElementById('resultado');
    var options = {
        layout: { randomSeed: seed }, // just to make sure the layout is the same when the locale is changed
        locale: document.getElementById('locale').value,
        manipulation: {
            addNode: function(data, callback) {
                // Esto se despliega luego de apretar el boton añadir nodo
                document.getElementById('node-operation').innerHTML = "Agregar Vértice";
                editNode(data, clearNodePopUp, callback);
            },
            editNode: function(data, callback) {
                // filling in the popup DOM elements
                document.getElementById('node-operation').innerHTML = "Editar Vértice";
                editNode(data, cancelNodeEdit, callback);
            },
            addEdge: function(data, callback) {
                if (data.from == data.to) {
                    var r = confirm(`
            Si conectas un vertice a si mismo crearas un bucle , ¿estas seguro?
          `);
                    if (r != true) {
                        callback(null);
                        return;
                    }
                }
                var tipoGrafo = document.querySelector("#tipoGrafo").value;
                if (tipoGrafo === 'Dirigido') {
                    var options = {
                        edges: {
                            arrows: 'to',
                        }
                    }
                    network.setOptions(options);
                }
                document.getElementById('edge-operation').innerHTML = "Agregar Arista";
                editEdgeWithoutDrag(data, callback);
            },
            editEdge: {
                editWithoutDrag: function(data, callback) {
                    document.getElementById('edge-operation').innerHTML = "Editar Arista";
                    editEdgeWithoutDrag(data, callback);
                }
            }

        }
    };
    network = new vis.Network(container, data, options);

}

function editNode(data, cancelAction, callback) {
    document.getElementById('node-label').value = data.label;
    document.getElementById('node-saveButton').onclick = saveNodeData.bind(this, data, callback);
    document.getElementById('node-cancelButton').onclick = cancelAction.bind(this, callback);
    document.getElementById('node-popUp').style.display = 'block';
}

// Callback passed as parameter is ignored
function clearNodePopUp() {
    document.getElementById('node-saveButton').onclick = null;
    document.getElementById('node-cancelButton').onclick = null;
    document.getElementById('node-popUp').style.display = 'none';
}

function cancelNodeEdit(callback) {
    clearNodePopUp();
    callback(null);
}

function saveNodeData(data, callback) {
    data.id = document.getElementById('node-id').value;
    data.label = document.getElementById('node-id').value;
    vertices.push(data.id);
    clearNodePopUp();
    callback(data);
}

function editEdgeWithoutDrag(data, callback) {
    // filling in the popup DOM elements
    // document.getElementById('edge-label').value = data.label;
    document.getElementById('edge-saveButton').onclick = saveEdgeData.bind(this, data, callback);
    document.getElementById('edge-cancelButton').onclick = cancelEdgeEdit.bind(this, callback);
    document.getElementById('edge-popUp').style.display = 'block';
}

function clearEdgePopUp() {
    document.getElementById('edge-saveButton').onclick = null;
    document.getElementById('edge-cancelButton').onclick = null;
    document.getElementById('edge-popUp').style.display = 'none';
}

function cancelEdgeEdit(callback) {
    clearEdgePopUp();
    callback(null);
}

function saveEdgeData(data, callback) {
    if (typeof data.to === 'object')
        data.to = data.to.id;

    if (typeof data.from === 'object')
        data.from = data.from.id;

    data.label = document.getElementById('edge-label').value;
    arista_origen.push(data.from);
    arista_llegada.push(data.to);
    peso.push(data.label);

    clearEdgePopUp();
    callback(data);
}

function init() {
    setDefaultLocale();
    draw();
}


/* MAtriz de adyacencia */

function mAdyacencia() {
    var matrizAdyacencia = [];
    var col = [];
    for (let i = 1; i <= vertices.length; i++) {
        for (let j = 1; i <= vertices.length; j++) {
            if (buscar(vertices[i], vertices[j] !== 1)) {
                col.push(0);
            } else {
                col.push(1);
            }
        }
        matrizAdyacencia[i] = col;
        col = [];
    }
    return matrizAdyacencia;
}


/* Funcion para mostrar matriz */

function verMatriz(MatrizA) {

    for (let i = 0; i < vertices.length; i++) {
        for (let j = 0; j < vertices.length; j++) {
            console.log(MatrizA[i][j]);
        }
    }

}


/* Multiplicacion de matrices para poder saber los caminos */

function Multiplicacion_de_Matriz(MatrizA, MatrizB, MatrizC) {
    let resultado = 0,
        MatrizAux = [];
    for (let i = 0; i <= vertices.lenght; i++) {
        for (let j = 0; j <= vertices.lenght; j++) {
            for (let k = 0; k <= vertices.lenght; k++) {
                resultado += MatrizA[i][k] * MatrizB[j][k];
            }
            MatrizAux.push(resultado);
            resultado = 0;
        }
        MatrizC[i] = MatrizAux;
        MatrizAux = [];
    }
}


function Suma_De_Matrices(MatrizA, MatrizB, MatrizC) {
    var MatrizAux = [];
    for (let i = 0; i < vertices.lenght; i++) {
        for (let j = 0; j < vertices.lenght; j++) {
            MatrizAux.push(MatrizA[i][j] + MatrizB[i][j]);
        }
        MatrizC[i] = MatrizAux;
        MatrizAux = [];
    }
}


/* Matriz conexa*/

function matrizConexa(MatrizA) {
    let contador = 0;
    for (let i = 0; i < vertices.lenght; i++) {
        for (let j = 0; j < vertices.lenght; j++) {
            if (MatrizA[i][j] != 0) {
                contador++;
            } else {
                return false;
            }
        }

    }
    if (contador != 0)
        return true;
}

/* Matriz de caminos */

function MatrizCaminos(MatrizA) {

}