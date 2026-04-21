'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AnnouncementBar from '@/components/AnnouncementBar'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useCart } from '@/context/CartContext'
import { getBoxPrice, getMixBoxPrice, formatMXN, RETRO_SURCHARGE } from '@/lib/pricing'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL']

const TIPOS_SINGLE = [
  { id: 'clubes', label: 'Clubes', desc: 'Clubes nacionales e internacionales', icon: 'stadium' },
  { id: 'selecciones', label: 'Selecciones', desc: 'Temporada mundialista', icon: 'emoji_events' },
  { id: 'retro', label: 'Retro', desc: 'Edición vintage · +$200', icon: 'history' },
]

// Tipos disponibles dentro de cada ficha en modo "Configurar"
const TIPOS_MIX = [
  { id: 'clubes', label: 'Clubes', icon: 'stadium', retro: false },
  { id: 'selecciones', label: 'Selecciones', icon: 'emoji_events', retro: false },
  { id: 'retro', label: 'Retro +$200', icon: 'history', retro: true },
]

const BOX_LABELS: Record<string, { name: string; jerseys: number }> = {
  debutante: { name: 'Debutante', jerseys: 1 },
  doble: { name: 'Doblete', jerseys: 2 },
  'hat-trick': { name: 'Hat-Trick', jerseys: 3 },
  'jersey-club': { name: 'Poker', jerseys: 4 },
}

const CATEGORIA_TO_TIPO: Record<string, string> = {
  Clubes: 'clubes',
  Selecciones: 'selecciones',
  Retro: 'retro',
}

const ESTAMPADO_PRICE = 20000

// Modo de la caja: presets (una talla) o mix (ficha por jersey)
type BoxMode = 'clubes' | 'selecciones' | 'retro' | 'mix'

type JerseySlot = {
  talla: string
  tipo: string
  estampado: boolean
  nombreEstampado: string
  numeroEstampado: string
}

const BOX_MODES: { id: BoxMode; label: string; desc: string; icon: string; accent: 'green' | 'amber' | 'blue' }[] = [
  { id: 'clubes',      label: 'Todo Clubes',      desc: 'Una talla · todos clubes',          icon: 'stadium',      accent: 'green' },
  { id: 'selecciones', label: 'Todo Selecciones',  desc: 'Una talla · todas selecciones',     icon: 'emoji_events', accent: 'green' },
  { id: 'retro',       label: 'Todo Retro',        desc: 'Una talla · +$200 por jersey',      icon: 'history',      accent: 'amber' },
  { id: 'mix',         label: 'Configurar',        desc: 'Tipo y talla diferente por jersey', icon: 'tune',         accent: 'blue'  },
]

const ACCENT_STYLES = {
  green: { border: 'border-primary', bg: 'bg-emerald-50', icon: 'text-primary', badge: 'text-primary' },
  amber: { border: 'border-amber-500', bg: 'bg-amber-50', icon: 'text-amber-500', badge: 'text-amber-500' },
  blue:  { border: 'border-blue-500',  bg: 'bg-blue-50',  icon: 'text-blue-500',  badge: 'text-blue-500'  },
}

