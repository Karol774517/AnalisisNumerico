let decimales = 4;
// Store result globally
let resultadoFinal = null;

function replaceMathFunctions(input) {
  return input
    .replace(/e/g, "Math.E")
    .replace(/exp/g, "Math.exp")
    .replace(/log/g, "Math.log")
    .replace(/sin/g, "Math.sin")
    .replace(/cos/g, "Math.cos")
    .replace(/tan/g, "Math.tan")
    .replace(/sqrt/g, "Math.sqrt");
}

function parseFunction(input) {
  let formattedInput = replaceMathFunctions(input);
  return new Function("x", `return ${formattedInput};`);
}

function falsePositionMethod(func, xi, xs, margenError) {
  if (func(xi) * func(xs) >= 0) {
    alert(
      "El Teorema de Bolzano no se cumple: f(xi) y f(xs) deben tener signos opuestos."
    );
    return null;
  }

  let xr_old = xi;
  let error = 100;
  let iter = 0;
  const round = (num) => parseFloat(num.toFixed(decimales));
  let resultsTable = document.querySelector("#resultsTable tbody");
  let iterationsDiv = document.getElementById("iterations");
  resultsTable.innerHTML = "";
  iterationsDiv.innerHTML = "";

  // Guardar todas las iteraciones para el PDF
  let iteracionesData = [];
  let xr, f_xr;

  while (error > margenError) {
    iter++;
    let f_xi = round(func(xi));
    let f_xs = round(func(xs));
    xr = round(xs - (f_xs * (xi - xs)) / (f_xi - f_xs));
    f_xr = round(func(xr));
    error = round(Math.abs((xr - xr_old) / xr) * 100);

    // Guardar datos para el PDF
    iteracionesData.push({
      iter: iter,
      xi: xi,
      xs: xs,
      xr: xr,
      f_xi: f_xi,
      f_xs: f_xs,
      f_xr: f_xr,
      error: error,
    });

    let row = `<tr>
                    <td>${iter}</td>
                    <td>${xi}</td>
                    <td>${xs}</td>
                    <td>${xr}</td>
                    <td>${f_xi}</td>
                    <td>${f_xs}</td>
                    <td>${f_xr}</td>
                    <td>${error}</td>
                </tr>`;
    resultsTable.innerHTML += row;

    // Mejor formato para mostrar las iteraciones
    iterationsDiv.innerHTML += `
            <div class="iteration">
                <strong>Iteración ${iter}</strong><br>
                xi = ${xi}, xs = ${xs}<br>
                xr = ${xr}<br>
                f(xi) = ${f_xi}, f(xs) = ${f_xs}, f(xr) = ${f_xr}<br>
                Error = ${error} %
            </div>
        `;

    if (error <= margenError) {
      return {
        raiz: xr,
        valorFuncion: f_xr,
        iteraciones: iter,
        error: error,
        allIterations: iteracionesData,
        funcString: document.getElementById("func").value,
      };
    }

    if (f_xi * f_xr < 0) {
      xs = xr;
    } else {
      xi = xr;
    }
    xr_old = xr;
  }

  return {
    raiz: xr,
    valorFuncion: f_xr,
    iteraciones: iter,
    error: error,
    allIterations: iteracionesData,
    funcString: document.getElementById("func").value,
  };
}

function runFalsePosition() {
  let funcInput = document.getElementById("func").value;
  let func = parseFunction(funcInput);
  let xi = parseFloat(document.getElementById("xi").value);
  let xs = parseFloat(document.getElementById("xs").value);
  let margenError = parseFloat(document.getElementById("error").value);

  // Obtener el resultado del método
  let resultado = falsePositionMethod(func, xi, xs, margenError);

  if (resultado) {
    // Crear o actualizar el div para mostrar la raíz
    let rootDiv = document.getElementById("root-result");
    if (!rootDiv) {
      rootDiv = document.createElement("div");
      rootDiv.id = "root-result";
      rootDiv.className = "card";
      rootDiv.style.width = "100%";
      rootDiv.style.marginTop = "20px";
      document.getElementById("iterations").appendChild(rootDiv);
    }

    // Determinar si la raíz es exacta o aproximada
    let esRaizExacta = Math.abs(resultado.valorFuncion) < 1e-6;
    let mensaje = esRaizExacta
      ? `Raíz exacta encontrada en x = ${resultado.raiz}, ya que f(x) ≈ 0.`
      : `Raíz aproximada encontrada en x = ${resultado.raiz}, con f(x) = ${resultado.valorFuncion}.`;

    rootDiv.innerHTML = `
            <h3>Resultado Final</h3>
            <p><strong>${mensaje}</strong></p>
            <p>Número de iteraciones: ${resultado.iteraciones}</p>
            <p>Error relativo: ${resultado.error}%</p>
            <button id="btn-generar-pdf" onclick="generatePDF()">Generar PDF</button>
        `;

    // Guardar el resultado en la variable global
    resultadoFinal = resultado;

    // Mostrar una alerta
    if (esRaizExacta) {
      alert(
        `Raíz exacta encontrada en xr = ${resultado.raiz}, ya que f(xr) ≈ 0.`
      );
    } else {
      alert(
        `Raíz aproximada encontrada en xr = ${resultado.raiz}, pero f(xr) ≠ 0.`
      );
    }
  }
}

