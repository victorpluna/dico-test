# Backup Tailwind CSS v4 Configuration

**Data:** 2025-08-08
**Motivo:** Rollback para v3 devido problemas de styling não funcionando

## Configurações originais (Tailwind v4):

### package.json (dependências relevantes):
```json
{
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.11",
    "postcss": "^8.5.6", 
    "tailwindcss": "^4.1.11",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

### postcss.config.mjs:
```javascript
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};

export default config;
```

### globals.css (primeiras 50 linhas):
```css
@tailwind base;

@custom-variant dark (&:is(.dark *));
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;

    /* Custom variables for Dico Platform */
    --color-primary: #0066ff;
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'JetBrains Mono', 'SF Mono', monospace;
    --spacing-unit: 8px;
  }
```

### Problemas identificados:
1. Duas definições `:root` conflitantes (linhas 8-40 e 139-172)
2. Mistura de formatos HSL e OKLCH
3. CSS variables duplicadas
4. Tailwind v4 ainda em preview causando instabilidade

## Para fazer rollback para v4:
1. Restaurar package.json com versões acima
2. Restaurar postcss.config.mjs
3. Restaurar globals.css original
4. `npm install`
5. Reiniciar servidor dev

## Versões para v3 (novo):
- tailwindcss: ^3.4.0
- @tailwindcss/postcss: remover
- postcss.config.mjs: usar plugins padrão