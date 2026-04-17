'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  X,
  Upload,
  Trash2,
  ImagePlus,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Edit3,
  Camera,
  Sparkles,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

type Category = 'Venue' | 'Decor' | 'Attire' | 'Food' | 'Inspiration'

interface Photo {
  id: string
  src: string
  caption: string
  category: Category
  isPlaceholder?: boolean
}

interface GalleryProps {
  weddingId: string
}

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: ('All' | Category)[] = ['All', 'Venue', 'Decor', 'Attire', 'Food', 'Inspiration']

const CATEGORY_COLORS: Record<Category, string> = {
  Venue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Decor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Attire: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Food: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Inspiration: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
}

const PLACEHOLDERS: Photo[] = [
  {
    id: 'ph-1',
    src: '',
    caption: 'Venue Inspiration',
    category: 'Venue',
    isPlaceholder: true,
  },
  {
    id: 'ph-2',
    src: '',
    caption: 'Floral Arrangements',
    category: 'Decor',
    isPlaceholder: true,
  },
  {
    id: 'ph-3',
    src: '',
    caption: 'Table Settings',
    category: 'Decor',
    isPlaceholder: true,
  },
  {
    id: 'ph-4',
    src: '',
    caption: 'Bridal Suite',
    category: 'Attire',
    isPlaceholder: true,
  },
  {
    id: 'ph-5',
    src: '',
    caption: 'Cake Design',
    category: 'Food',
    isPlaceholder: true,
  },
  {
    id: 'ph-6',
    src: '',
    caption: 'Lighting Ideas',
    category: 'Inspiration',
    isPlaceholder: true,
  },
]

const GRADIENT_STYLES: Record<string, string> = {
  'ph-1': 'bg-gradient-to-br from-rose-400 via-pink-500 to-fuchsia-500',
  'ph-2': 'bg-gradient-to-br from-amber-300 via-orange-400 to-red-400',
  'ph-3': 'bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-500',
  'ph-4': 'bg-gradient-to-br from-violet-400 via-purple-500 to-fuchsia-500',
  'ph-5': 'bg-gradient-to-br from-pink-300 via-rose-400 to-red-400',
  'ph-6': 'bg-gradient-to-br from-sky-300 via-blue-400 to-indigo-500',
}

