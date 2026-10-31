# SEO: structured data (JSON-LD) and the launch checklist

Every site for a real business ships with structured data. It tells Google what the
business is, where it works and how to reach it, in a form that feeds the knowledge
panel, local results and rich results. For a local service business (electrician,
plumber, lawyer, clinic, barber, restaurant) it is one of the highest-return things
the build can do, and it costs one JSON file.

## 1. Pick the most specific type

Use the narrowest schema.org subtype of `LocalBusiness` that fits, never the generic
one when a specific one exists:

| Business | Type |
|---|---|
| Electrician, plumber, roofer, HVAC, locksmith, painter | `Electrician`, `Plumber`, `RoofingContractor`, `HVACBusiness`, `Locksmith`, `HousePainter` (all `HomeAndConstructionBusiness`) |
| Lawyer, accountant | `LegalService` (schema.org deprecated `Attorney`), `AccountingService` |
| Clinic, dentist | `MedicalClinic`, `Dentist` |
| Barber, salon, spa | `BarberShop`, `HairSalon`, `DaySpa` |
| Restaurant, cafe, bakery | `Restaurant`, `CafeOrCoffeeShop`, `Bakery` |
| Hotel | `Hotel` |
| Anything else with customers | `LocalBusiness`, or `ProfessionalService` |

## 2. The template

One `@graph` per page: the `WebSite`, this page's `WebPage`, and the business. The
business node has a stable `@id` (`<root>#business`) that every other node points at.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://example.co.il/#website",
      "url": "https://example.co.il/",
      "name": "Business name in the site's language",
      "inLanguage": "he-IL",
      "publisher": { "@id": "https://example.co.il/#business" }
    },
    {
      "@type": "WebPage",
      "@id": "https://example.co.il/#webpage",
      "url": "https://example.co.il/",
      "name": "The page's <title>",
      "inLanguage": "he-IL",
      "isPartOf": { "@id": "https://example.co.il/#website" },
      "about": { "@id": "https://example.co.il/#business" }
    },
    {
      "@type": "Electrician",
      "@id": "https://example.co.il/#business",
      "name": "The official name, exactly as on Google Business Profile",
      "alternateName": ["Latin spelling", "Brand name in the logo", "Older names"],
      "url": "https://example.co.il/",
      "description": "Who they are and what they do, in plain words from the page.",
      "telephone": "+972-50-000-0000",
      "logo": "https://example.co.il/logo-512.png",
      "image": ["https://example.co.il/og.jpg"],
      "sameAs": ["https://www.instagram.com/handle/", "https://www.facebook.com/page"],
      "address": { "@type": "PostalAddress", "addressCountry": "IL" },
      "areaServed": [
        { "@type": "Place", "name": "Region" },
        { "@type": "City", "name": "City" },
        { "@type": "Country", "name": "Country" }
      ],
      "founder": [{
        "@type": "Person",
        "name": "Owner",
        "jobTitle": "Title",
        "hasCredential": [{
          "@type": "EducationalOccupationalCredential",
          "credentialCategory": "license",
          "name": "License name",
          "identifier": "License number"
        }]
      }],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Services",
        "itemListElement": [
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Service, in the words people search" } }
        ]
      },
      "knowsAbout": ["Searched topic", "Searched topic"]
    }
  ]
}
</script>
```

Add a `FAQPage` node when the page has a visible FAQ (law 5). Google retired FAQ rich results
on 2026-05-07, so it earns no rich result: keep it only because it is accurate and other
consumers read it (`seo-geo.md` section 7). Add `openingHoursSpecification`
only with real hours from the client.

## 3. The laws

1. **One business, one `@id`, one source.** Keep the WebSite + business nodes in one
   file (for example `seo/identity.json`) that every page's build injects. Never paste
   a second, thinner business block next to an existing one: two definitions of the
   same `@id` with different descriptions confuse the merge. To add a field, add it
   to the single source. `scripts/verify.mjs` fails a page that defines an `@id` twice.
2. **Schema matches the page and the world.** Every claim in the JSON must be visible
   on the page and true. Name, phone and area must match the Google Business Profile
   character for character (the NAP rule).
3. **Never invent.**
   - No `aggregateRating` or `review` unless they are real reviews shown on the page.
     Self-serving review markup earns a manual action.
   - No licenses, years, awards or guarantees the client has not confirmed. Add
     license numbers (`identifier`) only once the client has sent them.
   - Describe the services they actually provide, in their words. If they execute
     from someone else's plan, don't call it design.
4. **Service-area businesses** without a storefront: omit `streetAddress`. Keep
   `addressCountry` and list where they work in `areaServed`: regions as `Place`,
   cities as `City`, then the country for nationwide work.
5. **FAQPage is generated, never hand-copied.** Build it at build time from the
   visible `<details>` markup (or from the same data module the FAQ component
   renders), so the schema can never drift from what visitors read.
6. **Absolute production URLs from one constant.**
   - Every `@id`, `url`, `logo` and `image` is absolute.
   - They are built from a single `ROOT` constant, so moving to the real domain
     later is a one-line change.
   - Demo or staging copies keep their canonical and `@id`s pointing at the client's
     domain.
7. **The language of the searchers.** `name` is the official name in the language
   people type into Google (Hebrew for an Israeli business). The Latin or logo
   spelling goes in `alternateName`.
8. **noindex pages** (campaign landing pages, accessibility statements) don't need
   the business node.

## 4. Verify before shipping

- `scripts/verify.mjs` parses every JSON-LD block and fails on invalid JSON or an
  `@id` defined twice.
- Then paste the live URL into Google's Rich Results Test
  (https://search.google.com/test/rich-results) and the schema.org validator
  (https://validator.schema.org).
- Content must be in the HTML for crawlers that don't run JavaScript. A
  client-rendered SPA needs prerendering: render to HTML at build time and hydrate.

## 5. The launch checklist (after the real domain is live)

1. `rel="canonical"`, `robots.txt` with the sitemap line, and `sitemap.xml` (with
   `image:image` entries) all on the production domain. noindex pages are left out
   of the sitemap.
2. Old hosts (`*.vercel.app`, `www`) 301/308 to the canonical domain.
3. Google Search Console: add a Domain property, verify it with the DNS TXT record,
   submit the sitemap, then use URL Inspection and "Request indexing" on the
   homepage. A new domain is often indexed within a day this way.
4. Bing Webmaster Tools: import from Search Console and request indexing. Bing also
   feeds ChatGPT search.
5. IndexNow: host `<key>.txt` at the root, and have the deploy script POST the
   changed URLs to `https://api.indexnow.org/indexnow` after each production deploy.
   202 means the key is still being validated; 200 means accepted. Bing and Yandex
   pick up changes within hours.
6. Links in: Google Business Profile with the website, the Instagram bio, WhatsApp
   Business, and local directory listings. A new domain with no links is what Bing
   waits on.
