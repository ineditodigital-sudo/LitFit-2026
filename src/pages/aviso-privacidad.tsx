import React, { useEffect } from 'react';

export function AvisoPrivacidad() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-black/80 space-y-8">
        <div>
          <h1 className="text-3xl font-black mb-2 uppercase tracking-tight text-black">Aviso de Privacidad y Uso de Cookies</h1>
          <h2 className="text-xl font-bold uppercase tracking-tight text-[#00AAC7]">LITFIT</h2>
          <p className="font-bold text-sm mt-4 text-gray-500">Última actualización: 19 de junio de 2026</p>
        </div>

        <p className="leading-relaxed">
          En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y demás disposiciones aplicables en México, LITFIT, con domicilio en <strong>Cedro 305, Circunvalación Nte., 20020 Aguascalientes, Ags.</strong>, correo electrónico de contacto <strong>litfitmexico@gmail.com</strong> y sitio web litfitmexico.com, es responsable del uso, tratamiento y protección de los datos personales que nos proporciones.
        </p>
        
        <p className="leading-relaxed">
          Este Aviso de Privacidad y Uso de Cookies tiene como finalidad informarte qué datos personales recabamos, para qué los utilizamos, cómo los protegemos, con quién podemos compartirlos y cómo puedes ejercer tus derechos relacionados con ellos.
        </p>

        <div>
          <h3 className="text-xl font-black uppercase text-black mb-4">1. Datos personales que podemos recabar</h3>
          <p className="mb-4">LITFIT podrá recabar los siguientes datos personales:</p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Nombre completo.</li>
            <li>Correo electrónico.</li>
            <li>Teléfono.</li>
            <li>Dirección de entrega.</li>
            <li>Dirección de facturación.</li>
            <li>Ciudad, estado y país.</li>
            <li>Datos fiscales, en caso de solicitar factura.</li>
            <li>Información relacionada con compras, pedidos, pagos, entregas, devoluciones o aclaraciones.</li>
            <li>Historial de contacto con la marca.</li>
            <li>Preferencias de producto.</li>
            <li>Información proporcionada voluntariamente en formularios, encuestas, mensajes de WhatsApp, redes sociales o campañas publicitarias.</li>
            <li>Datos de navegación, como dirección IP, tipo de dispositivo, navegador, sistema operativo, páginas visitadas, tiempo de permanencia, clics y origen de la visita.</li>
          </ul>
          <p className="leading-relaxed mb-4">
            LITFIT no solicita datos personales sensibles. En caso de que el usuario proporcione voluntariamente información relacionada con objetivos deportivos, hábitos de entrenamiento, estilo de vida o preferencias de suplementación, dicha información será utilizada únicamente para fines de atención, orientación comercial y recomendación de productos.
          </p>
          <p className="font-bold text-[#00AAC7]">
            La información proporcionada por LITFIT no sustituye asesoría médica, nutricional o profesional.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-black uppercase text-black mb-4">2. Finalidades principales del uso de datos personales</h3>
          <p className="mb-4">Los datos personales recabados podrán ser utilizados para las siguientes finalidades necesarias:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Atender solicitudes de información.</li>
            <li>Procesar compras, pedidos y entregas.</li>
            <li>Confirmar datos de contacto.</li>
            <li>Dar seguimiento a cotizaciones, mensajes, formularios o conversaciones comerciales.</li>
            <li>Brindar atención al cliente por correo, teléfono, WhatsApp, redes sociales u otros medios.</li>
            <li>Gestionar pagos, aclaraciones, cambios, devoluciones o garantías.</li>
            <li>Emitir facturas o comprobantes fiscales.</li>
            <li>Confirmar disponibilidad de productos.</li>
            <li>Cumplir obligaciones legales, fiscales, administrativas o contractuales.</li>
            <li>Mantener comunicación relacionada con pedidos o servicios solicitados.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-black uppercase text-black mb-4">3. Finalidades secundarias</h3>
          <p className="mb-4">De manera adicional, LITFIT podrá utilizar tus datos personales para:</p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Enviar promociones, descuentos, lanzamientos, noticias o campañas comerciales.</li>
            <li>Compartir contenido relacionado con suplementación, entrenamiento, rendimiento físico, recuperación y estilo de vida fitness.</li>
            <li>Realizar encuestas de satisfacción.</li>
            <li>Mejorar nuestros productos, servicios, campañas, sitio web y experiencia de usuario.</li>
            <li>Crear audiencias publicitarias, campañas de remarketing o anuncios personalizados en plataformas como Meta, Google, TikTok u otras similares.</li>
            <li>Medir el rendimiento de campañas digitales.</li>
            <li>Analizar preferencias de consumo y comportamiento de navegación.</li>
          </ul>
          <p className="leading-relaxed mb-8">
            La negativa para el uso de tus datos en finalidades secundarias no afectará la prestación de los servicios o productos que solicites.
          </p>

          <h4 className="text-lg font-bold uppercase text-black mb-4">Uso de cookies y consentimiento</h4>
          <p className="leading-relaxed mb-4">
            Al ingresar y navegar en el sitio web de LITFIT, el usuario reconoce haber leído el presente Aviso de Privacidad y Uso de Cookies.
          </p>
          <p className="leading-relaxed mb-4">
            Nuestro sitio utiliza cookies necesarias para permitir el correcto funcionamiento de la página, mejorar la navegación, proteger la seguridad del sitio, recordar preferencias básicas y facilitar procesos como formularios, carrito de compra o seguimiento de pedidos.
          </p>
          <p className="leading-relaxed mb-4">
            Adicionalmente, LITFIT podrá utilizar cookies de analítica, publicidad y remarketing, propias o de terceros, con la finalidad de analizar el comportamiento de navegación, medir el rendimiento del sitio, optimizar campañas digitales, personalizar contenido y mostrar publicidad relacionada con nuestros productos.
          </p>
          <p className="leading-relaxed mb-4">
            El usuario podrá aceptar, rechazar o configurar el uso de cookies no necesarias a través del banner de cookies disponible en el sitio web o mediante la configuración de su navegador. En caso de rechazar cookies no necesarias, algunas funciones de personalización, medición o publicidad podrían verse limitadas, sin que ello impida el acceso general al sitio.
          </p>
          <p className="leading-relaxed">
            Al seleccionar "Aceptar cookies" en el banner correspondiente, el usuario otorga su consentimiento para el uso de cookies de analítica, publicidad y remarketing conforme a este Aviso de Privacidad y Uso de Cookies.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-black uppercase text-black mb-4">4. Uso de cookies y tecnologías similares</h3>
          <p className="leading-relaxed mb-4">
            El sitio web de LITFIT puede utilizar cookies, píxeles, etiquetas, identificadores, herramientas de analítica y tecnologías similares.
          </p>
          <p className="leading-relaxed mb-4">
            Las cookies son pequeños archivos que se almacenan en tu navegador o dispositivo cuando visitas un sitio web. Estas tecnologías permiten recordar información sobre tu visita y mejorar tu experiencia de navegación. Google describe que las cookies pueden ayudar a mantener sesiones iniciadas, recordar preferencias y ofrecer contenido relevante.
          </p>
          <p className="mb-4">LITFIT podrá utilizar cookies para las siguientes finalidades:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Hacer funcionar correctamente el sitio web.</li>
            <li>Recordar preferencias del usuario.</li>
            <li>Analizar tráfico y comportamiento de navegación.</li>
            <li>Medir visitas, clics, conversiones y rendimiento del sitio.</li>
            <li>Mejorar la experiencia de compra.</li>
            <li>Personalizar contenido.</li>
            <li>Mostrar publicidad relacionada con productos LITFIT.</li>
            <li>Realizar campañas de remarketing.</li>
            <li>Medir resultados de campañas en plataformas digitales.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-black uppercase text-black mb-4">5. Tipos de cookies que podemos utilizar</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-bold">Cookies necesarias</h4>
              <p className="leading-relaxed">
                Son indispensables para que el sitio web funcione correctamente. Permiten funciones básicas como navegación, seguridad, carrito de compra, procesamiento de pedidos o acceso a secciones del sitio. Estas cookies no pueden desactivarse desde nuestros sistemas, ya que son necesarias para el funcionamiento del sitio.
              </p>
            </div>
            <div>
              <h4 className="font-bold">Cookies de rendimiento y analítica</h4>
              <p className="leading-relaxed">
                Nos ayudan a entender cómo los usuarios interactúan con el sitio web, qué páginas visitan, cuánto tiempo permanecen, desde dónde llegan y qué contenido genera mayor interés. Estas cookies pueden utilizarse mediante herramientas como Google Analytics, Meta Pixel u otras plataformas de medición.
              </p>
            </div>
            <div>
              <h4 className="font-bold">Cookies de funcionalidad</h4>
              <p className="leading-relaxed">
                Permiten recordar preferencias del usuario, como idioma, ubicación, productos consultados, datos de navegación o configuraciones personalizadas.
              </p>
            </div>
            <div>
              <h4 className="font-bold">Cookies de publicidad y remarketing</h4>
              <p className="leading-relaxed">
                Permiten mostrar anuncios personalizados o relacionados con productos de LITFIT dentro y fuera de nuestro sitio web. Estas cookies pueden ser utilizadas por plataformas publicitarias como Meta, Google, TikTok u otros proveedores externos para crear audiencias, medir conversiones y optimizar campañas.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-black uppercase text-black mb-4">6. Administración o desactivación de cookies</h3>
          <p className="leading-relaxed mb-4">
            Puedes aceptar, rechazar, bloquear o eliminar cookies desde la configuración de tu navegador. También puedes configurar tu navegador para que te avise cuando un sitio web intente almacenar cookies en tu dispositivo.
          </p>
          <p className="leading-relaxed font-bold text-[#00AAC7]">
            Ten en cuenta que, si decides bloquear algunas cookies, ciertas funciones del sitio web podrían verse limitadas o no funcionar correctamente, especialmente aquellas relacionadas con carrito de compra, formularios, personalización o seguimiento de pedidos.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-black uppercase text-black mb-4">7. Transferencia de datos personales</h3>
          <p className="mb-4">LITFIT podrá compartir tus datos personales con terceros únicamente cuando sea necesario para cumplir con las finalidades descritas en este aviso, tales como:</p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Empresas de mensajería o paquetería.</li>
            <li>Plataformas de pago.</li>
            <li>Proveedores de facturación.</li>
            <li>Servicios contables, fiscales o administrativos.</li>
            <li>Proveedores de hosting, ecommerce, CRM o herramientas tecnológicas.</li>
            <li>Plataformas de marketing, analítica o publicidad digital.</li>
            <li>Autoridades competentes, cuando exista obligación legal.</li>
          </ul>
          <p className="leading-relaxed">
            En todos los casos, LITFIT procurará que los terceros que tengan acceso a datos personales mantengan medidas de confidencialidad, seguridad y protección adecuadas.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-black uppercase text-black mb-4">8. Medidas de seguridad</h3>
          <p className="leading-relaxed mb-4">
            LITFIT implementa medidas administrativas, técnicas y físicas razonables para proteger los datos personales contra daño, pérdida, alteración, destrucción, uso, acceso o tratamiento no autorizado.
          </p>
          <p className="leading-relaxed font-bold text-[#00AAC7]">
            Sin embargo, ningún sistema de transmisión o almacenamiento digital puede garantizar seguridad absoluta. Por ello, recomendamos a los usuarios navegar de forma segura y evitar compartir información confidencial por canales no oficiales.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-black uppercase text-black mb-4">9. Derechos ARCO</h3>
          <p className="leading-relaxed mb-4">
            Como titular de tus datos personales, tienes derecho a acceder, rectificar, cancelar u oponerte al tratamiento de tus datos personales, conocidos como derechos ARCO. También puedes revocar el consentimiento que hayas otorgado para el uso de tus datos.
          </p>
          <p className="leading-relaxed mb-4">Para ejercer cualquiera de estos derechos, deberás enviar una solicitud al correo:</p>
          <p className="font-bold text-lg mb-4"><a href="mailto:litfitmexico@gmail.com" className="text-[#00AAC7] hover:underline">litfitmexico@gmail.com</a></p>
          <p className="mb-4">Tu solicitud deberá incluir:</p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Nombre completo.</li>
            <li>Medio de contacto.</li>
            <li>Derecho que deseas ejercer.</li>
            <li>Descripción clara de la solicitud.</li>
            <li>Documento que acredite tu identidad.</li>
            <li>En caso de rectificación, indicar los datos correctos y anexar documentación que lo justifique, si aplica.</li>
          </ul>
          <p className="leading-relaxed">
            LITFIT responderá la solicitud conforme a los plazos establecidos por la legislación aplicable.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-black uppercase text-black mb-4">10. Revocación del consentimiento para comunicaciones comerciales</h3>
          <p className="leading-relaxed mb-4">
            Puedes solicitar en cualquier momento dejar de recibir comunicaciones promocionales, campañas, newsletters, mensajes comerciales o publicidad personalizada.
          </p>
          <p className="leading-relaxed mb-4">Para hacerlo, puedes escribir a:</p>
          <p className="font-bold text-lg mb-4"><a href="mailto:litfitmexico@gmail.com" className="text-[#00AAC7] hover:underline">litfitmexico@gmail.com</a></p>
          <p className="leading-relaxed">
            También podrás utilizar los mecanismos de baja disponibles en correos electrónicos, formularios o plataformas digitales, cuando estén habilitados.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-black uppercase text-black mb-4">11. Conservación de datos personales</h3>
          <p className="leading-relaxed mb-4">
            Tus datos personales serán conservados durante el tiempo necesario para cumplir con las finalidades descritas en este aviso, así como para atender obligaciones legales, fiscales, administrativas, comerciales o contractuales.
          </p>
          <p className="leading-relaxed">
            Una vez que los datos dejen de ser necesarios, podrán ser eliminados, bloqueados o anonimizados conforme a la legislación aplicable.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-black uppercase text-black mb-4">12. Menores de edad</h3>
          <p className="leading-relaxed mb-4">
            El sitio web y los productos de LITFIT están dirigidos principalmente a personas mayores de edad.
          </p>
          <p className="leading-relaxed mb-4">
            LITFIT no recaba intencionalmente datos personales de menores de edad sin autorización de sus padres, tutores o representantes legales.
          </p>
          <p className="leading-relaxed">
            Si detectamos que se han proporcionado datos personales de un menor sin autorización, podremos eliminarlos de nuestras bases de datos.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-black uppercase text-black mb-4">13. Cambios al Aviso de Privacidad y Uso de Cookies</h3>
          <p className="leading-relaxed mb-4">
            LITFIT se reserva el derecho de modificar, actualizar o cambiar el presente Aviso de Privacidad y Uso de Cookies en cualquier momento, derivado de cambios legales, operativos, comerciales, tecnológicos o por modificaciones en nuestros productos, servicios o sitio web.
          </p>
          <p className="leading-relaxed mb-4">Cualquier cambio será publicado en:</p>
          <p className="font-bold text-lg mb-4"><a href="https://www.litfitmexico.com" className="text-[#00AAC7] hover:underline">www.litfitmexico.com</a></p>
          <p className="leading-relaxed">
            Te recomendamos revisar periódicamente este aviso para conocer cualquier actualización.
          </p>
        </div>
      </div>
    </div>
  );
}
