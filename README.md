# 💸 Gastos-Compartidos

![license](https://img.shields.io/badge/license-MIT-blue.svg) ![next.js](https://img.shields.io/badge/Next.js-React-black) ![node](https://img.shields.io/badge/Node.js-%23339933)

Aplicación web para administrar gastos entre grupos de personas, desarrollada con Next.js como trabajo práctico para la materia "Aplicaciones Web con Next.js".

---

## ✨ Resumen rápido
- ✅ Permite crear grupos, registrar miembros y gastos.  
- 🔁 Convierte automáticamente montos entre monedas usando la API pública de exchangerate.host.  
- 🗄️ Persiste datos en archivos JSON (simulando una base de datos simple).  
- 📊 Muestra balances simplificados y gráficos de gasto por persona y categoría.

---

## 🎯 Motivación y contexto
La consigna pedía construir una app en Next.js que gestionara gastos compartidos. Se priorizó:
- Seguir buenas prácticas de Next.js y React.  
- Mantener persistencia sencilla con archivos JSON (requisito de la consigna).  
- No implementar autenticación completa (uso de UUIDs temporales en localStorage cuando es necesario).  
- Integrar exchangerate.host para normalizar montos a la moneda base por grupo.

---

## 📚 Requisitos
- Crear grupos con múltiples integrantes.  
- Registrar gastos: descripción, monto, moneda, persona que pagó y participantes.  
- Integrar exchangerate.host para convertir gastos a la moneda base del grupo.  
- Guardar grupos, miembros y gastos en archivos JSON.  
- Calcular y mostrar balance simplificado (quién debe pagar y cuánto a quién).  
- Mostrar gráficos por persona y por categoría (Chart.js / Recharts u otra).

---

## 🧰 Tecnologías usadas
- Next.js, React  
- Node.js (server-side simple para lectura/escritura de archivos JSON)  
- fetch / axios para exchangerate.host  
- Chart.js o Recharts para visualizaciones  
- uuid para generar IDs temporales en cliente  
- fs/promises para persistencia en JSON en servidor  
- ESLint / Prettier (opcional)

---

## 🗂️ Estructura del proyecto
- /pages - páginas Next.js  
- /components - componentes UI (formularios, listas, gráficos)  
- /lib - utilidades: conversión de monedas, cálculo de balances, lectura/escritura de JSON  
- /data - archivos JSON que actúan como persistencia (groups.json, users.json, expenses.json)  
- /public - assets (ej.: screenshots, iconos)  
- /styles - estilos

---

## 💾 Archivos de datos (persistencia)
Los datos se guardan en `/data` como JSON. Ejemplo de estructura de un grupo (groups.json):

```json
[
  {
    "id": "group-1",
    "name": "Vacaciones 2025",
    "baseCurrency": "USD",
    "members": [
      { "id": "user-1", "name": "Facundo" },
      { "id": "user-2", "name": "Sofía" },
      { "id": "user-3", "name": "Lucas" }
    ],
    "expenses": [
      {
        "id": "expense-1",
        "description": "Alquiler departamento",
        "amount": 300,
        "currency": "EUR",
        "paidBy": "user-1",
        "participants": ["user-1", "user-2", "user-3"],
        "category": "Alojamiento",
        "convertedAmountToBase": 318,
        "createdAt": "2025-11-21T10:00:00Z"
      }
    ]
  }
]
```

---

## 🔁 Flujo de conversiones (exchangerate.host)
- Al crear/editar un gasto se consulta:  
  `https://api.exchangerate.host/convert?from=EUR&to=USD&amount=300`  
- Se guarda `convertedAmountToBase` en el gasto para mantener histórico y evitar llamadas repetidas.  
- No requiere API key para uso básico.

---

## 🧮 Algoritmo de cálculo de balances (resumen)
1. Para cada miembro:
   - totalPagado = suma de `convertedAmountToBase` donde `paidBy === member.id`.  
   - totalDeberia = suma de su participación en cada gasto (`convertedAmountToBase * share`).  
2. saldo = totalPagado - totalDeberia (saldo > 0 recibe, saldo < 0 debe pagar).  
3. Generar transferencias sugeridas: deudores pagan proporcionalmente a acreedores hasta saldar.

Ejemplo:
- A: saldo -50  
- B: saldo +30  
- C: saldo +20  
Resultado: A paga 30 a B y 20 a C.

---

## 🖼️ Interfaz y visualizaciones
- Formulario para crear grupos.
  <img width="1917" height="827" alt="image" src="https://github.com/user-attachments/assets/5b067dc2-0837-4ee9-ba85-83fbb3a8ba52" />

- Vista de grupo: gastos, formulario para agregar gasto (incluye selección de moneda).
  <img width="1850" height="632" alt="image" src="https://github.com/user-attachments/assets/f2300da0-26bf-4d36-b14b-0d90f0c5ca70" />
  <img width="1917" height="623" alt="image" src="https://github.com/user-attachments/assets/8d43e393-8f86-4ec2-ba1a-b5f668ebc0d3" />
  <img width="1904" height="330" alt="image" src="https://github.com/user-attachments/assets/1a80c0de-920f-4273-9bd5-845ea1c411e8" />

- Gráficos: gasto total por persona y por categoría (Chart.js / Recharts).
<img width="1871" height="919" alt="image" src="https://github.com/user-attachments/assets/8d4ac7a8-a877-45e7-bb1a-ed0b43096e5d" />

- Tabla de balance y listado de transacciones sugeridas.
<img width="1886" height="871" alt="image" src="https://github.com/user-attachments/assets/0c95cbe7-8b98-42d6-8f04-ffd81a1ce9e5" />


---

## 🚀 Cómo ejecutar (local) — Paso a paso (copy & paste)
1. Clonar el repositorio:
```bash
git clone https://github.com/facundodelga/Gastos-Compartidos.git
cd Gastos-Compartidos
```

2. Instalar dependencias:
```bash
npm install
# o
yarn
```

3. Ejecutar en modo desarrollo:
```bash
npm run dev
# o
yarn dev
```
Abrir: http://localhost:3000

4. Build para producción y ejecución:
```bash
npm run build
npm start
# o con yarn
yarn build
yarn start
```

5. Archivos de datos:
- Asegúrate de que `/data` existe con archivos iniciales (por ejemplo `groups.json` vacío `[]`). La app puede crear archivos si están ausentes, pero es recomendable dejar JSON de ejemplo para pruebas.

---

## 🔧 Configuración de la API de monedas
- Se usa exchangerate.host (sin clave en uso básico).  
- Si cambias a otra API con key, agrega `.env.local` con la variable correspondiente y ajusta la lógica.

---

## 🔐 Identificación temporal de usuario
- No hay autenticación completa. Cuando se necesita "identificar" al usuario (preselección, chat, etc.) se genera un UUID en cliente y se guarda en `localStorage` o `sessionStorage`.

---

## ✅ Buenas prácticas implementadas
- Validación de inputs (monto > 0, participantes válidos).  
- Persistencia de montos convertidos por gasto (historial estable).  
- Sanitización básica de entradas para evitar XSS en presentaciones simples.  
- Código modular en `/lib` para facilitar tests y mantenimiento.

---

## ⚠️ Limitaciones conocidas
- Persistencia en JSON no es concurrente ni escalable.  
- Algoritmo de balance no minimiza número de transacciones.  
- Sin autenticación real: UUID en localStorage puede perderse.  
- Manejo básico de errores de exchangerate.host (se recomienda añadir reintentos).

---

## 📄 Licencia
- MIT
