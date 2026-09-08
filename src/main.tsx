  import { createRoot } from "react-dom/client";
  import { LazyMotion } from "motion/react";
  import App from "./App.tsx";
  import "./index.css";

  // El motor de animacion de Motion se carga aparte, despues del primer pintado.
  // Los componentes siguen escribiendose igual (motion.div): en cada archivo se
  // importa `m as motion`, y LazyMotion le inyecta las funciones al llegar.
  // Importante: LazyMotion espera el paquete de funciones, no el modulo. Sin el
  // .then(m => m.default) no falla ni avisa: simplemente no aplica nada y cada
  // componente se queda congelado en su estado `initial` (opacity 0, y -100...).
  const cargarFunciones = () => import("./config/motion-features").then((m) => m.default);

  createRoot(document.getElementById("root")!).render(
    <LazyMotion features={cargarFunciones}>
      <App />
    </LazyMotion>
  );
