import Link from 'next/link'

export default function AnnulationPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg text-center space-y-6">
        <div className="text-5xl text-gray-400">✕</div>
        <h1 className="font-serif text-3xl text-white">Paiement annulé</h1>
        <p className="text-gray-400">
          Votre paiement a été annulé. Votre réservation n&apos;a pas été confirmée.
          Les dates sont toujours disponibles.
        </p>
        <Link href="/" className="btn-gold inline-block">
          ← Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  )
}
