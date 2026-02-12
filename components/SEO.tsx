import React from 'react';
import { Helmet } from 'react-helmet-async';
import { CONTACT_INFO, FIRM_NAME, SERVICES } from '../constants';

const SEO: React.FC = () => {
  const siteUrl = 'https://www.astorgayasociados.cl'; // Reemplazar con URL real en producción
  const defaultTitle = `${FIRM_NAME} | Abogados Expertos en Litigación y Defensa Penal`;
  const defaultDescription = "Firma legal líder en litigación estratégica, defensa penal de alta complejidad, derecho civil y familia. Representación jurídica de excelencia con resultados probados.";
  
  // Esquema de Organización Legal (Schema.org) para Google
  // Esto permite que Google muestre "horarios, teléfono y dirección" en los resultados.
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "name": FIRM_NAME,
    "image": `${siteUrl}/hero.jpg`,
    "@id": siteUrl,
    "url": siteUrl,
    "telephone": CONTACT_INFO.phone,
    "email": CONTACT_INFO.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av. Castellón 320",
      "addressLocality": "Yumbel",
      "addressRegion": "Biobío",
      "addressCountry": "CL"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -37.0970437,
      "longitude": -72.5610032
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "10:00",
      "closes": "14:00"
    },
    "priceRange": "$$$",
    "description": defaultDescription,
    "areaServed": ["Yumbel", "Concepción", "Los Ángeles", "Región del Biobío", "Chile"],
    "founder": {
      "@type": "Person",
      "name": "Pablo Astorga"
    },
    "knowsAbout": SERVICES.map(s => s.title)
  };

  return (
    <Helmet>
      {/* Título y Meta Tags Básicos */}
      <title>{defaultTitle}</title>
      <meta name="description" content={defaultDescription} />
      <meta name="keywords" content="abogados yumbel, defensa penal, abogado penalista, divorcios, herencias, estudio jurídico biobío, litigación estratégica, astorga abogados" />
      <link rel="canonical" href={siteUrl} />
      <meta name="robots" content="index, follow" />

      {/* Open Graph / Facebook / LinkedIn (Vital para compartir) */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content="Astorga y Asociados | Defensa Jurídica de Alto Nivel" />
      <meta property="og:description" content="Estrategia legal implacable y defensa experta. Protegemos su libertad, patrimonio y familia con estándares de excelencia académica." />
      <meta property="og:image" content={`${siteUrl}/og-image.jpg`} />
      <meta property="og:locale" content="es_CL" />
      <meta property="og:site_name" content={FIRM_NAME} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Astorga y Asociados | Litigación Estratégica" />
      <meta name="twitter:description" content="Firma legal especializada en casos de alta complejidad. Penal, Civil y Familia." />
      <meta name="twitter:image" content={`${siteUrl}/og-image.jpg`} />

      {/* Datos Estructurados JSON-LD (El "Secreto" del SEO Local) */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
};

export default SEO;