import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-ink text-paper">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:gap-0">
        <p className="text-sm text-ink/50">
          &copy; 2024 Cyna. Tous droits réservés.
        </p>
        <div className="flex gap-4">
          <Link to="/privacy" className="text-sm text-ink/50 hover:text-ink/80">
            Politique de confidentialité
          </Link>
          <Link to="/terms" className="text-sm text-ink/50 hover:text-ink/80">
            Conditions d'utilisation
          </Link>
        </div>
      </div>
    </footer>
  )
}