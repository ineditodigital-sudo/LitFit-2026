// Identificador local del visitante.
//
// Los cupones de un solo uso quedan tomados en cuanto alguien los aplica, y hay
// que saber a nombre de quien. Lo natural es el correo, pero en el checkout la
// casilla del cupon esta en el resumen y se puede usar antes de llenar el
// formulario. Este identificador cubre ese hueco: permite reaplicar el mismo
// cupon sin gastarlo dos veces, y al guardar el pedido la reserva se pasa a
// nombre del correo, que es lo que vale entre dispositivos.
//
// No identifica a la persona ni viaja a ningun tercero: es un numero al azar
// guardado en este navegador.

const CLAVE = "litfit_visitante";

export function obtenerIdVisitante(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(CLAVE);
    if (!id) {
      id = (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36))
        .replace(/[^A-Za-z0-9_-]/g, "");
      localStorage.setItem(CLAVE, id);
    }
    return id;
  } catch {
    // Modo privado o almacenamiento bloqueado: el cupon se identifica solo por correo.
    return "";
  }
}
