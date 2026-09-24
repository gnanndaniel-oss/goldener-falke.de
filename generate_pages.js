const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');

// The basic template setup:
// We want to replace all href="#..." with href="/#..."
let baseTemplate = indexHtml.replace(/href="#/g, 'href="/#');

// Remove Hero (lines matching <section class="hero"> to its closing tag)
baseTemplate = baseTemplate.replace(/<!-- Hero -->[\s\S]*?<\/section>/, '');
// Remove Booking (if we don't want it top)
baseTemplate = baseTemplate.replace(/<!-- Booking -->[\s\S]*?<\/section>/, '');
// Remove USPs
baseTemplate = baseTemplate.replace(/<!-- USPs -->[\s\S]*?<\/section>/, '');
// Remove Über Uns
baseTemplate = baseTemplate.replace(/<!-- Über Uns -->[\s\S]*?<\/section>/, '');
// Remove Zimmer
baseTemplate = baseTemplate.replace(/<!-- Zimmer -->[\s\S]*?<\/section>/, '');
// Remove Sonderaktion Klinik
baseTemplate = baseTemplate.replace(/<!-- Sonderaktion Klinik -->[\s\S]*?<\/section>/, '');
// Remove Lage
baseTemplate = baseTemplate.replace(/<!-- Lage -->[\s\S]*?<\/section>/, '');
// Remove Kontakt
baseTemplate = baseTemplate.replace(/<!-- Kontakt -->[\s\S]*?<\/section>/, '');

function createPage(filename, title, description, ogUrl, customHtml, schema = null) {
    let page = baseTemplate;

    // Replace Title
    page = page.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
    page = page.replace(/<meta property="og:title" content=".*?">/, `<meta property="og:title" content="${title}">`);
    page = page.replace(/<meta name="twitter:title" content=".*?">/, `<meta name="twitter:title" content="${title}">`);

    // Replace Description
    page = page.replace(/<meta name="description"[\s\S]*?\/>/, `<meta name="description" content="${description}" />`);
    page = page.replace(/<meta property="og:description"[\s\S]*?>/, `<meta property="og:description" content="${description}">`);
    page = page.replace(/<meta name="twitter:description"[\s\S]*?>/, `<meta name="twitter:description" content="${description}">`);

    // Replace canonical and OG URL
    page = page.replace(/<meta property="og:url" content=".*?">/, `<meta property="og:url" content="${ogUrl}">`);
    page = page.replace(/<link rel="canonical" href=".*?"(.*?)>/, `<link rel="canonical" href="${ogUrl}"$1>`);

    // Add schema.org JSON-LD if provided
    if (schema) {
        const schemaTag = `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
        page = page.replace('</head>', `${schemaTag}\n</head>`);
    }

    // Insert Custom HTML
    page = page.replace('<!-- Footer -->', customHtml + '\n\n    <!-- Footer -->');

    fs.writeFileSync(filename, page);
}

// 1. Zimmer & Preise
const zimmerHtml = `<section>
    <div class="container">
        <h1 style="text-align: center; margin-bottom: 30px;">Zimmer & Preise</h1>
        <div class="grid-3">
            <div class="feature-card">
                <h3>Einzelzimmer Eco</h3>
                <p class="price">ab 59 EUR/Nacht</p>
                <p>Gemütliches Einzelzimmer mit Dusche/WC, TV, Erfrischungsgetränk und kostenlosem WLAN</p>
            </div>
            <div class="feature-card">
                <h3>Einzelzimmer Standard</h3>
                <p class="price">ab 69 EUR/Nacht</p>
                <p>Komfortables Einzelzimmer mit Dusche/WC, TV, Safe, Kühlschrank, Erfrischungsgetränk und WLAN</p>
            </div>
            <div class="feature-card">
                <h3>Doppelzimmer Standard</h3>
                <p class="price">ab 89 EUR/Nacht</p>
                <p>Geräumiges Doppelzimmer mit Dusche/WC, TV, Safe, Kühlschrank, Erfrischungsgetränk und WLAN</p>
            </div>
        </div>
    </div>
</section>`;

createPage('zimmer-preise.html',
    'Zimmer & Preise | Hotel Goldener Falke Augsburg',
    'Einzelzimmer ab 59 EUR, Doppelzimmer ab 89 EUR pro Nacht. Kostenlos Parken, WLAN & Frühstück. Jetzt buchen!',
    'https://www.goldener-falke.de/zimmer-preise.html',
    zimmerHtml
);

// 2. Hotel Klinik Augsburg
const klinikHtml = `<section>
    <div class="container">
        <h1 style="text-align: center; margin-bottom: 30px;">Sonderangebot Klinikbesucher</h1>
        <p style="text-align: center; font-size: 1.1rem; margin-bottom: 40px;">Wir bieten Angehörigen und Besuchern spezielle Konditionen für längere Aufenthalte.</p>
        <div class="grid-2">
            <div class="feature-card">
                <h3>Uniklinik Augsburg</h3>
                <p>Nur ca. 10 Minuten mit dem Auto entfernt</p>
            </div>
            <div class="feature-card">
                <h3>Josefinum</h3>
                <p>Etwa 4 Minuten Fahrtzeit</p>
            </div>
        </div>
        <div style="margin-top: 40px; text-align: center;">
            <a href="/#kontakt" class="btn" style="display: inline-block; padding: 15px 40px; background-color: var(--clr-gold); color: white; border-radius: 8px; cursor: pointer; text-decoration: none;">Kontaktieren Sie uns für Ihr Angebot</a>
        </div>
    </div>
</section>`;

createPage('hotel-klinik-augsburg.html',
    'Spezialkonditionen für Klinikbesucher | Hotel Goldener Falke Augsburg',
    'Ermäßigte Konditionen für Angehörige von Patienten der Uniklinik und des Josefinum Augsburg.',
    'https://www.goldener-falke.de/hotel-klinik-augsburg.html',
    klinikHtml
);

// 3. Hotel Messe Augsburg
const messeHtml = `<section>
    <div class="container">
        <h1 style="text-align: center; margin-bottom: 30px;">Messehotel Augsburg</h1>
        <p style="text-align: center; font-size: 1.1rem; margin-bottom: 40px;">Perfekt für Geschäftsreisende und Messegäste.</p>
        <div class="feature-card" style="max-width: 600px; margin: 0 auto;">
            <h3>Kurze Wege zur Messe</h3>
            <p>Über die B17 erreichen Sie die Messe Augsburg in nur ca. 15 Minuten.</p>
            <p style="margin-top: 15px;">Nutzen Sie unsere erweiterten Check-In Zeiten und den kostenlosen Parkplatz für Ihre Messebesuche.</p>
        </div>
    </div>
</section>`;

createPage('hotel-messe-augsburg.html',
    'Messehotel Augsburg | Hotel Goldener Falke',
    'Das Hotel Goldener Falke ist der ideale Ort für Messegäste. 15 Min zur Messe Augsburg, kostenlos Parken.',
    'https://www.goldener-falke.de/hotel-messe-augsburg.html',
    messeHtml
);

// 4. Über Uns
const ueberHtml = `<section>
    <div class="container">
        <h1 style="text-align: center; margin-bottom: 30px;">Über das Hotel Goldener Falke</h1>
        <p style="text-align: center; font-size: 1.1rem; margin-bottom: 40px;">Seit über 100 Jahren Ihre Heimat in Augsburg.</p>
        <div class="feature-card" style="max-width: 800px; margin: 0 auto;">
            <p>Das Hotel Goldener Falke ist ein Familienhotel mit langer Tradition. Gegründet 1923, bieten wir komfortable und preiswerte Übernachtungen in einem der schönsten Teile Augsburgs.</p>
            <p style="margin-top: 20px;">Kostenlos Parken, 24h Check-In, WLAN und reichhaltiges Frühstück – alles zu fairen Preisen.</p>
        </div>
    </div>
</section>`;

createPage('ueber-uns.html',
    'Über uns | Hotel Goldener Falke Augsburg',
    'Das Hotel Goldener Falke ist ein Familienhotel seit über 100 Jahren. Komfortable Zimmer zu fairen Preisen mit kostenlosem Parkplatz.',
    'https://www.goldener-falke.de/ueber-uns.html',
    ueberHtml
);

// 5. Lage & Anfahrt
const lageHtml = `<section>
    <div class="container">
        <h1 style="text-align: center; margin-bottom: 30px;">Lage & Anfahrt</h1>
        <p style="text-align: center; font-size: 1.1rem; margin-bottom: 40px;">Hotel Goldener Falke · Neuhäuserstraße 10 · 86154 Augsburg</p>
        <div class="feature-card" style="max-width: 600px; margin: 0 auto;">
            <h3>Verkehranbindung</h3>
            <p><strong>Kostenlos Parken:</strong> Direkter Parkplatz am Hotel</p>
            <p style="margin-top: 10px;"><strong>Öffentliche Verkehrsmittel:</strong> Nächste Bushaltestelle in Gehweite</p>
            <p style="margin-top: 10px;"><strong>Flughafen:</strong> ca. 50 Minuten Fahrzeit zum Flughafen München</p>
        </div>
    </div>
</section>`;

createPage('lage-anfahrt.html',
    'Lage & Anfahrt | Hotel Goldener Falke Augsburg',
    'Hotel Goldener Falke in Augsburg-Oberhausen. Kostenlos Parken, nähe Uniklinik, Messe und Innenstadt.',
    'https://www.goldener-falke.de/lage-anfahrt.html',
    lageHtml
);

// ========== BLOG GENERATION ==========
console.log('Generating blog pages...');

// Load blog posts from JSON
const blogPosts = JSON.parse(fs.readFileSync('content/blog-posts.json', 'utf8'));

// Function to format date for display
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('de-DE', options);
}

// Blog-Seiten liegen unter /blog/ – relative Pfade aus dem Template (style.css, app.js,
// impressum.html, datenschutz.html, images/...) würden dort ins Leere (404) laufen.
function fixBlogPaths(page) {
    return page
        .replace(/href="style\.css/g, 'href="/style.css')
        .replace(/src="app\.js"/g, 'src="/app.js"')
        .replace(/href="(impressum|datenschutz|buchen)\.html"/g, 'href="/$1.html"')
        .replace(/(src|srcset)="images\//g, '$1="/images/');
}

// Meta-Tags ersetzen – tolerant gegenüber "…">" und "…" />"
function setMeta(page, attr, name, value) {
    const re = new RegExp(`<meta ${attr}="${name}"[^>]*?\\/?>`);
    const tag = `<meta ${attr}="${name}" content="${value}" />`;
    return re.test(page) ? page.replace(re, tag) : page.replace('</head>', `  ${tag}\n</head>`);
}

function stripHtml(str) {
    return str.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function blogBaseTemplate() {
    let page = indexHtml.replace(/href="#/g, 'href="/#');
    page = page.replace(/<!-- Hero -->[\s\S]*?<\/section>/, '');
    page = page.replace(/<!-- Booking -->[\s\S]*?<\/section>/, '');
    page = page.replace(/<!-- USPs -->[\s\S]*?<\/section>/, '');
    page = page.replace(/<!-- Über Uns -->[\s\S]*?<\/section>/, '');
    page = page.replace(/<!-- Zimmer -->[\s\S]*?<\/section>/, '');
    page = page.replace(/<!-- Sonderaktion Klinik -->[\s\S]*?<\/section>/, '');
    page = page.replace(/<!-- Lage -->[\s\S]*?<\/section>/, '');
    page = page.replace(/<!-- Kontakt -->[\s\S]*?<\/section>/, '');
    return fixBlogPaths(page);
}

// Function to create blog-specific template
// Optionale Felder je Post in content/blog-posts.json:
//   seoTitle        – <title>/og:title (sonst "<title> | Hotel Goldener Falke Augsburg")
//   metaDescription – Meta-Description (sonst excerpt)
//   dateModified    – Aktualisierungsdatum (Schema + Anzeige)
//   faq             – [{ "q": "...", "a": "... (HTML erlaubt)" }] → FAQ-Block + FAQPage-Schema
//   related         – [slug, slug] für "Weitere Artikel"
//   static          – true: Seite ist handgepflegt, wird NICHT generiert, erscheint aber im Blog-Index
function createBlogPage(filename, post, allPosts) {
    let page = blogBaseTemplate();
    const url = `https://www.goldener-falke.de/blog/${post.slug}.html`;
    const seoTitle = post.seoTitle || `${post.title} | Hotel Goldener Falke Augsburg`;
    const description = post.metaDescription || post.excerpt;

    // Update meta tags
    page = page.replace(/<title>[\s\S]*?<\/title>/, `<title>${seoTitle}</title>`);
    page = setMeta(page, 'property', 'og:title', seoTitle);
    page = setMeta(page, 'name', 'twitter:title', seoTitle);
    page = setMeta(page, 'name', 'description', description);
    page = setMeta(page, 'property', 'og:description', description);
    page = setMeta(page, 'name', 'twitter:description', description);
    page = setMeta(page, 'property', 'og:url', url);
    page = setMeta(page, 'property', 'og:type', 'article');
    page = setMeta(page, 'property', 'og:image', post.image);
    page = setMeta(page, 'name', 'twitter:image', post.image);
    page = setMeta(page, 'name', 'keywords', post.keywords);
    page = page.replace(/<link rel="canonical" href=".*?"(.*?)>/, `<link rel="canonical" href="${url}"$1>`);

    // Create BlogPosting schema
    const blogSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": description,
        "image": post.image,
        "datePublished": post.date,
        "dateModified": post.dateModified || post.date,
        "inLanguage": "de-DE",
        "author": {
            "@type": "Organization",
            "name": post.author,
            "url": "https://www.goldener-falke.de"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Hotel Goldener Falke Augsburg",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.goldener-falke.de/images/Hotel_Augsburg_Goldener_Falke_Titelbild.jpg"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": url
        }
    };
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Startseite", "item": "https://www.goldener-falke.de/" },
            { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.goldener-falke.de/blog/" },
            { "@type": "ListItem", "position": 3, "name": post.title, "item": url }
        ]
    };
    const schemas = [blogSchema, breadcrumbSchema];
    if (post.faq && post.faq.length) {
        schemas.push({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": post.faq.map(f => ({
                "@type": "Question",
                "name": f.q,
                "acceptedAnswer": { "@type": "Answer", "text": stripHtml(f.a) }
            }))
        });
    }

    // Add schema before closing head
    const schemaTags = schemas.map(sc => `<script type="application/ld+json">\n${JSON.stringify(sc, null, 2)}\n</script>`).join('\n');
    page = page.replace('</head>', `${schemaTags}\n</head>`);

    // FAQ-Block (sichtbar, identisch zum FAQPage-Schema)
    const faqHtml = (post.faq && post.faq.length) ? `
                <h2 id="faq">Häufige Fragen</h2>
                <div class="faq-list" style="margin-top: 20px;">
${post.faq.map(f => `                    <details style="margin-bottom: 15px; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid var(--clr-gray); cursor: pointer;">
                        <summary style="font-weight: 700; font-size: 1.05rem; color: var(--clr-brand); outline: none;">${f.q}</summary>
                        <p style="margin-top: 15px; line-height: 1.6;">${f.a}</p>
                    </details>`).join('\n')}
                </div>` : '';

    // Create blog post HTML
    let relatedPosts = (post.related || []).map(slug => allPosts.find(p => p.slug === slug)).filter(Boolean);
    if (!relatedPosts.length) relatedPosts = allPosts.filter(p => p.slug !== post.slug).slice(0, 2);
    const relatedPostsHtml = relatedPosts.map(p => `
        <div class="blog-card">
            <h4><a href="/blog/${p.slug}.html">${p.title}</a></h4>
            <p class="blog-meta">${formatDate(p.date)} | ${p.category}</p>
            <p>${p.excerpt}</p>
            <a href="/blog/${p.slug}.html" class="read-more">Mehr lesen →</a>
        </div>
    `).join('');

    const modifiedHtml = post.dateModified && post.dateModified !== post.date
        ? `
                    <span style="margin: 0 15px;">•</span>
                    <span>Aktualisiert am ${formatDate(post.dateModified)}</span>` : '';

    const blogContent = `
<section style="padding: 60px 0;">
    <div class="container">
        <nav aria-label="Brotkrumen" style="font-size: 0.9rem; color: var(--clr-text-light); margin-bottom: 20px;">
            <a href="/">Startseite</a> › <a href="/blog/">Blog</a> › <span>${post.title}</span>
        </nav>
        <article class="blog-post">
            <header class="blog-header" style="margin-bottom: 40px;">
                <h1>${post.title}</h1>
                <div class="blog-meta" style="color: var(--clr-text-light); margin-top: 15px; font-size: 0.95rem;">
                    <span>${formatDate(post.date)}</span>${modifiedHtml}
                    <span style="margin: 0 15px;">•</span>
                    <span class="blog-category" style="display: inline-block; padding: 5px 12px; background: var(--clr-gold-glow); color: var(--clr-dark); border-radius: 4px; font-weight: 600;">${post.category}</span>
                    <span style="margin: 0 15px;">•</span>
                    <span>Von ${post.author}</span>
                </div>
            </header>

            <div class="blog-content" style="line-height: 1.8; font-size: 1.05rem; color: var(--clr-text);">
                ${post.content}
${faqHtml}
            </div>

            <div class="blog-footer" style="margin-top: 60px; padding-top: 30px; border-top: 1px solid var(--clr-gold); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <p style="margin: 0; font-weight: 600; color: var(--clr-dark);">${post.author}</p>
                    <p style="margin: 5px 0 0 0; color: var(--clr-text-light); font-size: 0.9rem;">Hotel Goldener Falke</p>
                </div>
                <a href="/blog/" class="btn" style="display: inline-block; padding: 10px 20px; background-color: var(--clr-gold); color: white; border-radius: 8px; text-decoration: none;">← Zurück zum Blog</a>
            </div>
        </article>

        <section style="margin-top: 80px;">
            <h2 style="margin-bottom: 30px; text-align: center;">Weitere Artikel</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
                ${relatedPostsHtml}
            </div>
        </section>

        <section style="margin-top: 60px; padding: 40px; background: var(--clr-warm-dark); border-radius: 12px; text-align: center;">
            <h3 style="margin-bottom: 15px;">Fragen zum Hotel?</h3>
            <p style="color: var(--clr-text-light); margin-bottom: 20px;">Gerne helfen wir Ihnen weiter. Kontaktieren Sie uns direkt:</p>
            <p style="margin: 10px 0;"><strong>Telefon:</strong> +49 821 411957</p>
            <p style="margin: 10px 0;"><strong>E-Mail:</strong> hotel@goldener-falke.de</p>
            <a href="/#kontakt" class="btn" style="display: inline-block; padding: 12px 30px; background-color: var(--clr-gold); color: white; border-radius: 8px; text-decoration: none; margin-top: 15px;">Kontaktformular</a>
        </section>
    </div>
</section>
    `;

    page = page.replace('<!-- Footer -->', blogContent + '\n\n    <!-- Footer -->');
    fs.writeFileSync(filename, page);
}