function generatePDF() {
  // Verificar que jsPDF esté cargado correctamente
  if (typeof window.jspdf === "undefined") {
    // Intentar con otras posibles referencias
    if (typeof jspdf === "undefined" && typeof jsPDF === "undefined") {
      alert(
        "La librería jsPDF no está cargada. Por favor, añade la librería al HTML."
      );
      return;
    }
  }

  // Acceder a jsPDF correctamente según cómo esté disponible
  const { jsPDF } = window.jspdf || window;

  if (!resultadoFinal) {
    alert(
      "No hay resultados para generar el PDF. Por favor, ejecuta el método primero."
    );
    return;
  }

  // Crear un nuevo PDF
  const doc = new jsPDF();
  let y = 20; // Posición vertical inicial

  // Título del método
  doc.setFontSize(18);
  doc.text("Método de la Regla Falsa", 105, y, { align: "center" });
  y += 10;

  // Nombres de los integrantes
  doc.setFontSize(14);
  doc.text("Integrantes:", 20, y);
  y += 8;
  doc.setFontSize(12);
  doc.text("Hecmaibel Quero", 30, y);
  y += 6;
  doc.text("Karolay Sierra", 30, y);
  y += 10;

  // Función utilizada
  doc.setFontSize(14);
  doc.text("Función: " + resultadoFinal.funcString, 20, y);
  y += 10;

  // Iteraciones
  doc.setFontSize(14);
  doc.text("Iteraciones:", 20, y);
  y += 8;

  doc.setFontSize(10);
  for (let iter of resultadoFinal.allIterations) {
    // Verificar si necesitamos una nueva página
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.text(`Iteración ${iter.iter}:`, 20, y);
    y += 5;
    doc.text(`xi = ${iter.xi}, xs = ${iter.xs}, xr = ${iter.xr}`, 25, y);
    y += 5;
    doc.text(
      `f(xi) = ${iter.f_xi}, f(xs) = ${iter.f_xs}, f(xr) = ${iter.f_xr}`,
      25,
      y
    );
    y += 5;
    doc.text(`Error = ${iter.error}%`, 25, y);
    y += 8;
  }

  // Nueva página para la tabla
  doc.addPage();
  y = 20;

  // Título de la tabla
  doc.setFontSize(14);
  doc.text("Tabla de Resultados:", 105, y, { align: "center" });
  y += 10;

  // Crear la tabla
  const headers = [
    ["Iter", "xi", "xs", "xr", "f(xi)", "f(xs)", "f(xr)", "Error (%)"],
  ];
  const data = resultadoFinal.allIterations.map((iter) => [
    iter.iter.toString(),
    iter.xi.toString(),
    iter.xs.toString(),
    iter.xr.toString(),
    iter.f_xi.toString(),
    iter.f_xs.toString(),
    iter.f_xr.toString(),
    iter.error.toString(),
  ]);

  doc.autoTable({
    startY: y,
    head: headers,
    body: data,
    theme: "grid",
    headStyles: { fillColor: [139, 94, 59] },
    styles: { fontSize: 8 },
  });

  // Agregar la raíz calculada (en una nueva página si es necesario)
  y = doc.lastAutoTable.finalY + 15;
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  // Resultados finales
  doc.setFontSize(14);
  doc.text("Resultado Final:", 20, y);
  y += 8;

  doc.setFontSize(12);
  const esRaizExacta = Math.abs(resultadoFinal.valorFuncion) < 1e-6;
  const mensajeRaiz = esRaizExacta
    ? `Raíz exacta encontrada en x = ${resultadoFinal.raiz}, ya que f(x) ≈ 0.`
    : `Raíz aproximada encontrada en x = ${resultadoFinal.raiz}, con f(x) = ${resultadoFinal.valorFuncion}.`;

  doc.text(mensajeRaiz, 20, y);
  y += 6;
  doc.text(`Número de iteraciones: ${resultadoFinal.iteraciones}`, 20, y);
  y += 6;
  doc.text(`Error relativo final: ${resultadoFinal.error}%`, 20, y);

  // Guardar el PDF
  doc.save("MetodoReglaFalsa.pdf");
}
