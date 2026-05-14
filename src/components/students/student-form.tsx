/**
 * STUDENT FORM COMPONENT
 * ======================
 * Form untuk menambahkan siswa baru ke mata pelajaran
 * 
 * Features:
 * - Input field untuk nama, NIS, dan kelas
 * - Validasi required field (nama)
 * - Auto-trim whitespace
 * - Error handling dengan display
 * - Callbacks untuk success dan cancel
 * 
 * Props:
 * - subjectId: ID mata pelajaran tempat siswa ditambahkan
 * - onSuccess: Callback setelah siswa berhasil ditambahkan
 * - onCancel: Callback saat user membatalkan form
 * 
 * Used in: Modal dalam subject detail page
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// === INTERFACE PROPS ===
interface StudentFormProps {
  subjectId: string            // ID subject target
  onSuccess: () => void        // Callback after successful creation
  onCancel: () => void         // Callback when user cancels
}

export default function StudentForm({ subjectId, onSuccess, onCancel }: StudentFormProps) {
  // === STATE MANAGEMENT ===
  const [name, setName] = useState('')              // Nama siswa (required)
  const [nis, setNis] = useState('')                // Nomor Induk Siswa (optional)
  const [className, setClassName] = useState('')    // Nama kelas: 5A, 6B, dll (optional)
  const [isLoading, setIsLoading] = useState(false) // Loading state
  const [error, setError] = useState('')            // Error message

  /**
   * HANDLE SUBMIT
   * =============
   * Handler untuk submit form siswa baru
   * 
   * Flow:
   * 1. Prevent default submit
   * 2. Trim semua input
   * 3. POST ke /api/students dengan subjectId
   * 4. Handle response (success: callback, error: show message)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()  // Prevent page reload
    setIsLoading(true)
    setError('')

    try {
      // POST request ke API
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),                  // Trim whitespace
          nis: nis.trim() || null,           // Empty string jadi null
          className: className.trim() || null,
          subjectId                          // Link ke subject
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Success: Trigger onSuccess callback (biasanya refresh data & close modal)
        onSuccess()
      } else {
        // Error: Tampilkan error message dari API
        setError(data.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      // Network error
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  // === RENDER COMPONENT ===
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* FIELD 1: Nama Siswa (Required) */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Nama Siswa *
        </label>
        <Input
          id="name"
          type="text"
          placeholder="Nama lengkap siswa"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required  // HTML5 validation
        />
      </div>

      {/* FIELD 2: NIS (Optional) */}
      <div className="space-y-2">
        <label htmlFor="nis" className="text-sm font-medium">
          NIS (Opsional)
        </label>
        <Input
          id="nis"
          type="text"
          placeholder="Nomor Induk Siswa"
          value={nis}
          onChange={(e) => setNis(e.target.value)}
        />
      </div>

      {/* FIELD 3: Kelas (Optional) */}
      <div className="space-y-2">
        <label htmlFor="className" className="text-sm font-medium">
          Kelas (Opsional)
        </label>
        <Input
          id="className"
          type="text"
          placeholder="Contoh: 5A, 6B"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
        />
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex gap-3 pt-4">
        {/* Submit Button */}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : 'Simpan'}
        </Button>
        {/* Cancel Button */}
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </form>
  )
}