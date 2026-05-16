'use client'

import { useState, useRef, useEffect } from 'react'

const CITIES = [
  'A Coruña', 'Albacete', 'Alcalá de Henares', 'Alcobendas', 'Alcorcón',
  'Algeciras', 'Alicante', 'Almería', 'Badajoz', 'Badalona', 'Barakaldo',
  'Barcelona', 'Bilbao', 'Burgos', 'Cáceres', 'Cádiz', 'Cartagena',
  'Castellón de la Plana', 'Córdoba', 'Dos Hermanas', 'Elche', 'Fuenlabrada',
  'Getafe', 'Gijón', 'Girona', 'Granada', 'Guadalajara', 'Hospitalet de Llobregat',
  'Huelva', 'Jaén', 'Jerez de la Frontera', 'Las Palmas de Gran Canaria',
  'Las Rozas de Madrid', 'Leganés', 'León', 'Lleida', 'Logroño', 'Lugo',
  'Madrid', 'Majadahonda', 'Málaga', 'Marbella', 'Mataró', 'Móstoles',
  'Murcia', 'Ourense', 'Oviedo', 'Palma', 'Pamplona', 'Parla', 'Pozuelo de Alarcón',
  'Reus', 'Sabadell', 'Salamanca', 'San Sebastián', 'Santa Cruz de Tenerife',
  'Santa Coloma de Gramenet', 'Santander', 'Santiago de Compostela', 'Sevilla',
  'Tarragona', 'Telde', 'Terrassa', 'Toledo', 'Torrejón de Ardoz', 'Valencia',
  'Valladolid', 'Vigo', 'Vitoria-Gasteiz', 'Zaragoza',
]

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export default function CityInput({
  value,
  onChange,
  placeholder = 'Madrid, Barcelona…',
  className = '',
}: {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)

  const suggestions = query.length >= 1
    ? CITIES.filter(c => normalize(c).startsWith(normalize(query))).slice(0, 8)
    : []

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleInput(val: string) {
    setQuery(val)
    onChange(val)
    setOpen(true)
  }

  function select(city: string) {
    setQuery(city)
    onChange(city)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={e => handleInput(e.target.value)}
        onFocus={() => query.length >= 1 && setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 left-0 right-0 mt-1 bg-e-surface border border-e-border rounded-xl overflow-hidden shadow-lg">
          {suggestions.map(city => (
            <li key={city}>
              <button
                type="button"
                onMouseDown={() => select(city)}
                className="w-full text-left px-4 py-2.5 text-e-text text-sm hover:bg-e-input transition-colors"
              >
                {city}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
