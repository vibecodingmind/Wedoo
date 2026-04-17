'use client'

import { useState, useEffect } from 'react'

interface Vendor { id: string; name: string; category: string; description: string; priceRange: string; rating: number; contactEmail: string | null; website: string | null }

const CATEGORIES = ['All', 'Venue', 'Catering', 'Photography', 'Florist', 'Music', 'Attire', 'Stationery', 'Transportation', 'Entertainment']
const CATEGORY_COLORS: Record<string, string> = {
  Venue: 'bg-rose-100 text-rose-700', Catering: 'bg-amber-100 text-amber-700', Photography: 'bg-violet-100 text-violet-700',
  Florist: 'bg-pink-100 text-pink-700', Music: 'bg-emerald-100 text-emerald-700', Attire: 'bg-sky-100 text-sky-700',
  Stationery: 'bg-orange-100 text-orange-700', Transportation: 'bg-teal-100 text-teal-700', Entertainment: 'bg-fuchsia-100 text-fuchsia-700',
}

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      const res = await fetch('/api/vendors')
      const data = await res.json()
      if (!cancelled) { setVendors(data); setLoading(false) }
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

  const filtered = vendors.filter(v =>
    (category === 'All' || v.category === category) &&
    (!search || v.name.toLowerCase().includes(search.toLowerCase()) || v.description.toLowerCase().includes(search.toLowerCase()))
  )

  const Stars = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#f59e0b' : '#e5e7eb'} stroke="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Vendor Marketplace</h2>
        <p className="text-sm text-muted-foreground">Discover and connect with top wedding professionals</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} className="flex-1 min-w-[200px] rounded-lg border bg-background px-3 py-2 text-sm" placeholder="Search vendors..." />
        {CATEGORIES.slice(0, 7).map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${category === c ? 'bg-rose-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(vendor => (
          <div key={vendor.id} className="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[vendor.category] || 'bg-muted text-muted-foreground'}`}>
                    {vendor.category}
                  </span>
                  <h4 className="mt-2 text-lg font-semibold group-hover:text-rose-600 transition-colors">{vendor.name}</h4>
                </div>
                <div className="text-right">
                  <Stars rating={vendor.rating} />
                  <p className="mt-0.5 text-xs text-muted-foreground">{vendor.rating.toFixed(1)}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{vendor.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-rose-600">{vendor.priceRange}</span>
                {vendor.website && (
                  <span className="text-xs text-muted-foreground">{vendor.website}</span>
                )}
              </div>
              <button className="mt-4 w-full rounded-lg bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-rose-500 hover:text-white">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <p className="py-8 text-center text-muted-foreground">No vendors found</p>}
    </div>
  )
}
