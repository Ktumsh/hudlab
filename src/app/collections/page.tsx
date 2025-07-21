export default function CollectionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Mis Colecciones</h1>
        <p className="text-base-content/70">
          Organiza tus uploads favoritos en colecciones temáticas
        </p>
      </div>

      <div className="grid gap-6">
        {/* TODO: Implementar grid de colecciones */}
        <div className="py-12 text-center">
          <p className="text-base-content/60">
            Aún no has creado ninguna colección.
          </p>
          <button className="btn btn-primary mt-4">
            Crear mi primera colección
          </button>
        </div>
      </div>
    </div>
  );
}