// Generate individual blog post pages (static: true = handgepflegte Seite, nur im Index listen)
blogPosts.filter(post => !post.static).forEach(post => {
    createBlogPage(`blog/${post.slug}.html`, post, blogPosts);
    console.log(`Created blog/${post.slug}.html`);
});

// Create blog index page
function createBlogIndex() {
    let page = blogBaseTemplate();
    const idxTitle = 'Blog | Hotel Goldener Falke Augsburg – Reisetipps, Gastro & Geschichte';
    const idxDesc = 'Blog des Hotel Goldener Falke: Augsburger Sehenswürdigkeiten, Spezialitäten, Anreise- und Übernachtungstipps – seit 1923 in Augsburg-Oberhausen.';

    // Update meta tags
    page = page.replace(/<title>[\s\S]*?<\/title>/, `<title>${idxTitle}</title>`);
    page = setMeta(page, 'property', 'og:title', idxTitle);
    page = setMeta(page, 'name', 'twitter:title', idxTitle);
    page = setMeta(page, 'name', 'description', idxDesc);
    page = setMeta(page, 'property', 'og:description', idxDesc);
    page = setMeta(page, 'name', 'twitter:description', idxDesc);
    page = setMeta(page, 'property', 'og:url', 'https://www.goldener-falke.de/blog/');
    page = page.replace(/<link rel="canonical" href=".*?"(.*?)>/, '<link rel="canonical" href="https://www.goldener-falke.de/blog/"$1>');

    // Create blog listing
    const sortedPosts = [...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const postCardsHtml = sortedPosts.map(post => `
        <article class="blog-card" style="background: white; padding: 30px; border-radius: 12px; box-shadow: var(--shadow); transition: var(--transition); border: 1px solid var(--clr-warm-dark);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                <h3 style="flex: 1;"><a href="/blog/${post.slug}.html" style="color: var(--clr-dark); text-decoration: none; transition: var(--transition);">${post.title}</a></h3>
            </div>
            <div class="blog-meta" style="color: var(--clr-text-light); font-size: 0.9rem; margin-bottom: 15px;">
                <span>${formatDate(post.date)}</span>
                <span style="margin: 0 10px;">•</span>
                <span style="display: inline-block; padding: 4px 10px; background: var(--clr-gold-glow); color: var(--clr-dark); border-radius: 4px; font-weight: 600; font-size: 0.85rem;">${post.category}</span>
            </div>
            <p style="color: var(--clr-text); margin-bottom: 15px; line-height: 1.6;">${post.excerpt}</p>
            <a href="/blog/${post.slug}.html" style="color: var(--clr-gold); font-weight: 600; text-decoration: none; transition: var(--transition);">Mehr lesen →</a>
        </article>
    `).join('');

    // Create categories filter info
    const categories = [...new Set(blogPosts.map(p => p.category))];
    const categoryBadges = categories.map(cat => `<span style="display: inline-block; padding: 6px 12px; background: var(--clr-gold-glow); color: var(--clr-dark); border-radius: 4px; margin-right: 10px; margin-bottom: 10px; font-weight: 600; font-size: 0.9rem;">${cat}</span>`).join('');

    const blogIndexContent = `
<section style="padding: 60px 0;">
    <div class="container">
        <header style="text-align: center; margin-bottom: 50px;">
            <h1 style="margin-bottom: 15px;">Blog – Augsburg entdecken</h1>
            <p style="font-size: 1.1rem; color: var(--clr-text-light); max-width: 600px; margin: 0 auto;">Sehenswürdigkeiten, Kulinarisches, Anreise- und Übernachtungstipps – und die über 100 Jahre Geschichte unseres Hotels.</p>
        </header>

        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 2px solid var(--clr-warm-dark);">
            ${categoryBadges}
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 30px;">
            ${postCardsHtml}
        </div>

        <div style="text-align: center; margin-top: 60px;">
            <a href="/" class="btn" style="display: inline-block; padding: 12px 30px; background-color: var(--clr-gold); color: white; border-radius: 8px; text-decoration: none;">← Zurück zur Startseite</a>
        </div>
    </div>
</section>
    `;

    page = page.replace('<!-- Footer -->', blogIndexContent + '\n\n    <!-- Footer -->');
    fs.writeFileSync('blog/index.html', page);
}

createBlogIndex();
console.log('Created blog/index.html');

// 6. Häufige Fragen
const faqHtml = `<section>
    <div class="container">
        <h1 style="text-align: center; margin-bottom: 30px;">Häufig gestellte Fragen</h1>

            <script type="application/ld+json">
            {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Gibt es einen kostenlosen Parkplatz?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Ja, das Hotel Goldener Falke bietet einen kostenlosen Hotelparkplatz direkt am Haus für alle Gäste (nach Verfügbarkeit)."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Wann kann ich einchecken / auschecken?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Unsere regulären Check-In Zeiten sind Montag bis Freitag von 14:00 bis 18:00 Uhr. Darüber hinaus können Sie unser 24h Check-In-Terminal (elektronisch) durchgehend von Montag bis Sonntag von 0:00 bis 24:00 Uhr nutzen. Der Check-out erfolgt in der Regel bis 11:00 Uhr."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Wie funktioniert das 24h Check-In-Terminal?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Sollten Sie außerhalb der regulären Check-In Zeiten anreisen, informieren Sie uns bitte kurz telefonisch oder per E-Mail. Wir schalten das moderne Self-Service-Terminal am Eingang für Sie frei. Dort erhalten Sie mit Ihrem Reservierungsnamen schnell und einfach Ihre Zimmerkarte."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Wie weit ist das Hotel von der Uniklinik Augsburg entfernt?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Das Hotel Goldener Falke liegt nur ca. 10 Minuten mit dem Auto von der Uniklinik Augsburg entfernt. Das Josefinum erreichen Sie in etwa 4 Minuten."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Gibt es Sonderkonditionen für Klinikbesucher?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Ja, wir bieten spezielle, ermäßigte Konditionen für Klinikbesucher und Angehörige von Patienten in Augsburg an. Bitte kontaktieren Sie uns für Ihr individuelles Angebot."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Wie weit ist es zur Messe Augsburg?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Über die B17 erreichen Sie die Messe Augsburg mit dem Auto schnell und direkt in ca. 15 Minuten."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Ist WLAN kostenlos?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Ja, eine schnelle und kostenfreie WLAN-Verbindung steht Ihnen im gesamten Hotelbereich sowie auf allen Zimmern zur Verfügung."
                        }
                    }
                ]
            }
            </script>

            <div class="faq-list" style="margin-top: 40px;">
                <details style="margin-bottom: 20px; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid var(--clr-gray); cursor: pointer;">
                    <summary style="font-weight: 700; font-size: 1.1rem; color: var(--clr-brand); outline: none;">Gibt es einen kostenlosen Parkplatz?</summary>
                    <p style="margin-top: 15px; line-height: 1.6;">Ja, das Hotel Goldener Falke bietet einen kostenlosen Hotelparkplatz direkt am Haus für alle Gäste (nach Verfügbarkeit).</p>
                </details>

                <details style="margin-bottom: 20px; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid var(--clr-gray); cursor: pointer;">
                    <summary style="font-weight: 700; font-size: 1.1rem; color: var(--clr-brand); outline: none;">Wann kann ich einchecken / auschecken?</summary>
                    <p style="margin-top: 15px; line-height: 1.6;">Unsere regulären Check-In Zeiten sind Montag bis Freitag von 14:00 bis 18:00 Uhr. Darüber hinaus können Sie unser <strong>24h Check-In-Terminal (elektronisch)</strong> durchgehend von Montag bis Sonntag von 0:00 bis 24:00 Uhr nutzen. Der Check-out erfolgt in der Regel bis 11:00 Uhr.</p>
                </details>

                <details style="margin-bottom: 20px; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid var(--clr-gray); cursor: pointer;">
                    <summary style="font-weight: 700; font-size: 1.1rem; color: var(--clr-brand); outline: none;">Wie funktioniert das 24h Check-In-Terminal?</summary>
                    <p style="margin-top: 15px; line-height: 1.6;">Sollten Sie außerhalb der regulären Check-In Zeiten anreisen, informieren Sie uns bitte kurz telefonisch oder per E-Mail. Wir schalten das moderne Self-Service-Terminal am Eingang für Sie frei. Dort erhalten Sie mit Ihrem Reservierungsnamen schnell und einfach Ihre Zimmerkarte.</p>
                </details>

                <details style="margin-bottom: 20px; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid var(--clr-gray); cursor: pointer;">
                    <summary style="font-weight: 700; font-size: 1.1rem; color: var(--clr-brand); outline: none;">Wie weit ist das Hotel von der Uniklinik Augsburg entfernt?</summary>
                    <p style="margin-top: 15px; line-height: 1.6;">Das Hotel Goldener Falke liegt nur ca. 10 Minuten mit dem Auto von der Uniklinik Augsburg entfernt. Das Josefinum erreichen Sie in etwa 4 Minuten.</p>
                </details>
                
                <details style="margin-bottom: 20px; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid var(--clr-gray); cursor: pointer;">
                    <summary style="font-weight: 700; font-size: 1.1rem; color: var(--clr-brand); outline: none;">Gibt es Sonderkonditionen für Klinikbesucher?</summary>
                    <p style="margin-top: 15px; line-height: 1.6;">Ja, wir bieten spezielle, ermäßigte Konditionen für Klinikbesucher und Angehörige von Patienten in Augsburg an. Bitte <a href="/#kontakt">kontaktieren Sie uns</a> für Ihr individuelles Angebot.</p>
                </details>

                <details style="margin-bottom: 20px; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid var(--clr-gray); cursor: pointer;">
                    <summary style="font-weight: 700; font-size: 1.1rem; color: var(--clr-brand); outline: none;">Wie weit ist es zur Messe Augsburg?</summary>
                    <p style="margin-top: 15px; line-height: 1.6;">Über die B17 erreichen Sie die Messe Augsburg mit dem Auto schnell und direkt in ca. 15 Minuten.</p>
                </details>
                
                <details style="margin-bottom: 20px; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid var(--clr-gray); cursor: pointer;">
                    <summary style="font-weight: 700; font-size: 1.1rem; color: var(--clr-brand); outline: none;">Ist WLAN kostenlos?</summary>
                    <p style="margin-top: 15px; line-height: 1.6;">Ja, eine schnelle und kostenfreie WLAN-Verbindung steht Ihnen im gesamten Hotelbereich sowie auf allen Zimmern zur Verfügung.</p>
                </details>

            </div>
        </div>
    </section>
`;

createPage('haeufige-fragen.html',
    'Häufige Fragen | Hotel Goldener Falke Augsburg',
    'Antworten auf häufige Fragen: Parkplatz, Check-In Zeiten, Frühstück, Stornierung, Klinikbesucher-Konditionen und mehr.',
    'https://www.goldener-falke.de/haeufige-fragen.html',
    faqHtml
);

console.log('✓ All pages generated successfully!');