function ConfiguradorContent() {
  const router = useRouter()
  const params = useSearchParams()
  const boxId = params.get('box') ?? 'debutante'
  const categoria = params.get('categoria') ?? 'Clubes'

  const boxInfo = BOX_LABELS[boxId] ?? BOX_LABELS.debutante
  const { addItem } = useCart()
  const isMultiJersey = boxInfo.jerseys > 1
  const initialTipo = CATEGORIA_TO_TIPO[categoria] ?? 'clubes'

  // ── Estado debutante (flujo simple) ──────────────────
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedTipo, setSelectedTipo] = useState(initialTipo)
  const [estampado, setEstampado] = useState(false)
  const [nombreEstampado, setNombreEstampado] = useState('')
  const [numeroEstampado, setNumeroEstampado] = useState('')

  // ── Estado multi-jersey ───────────────────────────────
  const initMode: BoxMode = initialTipo === 'retro' ? 'retro' : initialTipo === 'selecciones' ? 'selecciones' : 'clubes'
  const [boxMode, setBoxMode] = useState<BoxMode>(initMode)
  const [presetTalla, setPresetTalla] = useState('M') // talla única para modos preset
  const [jerseySlots, setJerseySlots] = useState<JerseySlot[]>(
    Array.from({ length: boxInfo.jerseys }, () => ({
      talla: 'M',
      tipo: initialTipo === 'retro' ? 'clubes' : initialTipo,
      estampado: false,
      nombreEstampado: '',
      numeroEstampado: '',
    }))
  )

  function changeBoxMode(mode: BoxMode) {
    setBoxMode(mode)
    // Al cambiar a preset, actualizar tipo de los slots para coherencia interna
    if (mode !== 'mix') {
      setJerseySlots((prev) => prev.map((s) => ({ ...s, tipo: mode === 'retro' ? 'retro' : s.tipo })))
    }
  }

  function updateSlot(index: number, field: keyof JerseySlot, value: string | boolean) {
    setJerseySlots((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }

  // ── Estado compartido ─────────────────────────────────
  const [exclusiones, setExclusiones] = useState<string[]>([])
  const [editingSlot, setEditingSlot] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [mensajeRegalo, setMensajeRegalo] = useState('')
  const [added, setAdded] = useState(false)

  function confirmSlot() {
    const trimmed = editingValue.trim()
    if (trimmed && !exclusiones.includes(trimmed)) setExclusiones([...exclusiones, trimmed])
    setEditingSlot(null)
    setEditingValue('')
  }

  function removeExclusion(eq: string) {
    setExclusiones(exclusiones.filter((e) => e !== eq))
  }

  // ── Precio ────────────────────────────────────────────
  const isMixMode = isMultiJersey && boxMode === 'mix'
  const isPresetMode = isMultiJersey && boxMode !== 'mix'
  // El extra de estampado (sección abajo) aplica en debutante y modos preset
  const showExtraEstampado = !isMultiJersey || isPresetMode

  let computedPrice: number
  if (!isMultiJersey) {
    computedPrice = getBoxPrice(boxId, selectedTipo) + (estampado ? ESTAMPADO_PRICE : 0)
  } else if (isMixMode) {
    const slotEstampadoCount = jerseySlots.filter((s) => s.estampado).length
    computedPrice = getMixBoxPrice(boxId, jerseySlots) + slotEstampadoCount * ESTAMPADO_PRICE
  } else {
    // Preset: clubes/selecciones/retro → getBoxPrice ya incluye el surcharge de retro
    computedPrice = getBoxPrice(boxId, boxMode) + (estampado ? ESTAMPADO_PRICE : 0)
  }
  const computedPriceDisplay = formatMXN(computedPrice)

  const canAdd = isMultiJersey ? true : !!selectedTipo

  function handleAgregarAlCarrito() {
    let tipo: string
    let talla: string
    let slots: { talla: string; tipo: string; estampado?: boolean; nombreEstampado?: string; numeroEstampado?: string }[] | undefined
    let topEstampado: boolean | undefined
    let topNombre: string | undefined
    let topNumero: string | undefined

    if (!isMultiJersey) {
      tipo = selectedTipo
      talla = selectedSize
      topEstampado = estampado
      topNombre = estampado ? nombreEstampado.trim() || undefined : undefined
      topNumero = estampado ? numeroEstampado.trim() || undefined : undefined
    } else if (isMixMode) {
      tipo = 'mix'
      talla = jerseySlots[0].talla
      slots = jerseySlots.map((s) => ({
        talla: s.talla,
        tipo: s.tipo,
        estampado: s.estampado || undefined,
        nombreEstampado: s.estampado ? s.nombreEstampado.trim() || undefined : undefined,
        numeroEstampado: s.estampado ? s.numeroEstampado.trim() || undefined : undefined,
      }))
    } else {
      // Preset
      tipo = boxMode
      talla = presetTalla
      topEstampado = estampado
      topNombre = estampado ? nombreEstampado.trim() || undefined : undefined
      topNumero = estampado ? numeroEstampado.trim() || undefined : undefined
    }

    addItem({
      boxId,
      boxName: `Mystery Box ${boxInfo.name}`,
      categoria,
      talla,
      tipo,
      jerseySlots: slots,
      exclusiones,
      mensajeRegalo: mensajeRegalo.trim() || undefined,
      estampado: topEstampado,
      nombreEstampado: topNombre,
      numeroEstampado: topNumero,
      price: computedPrice,
      priceDisplay: computedPriceDisplay,
      jerseys: boxInfo.jerseys,
    })
    setAdded(true)
    setTimeout(() => router.push('/carrito'), 800)
  }

  return (
    <div className="bg-surface text-on-surface">
      <AnnouncementBar />
      <Navbar />

      <main className="max-w-screen-2xl mx-auto px-6 py-12 lg:py-20 flex flex-col lg:flex-row gap-12">
        <section className="flex-grow space-y-16">
          <header>
            <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase mb-2 font-label">
              Personalización
            </p>
            <h1 className="font-headline font-black text-4xl md:text-6xl text-on-surface tracking-tighter uppercase leading-none">
              Personaliza tu{' '}
              <br />
              <span className="text-gradient-primary">Experiencia</span>
            </h1>
          </header>

          {/* ════════════ DEBUTANTE ════════════ */}
          {!isMultiJersey && (
            <>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="font-headline font-black text-2xl text-primary/20">01</span>
                  <h2 className="font-headline font-bold text-xl uppercase tracking-tight">Selecciona tu Talla</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`border-2 p-6 rounded-lg transition-all flex flex-col items-center gap-2 ${
                        selectedSize === size
                          ? 'border-primary bg-primary-container text-white'
                          : 'border-outline-variant hover:border-primary'
                      }`}
                    >
                      <span className="text-2xl font-black font-headline">{size}</span>
                      <span className={`text-[10px] uppercase font-bold tracking-widest ${selectedSize === size ? 'text-on-primary-container' : 'text-secondary'}`}>
                        {size === 'XS' ? 'Extra Small' : size === 'S' ? 'Small' : size === 'M' ? 'Medium' : size === 'L' ? 'Large' : size === 'XL' ? 'X-Large' : '2X-Large'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="font-headline font-black text-2xl text-primary/20">02</span>
                  <h2 className="font-headline font-bold text-xl uppercase tracking-tight">Tipo de Jersey</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {TIPOS_SINGLE.map((tipo) => (
                    <button
                      key={tipo.id}
                      onClick={() => setSelectedTipo(tipo.id)}
                      className={`border-2 p-6 rounded-xl transition-all text-left flex flex-col gap-3 ${
                        selectedTipo === tipo.id
                          ? 'border-primary bg-emerald-50 shadow-md'
                          : 'border-outline-variant hover:border-primary'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-3xl ${selectedTipo === tipo.id ? 'text-primary' : 'text-zinc-400'}`}>
                        {tipo.icon}
                      </span>
                      <div>
                        <p className="font-headline font-black text-lg uppercase tracking-tight">{tipo.label}</p>
                        <p className="text-xs text-on-surface-variant font-medium">{tipo.desc}</p>
                      </div>
                      {selectedTipo === tipo.id && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Seleccionado ✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ════════════ MULTI-JERSEY ════════════ */}
          {isMultiJersey && (
            <>
              {/* Step 01: Tipo de caja */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-headline font-black text-2xl text-primary/20">01</span>
                  <h2 className="font-headline font-bold text-xl uppercase tracking-tight">Tipo de Caja</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {BOX_MODES.map((opt) => {
                    const a = ACCENT_STYLES[opt.accent]
                    const active = boxMode === opt.id
                    return (
                      <button
                        key={opt.id}
                        onClick={() => changeBoxMode(opt.id)}
                        className={`flex flex-col gap-3 p-5 rounded-xl border-2 text-left transition-all ${
                          active ? `${a.border} ${a.bg} shadow-md` : 'border-outline-variant hover:border-primary'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-3xl ${active ? a.icon : 'text-zinc-400'}`}>
                          {opt.icon}
                        </span>
                        <div>
                          <p className="font-headline font-black text-sm uppercase tracking-tight leading-tight">{opt.label}</p>
                          <p className="text-[10px] text-on-surface-variant font-medium mt-1 leading-snug">{opt.desc}</p>
                        </div>
                        {active && (
                          <span className={`text-[10px] font-black uppercase tracking-widest ${a.badge}`}>
                            Seleccionado ✓
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Step 02 — Preset (clubes / selecciones / retro): una sola talla */}
              {isPresetMode && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="font-headline font-black text-2xl text-primary/20">02</span>
                    <h2 className="font-headline font-bold text-xl uppercase tracking-tight">
                      Talla <span className="text-sm font-medium text-on-surface-variant normal-case tracking-normal">(aplica a todos los jerseys)</span>
                    </h2>
                  </div>
                  {boxMode === 'retro' && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                      <span className="material-symbols-outlined text-amber-500 text-base">info</span>
                      <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">
                        Retro: +${RETRO_SURCHARGE / 100} por jersey ({boxInfo.jerseys} jerseys = +${(RETRO_SURCHARGE * boxInfo.jerseys) / 100} total)
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => setPresetTalla(size)}
                        className={`border-2 p-4 rounded-lg transition-all flex flex-col items-center gap-1 ${
                          presetTalla === size
                            ? boxMode === 'retro'
                              ? 'border-amber-500 bg-amber-50 text-amber-700'
                              : 'border-primary bg-primary-container text-white'
                            : 'border-outline-variant hover:border-primary'
                        }`}
                      >
                        <span className="text-xl font-black font-headline">{size}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 02 — Mix: ficha por jersey con tipo + talla + estampado */}
              {isMixMode && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="font-headline font-black text-2xl text-primary/20">02</span>
                    <h2 className="font-headline font-bold text-xl uppercase tracking-tight">Configura cada Jersey</h2>
                  </div>
                  <div className="space-y-4">
                    {jerseySlots.map((slot, index) => (
                      <div key={index} className="bg-surface-container rounded-xl p-6 space-y-4">
                        {/* Header */}
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <p className="font-headline font-black text-sm uppercase tracking-tight">Jersey {index + 1}</p>
                        </div>

                        {/* Tipo */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Tipo</p>
                          <div className="grid grid-cols-3 gap-2">
                            {TIPOS_MIX.map((tipo) => (
                              <button
                                key={tipo.id}
                                onClick={() => updateSlot(index, 'tipo', tipo.id)}
                                className={`flex flex-col items-center gap-1.5 px-3 py-3 border-2 rounded-xl transition-all ${
                                  slot.tipo === tipo.id
                                    ? tipo.retro
                                      ? 'border-amber-500 bg-amber-50'
                                      : 'border-primary bg-emerald-50'
                                    : 'border-outline-variant hover:border-primary'
                                }`}
                              >
                                <span className={`material-symbols-outlined text-xl ${
                                  slot.tipo === tipo.id
                                    ? tipo.retro ? 'text-amber-500' : 'text-primary'
                                    : 'text-zinc-400'
                                }`}>
                                  {tipo.icon}
                                </span>
                                <span className={`text-[10px] font-black uppercase tracking-tight text-center leading-tight ${
                                  slot.tipo === tipo.id
                                    ? tipo.retro ? 'text-amber-600' : 'text-primary'
                                    : 'text-zinc-500'
                                }`}>
                                  {tipo.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Talla */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Talla</p>
                          <div className="flex flex-wrap gap-2">
                            {SIZES.map((size) => (
                              <button
                                key={size}
                                onClick={() => updateSlot(index, 'talla', size)}
                                className={`px-3 py-2 border-2 rounded-lg text-xs font-black uppercase transition-all ${
                                  slot.talla === size
                                    ? 'border-primary bg-primary-container text-white'
                                    : 'border-outline-variant hover:border-primary'
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Estampado toggle */}
                        <button
                          onClick={() => updateSlot(index, 'estampado', !slot.estampado)}
                          className={`w-full flex items-center justify-between gap-3 px-4 py-3 border-2 rounded-xl transition-all text-left ${
                            slot.estampado ? 'border-primary bg-emerald-50' : 'border-outline-variant hover:border-primary'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`material-symbols-outlined text-xl ${slot.estampado ? 'text-primary' : 'text-zinc-400'}`}>style</span>
                            <div>
                              <p className="text-xs font-black uppercase tracking-tight">Estampado</p>
                              <p className="text-[10px] text-on-surface-variant font-medium">Nombre y número personalizados</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end shrink-0">
                            <span className={`text-sm font-black font-headline ${slot.estampado ? 'text-primary' : 'text-zinc-400'}`}>+$200</span>
                            {slot.estampado && <span className="text-[9px] font-black text-primary uppercase">✓</span>}
                          </div>
                        </button>

                        {/* Datos del estampado */}
                        {slot.estampado && (
                          <div className="grid grid-cols-2 gap-3 bg-white rounded-lg p-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">
                                Nombre <span className="text-zinc-400 normal-case tracking-normal font-normal">(máx. 6)</span>
                              </label>
                              <input
                                type="text"
                                maxLength={6}
                                value={slot.nombreEstampado}
                                onChange={(e) => updateSlot(index, 'nombreEstampado', e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]/g, '').toUpperCase())}
                                placeholder="LOPEZ"
                                className="w-full border-2 border-outline-variant rounded-lg px-3 py-2 text-xs font-black uppercase tracking-widest outline-none focus:border-primary placeholder:text-zinc-300 placeholder:font-normal placeholder:tracking-normal placeholder:normal-case"
                              />
                              <p className="text-[9px] text-zinc-400">{slot.nombreEstampado.length}/6</p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">
                                Número <span className="text-zinc-400 normal-case tracking-normal font-normal">(2 dígitos)</span>
                              </label>
                              <input
                                type="text"
                                maxLength={2}
                                value={slot.numeroEstampado}
                                onChange={(e) => updateSlot(index, 'numeroEstampado', e.target.value.replace(/\D/g, ''))}
                                placeholder="10"
                                className="w-full border-2 border-outline-variant rounded-lg px-3 py-2 text-xs font-black tracking-widest outline-none focus:border-primary placeholder:text-zinc-300 placeholder:font-normal"
                              />
                              <p className="text-[9px] text-zinc-400">{slot.numeroEstampado.length}/2</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Step 3: Exclusiones */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="font-headline font-black text-2xl text-primary/20">03</span>
              <h2 className="font-headline font-bold text-xl uppercase tracking-tight">Equipos Excluidos</h2>
            </div>
            <div className="bg-surface-container p-8 rounded-xl space-y-4">
              <p className="text-sm text-on-surface-variant leading-relaxed max-w-xl">
                ¿Hay algún equipo que prefieras no recibir? Haz clic en un chip vacío y escribe el nombre.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, i) => {
                  const equipo = exclusiones[i]
                  const isEditing = editingSlot === i
                  const isNextAvailable = !equipo && !isEditing && i === exclusiones.length
                  if (equipo) return (
                    <div key={i} className="flex items-center justify-between gap-2 bg-white border-2 border-primary/30 px-4 py-3 rounded-xl min-h-[52px]">
                      <span className="text-xs font-black uppercase tracking-wide truncate">{equipo}</span>
                      <button onClick={() => removeExclusion(equipo)} className="material-symbols-outlined text-base text-zinc-400 hover:text-error transition-colors shrink-0">close</button>
                    </div>
                  )
                  if (isEditing) return (
                    <div key={i} className="border-2 border-primary bg-white rounded-xl min-h-[52px] px-3 flex items-center">
                      <input
                        autoFocus
                        className="w-full text-xs font-black uppercase tracking-wide outline-none bg-transparent placeholder:text-zinc-300 placeholder:normal-case placeholder:tracking-normal"
                        placeholder="Equipo..."
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') confirmSlot(); if (e.key === 'Escape') { setEditingSlot(null); setEditingValue('') } }}
                        onBlur={confirmSlot}
                      />
                    </div>
                  )
                  if (isNextAvailable) return (
                    <button key={i} onClick={() => { setEditingSlot(i); setEditingValue('') }}
                      className="flex items-center justify-center gap-2 border-2 border-dashed border-outline-variant/50 hover:border-primary hover:bg-white transition-all rounded-xl min-h-[52px] group">
                      <span className="material-symbols-outlined text-base text-zinc-300 group-hover:text-primary transition-colors">add</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300 group-hover:text-primary transition-colors">Agregar</span>
                    </button>
                  )
                  return (
                    <div key={i} className="flex items-center justify-center border-2 border-dashed border-outline-variant/20 rounded-xl min-h-[52px]">
                      <span className="text-[10px] font-bold tracking-widest text-zinc-200">{i + 1}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Step 4: Mensaje de regalo */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="font-headline font-black text-2xl text-primary/20">04</span>
              <h2 className="font-headline font-bold text-xl uppercase tracking-tight">Mensaje de Regalo</h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">Opcional</span>
            </div>
            <div className="bg-surface-container p-8 rounded-xl space-y-4">
              <p className="text-sm text-on-surface-variant leading-relaxed max-w-xl">
                ¿Es un regalo? Escribe un mensaje y lo incluimos en el paquete.
              </p>
              <div className="relative">
                <textarea
                  maxLength={150}
                  rows={3}
                  value={mensajeRegalo}
                  onChange={(e) => setMensajeRegalo(e.target.value)}
                  placeholder="Ej: ¡Feliz cumpleaños! Espero que disfrutes tu jersey sorpresa"
                  className="w-full border-2 border-outline-variant rounded-xl px-4 py-3 text-sm font-medium resize-none outline-none focus:border-primary transition-colors placeholder:text-zinc-300"
                />
                <span className={`absolute bottom-3 right-4 text-[10px] font-bold ${mensajeRegalo.length >= 140 ? 'text-red-400' : 'text-zinc-300'}`}>
                  {mensajeRegalo.length}/150
                </span>
              </div>
            </div>
          </div>

          {/* Extra: Estampado — solo debutante y modos preset */}
          {showExtraEstampado && (
            <div className="space-y-4">
              <h2 className="font-headline font-bold text-xl uppercase tracking-tight">Extra</h2>
              <button
                onClick={() => setEstampado((prev) => !prev)}
                className={`w-full flex items-center justify-between gap-4 p-6 rounded-xl border-2 transition-all text-left ${
                  estampado ? 'border-primary bg-emerald-50 shadow-md' : 'border-outline-variant hover:border-primary'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`material-symbols-outlined text-3xl ${estampado ? 'text-primary' : 'text-zinc-400'}`}>style</span>
                  <div>
                    <p className="font-headline font-black text-lg uppercase tracking-tight">Jersey Estampado</p>
                    <p className="text-xs text-on-surface-variant font-medium">Personaliza tu jersey con nombre y número</p>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className={`text-lg font-black font-headline ${estampado ? 'text-primary' : 'text-zinc-400'}`}>+$200</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${estampado ? 'text-primary' : 'text-zinc-300'}`}>
                    {estampado ? 'Seleccionado ✓' : 'MXN'}
                  </span>
                </div>
              </button>

              {estampado && (
                <div className="grid grid-cols-2 gap-4 bg-surface-container p-6 rounded-xl">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                      Nombre <span className="text-zinc-400 font-normal normal-case tracking-normal">(máx. 6 letras)</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={nombreEstampado}
                      onChange={(e) => setNombreEstampado(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]/g, '').toUpperCase())}
                      placeholder="LOPEZ"
                      className="w-full border-2 border-outline-variant rounded-lg px-4 py-3 text-sm font-black uppercase tracking-widest outline-none focus:border-primary transition-colors placeholder:text-zinc-300 placeholder:normal-case placeholder:tracking-normal placeholder:font-normal"
                    />
                    <p className="text-[9px] text-zinc-400">{nombreEstampado.length}/6</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                      Número <span className="text-zinc-400 font-normal normal-case tracking-normal">(2 dígitos)</span>
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={numeroEstampado}
                      onChange={(e) => setNumeroEstampado(e.target.value.replace(/\D/g, ''))}
                      placeholder="10"
                      className="w-full border-2 border-outline-variant rounded-lg px-4 py-3 text-sm font-black tracking-widest outline-none focus:border-primary transition-colors placeholder:text-zinc-300 placeholder:font-normal"
                    />
                    <p className="text-[9px] text-zinc-400">{numeroEstampado.length}/2</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Sidebar ─────────────────────────────────── */}
        <aside className="w-full lg:w-96 shrink-0">
          <div className="sticky top-32 space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/10 space-y-8">
              <h3 className="font-headline font-black text-2xl uppercase tracking-tighter">Tu Selección</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-surface-container">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">Producto</span>
                  <span className="text-sm font-bold uppercase">{boxInfo.name} ({boxInfo.jerseys} jersey{boxInfo.jerseys > 1 ? 's' : ''})</span>
                </div>

                {/* Debutante */}
                {!isMultiJersey && (
                  <>
                    <div className="flex justify-between items-center py-3 border-b border-surface-container">
                      <span className="text-xs font-bold uppercase tracking-wider text-secondary">Talla</span>
                      <span className="text-sm font-bold uppercase">{selectedSize}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-surface-container">
                      <span className="text-xs font-bold uppercase tracking-wider text-secondary">Tipo</span>
                      <span className="text-sm font-bold uppercase">
                        {TIPOS_SINGLE.find((t) => t.id === selectedTipo)?.label ?? '—'}
                      </span>
                    </div>
                  </>
                )}

                {/* Preset (una talla) */}
                {isPresetMode && (
                  <>
                    <div className="flex justify-between items-center py-3 border-b border-surface-container">
                      <span className="text-xs font-bold uppercase tracking-wider text-secondary">Tipo</span>
                      <span className={`text-sm font-bold uppercase ${boxMode === 'retro' ? 'text-amber-600' : ''}`}>
                        {BOX_MODES.find((m) => m.id === boxMode)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-surface-container">
                      <span className="text-xs font-bold uppercase tracking-wider text-secondary">Talla (todos)</span>
                      <span className="text-sm font-bold uppercase">{presetTalla}</span>
                    </div>
                  </>
                )}

                {/* Mix: ficha por jersey */}
                {isMixMode && (
                  <div className="py-3 border-b border-surface-container space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-2">Configurar</p>
                    {jerseySlots.map((slot, i) => (
                      <div key={i} className="text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-secondary uppercase tracking-wider">Jersey {i + 1}</span>
                          <span className={`font-bold uppercase ${slot.tipo === 'retro' ? 'text-amber-600' : ''}`}>
                            {slot.tipo} · {slot.talla}
                          </span>
                        </div>
                        {slot.estampado && (
                          <p className="text-[9px] text-primary font-black text-right mt-0.5">
                            Estampado: {slot.nombreEstampado || '—'} #{slot.numeroEstampado || '—'} (+$200)
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {exclusiones.length > 0 && (
                  <div className="flex justify-between items-start py-3 border-b border-surface-container">
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary">Exclusiones</span>
                    <div className="text-right">
                      {exclusiones.map((eq) => (
                        <p key={eq} className="text-[10px] font-bold uppercase">{eq}</p>
                      ))}
                    </div>
                  </div>
                )}

                {mensajeRegalo.trim() && (
                  <div className="flex justify-between items-start py-3 border-b border-surface-container">
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary shrink-0 mr-3">Regalo</span>
                    <p className="text-[10px] font-bold text-right leading-relaxed">{mensajeRegalo}</p>
                  </div>
                )}

                {estampado && showExtraEstampado && (
                  <div className="py-3 border-b border-surface-container space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-secondary">Estampado</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-1 bg-primary/10 text-primary rounded">+$200</span>
                    </div>
                    {(nombreEstampado || numeroEstampado) && (
                      <div className="flex gap-3 justify-end">
                        {nombreEstampado && <span className="text-[10px] font-black uppercase tracking-widest">{nombreEstampado}</span>}
                        {numeroEstampado && <span className="text-[10px] font-black">#{numeroEstampado}</span>}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center py-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">Envío</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-1 bg-emerald-100 text-emerald-800 rounded">Gratis</span>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider">Total</span>
                  <span className="text-4xl font-black font-headline text-primary">{computedPriceDisplay}</span>
                </div>
                <button
                  onClick={handleAgregarAlCarrito}
                  disabled={added || !canAdd}
                  className={`w-full py-5 rounded-lg font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-3 ${
                    added
                      ? 'bg-emerald-500 text-white scale-95'
                      : !canAdd
                      ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                      : 'kinetic-gradient text-on-primary shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  {added ? (
                    <><span className="material-symbols-outlined text-lg">check_circle</span>Agregado al Carrito</>
                  ) : (
                    <><span className="material-symbols-outlined text-lg">shopping_bag</span>Añadir al Carrito</>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-lg">
                <span className="material-symbols-outlined text-primary">verified</span>
                <p className="text-[10px] font-bold uppercase tracking-tight leading-tight">Garantía de KINETIC PRECISION</p>
              </div>
            </div>

            <div className="bg-primary-container p-8 rounded-xl text-on-primary-container relative overflow-hidden">
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12">local_shipping</span>
              <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Promoción Activa</p>
              <h4 className="font-headline font-black text-xl uppercase leading-none mb-4">Envío Gratuito <br />Confirmado</h4>
              <p className="text-xs leading-relaxed opacity-90">Tu configuración califica para envío express sin costo adicional.</p>
            </div>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  )
}

export default function ConfigurarPage() {
  return (
    <Suspense>
      <ConfiguradorContent />
    </Suspense>
  )
}
