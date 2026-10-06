# Coppel POS Móvil 📱🛒
### Terminal de Punto de Venta Móvil para Asesores en Tienda

Sistema de **Punto de Venta Móvil (mPOS)** modelado para tiendas **Coppel**, diseñado para que asesores de piso utilicen tabletas para asistir a los clientes directamente en los pasillos de la tienda.

---

## 🚀 Características Principales

1. **Catálogo de Productos con Stock en Tiempo Real**:
   - Ubicación física exacta en piso de tienda (ej. *Pasillo 4 · Exhibición Central TV*, *Isla de Telefonía Telcel*).
   - Consulta a la **API Simulada de Inventarios** de la tienda (`Sucursal #104 Culiacán Centro`).
   - Alertas visuales de **«Pocas piezas»** en color rojo cuando el stock en exhibición es de 1 o 2 piezas.
   - Desglose de existencias: En Pasillo, En Bodega de Sucursal y en CEDIS Regional.
   - Solicitud de resurtido express a bodega interna en un solo toque.

2. **Motor de Crédito Coppel & Abonos Quincenales**:
   - Cálculo automático de **Precio de Contado** vs. **Abono Quincenal Coppel** (12, 18, 24, 36 y 48 quincenas).
   - Simulador interactivo de plazos y enganche voluntario con visualización de ahorro por pronto pago.
   - Búsqueda de clientes Coppel con consulta de **Línea de Crédito Disponible**, saldo actual y lector biométrico de huella digital simulado.

3. **Experiencia Ergonómica para Tableta en Tienda**:
   - **Modo Horizontal (Split-Screen)**: Catálogo a la izquierda (65%) con carrito de venta anclado a la derecha (35%).
   - **Modo Vertical (Walk-around)**: Botones táctiles optimizados ($\ge 44\text{px}$) y barra de acciones inferior para operar caminando con una mano.
   - Lector óptico de **Código de Barras y Códigos QR** con animación láser y sonido *beep*.
   - Herramientas auxiliares: Comparador de artículos lado a lado, Calculadora rápida y Panel de comisiones del asesor.

4. **Cobro en Pasillo & Ticket Oficial Coppel**:
   - Métodos de cobro: **Crédito Coppel** (con **lienzo de firma digital en tableta**), **Terminal Bancaria Pinpad Bluetooth** (chip y contactless), **Ficha de Turno para Caja Rápida** (efectivo sin fila) y **Coppel Pay**.
   - Emisión de ticket térmico con desglose de IVA (16%), opción de impresión Bluetooth a mini-impresora de cinturón Zebra, envío por WhatsApp o correo.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + TypeScript
- **Estilos**: Tailwind CSS v4 con paleta corporativa Coppel (`#005BAB` y `#FFD000`)
- **Iconos**: Lucide React
- **Bundler**: Vite 8 con soporte para rutas relativas (`base: './'`)

---

## 📦 Instalación y Ejecución Local

Clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/tu-usuario/coppel-pos-movil.git
cd coppel-pos-movil
npm install
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Abre en tu navegador en `http://localhost:3000`.

---

## 🌐 Despliegue en GitHub Pages

Este proyecto ya está configurado con `base: './'` en `vite.config.ts` e importación directa de assets para funcionar sin errores en GitHub Pages o cualquier servidor estático:

1. **Compilar para producción**:
   ```bash
   npm run build
   ```
2. La carpeta generada `dist/` contiene todos los archivos estáticos listos para desplegar.
3. Si utilizas **GitHub Actions**, puedes configurar el workflow estándar de Vite para GitHub Pages en `.github/workflows/deploy.yml`.
4. También es compatible directamente con **Vercel**, **Netlify** o **Cloudflare Pages** conectando tu repositorio de GitHub.

---

## 📄 Licencia

Desarrollado con fines demostrativos para terminales mPOS en el sector retail.
