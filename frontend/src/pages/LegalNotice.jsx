export default function LegalNotice() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-white">Mentions légales</h1>
      <div className="mt-6 space-y-6 text-sm text-gray-400">
        <section>
          <h2 className="mb-2 font-semibold text-white">Éditeur du site</h2>
          <p>Cyna — [raison sociale à compléter]<br />[adresse à compléter]<br />Contact : support@cyna.fr</p>
        </section>
        <section>
          <h2 className="mb-2 font-semibold text-white">Hébergement</h2>
          <p>[hébergeur à compléter]</p>
        </section>
        <section>
          <h2 className="mb-2 font-semibold text-white">Directeur de la publication</h2>
          <p>[nom à compléter]</p>
        </section>
      </div>
      <p className="mt-8 text-xs text-gray-600">
        Cette page est un modèle à compléter avec les informations légales réelles de votre société avant mise en production.
      </p>
    </div>
  );
}
