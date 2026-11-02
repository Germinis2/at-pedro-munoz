import { useEffect, useState } from 'react'
import { WhatsAppIcon } from '../components/Icons'
import { club } from '../data/club'
import { fetchProducts, fmtPrice, orderText, productImageUrl, whatsappUrl, type Product } from '../data/products'

function WhatsAppButton({ href, children, className = '' }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex -skew-x-12 items-center justify-center gap-2 bg-[#25D366] px-5 py-3 font-display text-base font-extrabold uppercase italic tracking-wide text-[#073b1c] transition hover:bg-[#3be37a] ${className}`}
    >
      <span className="flex skew-x-12 items-center gap-2">
        <WhatsAppIcon className="size-5" />
        {children}
      </span>
    </a>
  )
}

function ProductCard({ p }: { p: Product }) {
  const [i, setI] = useState(0)
  const img = p.images[i]
  return (
    <article className="panel flex flex-col overflow-hidden">
      <div className="relative grid aspect-square place-items-center bg-white">
        {img ? (
          <img src={productImageUrl(img.path)} alt={`${p.name}${p.images.length > 1 ? ` · ${img.label}` : ''}`} loading="lazy" className="size-full object-contain" />
        ) : (
          <span className="text-sm text-club-800/50">Sin foto</span>
        )}
        <span className="absolute left-3 top-3 -skew-x-12 bg-club-600 px-3 py-1 font-display text-lg font-extrabold">
          <span className="block skew-x-12">{fmtPrice(p.price)}</span>
        </span>
      </div>
      {p.images.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-white/10 p-2">
          {p.images.map((im, k) => (
            <button
              key={im.path}
              onClick={() => setI(k)}
              aria-label={im.label}
              className={`size-14 shrink-0 overflow-hidden rounded-sm border-2 bg-white ${k === i ? 'border-club-500' : 'border-transparent opacity-70'}`}
            >
              <img src={productImageUrl(im.path)} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold uppercase italic leading-none">{p.name}</h2>
          {p.images.length > 1 && img && <p className="mt-1 font-display text-sm font-bold uppercase tracking-wider text-club-300">{img.label}</p>}
          {p.description && <p className="mt-2 text-sm text-white/70">{p.description}</p>}
        </div>
        <WhatsAppButton href={whatsappUrl(orderText(p, img?.label))} className="mt-auto">Pedir por WhatsApp</WhatsAppButton>
      </div>
    </article>
  )
}

export function Shop() {
  const [products, setProducts] = useState<Product[] | null>(null)
  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => setProducts([]))
  }, [])

  return (
    <section className="space-y-8">
      <div>
        <p className="label-caps">{club.name}</p>
        <h1 className="font-display text-5xl font-extrabold uppercase italic leading-none md:text-6xl">Tienda</h1>
        <p className="mt-3 max-w-xl text-white/70">
          Pide lo que quieras por WhatsApp: te confirmamos disponibilidad, talla y cómo recogerlo. Cada compra ayuda al club.
        </p>
      </div>

      {products === null ? (
        <p className="text-white/50">Cargando…</p>
      ) : products.length === 0 ? (
        <p className="panel p-6 text-center text-white/60">Ahora mismo no hay artículos. Escríbenos y te contamos.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}

      <div className="panel flex flex-col items-center gap-3 p-6 text-center">
        <p className="font-display text-xl font-extrabold uppercase italic">¿Buscas otra cosa o tienes dudas?</p>
        <WhatsAppButton href={whatsappUrl(`¡Hola! Tengo una consulta sobre la tienda del ${club.shortName}.`)}>Escríbenos</WhatsAppButton>
      </div>
    </section>
  )
}
