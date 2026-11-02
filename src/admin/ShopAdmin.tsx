import { useCallback, useEffect, useState } from 'react'
import { fetchProducts, productImageUrl, removeProductImage, uploadProductImage, type Product } from '../data/products'
import { supabase } from '../lib/supabase'
import { Button, Field, Input, Notice } from './ui'

function ProductEditor({ initial, first, last, onMove, onSaved }: {
  initial: Product
  first: boolean
  last: boolean
  onMove: (d: number) => void
  onSaved: () => void
}) {
  const [p, setP] = useState(initial)
  const [price, setPrice] = useState(initial.price?.toString() ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const dirty = JSON.stringify(p) !== JSON.stringify(initial) || price !== (initial.price?.toString() ?? '')

  const save = async (patch: Partial<Product> = {}) => {
    const next = { ...p, ...patch }
    const value = price.trim() === '' ? null : Number(price.replace(',', '.'))
    if (value !== null && (Number.isNaN(value) || value < 0)) return setError('Precio no válido')
    const { error } = await supabase
      .from('products')
      .update({ name: next.name, description: next.description || null, price: value, images: next.images, active: next.active })
      .eq('id', p.id)
    if (error) return setError(error.message)
    setError('')
    onSaved()
  }

  const addImages = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    try {
      const added = []
      for (const f of files) added.push({ path: await uploadProductImage(f), label: f.name.replace(/\.[^.]+$/, '') })
      await save({ images: [...p.images, ...added] })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir la foto')
    }
    setBusy(false)
  }

  const removeImage = async (k: number) => {
    if (!confirm('¿Quitar esta foto?')) return
    const img = p.images[k]
    await save({ images: p.images.filter((_, j) => j !== k) })
    await removeProductImage(img.path)
  }

  const remove = async () => {
    if (!confirm(`¿Borrar «${p.name}» de la tienda?`)) return
    const { error } = await supabase.from('products').delete().eq('id', p.id)
    if (error) return setError(error.message)
    await Promise.all(p.images.map((im) => removeProductImage(im.path)))
    onSaved()
  }

  return (
    <div className={`panel space-y-3 p-4 ${p.active ? '' : 'opacity-60'}`}>
      <div className="flex flex-wrap items-end gap-2">
        <Field label="Artículo" className="min-w-40 flex-1">
          <Input value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} />
        </Field>
        <Field label="Precio (€) · vacío = consultar" className="w-48">
          <Input inputMode="decimal" value={price} placeholder="Consultar" onChange={(e) => setPrice(e.target.value)} />
        </Field>
      </div>
      <Field label="Descripción">
        <Input value={p.description ?? ''} onChange={(e) => setP({ ...p, description: e.target.value })} />
      </Field>

      <div>
        <p className="label-caps mb-2">Fotos {p.images.length > 1 && '· cada una es un modelo'}</p>
        <div className="space-y-2">
          {p.images.map((im, k) => (
            <div key={im.path} className="flex items-center gap-2">
              <img src={productImageUrl(im.path)} alt="" className="size-14 shrink-0 rounded-sm bg-white object-contain" />
              <Input
                value={im.label}
                aria-label="Nombre del modelo"
                onChange={(e) => setP({ ...p, images: p.images.map((x, j) => (j === k ? { ...x, label: e.target.value } : x)) })}
              />
              <Button variant="ghost" className="!px-3" onClick={() => removeImage(k)} aria-label="Quitar foto">✕</Button>
            </div>
          ))}
          <label className={`inline-block cursor-pointer rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15 ${busy ? 'pointer-events-none opacity-50' : ''}`}>
            {busy ? 'Subiendo…' : '+ Añadir fotos'}
            <input type="file" accept="image/png,image/jpeg,image/webp" multiple className="sr-only" onChange={(e) => addImages(e.target.files)} />
          </label>
        </div>
      </div>

      {error && <Notice kind="error">{error}</Notice>}
      <div className="flex flex-wrap gap-2">
        {dirty && <Button onClick={() => save()}>Guardar cambios</Button>}
        <Button variant="ghost" className="!px-3" disabled={first} onClick={() => onMove(-1)} aria-label="Subir">↑</Button>
        <Button variant="ghost" className="!px-3" disabled={last} onClick={() => onMove(1)} aria-label="Bajar">↓</Button>
        <Button variant="ghost" onClick={() => save({ active: !p.active })}>{p.active ? 'Ocultar' : 'Mostrar'}</Button>
        <Button variant="danger" className="ml-auto" onClick={remove}>Borrar</Button>
      </div>
    </div>
  )
}

export function ShopAdmin() {
  const [products, setProducts] = useState<Product[]>([])
  const load = useCallback(async () => setProducts(await fetchProducts(true)), [])
  useEffect(() => {
    load()
  }, [load])

  const add = async () => {
    const sort = Math.max(0, ...products.map((p) => p.sort)) + 1
    await supabase.from('products').insert({ name: 'Nuevo artículo', sort })
    load()
  }

  const move = async (i: number, d: number) => {
    const a = products[i]
    const b = products[i + d]
    if (!b) return
    await supabase.from('products').update({ sort: b.sort === a.sort ? a.sort + d : b.sort }).eq('id', a.id)
    await supabase.from('products').update({ sort: a.sort }).eq('id', b.id)
    load()
  }

  return (
    <div className="space-y-4">
      <Notice>
        Los pedidos llegan por WhatsApp con el artículo y el modelo ya escritos. Si un artículo tiene varias fotos, cada una es un modelo a elegir (por
        ejemplo, las banderas).
      </Notice>
      <Button onClick={add}>+ Nuevo artículo</Button>
      {products.map((p, i) => (
        <ProductEditor
          key={p.id + JSON.stringify(p)}
          initial={p}
          first={i === 0}
          last={i === products.length - 1}
          onMove={(d) => move(i, d)}
          onSaved={load}
        />
      ))}
    </div>
  )
}
