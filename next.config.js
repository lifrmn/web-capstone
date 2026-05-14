/**
 * KONFIGURASI NEXT.JS
 * File ini mengatur konfigurasi untuk aplikasi Next.js 14
 * Menangani optimasi, bundling, dan pengaturan deployment
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // React Strict Mode: Mengaktifkan pemeriksaan tambahan dan peringatan untuk development
  // Membantu mendeteksi masalah potensial dalam aplikasi React
  reactStrictMode: true,
  
  // SWC Minify: Menggunakan compiler SWC untuk minifikasi JavaScript
  // Lebih cepat daripada Terser dan menghasilkan bundle yang lebih kecil
  swcMinify: true,
  
  // Experimental Features: Fitur-fitur eksperimental Next.js
  experimental: {
    // Menonaktifkan optimasi CSS otomatis
    optimizeCss: false,
    // Mengoptimalkan import dari package tertentu untuk mengurangi bundle size
    optimizePackageImports: ['lucide-react', 'exceljs'],
  },
  
  // Compiler Options: Pengaturan compiler Next.js
  compiler: {
    // Menghapus semua console.log() di production untuk keamanan dan performa
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Output Mode: Mengatur mode output aplikasi
  // 'standalone' untuk production: Menghasilkan output yang siap di-deploy dengan semua dependencies
  // undefined untuk development: Mode normal dengan hot reloading
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Image Optimization: Konfigurasi optimasi gambar Next.js
  images: {
    // Format gambar yang didukung: AVIF (ukuran kecil) dan WebP (kompatibilitas baik)
    formats: ['image/avif', 'image/webp'],
    // Menonaktifkan optimasi image bawaan Next.js karena sudah dihandle oleh Vercel
    unoptimized: true,
  },
  
  // Webpack Configuration: Kustomisasi konfigurasi webpack
  // Berfungsi untuk mengoptimalkan bundle size dan loading performance
  webpack: (config, { dev, isServer }) => {
    // Hanya jalankan optimasi di production dan untuk client-side
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        // Module IDs: Menggunakan deterministic untuk cache yang stabil
        moduleIds: 'deterministic',
        
        // Split Chunks: Memecah bundle menjadi chunks yang lebih kecil
        // Meningkatkan caching dan parallel loading
        splitChunks: {
          chunks: 'all', // Analisa semua chunks (sync + async)
          cacheGroups: {
            default: false,    // Nonaktifkan cache group default
            vendors: false,    // Nonaktifkan vendors group default
            
            // Framework Chunk: React, React DOM, Next.js core
            // Priority tertinggi karena jarang berubah
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
              priority: 40,
              enforce: true, // Selalu buat chunk terpisah
            },
            
            // Library Chunk: Semua node_modules lainnya
            // Cached secara terpisah untuk optimasi
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name: 'lib',
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true, // Reuse chunk jika sudah ada
            },
            
            // Commons Chunk: Kode yang digunakan di beberapa page
            // Mengurangi duplikasi kode
            commons: {
              name: 'commons',
              minChunks: 2, // Minimal digunakan di 2 tempat
              priority: 20,
            },
          },
        },
      }
    }
    // Return konfigurasi webpack yang sudah dimodifikasi
    return config
  },
}

// Export konfigurasi untuk digunakan oleh Next.js
module.exports = nextConfig