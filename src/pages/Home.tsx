// Landing page: propuesta de valor del producto para corredores nuevos.
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";

export function Home() {
  return (
    <div>
      <Navbar />
      <section className="text-center px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Todos tus clientes y propiedades, en un solo lugar
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto mb-8">
          Dejá los papelitos y los Excels ilegibles. InmoFlow unifica los datos de tus clientes
          y tu cartera de propiedades, y te avisa apenas hay un match antes de que el cliente se enfríe.
        </p>
        <Link
          to="/login"
          className="inline-block bg-gray-900 text-white px-7 py-3 rounded-lg text-lg hover:bg-gray-800"
        >
          Empezá gratis 14 días
        </Link>
      </section>

      <section className="grid gap-8 px-6 py-12 max-w-4xl mx-auto sm:grid-cols-2">
        <div>
          <h3 className="font-semibold text-lg mb-1">Alta de propiedades en 30 segundos</h3>
          <p className="text-gray-600">Cargá una propiedad nueva desde el celular, en la calle, sin perder tiempo con formularios eternos.</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1">Compartí por WhatsApp con un click</h3>
          <p className="text-gray-600">Fichas de propiedad livianas y con buena vista previa — sin PDFs pesados ni links de portales con la competencia.</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1">Matching automático</h3>
          <p className="text-gray-600">El sistema te avisa cuando una propiedad de tu cartera encaja con un cliente, antes de que se enfríe.</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1">
            Publicá en varios portales con un click{" "}
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full font-normal">Próximamente</span>
          </h3>
          <p className="text-gray-600">Estamos trabajando para que puedas publicar en Zonaprop, Argenprop y más, sin cargar todo dos veces.</p>
        </div>
      </section>
    </div>
  );
}