const PLACEHOLDER_ICONS: Record<string, typeof Camera> = {
  'ph-1': Camera,
  'ph-2': Sparkles,
  'ph-3': Sparkles,
  'ph-4': Camera,
  'ph-5': Sparkles,
  'ph-6': Sparkles,
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Gallery({ weddingId: _weddingId }: GalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>(PLACEHOLDERS)
  const [activeFilter, setActiveFilter] = useState<'All' | Category>('All')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null)
  const [captionDraft, setCaptionDraft] = useState('')
  const [uploadCategory, setUploadCategory] = useState<Category>('Inspiration')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Derived State ─────────────────────────────────────────────────────────

  const filteredPhotos = useMemo(() => {
    if (activeFilter === 'All') return photos
    return photos.filter((p) => p.category === activeFilter)
  }, [photos, activeFilter])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: photos.length }
    for (const cat of CATEGORIES.slice(1)) {
      counts[cat] = photos.filter((p) => p.category === cat).length
    }
    return counts
  }, [photos])

  const lightboxPhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files) return

      Array.from(files).forEach((file) => {
        if (file.size > 5 * 1024 * 1024) {
          return // skip files > 5MB
        }
        const reader = new FileReader()
        reader.onload = () => {
          const newPhoto: Photo = {
            id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            src: reader.result as string,
            caption: file.name.replace(/\.[^.]+$/, ''),
            category: uploadCategory,
          }
          setPhotos((prev) => [...prev, newPhoto])
        }
        reader.readAsDataURL(file)
      })

      // reset input so same file can be uploaded again
      e.target.value = ''
    },
    [uploadCategory],
  )

  const handleDelete = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
    setLightboxIndex(null)
  }, [])

  const handleSaveCaption = useCallback((id: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, caption: captionDraft } : p)),
    )
    setEditingCaptionId(null)
    setCaptionDraft('')
  }, [captionDraft])

  const startEditCaption = useCallback((photo: Photo) => {
    setEditingCaptionId(photo.id)
    setCaptionDraft(photo.caption)
  }, [])

  const handleLightboxNav = useCallback(
    (dir: 'prev' | 'next') => {
      if (lightboxIndex === null) return
      const len = filteredPhotos.length
      if (dir === 'prev') {
        setLightboxIndex((lightboxIndex - 1 + len) % len)
      } else {
        setLightboxIndex((lightboxIndex + 1) % len)
      }
    },
    [lightboxIndex, filteredPhotos.length],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowLeft') handleLightboxNav('prev')
      if (e.key === 'ArrowRight') handleLightboxNav('next')
    },
    [lightboxIndex, handleLightboxNav],
  )

  // ── Sub-Components ────────────────────────────────────────────────────────

  const PlaceholderCard = ({ photo }: { photo: Photo }) => {
    const gradientClass = GRADIENT_STYLES[photo.id] ?? 'bg-gradient-to-br from-rose-400 to-pink-500'
    const IconComponent = PLACEHOLDER_ICONS[photo.id] ?? Camera

    return (
      <div
        className={`group relative break-inside-avoid mb-3 rounded-xl overflow-hidden cursor-pointer ${gradientClass}`}
        style={{ aspectRatio: photo.id === 'ph-2' || photo.id === 'ph-5' ? '3/4' : '4/5' }}
        onClick={() => {
          const idx = filteredPhotos.findIndex((p) => p.id === photo.id)
          if (idx !== -1) setLightboxIndex(idx)
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/5" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
            <IconComponent className="h-7 w-7 text-white/90" />
          </div>
          <p className="text-sm font-semibold text-white/95 text-center leading-tight drop-shadow-sm">
            {photo.caption}
          </p>
          <span className="text-[10px] font-medium text-white/70 uppercase tracking-widest">
            {photo.category}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg">
              <ZoomIn className="h-5 w-5 text-rose-600" />
            </div>
          </div>
        </div>

        {/* Caption bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent p-3 pt-8">
          <p className="text-xs text-white/80 font-medium">{photo.caption}</p>
        </div>
      </div>
    )
  }

  const PhotoCard = ({ photo, index }: { photo: Photo; index: number }) => {
    const isEditing = editingCaptionId === photo.id

    return (
      <div className="group relative break-inside-avoid mb-3 rounded-xl overflow-hidden bg-muted cursor-pointer">
        {/* Image */}
        <img
          src={photo.src}
          alt={photo.caption}
          className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onClick={() => setLightboxIndex(index)}
          loading="lazy"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Actions */}
          <div className="absolute top-2 right-2 flex gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation()
                startEditCaption(photo)
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-muted-foreground hover:text-foreground transition-colors shadow-sm"
              title="Edit caption"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(photo.id)
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
              title="Delete photo"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Caption */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-xs text-white/90 font-medium truncate drop-shadow-sm">
              {photo.caption}
            </p>
            <Badge
              className={`mt-1.5 text-[10px] ${CATEGORY_COLORS[photo.category]}`}
            >
              {photo.category}
            </Badge>
          </div>

          {/* Zoom icon */}
          <div className="absolute top-2 left-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <ZoomIn className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
        </div>

        {/* Caption edit modal */}
        {isEditing && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-10">
            <div className="bg-card rounded-xl p-4 w-full max-w-xs shadow-xl border">
              <h4 className="text-sm font-semibold mb-2 text-foreground">Edit Caption</h4>
              <Input
                value={captionDraft}
                onChange={(e) => setCaptionDraft(e.target.value)}
                placeholder="Add a caption..."
                className="mb-3 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveCaption(photo.id)
                  if (e.key === 'Escape') {
                    setEditingCaptionId(null)
                    setCaptionDraft('')
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => {
                    setEditingCaptionId(null)
                    setCaptionDraft('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="flex-1 text-xs bg-rose-600 hover:bg-rose-700 text-white"
                  onClick={() => handleSaveCaption(photo.id)}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 shadow-sm shadow-rose-200 dark:shadow-rose-900/30">
              <Camera className="h-4.5 w-4.5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              Photo Gallery
            </h2>
          </div>
          <p className="text-sm text-muted-foreground ml-[46px]">
            Collect and organize your wedding inspiration
          </p>
        </div>

        <div className="flex items-center gap-2 ml-[46px] sm:ml-0">
          {/* Category selector for upload */}
          <select
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value as Category)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400"
          >
            {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-sm shadow-rose-200 dark:shadow-rose-900/30 text-sm"
          >
            <Upload className="h-4 w-4" />
            Upload
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = activeFilter === cat
          const count = categoryCounts[cat] ?? 0

          return (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 border ${
                isActive
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-200 dark:shadow-rose-900/30'
                  : 'bg-card text-muted-foreground border-border hover:border-rose-300 hover:text-rose-600 dark:hover:text-rose-400 dark:hover:border-rose-800'
              }`}
            >
              {cat}
              <span
                className={`flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Upload hint */}
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-rose-200 dark:border-rose-800/50 bg-rose-50/50 dark:bg-rose-950/20 p-3">
        <ImagePlus className="h-4 w-4 text-rose-400 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Upload photos in <span className="font-medium text-foreground">JPG, PNG, or WebP</span> format.
          Maximum <span className="font-medium text-foreground">5MB</span> per file. Select a category before uploading.
        </p>
      </div>

      {/* Gallery Grid */}
      {filteredPhotos.length > 0 ? (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
          {filteredPhotos.map((photo, index) =>
            photo.isPlaceholder ? (
              <PlaceholderCard key={photo.id} photo={photo} />
            ) : (
              <PhotoCard key={photo.id} photo={photo} index={index} />
            ),
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Camera className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">No photos in this category</p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload some photos or select a different category
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload Photos
          </Button>
        </div>
      )}

      {/* Photo count summary */}
      <div className="flex items-center justify-between pt-2 border-t">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredPhotos.length}</span>{' '}
          {filteredPhotos.length === 1 ? 'photo' : 'photos'}
          {activeFilter !== 'All' && (
            <span>
              {' '}
              in <span className="font-medium text-rose-600 dark:text-rose-400">{activeFilter}</span>
            </span>
          )}
        </p>
        {photos.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {photos.length} total {photos.length === 1 ? 'photo' : 'photos'}
          </p>
        )}
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {lightboxPhoto && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          ref={(el) => el?.focus()}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setLightboxIndex(null)
            }}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(lightboxPhoto.id)
            }}
            className="absolute top-4 left-16 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-red-500/30 text-white transition-colors"
            title="Delete photo"
          >
            <Trash2 className="h-5 w-5" />
          </button>

          {/* Navigation arrows */}
          {filteredPhotos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleLightboxNav('prev')
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleLightboxNav('next')
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Content */}
          <div
            className="relative max-w-5xl max-h-[90vh] mx-4 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {lightboxPhoto.isPlaceholder ? (
              <div
                className={`w-full rounded-xl overflow-hidden flex items-center justify-center ${
                  GRADIENT_STYLES[lightboxPhoto.id] ?? 'bg-gradient-to-br from-rose-400 to-pink-500'
                }`}
                style={{ minHeight: '400px', maxHeight: '70vh' }}
              >
                <div className="flex flex-col items-center gap-4 p-8">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm shadow-xl">
                    <Camera className="h-10 w-10 text-white/90" />
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white/95 drop-shadow-sm">
                      {lightboxPhoto.caption}
                    </p>
                    <span className="inline-block mt-2 px-3 py-1 rounded-full bg-white/20 text-xs font-medium text-white/80 uppercase tracking-widest">
                      {lightboxPhoto.category}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-2">Placeholder inspiration card</p>
                </div>
              </div>
            ) : (
              <img
                src={lightboxPhoto.src}
                alt={lightboxPhoto.caption}
                className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            )}

            {/* Info bar */}
            <div className="mt-4 text-center">
              <p className="text-sm font-medium text-white/90">
                {lightboxPhoto.caption}
              </p>
              <div className="flex items-center justify-center gap-2 mt-1.5">
                <Badge className={`text-[10px] ${CATEGORY_COLORS[lightboxPhoto.category]}`}>
                  {lightboxPhoto.category}
                </Badge>
                <span className="text-[11px] text-white/50">
                  {lightboxIndex + 1} / {filteredPhotos.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
