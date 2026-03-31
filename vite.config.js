import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base : '/myorder/',
})
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   base: '/',  // 👈 เปลี่ยนจาก '/myorder/' เป็น '/'
//   server: {
//     host: true,
//     port: 5173
//   }
// })