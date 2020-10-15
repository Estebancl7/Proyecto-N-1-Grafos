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

// randomly create some nodes and edges
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
                // filling in the popup DOM elements
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
            Si conectas el vertice a si mismo crearas un buble, ¿estas seguro? 
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



//a. matriz de caminos y grafo conexa o no
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


/* Matriz de adyacencia */

function MatrizAdyacencia() {
    var mAdyacencia = []
    var col = []; // columnas
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


/* Suma de matrices para usar en funcion de matriz de caminos */
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

/* Multiplicacion de matrices para usar en matriz de caminos */

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

/* Matriz conexa*/

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
    //creo los elementos y llamo a la tabla del html
    var tablaS = document.createElement('table'); //TablaS es la matriz superior donde se guarda todo
    var fila = document.createElement('tr');
    var primero = document.createElement('td');
    primero.textContent = "M";
    primero.style.backgroundColor = "#CDA434";
    primero.style.textAlign = "center";
    primero.style.width = "40px";
    primero.style.height = "40px";
    primero.style.borderColor = "#1F1F1F";
    fila.appendChild(primero);
    //for para agregar los valores de la primera fila
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
        //se agrega el nombre de los vertices (en la primera columna)
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
            //se agregan los datos contenidos en la matriz
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


/*Funciones de Imprimir de matrices*/

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
    /* es conexo */
    const saberCon = document.querySelector("#saberConexo");
    var conexo = matrizConexa(matriz_c);
    if (conexo) {
        saberCon.textContent = "La matriz ingresada es Conexa :D !";
    } else {
        saberCon.textContent = "Su matriz no es Conexa :V";
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
                Matriz_aux.push(Infinity);
            }
        }
        Matriz_de_Peso[i] = Matriz_aux;
        Matriz_aux = [];
    }
    return Matriz_de_Peso;


}


function CaminoMasCorto(Matriz_de_Peso) {
    let vertices = Matriz_de_Peso.length;
    var MatrizAuxi = Matriz_de_Peso;
    var caminos = [];
    var caminosauxiliares = [];
    let caminoRecorrido = "",
        cadena = "",
        caminitos = "";
    let temporal1, temporal2, temporal3, temporal4, minimo;
    for (let k = 0; k < vertices; k++) {
        for (let i = 0; i < vertices; i++) {
            for (let j = 0; j < vertices.length; j++) {
                temporal1 = Matriz_de_Peso[i][j];
                temporal2 = Matriz_de_Peso[i][k];
                temporal3 = Matriz_de_Peso[k][j];
                temporal4 = temporal2 + temporal3;

                minimo = Math.min(temporal1, temporal4);
                if (temporal1 != temporal4) {
                    if (minimo = temporal4) {
                        caminoRecorrido = "";
                        caminosauxiliares[i][j] = k + "";
                        caminos[i][j] = caminosR(i, k, caminosauxiliares, caminoRecorrido) + (k + 1);

                    }
                }
                MatrizAuxi[i][j] = minimo;
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
                        caminitos += "De (" + (i + 1) + "--->" + (j + 1) + ")Irse Por...(" + (i + 1) + "," + (j + 1) + ")\n";
                    } else {
                        caminitos += "De (" + (i + 1) + "--->" + (j + 1) + ")Irse Por...(" + (i + 1) + "," + caminos[i][j] + ", " + (j + 1) + ")\n";
                    }
                }
            }
        }
    }
    return "La Matriz de caminos mas cortos entre los diferentes vertices es:\n" + cadena + "\nLos diferentes caminos mas cortos entre vertices son:\n" + caminitos;

    function caminosR(i, k, MatrizJ, caminosauxiliares, caminoRecorrido) {
        if (caminosauxiliares[i][k].equals("")) {
            return "";
        } else {
            caminoRecorrido += caminosR(i, Integer.parseInt(caminosauxiliares[i][k]), caminosauxiliares, caminoRecorrido) + (Integer.parseInt(caminosauxiliares[i][k]) + 1) + ",";
            return caminoRecorrido;
        }
    }
}





/* 
function CaminoCorto(Matriz_A, nodo1, nodo2) {
    var aux_camino = Infinity;
    var contador = 0;
    for (i = 0; i < vertices.length; i++) {
        for (j = 0; j < vertices.length; j++) {
            if (nodo1 === i) {
                if(nodo2 === j){
                    if(Matriz_A[i][j] < aux_camino){
                        aux_camino = Matriz_A[i][j];
                    }
                }
                else{
                    if(Matriz_A[i][j] != Infinity){
                        
                        if(Matriz_A[j][nodo2] != Infinity){
                            for(let k = 0; k < vertices.length; k++) {
                                if(Matriz_A[j][k] != Infinity){
                                
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
*/

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
    } else {
        esEule.textContent = "Su grafo no es Euleriano :v !";
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
    var cont = 0;
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
    } else {
        esHamilto.textContent = "El grafo no es Hamiltoniano :V";
    }
}