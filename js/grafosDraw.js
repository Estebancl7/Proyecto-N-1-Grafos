var nodes = null;
var edges = null;
var network = null;

var vertices = [];
var aristas_origen = [];
var aristas_llegada = [];
var peso = [];
var pesoAux = [];
var mAdyacencia = [];
var mCaminos = [];
var a_desde = [];
var a_hacia = [];
var contador = 1;


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
    var container = document.getElementById('resultado');
    var options = {
        layout: { randomSeed: seed },
        locale: document.getElementById('locale').value,
        manipulation: {
            addNode: function(data, callback) {
                document.getElementById('node-operation').innerHTML = "Agregar Vértice";
                editNode(data, clearNodePopUp, callback);
            },
            editNode: function(data, callback) {
                document.getElementById('node-operation').innerHTML = "Editar Vértice";
                editNode(data, cancelNodeEdit, callback);
            },
            addEdge: function(data, callback) {
                if (data.from == data.to) {
                    var r = confirm("Si conectas el vertice a si mismo crearas un bucle, ¿estas seguro? ");
                    r.className = ("alert alert-warning text-center");
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
    aristas_origen.push(data.from);
    aristas_llegada.push(data.to);
    peso.push(data.label);

    clearEdgePopUp();
    callback(data);
}

function init() {
    setDefaultLocale();
    draw();
}


function buscar(columna, fila) {
    var tipoGrafo = document.querySelector("#tipoGrafo").value;
    for (let i = 0; i < (aristas_origen.length); i++) {
        if (tipoGrafo === 'Dirigido') {
            if (columna === aristas_origen[i] && fila === aristas_llegada[i])
                return 1;
        } else {
            if (columna === aristas_origen[i] && fila === aristas_llegada[i] || columna === aristas_llegada[i] && fila === aristas_origen[i])
                return 1;
        }
    }
}



function MatrizAdyacencia() {
    var mAdyacencia = []
    var col = [];
    for (let i = 0; i < vertices.length; i++) {
        for (let j = 0; j < vertices.length; j++) {
            if (buscar(vertices[i], vertices[j]) !== 1) {
                col.push(0);
            } else {
                col.push(1);
            }
        }
        mAdyacencia[i] = col;
        col = [];
    }
    return mAdyacencia;
}

function Suma_De_Matrices(MatrizA, MatrizB, MatrizC) {
    var MatrizAux = [];
    for (let i = 0; i < vertices.length; i++) {
        for (let j = 0; j < vertices.length; j++) {
            MatrizAux.push(MatrizA[i][j] + MatrizB[i][j]);
        }
        MatrizC[i] = MatrizAux;
        MatrizAux = [];

    }
}


function Multiplicacion_de_Matriz(MatrizA, MatrizB, MatrizC) {
    var resultado = 0,
        MatrizAux = [];
    for (let i = 0; i < vertices.length; i++) {
        for (let j = 0; j < vertices.length; j++) {
            for (let k = 0; k < vertices.length; k++) {
                resultado += MatrizA[i][k] * MatrizB[j][k];
            }
            MatrizAux.push(resultado);
            resultado = 0;
        }
        MatrizC[i] = MatrizAux;
        MatrizAux = [];

    }
}


function matrizConexa(MatrizA) {
    let contador = 0;
    for (let i = 0; i < vertices.length; i++) {
        for (let j = 0; j < vertices.length; j++) {
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


function MatrizCaminos(mAdyacencia) {
    var multiplicada = [],
        mCaminos = [],
        aux = [],
        sumada = [] = mAdyacencia,
        aux = mAdyacencia;
    for (let i = 0; i < ((vertices.length) - 1); i++) {
        Multiplicacion_de_Matriz(mAdyacencia, aux, multiplicada);
    }
    Suma_De_Matrices(multiplicada, sumada, mCaminos);
    aux = multiplicada;

    return mCaminos;
}


function drawMatriz(matriz) {
    var tablaS = document.createElement('table');
    var fila = document.createElement('tr');
    var primero = document.createElement('td');
    primero.textContent = "M";
    primero.style.backgroundColor = "#CDA434";
    primero.style.textAlign = "center";
    primero.style.width = "40px";
    primero.style.height = "40px";
    primero.style.borderColor = "#1F1F1F";
    fila.appendChild(primero);
    for (let i = 0; i < vertices.length; i++) {
        var p_fila = document.createElement('td');
        p_fila.style.width = "40px";
        p_fila.style.height = "40px";
        p_fila.style.textAlign = "center";
        p_fila.style.backgroundColor = "#CDA434";
        p_fila.style.borderColor = "#1F1F1F";
        p_fila.textContent = vertices[i];
        fila.appendChild(p_fila);
    }
    tablaS.appendChild(fila);

    for (let k = 0; k < matriz.length; k++) {
        var o_filas = document.createElement('tr');
        var nombre = document.createElement('td');
        nombre.style.width = "40px";
        nombre.style.height = "40px";
        nombre.style.backgroundColor = "#CDA434";
        nombre.style.borderColor = "#1F1F1F";
        nombre.style.textAlign = "center";
        nombre.textContent = vertices[k];
        o_filas.appendChild(nombre);

        for (let j = 0; j < matriz.length; j++) {
            var datos = document.createElement('td');
            datos.style.width = "40px";
            datos.style.height = "40px";
            datos.style.textAlign = "center";
            datos.style.borderColor = "#1F1F1F";
            datos.textContent = matriz[k][j];
            o_filas.appendChild(datos);
        }
        tablaS.appendChild(o_filas);
    }
    return tablaS;
}


function imprimirAD() {
    const matrizAdy = document.querySelector("#matrizAdy");
    var matriz = MatrizAdyacencia();
    matrizAdy.appendChild(drawMatriz(matriz));

}

function imprimirCamino() {

    var mAdyacencia = MatrizAdyacencia();
    const matrizCamino = document.querySelector("#matrizCam");
    matriz_c = MatrizCaminos(mAdyacencia, mCaminos);
    matrizCamino.appendChild(drawMatriz(matriz_c));
}

function imprimirConexo() {
    var mAdyacencia = MatrizAdyacencia();
    const matrizCamino = document.querySelector("#matrizCam");
    matriz_c = MatrizCaminos(mAdyacencia, mCaminos);
    const saberCon = document.querySelector("#saberConexo");
    var conexo = matrizConexa(matriz_c);
    if (conexo) {
        saberCon.textContent = "La matriz ingresada es Conexa :D !";
        saberCon.className = "alert alert-warning text-center";
    } else {
        saberCon.textContent = "Su matriz no es Conexa :V";
        saberCon.className = "alert alert-warning text-center";
    }
}

function ObtenerPeso(columnas, filas) {
    for (let i = 0; i < aristas_origen.length; i++) {
        if (columnas === aristas_origen[i] && filas === aristas_llegada[i]) {
            return peso[i];
        }
    }
}

function Matriz_Pesos() {
    var Matriz_de_Peso = [];
    var Matriz_aux = [];
    for (i = 0; i < vertices.length; i++) {
        for (j = 0; j < vertices.length; j++) {
            if (buscar(vertices[i], vertices[j]) === 1) {
                Matriz_aux.push(ObtenerPeso(vertices[i], vertices[j]));

            } else {
                Matriz_aux.push(0);
            }
        }
        Matriz_de_Peso[i] = Matriz_aux;
        Matriz_aux = [];
    }
    return Matriz_de_Peso;
}

/*
function CaminoMasCorto(Matriz_de_Peso) {
    let vertices = Matriz_de_Peso.length;
    var MatrizAuxi = Matriz_de_Peso;
    var caminos = [];
    var caminosauxiliares = [];
    let caminoRecorrido = "",
        cadena = "",
        caminitos = "";
    let temporal1, temporal2, temporal3, temporal4, minimo;
    let uno = 1;
    for (let k = 0; k < vertices; k++) {
        for (let i = 0; i < vertices; i++) {
            for (let j = 0; j < vertices.length; j++) {
                temporal1 = Matriz_de_Peso[i][j];
                temporal2 = Matriz_de_Peso[i][k];
                temporal3 = Matriz_de_Peso[k][j];
                temporal4 = temporal2 + temporal3;
                minimo = Math.min(temporal1, temporal4);
                if (temporal1 != temporal4) {
                    if (minimo == temporal4) {
                        caminoRecorrido = "";
                        caminosauxiliares[i][j] = k + "";
                        caminos[i][j] = caminosR(i, k, caminosauxiliares, caminoRecorrido) + (k + 1);

                    }
                } else {
                    MatrizAuxi[i][j] = minimo;
                }
            }
        }
    }
    for (let i = 0; i < vertices; i++) {
        for (let j = 0; j < vertices; j++) {
            cadena = cadena + "[" + MatrizAuxi[i][j] + "]";
        }
        cadena = cadena + "\n";
    }
    for (let i = 0; i < vertices; i++) {
        for (let j = 0; j < vertices; j++) {
            if (MatrizAuxi[i][j] != 1000000000000) {
                if (i != j) {
                    if (caminos[i][j].equals("")) {
                        caminitos += "De (" + (i + uno) + "--->" + (j + uno) + ")Irse Por...(" + (i + uno) + "," + (j + uno) + ")\n";
                    } else {
                        caminitos += "De (" + (i + uno) + "--->" + (j + uno + ")Irse Por...(" + (i + uno) + "," + caminos[i][j] + ", " + (j + uno) + ")\n");
                    }
                }
            }
        }
    }
    return "La Matriz de caminos mas cortos entre los diferentes vertices es:\n" + cadena + "\nLos diferentes caminos mas cortos entre vertices son:\n" + caminitos;

    function caminosR(i, k, caminosauxiliares, caminoRecorrido) {
        if (caminosauxiliares[i][k].equals("")) {
            return "";
        } else {
            caminoRecorrido += caminosR(caminosauxiliares) + (Integer.parseInt(caminosauxiliares[i][k]) + 1) + ",";
            return caminoRecorrido;
        }
    }
} *
*/
function CaminoMasCorto(Matriz_de_Peso, s) {
    var solutions = {};
    solutions[s] = [];
    solutions[s].dist = 0;

    while (true) {
        var parent = null;
        var nearest = null;
        var dist = Infinity;


        for (var n in solutions) {
            if (!solutions[n])
                continue
            var ndist = solutions[n].dist;
            var adj = Matriz_de_Peso[n];

            for (var a in adj) {

                if (solutions[a])
                    continue;

                var d = adj[a] + ndist;
                if (d < dist) {

                    parent = solutions[n];
                    nearest = a;
                    dist = d;
                }
            }
        }
        if (dist === Infinity) {
            break;
        }

        solutions[nearest] = parent.concat(nearest);
        solutions[nearest].dist = dist;
    }

    return solutions;
}


/* Item C, indicar si es hamiltoniano y/o euleriano */

/* Grafo euleriano , si es euleriano es conexo por tanto debe tener un circuito cerrado G tiene una componente conexa y
 el resto son vértices aislados*/

function gradoPar(matrizA) {
    var aux = 0;
    for (let i = 0; i < matrizA.length; i++) {
        if ((matrizA[i] % 2) === 0)
            aux++;
    }
    if (aux === matrizA.length) {
        return true;
    } else {
        return false;
    }
}

function grado(matrizA) {
    var gradoVertice = [],
        grado = 0;
    for (let i = 0; i < matrizA.length; i++) {
        for (let j = 0; j < matrizA.length; j++) {
            grado += matrizA[i][j];
        }
        gradoVertice.push(grado);
        grado = 0;
    }

    if (gradoPar(gradoVertice) === true) {
        const output = document.querySelector("#esEuleriano");
        output.textContent = (`Además es Euleriano debido a que pasa por el camino:  [${aristas_llegada}]`);
        output.className = ("alert alert-warning text-center mx-3");
        return true;
    } else {
        return false;
    }


}


function esEuleriano() {
    const matrizCamino = document.querySelector("#matrizCam");
    var mAdyacencia = MatrizAdyacencia();
    var matrizCam = MatrizCaminos(mAdyacencia, mCaminos);
    if (grado(matrizCam) === true && matrizConexa(mAdyacencia) === false) {
        return true;
    } else {
        return false;
    }
}

function imprimirEuleriano() {
    var mAdyacencia = MatrizAdyacencia();
    const matrizCamino = document.querySelector("#matrizCam");
    matriz_c = MatrizCaminos(mAdyacencia, mCaminos);
    const esEule = document.querySelector("#esEule");
    var eule = esEuleriano();
    if (eule) {
        esEule.textContent = "Su grafo es Euleriano :D !";
        esEule.className = "alert alert-warning text-center";
    } else {
        esEule.textContent = "Su grafo no es Euleriano :v !";
        esEule.className = "alert alert-warning text-center";
    }

}

/* Funcion para saber si es hamiltoniano */

function gradoHamil(mAdyacencia) {
    var gradoVertice = [],
        grado = 0;
    for (let i = 0; i < mAdyacencia.length; i++) {
        for (let j = 0; j < mAdyacencia.length; j++) {
            grado += mAdyacencia[i][j];
        }
        gradoVertice.push(grado);
        grado = 0;
    }
    return gradoVertice;
}


function esHamil(mAdyacencia) {
    var aux = gradoHamil(mAdyacencia);
    for (let i = 0; i < aux.length; i++) {
        if (aux[i] > 2) {
            return false;
        }
    }
    return true;
}

function esHamiltoniano() {
    var mAdyacencia = MatrizAdyacencia();
    if (esHamil(mAdyacencia) === true) {
        const output = document.querySelector("#esHamilton");
        output.textContent = (`Además es hamiltoniano debido a que pasa por el camino:  [${aristas_llegada}]`);
        output.className = ("alert alert-warning text-center mx-3");
        return true;
    } else {
        return false;
    }

}

function imprimirHamil() {
    var mAdyacencia = MatrizAdyacencia();
    const matrizCamino = document.querySelector("#matrizCam");
    matriz_c = MatrizCaminos(mAdyacencia, mCaminos);
    const esHamilto = document.querySelector("#esHamilto");
    var hamil = esHamiltoniano();
    if (hamil) {
        esHamilto.textContent = "El grafo es Hamiltoniano :D";
        esHamilto.className = "alert alert-warning text-center";
    } else {
        esHamilto.textContent = "El grafo no es Hamiltoniano :V";
        esHamilto.className = "alert alert-warning text-center";
    }
}


function imprimirMasCorto() {
    var entrada;
    const salida = document.querySelector("#entradacamino");
    entrada = vertices.indexOf(salida);
    if (entrada <= 0 || entrada >= 0) {
        var Matriz_de_Peso = Matriz_Pesos();
        var CaminonTulachi = CaminoMasCorto(Matriz_de_Peso, entrada);
        const output = document.querySelector("#caminoCorto");
        output.textContent = (`El flujo máximo de la ruta de vertices es de:  [${CaminonTulachi}]`);
        output.className = "alert alert-warning text-center";

    } else {
        alert("Error \n Ingrese un valor valido");
    }
}

function recorrerVertices(matrizA, en, sa, raiz) {
    var ver_visitado = [],
        col = [];
    for (let i = 0; i < vertices.length; i++) {
        ver_visitado[i] = false;
    }
    col.push(en);
    ver_visitado[en] = true;
    raiz[en] = -1;
    while (col.length != 0) {
        var aux = col.shift();
        for (let i = 0; i < vertices.length; i++) {
            if (ver_visitado[i] == false && matrizA[aux][i] > 0) {
                col.push(i);
                raiz[i] = aux;
                ver_visitado[i] = true;

            }

        }

    }
    return (ver_visitado[sa] == true);

}

function calcularFlujo(matrizA, en, sa) {
    var matriz_aux = matrizA;
    var raiz = new Array(vertices.length);
    var flujoC = 0;
    var aux;

    while (recorrerVertices(matriz_aux, en, sa, raiz)) {
        var flujoMaximo = Number.MAX_VALUE;
        for (let i = sa; i != en; i = raiz[i]) {
            aux = raiz[i];
            flujoMaximo = Math.min(flujoMaximo, matriz_aux[aux][i]);
        }
        for (let i = sa; i != en; i = raiz[i]) {
            aux = raiz[i];
            matriz_aux[aux][i] -= flujoMaximo;
            matriz_aux[i][aux] += flujoMaximo;
        }
        flujoC += flujoMaximo;
    }
    return flujoC;
}



function ImprimirFlujoMaximo() {
    var en, sa;
    const entrada = document.querySelector("#entrada_flujo").value;
    const salida = document.querySelector("#salida_flujo").value;
    var tipo_grafo = document.querySelector("#tipoGrafo").value;
    if (tipo_grafo === "Dirigido") {
        en = vertices.indexOf(entrada);
        sa = vertices.indexOf(salida);
        if (en == -1 || sa == -1) {
            alert("Error \n Ingrese un valor valido en el vertice ingresado");
        } else {
            var matrizPeso = Matriz_Pesos();
            var flujoMaximo = calcularFlujo(matrizPeso, en, sa);
            const output = document.querySelector("#flujoMax");
            output.textContent = (`El flujo máximo de la ruta de vertices es de:  [${flujoMaximo}]`);
            output.className = "alert alert-warning text-center";
        }
    } else {
        const popAlert = document.querySelector("#popAlert");
        popAlert.textContent = "El flujo maximo es solo para grafos dirigidos :v !";
        popAlert.className = "alert alert-danger text-center";

    }
}

