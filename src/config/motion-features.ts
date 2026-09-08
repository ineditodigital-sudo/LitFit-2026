// Paquete de funciones de Motion cargado bajo demanda por <LazyMotion>.
//
// Motion pesaba mas que React en el bundle inicial (~463 KB de fuente) y su
// evaluacion era la tarea que mas bloqueaba el hilo principal al arrancar. Con
// LazyMotion el componente `m` viaja casi vacio y todo el motor de animacion
// llega en este trozo aparte, despues del primer pintado.
//
// Se usa domMax y no domAnimation porque el carrito anima con la prop `layout`,
// que solo existe en el paquete completo.
export { domMax as default } from "motion/react";
