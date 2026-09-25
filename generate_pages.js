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
    page = setMeta(page, 'property', 'og:title', title);
    page = setMeta(page, 'name', 'twitter:title', title);

    // Replace Description
    page = setMeta(page, 'name', 'description', description);
    page = setMeta(page, 'property', 'og:description', description);
    page = setMeta(page, 'name', 'twitter:description', description);

    // Replace canonical and OG URL
    page = setMeta(page, 'property', 'og:url', ogUrl);
    page = page.replace(/<link rel="canonical" href=".*?"(.*?)>/, `<link rel="canonical" href="${ogUrl}"$1>`);

    // Add schema.org JSON-LD if provided (Objekt oder Array von Objekten)
    if (schema) {
        const list = Array.isArray(schema) ? schema : [schema];
        const schemaTags = list.map(sc => `<script type="application/ld+json">\n${JSON.stringify(sc, null, 2)}\n</script>`).join('\n');
        page = page.replace('</head>', `${schemaTags}\n</head>`);
    }

    // Insert Custom HTML
    page = page.replace('<!-- Footer -->', customHtml + '\n\n    <!-- Footer -->');

    fs.writeFileSync(filename, page);
}

// FAQ-Helfer für Seiten mit sichtbarem FAQ-Block + FAQPage-Schema
function faqBlock(faq) {
    return `
        <h2 id="faq" style="margin-top: 50px;">Häufige Fragen</h2>
        <div class="faq-list" style="margin-top: 20px;">
${faq.map(f => `            <details style="margin-bottom: 15px; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid var(--clr-gray); cursor: pointer;">
                <summary style="font-weight: 700; font-size: 1.05rem; color: var(--clr-brand); outline: none;">${f.q}</summary>
                <p style="margin-top: 15px; line-height: 1.6;">${f.a}</p>
            </details>`).join('\n')}
        </div>`;
}

function faqSchema(faq) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faq.map(f => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": { "@type": "Answer", "text": stripHtml(f.a) }
        }))
    };
}

// ========== BILDER ==========
// Vorhandene Hotelfotos (unter /images/, je .webp + -400/-800.webp + JPG-Fallback).
// w/h = Maße des Fallback-Bildes; webp = [Datei, Breite] für das srcset.
const IMAGES = {
    zimmer: { fallback: 'published_image_2.jpg', w: 992, h: 745,
        webp: [['published_image_2-400.webp', 400], ['published_image_2-800.webp', 800], ['published_image_2.webp', 992]] },
    einzelEco: { fallback: 'Hotel_Augsburg_Einzelzimmer_Goldener_Falke.JPG', w: 1600, h: 1159,
        webp: [['Hotel_Augsburg_Einzelzimmer_Goldener_Falke-400.webp', 400], ['Hotel_Augsburg_Einzelzimmer_Goldener_Falke-800.webp', 800], ['Hotel_Augsburg_Einzelzimmer_Goldener_Falke.webp', 2420]] },
    einzelEcoFenster: { fallback: 'hotel-augsburg-einzelzimmer-eco.jpg', w: 1600, h: 1200,
        webp: [['hotel-augsburg-einzelzimmer-eco-400.webp', 400], ['hotel-augsburg-einzelzimmer-eco-800.webp', 800], ['hotel-augsburg-einzelzimmer-eco.webp', 1600]] },
    einzelStandard: { fallback: 'hotel-augsburg-einzelzimmer-standard.jpg', w: 1624, h: 1042,
        webp: [['hotel-augsburg-einzelzimmer-standard-400.webp', 400], ['hotel-augsburg-einzelzimmer-standard-800.webp', 800], ['hotel-augsburg-einzelzimmer-standard.webp', 1624]] },
    doppel: { fallback: 'hotel-augsburg-doppelzimmer-standard.jpg', w: 1200, h: 1600,
        webp: [['hotel-augsburg-doppelzimmer-standard-400.webp', 400], ['hotel-augsburg-doppelzimmer-standard-800.webp', 800], ['hotel-augsburg-doppelzimmer-standard.webp', 1200]] },
    buffet: { fallback: 'hotel-augsburg-fruehstuecksbuffet.jpg', w: 640, h: 480,
        webp: [['hotel-augsburg-fruehstuecksbuffet-400.webp', 400], ['hotel-augsburg-fruehstuecksbuffet.webp', 640]] },
    fruehstuecksraum: { fallback: 'hotel-augsburg-fruehstuecksbuffet-auswahl.jpg', w: 480, h: 640,
        webp: [['hotel-augsburg-fruehstuecksbuffet-auswahl-400.webp', 400], ['hotel-augsburg-fruehstuecksbuffet-auswahl.webp', 480]] },
    fassade: { fallback: 'Hotel_Augsburg_Goldener_Falke_Titelbild.jpg', w: 334, h: 300,
        webp: [['Hotel_Augsburg_Goldener_Falke_Titelbild-400.webp', 400], ['Hotel_Augsburg_Goldener_Falke_Titelbild-800.webp', 800]] }
};

function imageUrl(key) {
    return `https://www.goldener-falke.de/images/${IMAGES[key].fallback}`;
}

function imageObject(key, caption) {
    const im = IMAGES[key];
    const obj = { "@type": "ImageObject", "url": imageUrl(key), "contentUrl": imageUrl(key), "width": im.w, "height": im.h };
    if (caption) obj.caption = caption;
    return obj;
}

// <picture> mit WebP-srcset + JPG-Fallback. priority=true nur für das erste sichtbare Bild.
function pic(key, alt, opts = {}) {
    const im = IMAGES[key];
    const sizes = opts.sizes || '(max-width: 768px) 100vw, 50vw';
    const style = opts.style || 'width: 100%; height: auto; border-radius: 12px; display: block;';
    const loading = opts.priority ? 'fetchpriority="high"' : 'loading="lazy"';
    const srcset = im.webp.map(([f, w]) => `/images/${f} ${w}w`).join(', ');
    return `<picture>
                <source type="image/webp" srcset="${srcset}" sizes="${sizes}" />
                <img src="/images/${im.fallback}" alt="${alt}" width="${im.w}" height="${im.h}" ${loading} decoding="async" style="${style}" />
            </picture>`;
}

function figure(key, alt, caption, opts = {}) {
    return `<figure style="margin: 0 0 30px 0;">
            ${pic(key, alt, opts)}
            ${caption ? `<figcaption style="font-size: 0.9rem; color: var(--clr-text-light); margin-top: 8px; text-align: center;">${caption}</figcaption>` : ''}
        </figure>`;
}

const CARD_IMG = 'width: 100%; height: 220px; object-fit: cover; border-radius: 10px; display: block; margin-bottom: 15px;';

// 1. Zimmer & Preise
const zimmerHtml = `<section>
    <div class="container">
        <h1 style="text-align: center; margin-bottom: 15px;">Zimmer & Preise</h1>
        <p style="text-align: center; font-size: 1.1rem; max-width: 760px; margin: 0 auto 40px;">Unsere Zimmer im Hotel Goldener Falke in Augsburg-Oberhausen – alle mit Dusche/WC, TV und kostenlosem WLAN. Dazu: kostenloser Parkplatz, Frühstücksbuffet und 24h-Check-in-Terminal nach Voranmeldung.</p>
        <div class="grid-3">
            <div class="feature-card">
                ${pic('einzelEco', 'Einzelzimmer Eco mit Schreibtisch im Hotel Goldener Falke in Augsburg-Oberhausen', { priority: true, sizes: '(max-width: 768px) 100vw, 33vw', style: CARD_IMG })}
                <h3>Einzelzimmer Eco</h3>
                <p class="price">ab 59 EUR/Nacht</p>
                <p>Gemütliches Einzelzimmer mit Dusche/WC, TV, Erfrischungsgetränk und kostenlosem WLAN</p>
            </div>
            <div class="feature-card">
                ${pic('einzelStandard', 'Einzelzimmer Standard mit Leselicht und TV im Hotel Goldener Falke Augsburg', { sizes: '(max-width: 768px) 100vw, 33vw', style: CARD_IMG })}
                <h3>Einzelzimmer Standard</h3>
                <p class="price">ab 69 EUR/Nacht</p>
                <p>Komfortables Einzelzimmer mit Dusche/WC, TV, Safe, Kühlschrank, Erfrischungsgetränk und WLAN</p>
            </div>
            <div class="feature-card">
                ${pic('doppel', 'Doppelzimmer Standard mit Doppelbett im Hotel Goldener Falke in Augsburg', { sizes: '(max-width: 768px) 100vw, 33vw', style: CARD_IMG })}
                <h3>Doppelzimmer Standard</h3>
                <p class="price">ab 89 EUR/Nacht</p>
                <p>Geräumiges Doppelzimmer mit Dusche/WC, TV, Safe, Kühlschrank, Erfrischungsgetränk und WLAN</p>
            </div>
        </div>

        <h2 style="text-align: center; margin: 60px 0 15px;">Frühstück im Goldenen Falken</h2>
        <p style="text-align: center; max-width: 700px; margin: 0 auto 30px;">Starten Sie gestärkt in den Tag – mit unserem vielfältigen Frühstücksbuffet, jeden Morgen frisch zubereitet.</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;">
            ${pic('buffet', 'Frühstücksbuffet mit frischen Speisen im Hotel Goldener Falke Augsburg-Oberhausen', { sizes: '(max-width: 768px) 100vw, 50vw', style: 'width: 100%; height: 320px; object-fit: cover; border-radius: 12px; display: block;' })}
            ${pic('fruehstuecksraum', 'Frühstücksraum mit Buffet im Hotel Goldener Falke in Augsburg', { sizes: '(max-width: 768px) 100vw, 50vw', style: 'width: 100%; height: 320px; object-fit: cover; border-radius: 12px; display: block;' })}
        </div>

        <h2 style="text-align: center; margin: 60px 0 30px;">Impressionen aus unseren Zimmern</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;">
            ${pic('zimmer', 'Hotelzimmer mit großem Bett und warmem Licht im Hotel Goldener Falke Augsburg', { sizes: '(max-width: 768px) 100vw, 50vw', style: 'width: 100%; height: 280px; object-fit: cover; border-radius: 12px; display: block;' })}
            ${pic('einzelEcoFenster', 'Helles Einzelzimmer mit Fenster im Hotel Goldener Falke in Augsburg-Oberhausen', { sizes: '(max-width: 768px) 100vw, 50vw', style: 'width: 100%; height: 280px; object-fit: cover; border-radius: 12px; display: block;' })}
        </div>

        <div style="margin-top: 40px; text-align: center;">
            <a href="/buchen.html" class="btn" style="display: inline-block; padding: 15px 40px; background-color: var(--clr-gold); color: white; border-radius: 8px; text-decoration: none;">Verfügbarkeit prüfen</a>
        </div>
    </div>
</section>`;

createPage('zimmer-preise.html',
    "Zimmer & Preise | Hotel in Augsburg ab 59 € – Goldener Falke",
    "Einzelzimmer ab 59 €, Doppelzimmer ab 89 € pro Nacht in Augsburg-Oberhausen: Dusche/WC, TV, WLAN, Frühstücksbuffet, kostenloser Parkplatz und 24h-Check-in.",
    'https://www.goldener-falke.de/zimmer-preise.html',
    zimmerHtml
);

// 2. Hotel Klinik Augsburg
const klinikFaq = [
    {
        "q": "Wie weit ist das Hotel von der Uniklinik Augsburg entfernt?",
        "a": "Das Hotel Goldener Falke liegt ca. 10 Minuten mit dem Auto vom Universitätsklinikum Augsburg entfernt."
    },
    {
        "q": "Wie weit ist es zum Josefinum?",
        "a": "Das Josefinum erreichen Sie vom Hotel aus in etwa 4 Minuten mit dem Auto."
    },
    {
        "q": "Gibt es Sonderkonditionen für Klinikbesucher?",
        "a": "Ja, wir bieten spezielle, ermäßigte Konditionen für Angehörige und Besucher von Patienten, besonders bei längeren Aufenthalten. Bitte kontaktieren Sie uns telefonisch unter +49 821 41 19 57 oder per E-Mail an hotel@goldener-falke.de für Ihr individuelles Angebot."
    },
    {
        "q": "Kann ich auch spät abends oder am Wochenende anreisen?",
        "a": "Ja. Nach kurzer Voranmeldung per Telefon oder E-Mail schalten wir unser 24h-Check-in-Terminal für Sie frei. Dort erhalten Sie mit Ihrem Reservierungsnamen rund um die Uhr Ihre Zimmerkarte."
    },
    {
        "q": "Kann ich am Hotel parken?",
        "a": "Ja, der hauseigene Parkplatz direkt am Hotel ist für Gäste kostenlos (nach Verfügbarkeit)."
    },
    {
        "q": "Was ist bei einem sehr langen Klinikaufenthalt die beste Unterkunft?",
        "a": "Sprechen Sie uns auf unsere Konditionen für längere Aufenthalte an. Ab etwa einer Woche sind auch möblierte Apartments mit Küche eine Option – zu finden auf apartment-augsburg.de."
    }
];

const klinikHtml = `<section>
    <div class="container" style="max-width: 900px;">
        <h1 style="text-align: center; margin-bottom: 30px;">Hotel nahe Uniklinik Augsburg und Josefinum</h1>
        <p style="font-size: 1.1rem; margin-bottom: 30px;"><strong>Kurz gesagt:</strong> Das Hotel Goldener Falke in Augsburg-Oberhausen liegt ca. 10 Minuten mit dem Auto vom Universitätsklinikum Augsburg und ca. 4 Minuten vom Josefinum entfernt. Für Angehörige und Besucher von Patienten bieten wir Sonderkonditionen – besonders bei längeren Aufenthalten. Kostenloser Parkplatz und ein 24h-Check-in-Terminal machen spontane Anreisen einfach.</p>

        ${figure('einzelStandard', 'Ruhiges Einzelzimmer im Hotel Goldener Falke nahe Uniklinik Augsburg und Josefinum', '', { priority: true, sizes: '(max-width: 900px) 100vw, 900px', style: 'width: 100%; height: auto; max-height: 460px; object-fit: cover; border-radius: 12px; display: block;' })}
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

        <div class="blog-content" style="line-height: 1.8; font-size: 1.05rem; margin-top: 40px;">
            <h2>Das Wichtigste auf einen Blick</h2>
            <ul>
                <li><strong>Adresse:</strong> Hotel Goldener Falke, Neuhäuserstraße 10, 86154 Augsburg (Oberhausen)</li>
                <li><strong>Universitätsklinikum Augsburg:</strong> ca. 10 Minuten mit dem Auto</li>
                <li><strong>Josefinum:</strong> ca. 4 Minuten mit dem Auto</li>
                <li><strong>Sonderkonditionen:</strong> ermäßigte Konditionen für Angehörige und Besucher von Patienten – bitte direkt anfragen</li>
                <li><strong>Parken:</strong> kostenloser Hotelparkplatz direkt am Haus (nach Verfügbarkeit)</li>
                <li><strong>Check-in:</strong> regulär Montag bis Freitag 15:00–18:00 Uhr, außerhalb dieser Zeiten per 24h-Check-in-Terminal nach kurzer Voranmeldung</li>
                <li><strong>Zimmer:</strong> Einzel- und Doppelzimmer mit Dusche/WC, TV und kostenlosem WLAN</li>
                <li><strong>Frühstück:</strong> Frühstücksbuffet, jeden Morgen frisch zubereitet</li>
                <li><strong>Längere Aufenthalte:</strong> ab einer Woche auch möblierte Apartments über <a href="https://www.apartment-augsburg.de/" target="_blank" rel="noopener">apartment-augsburg.de</a></li>
            </ul>

            <h2>Warum ein Hotel in der Nähe der Klinik?</h2>
            <p>Wenn ein Familienmitglied oder ein nahestehender Mensch im Krankenhaus liegt, zählt vor allem eines: schnell da sein zu können. Lange Anfahrten, Parkplatzsuche und starre Hotelzeiten kosten Kraft, die Sie in dieser Situation für anderes brauchen. Das Hotel Goldener Falke liegt in Augsburg-Oberhausen und damit nur wenige Minuten von zwei wichtigen Augsburger Kliniken entfernt – dem Universitätsklinikum Augsburg und dem Josefinum.</p>
            <p>So können Sie morgens nach dem Frühstück zur Besuchszeit fahren, mittags kurz durchatmen und abends ohne lange Wege zurück ins Zimmer. Ihr Auto bleibt auf unserem kostenlosen Hotelparkplatz stehen, bis Sie es brauchen.</p>

            <h2>Welche Sonderkonditionen gibt es für Klinikbesucher?</h2>
            <p>Wir bieten Angehörigen und Besuchern von Patienten spezielle, ermäßigte Konditionen – insbesondere für längere Aufenthalte. Da jede Situation anders ist, erstellen wir Ihnen gern ein individuelles Angebot. Rufen Sie uns an unter <a href="tel:+49821411957">+49 821 41 19 57</a>, schreiben Sie an <a href="mailto:hotel@goldener-falke.de">hotel@goldener-falke.de</a> oder nutzen Sie das <a href="/#kontakt">Kontaktformular</a>. Nennen Sie uns am besten gleich den geplanten Zeitraum und die Anzahl der Personen.</p>

            <h2>Was ist, wenn ich spontan oder spät anreisen muss?</h2>
            <p>Klinikbesuche lassen sich selten lange im Voraus planen. Deshalb gibt es bei uns ein <strong>24h-Check-in-Terminal</strong>. Unsere regulären Check-in-Zeiten sind Montag bis Freitag von 15:00 bis 18:00 Uhr. Kommen Sie später, früh morgens oder am Wochenende an, melden Sie Ihre Anreise kurz telefonisch oder per E-Mail an. Wir schalten das Self-Service-Terminal am Eingang für Sie frei, und Sie erhalten dort mit Ihrem Reservierungsnamen Ihre Zimmerkarte – rund um die Uhr.</p>

            <h2>Wie komme ich vom Hotel zur Uniklinik und zum Josefinum?</h2>
            <p>Mit dem Auto erreichen Sie das Universitätsklinikum Augsburg in ca. 10 Minuten und das Josefinum in ca. 4 Minuten. Wer ohne Auto unterwegs ist, nutzt Straßenbahn und Bus: Die Haltestelle „Oberhausen Bahnhof/Helmut-Haller-Platz" liegt direkt um die Ecke. Die aktuelle Verbindung zu Ihrer Klinik finden Sie in der Fahrplanauskunft der <a href="https://www.sw-augsburg.de/" target="_blank" rel="noopener">Stadtwerke Augsburg</a>. Wie Sie zu uns ins Hotel kommen, erklärt unsere Seite <a href="/lage-anfahrt.html">Lage &amp; Anfahrt</a>.</p>

            <h2>Wie sind die Zimmer ausgestattet?</h2>
            <p>Alle Zimmer haben Dusche/WC, TV und kostenloses WLAN. Zur Auswahl stehen:</p>
            <ul>
                <li><strong>Einzelzimmer Eco</strong> – Dusche/WC, TV, Erfrischungsgetränk, kostenloses WLAN</li>
                <li><strong>Einzelzimmer Standard</strong> – zusätzlich mit Safe und Kühlschrank</li>
                <li><strong>Doppelzimmer Standard</strong> – mit Doppelbett, Safe und Kühlschrank, ideal, wenn Sie zu zweit anreisen</li>
            </ul>
            <p>Die aktuellen Preise finden Sie unter <a href="/zimmer-preise.html">Zimmer &amp; Preise</a>. In unserer Gästelounge stehen Ihnen außerdem Kaffeemaschine, Computer und WLAN kostenfrei zur Verfügung – praktisch, wenn Sie zwischen zwei Besuchen etwas organisieren müssen.</p>

            ${figure('buffet', 'Frühstücksbuffet im Hotel Goldener Falke in Augsburg-Oberhausen', 'Frühstücksbuffet – jeden Morgen frisch zubereitet', { sizes: '(max-width: 900px) 100vw, 640px', style: 'width: 100%; max-width: 640px; height: auto; border-radius: 12px; display: block; margin: 0 auto;' })}
            <h2>Was tun bei einem längeren Klinikaufenthalt?</h2>
            <p>Dauert der Aufenthalt Ihres Angehörigen länger, sprechen Sie uns auf unsere Konditionen für längere Aufenthalte an. Ab etwa einer Woche kann auch ein möbliertes Apartment mit eigener Küche sinnvoll sein – diese finden Sie bei unserer Schwesterseite <a href="https://www.apartment-augsburg.de/" target="_blank" rel="noopener">apartment-augsburg.de</a>.</p>

            <h2>Tipps für Ihren Aufenthalt als Klinikbesucher</h2>
            <ul>
                <li>Informieren Sie sich vorab auf der Website der jeweiligen Klinik über Besuchszeiten und aktuelle Besuchsregeln.</li>
                <li>Melden Sie eine späte Anreise kurz an – dann ist das Check-in-Terminal für Sie freigeschaltet.</li>
                <li>Lassen Sie das Auto am Hotel stehen, wenn Sie in der Klinik keinen Parkplatz suchen möchten, und fahren Sie mit Straßenbahn oder Bus.</li>
                <li>Fragen Sie bei Buchung nach den Sonderkonditionen für Klinikbesucher.</li>
            </ul>
            <p>Weitere Antworten finden Sie in unseren <a href="/haeufige-fragen.html">häufigen Fragen</a> und im Blogbeitrag <a href="/blog/uebernachten-augsburg-oberhausen-hotel-pension-monteurzimmer.html">Übernachten in Augsburg-Oberhausen</a>.</p>
        </div>
${faqBlock(klinikFaq)}
        <div style="margin-top: 40px; text-align: center;">
            <a href="/#kontakt" class="btn" style="display: inline-block; padding: 15px 40px; background-color: var(--clr-gold); color: white; border-radius: 8px; cursor: pointer; text-decoration: none;">Kontaktieren Sie uns für Ihr Angebot</a>
        </div>
    </div>
</section>`;

createPage('hotel-klinik-augsburg.html',
    "Hotel nahe Uniklinik Augsburg & Josefinum | Goldener Falke",
    "Hotel für Klinikbesucher in Augsburg: ca. 10 Min. zur Uniklinik, ca. 4 Min. zum Josefinum. Sonderkonditionen für Angehörige, Parkplatz gratis, 24h-Check-in.",
    'https://www.goldener-falke.de/hotel-klinik-augsburg.html',
    klinikHtml,
    faqSchema(klinikFaq)
);

// 3. Hotel Messe Augsburg
const messeFaq = [
    {
        "q": "Wie weit ist das Hotel von der Messe Augsburg entfernt?",
        "a": "Über die B17 erreichen Sie die Messe Augsburg mit dem Auto in ca. 15 Minuten."
    },
    {
        "q": "Gibt es einen Parkplatz am Hotel?",
        "a": "Ja, Gäste parken kostenlos auf dem hauseigenen Parkplatz direkt am Hotel (nach Verfügbarkeit)."
    },
    {
        "q": "Kann ich nach einem Messetag spät einchecken?",
        "a": "Ja. Nach kurzer Voranmeldung nutzen Sie unser 24h-Check-in-Terminal. Die regulären Check-in-Zeiten sind Montag bis Freitag 15:00 bis 18:00 Uhr."
    },
    {
        "q": "Gibt es WLAN zum Arbeiten?",
        "a": "Ja, kostenloses WLAN steht in allen Zimmern und im gesamten Hotelbereich zur Verfügung. In der Gästelounge gibt es zusätzlich einen Computer und eine Kaffeemaschine."
    },
    {
        "q": "Gibt es Gruppenpreise für Messeteams?",
        "a": "Ja, Gruppenpreise erhalten Sie auf Anfrage – telefonisch unter +49 821 41 19 57 oder per E-Mail an hotel@goldener-falke.de."
    },
    {
        "q": "Wie komme ich von der Autobahn zum Hotel?",
        "a": "Nehmen Sie auf der A8 die Ausfahrt Augsburg-West und fahren Sie auf die B17 Richtung Landsberg bis zur Ausfahrt Zentralklinikum. Die Navi-Adresse lautet Neuhäuserstraße 10, 86154 Augsburg."
    }
];

const messeHtml = `<section>
    <div class="container" style="max-width: 900px;">
        <h1 style="text-align: center; margin-bottom: 30px;">Messehotel Augsburg</h1>
        <p style="font-size: 1.1rem; margin-bottom: 30px;"><strong>Kurz gesagt:</strong> Vom Hotel Goldener Falke in Augsburg-Oberhausen erreichen Sie die Messe Augsburg über die B17 in ca. 15 Minuten mit dem Auto. Für Aussteller, Fachbesucher und Geschäftsreisende bieten wir einen kostenlosen Parkplatz, ein 24h-Check-in-Terminal für späte Anreisen, kostenloses WLAN und ein Frühstücksbuffet – zu fairen Preisen bei Direktbuchung.</p>

        ${figure('doppel', 'Doppelzimmer Standard im Hotel Goldener Falke – Messehotel in Augsburg-Oberhausen', '', { priority: true, sizes: '(max-width: 900px) 100vw, 900px', style: 'width: 100%; height: auto; max-height: 460px; object-fit: cover; border-radius: 12px; display: block;' })}
        <div class="feature-card" style="max-width: 600px; margin: 0 auto;">
            <h3>Kurze Wege zur Messe</h3>
            <p>Über die B17 erreichen Sie die Messe Augsburg in nur ca. 15 Minuten.</p>
            <p style="margin-top: 15px;">Nutzen Sie unsere erweiterten Check-In Zeiten und den kostenlosen Parkplatz für Ihre Messebesuche.</p>
        </div>

        <div class="blog-content" style="line-height: 1.8; font-size: 1.05rem; margin-top: 40px;">
            <h2>Das Wichtigste auf einen Blick</h2>
            <ul>
                <li><strong>Adresse:</strong> Hotel Goldener Falke, Neuhäuserstraße 10, 86154 Augsburg (Oberhausen)</li>
                <li><strong>Messe Augsburg:</strong> ca. 15 Minuten mit dem Auto über die B17</li>
                <li><strong>Autobahn:</strong> A8, Ausfahrt Augsburg-West, weiter über die B17</li>
                <li><strong>Parken:</strong> kostenloser Hotelparkplatz direkt am Haus (nach Verfügbarkeit)</li>
                <li><strong>Check-in:</strong> regulär Montag bis Freitag 15:00–18:00 Uhr, außerhalb dieser Zeiten per 24h-Check-in-Terminal nach kurzer Voranmeldung</li>
                <li><strong>Arbeiten:</strong> kostenloses WLAN in allen Zimmern, Gästelounge mit Computer und Kaffeemaschine</li>
                <li><strong>Frühstück:</strong> Frühstücksbuffet, jeden Morgen frisch zubereitet</li>
                <li><strong>Zimmer:</strong> Einzelzimmer Eco, Einzelzimmer Standard, Doppelzimmer Standard – alle mit Dusche/WC und TV</li>
                <li><strong>Gruppen:</strong> Gruppenpreise auf Anfrage</li>
            </ul>

            <h2>Warum ein Messehotel in Augsburg-Oberhausen?</h2>
            <p>Während einer Messe sind Hotels in unmittelbarer Nähe des Messegeländes schnell ausgebucht – und oft teuer. Ein Hotel mit guter Verkehrsanbindung ist dann die entspanntere Wahl. Das Hotel Goldener Falke liegt in Augsburg-Oberhausen mit direktem Anschluss an die B17, die Augsburg von Norden nach Süden durchquert. So sind Sie in ca. 15 Minuten an der Messe Augsburg und abends ebenso schnell zurück.</p>
            <p>Dazu kommt, was Aussteller und Fachbesucher wirklich brauchen: ein Parkplatz, der nichts kostet und direkt am Haus liegt, ein Zimmer mit WLAN für E-Mails und Nachbereitung und ein Frühstück, das Sie gut in einen langen Messetag starten lässt.</p>

            <h2>Wie komme ich vom Hotel zur Messe Augsburg?</h2>
            <p>Am schnellsten geht es mit dem Auto über die B17 – rund 15 Minuten, je nach Verkehr. Zu Messezeiten kann es rund um das Messegelände voller werden; planen Sie für den Morgen etwas Puffer ein. Informationen zu Veranstaltungen, Anfahrt und Parken am Messegelände finden Sie direkt bei der <a href="https://www.messeaugsburg.de" target="_blank" rel="noopener nofollow">Messe Augsburg</a>.</p>
            <p>Wer lieber öffentlich fährt, startet an der Haltestelle „Oberhausen Bahnhof/Helmut-Haller-Platz" direkt um die Ecke. Die passende Verbindung zeigt die Fahrplanauskunft der <a href="https://www.sw-augsburg.de/" target="_blank" rel="noopener">Stadtwerke Augsburg</a>.</p>

            <h2>Wie komme ich zum Hotel?</h2>
            <p>Mit dem Auto nehmen Sie auf der A8 die Ausfahrt Augsburg-West und fahren auf die B17 Richtung Landsberg bis zur Ausfahrt Zentralklinikum. Von dort geht es links nach Kriegshaber, geradeaus über den Kobelweg bis zur Backsteinkirche, an der Ampel links, unter der Bahnunterführung hindurch und an der nächsten Ampel links in die Neuhäuserstraße – nach etwa 50 m rechts. Mit der Bahn fahren Sie bis Augsburg-Oberhausen oder steigen am Hauptbahnhof um. Alle Details finden Sie unter <a href="/lage-anfahrt.html">Lage &amp; Anfahrt</a> und im Beitrag <a href="/blog/anreise-augsburg-auto-bahn-flugzeug.html">Anreise nach Augsburg</a>.</p>

            <h2>Kann ich nach einem langen Messetag noch spät einchecken?</h2>
            <p>Ja. Aufbautage, Standpartys und Kundentermine enden selten pünktlich. Deshalb gibt es bei uns ein <strong>24h-Check-in-Terminal</strong>: Melden Sie Ihre späte Anreise kurz telefonisch oder per E-Mail an, wir schalten das Self-Service-Terminal am Eingang für Sie frei, und Sie erhalten dort mit Ihrem Reservierungsnamen Ihre Zimmerkarte – rund um die Uhr, auch am Wochenende.</p>

            <h2>Welche Zimmer gibt es für Messegäste?</h2>
            <ul>
                <li><strong>Einzelzimmer Eco</strong> – Dusche/WC, TV, Erfrischungsgetränk und kostenloses WLAN; die günstige Wahl für Fachbesucher</li>
                <li><strong>Einzelzimmer Standard</strong> – zusätzlich mit Safe und Kühlschrank</li>
                <li><strong>Doppelzimmer Standard</strong> – mit Doppelbett, Safe und Kühlschrank</li>
            </ul>
            <p>Aktuelle Preise und Verfügbarkeit finden Sie unter <a href="/zimmer-preise.html">Zimmer &amp; Preise</a>. Bei Direktbuchung über unsere Website zahlen Sie keine Buchungsgebühren.</p>

            ${figure('buffet', 'Frühstücksbuffet für Messegäste im Hotel Goldener Falke Augsburg', 'Gut gestärkt in den Messetag: unser Frühstücksbuffet', { sizes: '(max-width: 900px) 100vw, 640px', style: 'width: 100%; max-width: 640px; height: auto; border-radius: 12px; display: block; margin: 0 auto;' })}
            <h2>Reisen Sie als Team an?</h2>
            <p>Für Messeteams, Standpersonal und Gruppen nennen wir Ihnen gern Gruppenpreise – sprechen Sie uns einfach an. Bleibt Ihr Team länger in Augsburg, etwa für Aufbau, Montage oder Projektarbeit, lohnt sich auch ein Blick auf unsere Schwesterseiten: <a href="https://www.monteurzimmer.augsburg-apartments.de/" target="_blank" rel="noopener">Monteurzimmer Augsburg</a> für Handwerker und Monteure sowie <a href="https://www.apartment-augsburg.de/" target="_blank" rel="noopener">apartment-augsburg.de</a> für möblierte Apartments ab einer Woche.</p>

            <h2>Checkliste für Ihre Messereise</h2>
            <ul>
                <li>Zimmer frühzeitig buchen – zu Messezeiten ist die Nachfrage in Augsburg hoch.</li>
                <li>Späte Anreise kurz anmelden, damit das Check-in-Terminal freigeschaltet ist.</li>
                <li>Für den Messemorgen etwas Puffer auf der B17 einplanen.</li>
                <li>Nach Gruppenpreisen fragen, wenn Sie mit mehreren Personen anreisen.</li>
            </ul>
            <p>Noch Fragen? In unseren <a href="/haeufige-fragen.html">häufigen Fragen</a> finden Sie weitere Antworten – oder Sie rufen uns direkt an: <a href="tel:+49821411957">+49 821 41 19 57</a>.</p>
        </div>
${faqBlock(messeFaq)}
        <div style="margin-top: 40px; text-align: center;">
            <a href="/buchen.html" class="btn" style="display: inline-block; padding: 15px 40px; background-color: var(--clr-gold); color: white; border-radius: 8px; cursor: pointer; text-decoration: none;">Zimmer für Ihre Messe buchen</a>
        </div>
    </div>
</section>`;

createPage('hotel-messe-augsburg.html',
    "Hotel nahe Messe Augsburg | ca. 15 Min. – Goldener Falke",
    "Messehotel in Augsburg-Oberhausen: über die B17 ca. 15 Min. zur Messe Augsburg, kostenloser Parkplatz, 24h-Check-in-Terminal, WLAN und Frühstücksbuffet.",
    'https://www.goldener-falke.de/hotel-messe-augsburg.html',
    messeHtml,
    faqSchema(messeFaq)
);

// 4. Über Uns
const ueberHtml = `<section>
    <div class="container">
        <h1 style="text-align: center; margin-bottom: 30px;">Über das Hotel Goldener Falke</h1>
        <p style="text-align: center; font-size: 1.1rem; margin-bottom: 40px;">Seit über 100 Jahren Ihre Heimat in Augsburg.</p>
        <div style="max-width: 800px; margin: 0 auto 40px;">
        ${figure('fassade', 'Aquarell der Hausfassade des Hotel Goldener Falke in Augsburg-Oberhausen', 'Das Hotel Goldener Falke in der Neuhäuserstraße – als Aquarell', { priority: true, sizes: '(max-width: 800px) 100vw, 800px' })}
        </div>
        <div class="feature-card" style="max-width: 800px; margin: 0 auto;">
            <p>Das Hotel Goldener Falke ist ein Familienhotel mit langer Tradition. Gegründet 1923, bieten wir komfortable und preiswerte Übernachtungen in einem der schönsten Teile Augsburgs.</p>
            <p style="margin-top: 20px;">Kostenlos Parken, 24h Check-In, WLAN und reichhaltiges Frühstück – alles zu fairen Preisen.</p>
        </div>
        <div style="max-width: 480px; margin: 40px auto 0;">
        ${figure('fruehstuecksraum', 'Frühstücksraum mit Buffet im Hotel Goldener Falke in Augsburg', 'Unser Frühstücksraum – das Buffet wird jeden Morgen frisch zubereitet', { sizes: '(max-width: 480px) 100vw, 480px' })}
        </div>
        <p style="text-align: center; margin-top: 20px;">Mehr zur Geschichte des Hauses lesen Sie im Blogbeitrag <a href="/blog/geschichte-goldener-falke.html">Die Geschichte des Goldenen Falken</a>.</p>
    </div>
</section>`;

createPage('ueber-uns.html',
    "Über uns | Familienhotel in Augsburg seit 1923",
    "Das Hotel Goldener Falke ist ein familiär geführtes Hotel in Augsburg-Oberhausen – seit 1923. Komfortable Zimmer, faire Preise, kostenloser Parkplatz.",
    'https://www.goldener-falke.de/ueber-uns.html',
    ueberHtml
);

// 5. Lage & Anfahrt
const lageHtml = `<section>
    <div class="container">
        <h1 style="text-align: center; margin-bottom: 30px;">Lage & Anfahrt</h1>
        <p style="text-align: center; font-size: 1.1rem; margin-bottom: 40px;">Hotel Goldener Falke · Neuhäuserstraße 10 · 86154 Augsburg</p>
        <div style="max-width: 600px; margin: 0 auto 40px;">
        ${figure('fassade', 'Aquarell des Hotel Goldener Falke in der Neuhäuserstraße 10 in Augsburg-Oberhausen', 'Hier finden Sie uns: Neuhäuserstraße 10 in Augsburg-Oberhausen', { priority: true, sizes: '(max-width: 600px) 100vw, 600px' })}
        </div>
        <div class="feature-card" style="max-width: 600px; margin: 0 auto;">
            <h3>Verkehrsanbindung</h3>
            <p><strong>Kostenlos Parken:</strong> Direkter Parkplatz am Hotel</p>
            <p style="margin-top: 10px;"><strong>Öffentliche Verkehrsmittel:</strong> Nächste Bushaltestelle in Gehweite</p>
            <p style="margin-top: 10px;"><strong>Flughafen:</strong> ca. 50 Minuten Fahrzeit zum Flughafen München</p>
        </div>
        <div class="feature-card" style="max-width: 600px; margin: 30px auto 0;">
            <h3>Mit dem Auto</h3>
            <p>Autobahnausfahrt Augsburg West → B17 Richtung Landsberg → Ausfahrt Zentralklinikum → links nach Kriegshaber → geradeaus (Kobelweg) bis zur Backsteinkirche → Ampel links → unter Bahnunterführung → Ampel links in die Neuhäuserstr. → nach 50m rechts.</p>
            <h3 style="margin-top: 20px;">Mit der Bahn</h3>
            <p>Ticket für Augsburg-Oberhausen lösen. Direkt am Bahnhof Augsburg-Oberhausen aussteigen oder am Hbf umsteigen in R4/R6. Alternativ Straßenbahn Linie 4 → Umstieg Linie 2 Richtung P+R West → Haltestelle „Oberhausen Bahnhof/Helmut-Haller-Platz".</p>
            <p style="margin-top: 15px;">Mehr Tipps im Blogbeitrag <a href="/blog/anreise-augsburg-auto-bahn-flugzeug.html">Anreise nach Augsburg</a>.</p>
        </div>
    </div>
</section>`;

createPage('lage-anfahrt.html',
    "Lage & Anfahrt | Hotel Goldener Falke Augsburg-Oberhausen",
    "Neuhäuserstraße 10, 86154 Augsburg-Oberhausen: Anfahrt über A8 und B17, Bahnhof Oberhausen um die Ecke, kostenloser Hotelparkplatz, Uniklinik ca. 10 Min.",
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
    // heroImage: Schlüssel aus IMAGES (Titelbild des Posts), heroAlt: Alt-Text
    const heroKey = post.heroImage && IMAGES[post.heroImage] ? post.heroImage : null;
    const ogImage = heroKey ? imageUrl(heroKey) : post.image;
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
    page = setMeta(page, 'property', 'og:image', ogImage);
    page = setMeta(page, 'name', 'twitter:image', ogImage);
    page = setMeta(page, 'name', 'keywords', post.keywords);
    page = page.replace(/<link rel="canonical" href=".*?"(.*?)>/, `<link rel="canonical" href="${url}"$1>`);

    // Create BlogPosting schema
    const blogSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": description,
        "image": heroKey ? imageObject(heroKey, post.heroAlt) : post.image,
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

            ${heroKey ? figure(heroKey, post.heroAlt || post.title, post.heroCaption || '', { priority: true, sizes: '(max-width: 900px) 100vw, 900px', style: 'width: 100%; height: auto; max-height: 480px; object-fit: cover; border-radius: 12px; display: block;' }) : ''}

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
    
    const postCardsHtml = sortedPosts.map((post, i) => `
        <article class="blog-card" style="background: white; padding: 30px; border-radius: 12px; box-shadow: var(--shadow); transition: var(--transition); border: 1px solid var(--clr-warm-dark);">
            ${post.heroImage && IMAGES[post.heroImage] ? `<a href="/blog/${post.slug}.html" aria-hidden="true" tabindex="-1">${pic(post.heroImage, post.heroAlt || post.title, { priority: i === 0, sizes: '(max-width: 768px) 100vw, 400px', style: 'width: 100%; height: 200px; object-fit: cover; border-radius: 10px; display: block; margin-bottom: 20px;' })}</a>` : ''}
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
        <div style="max-width: 800px; margin: 0 auto 30px;">
        ${figure('zimmer', 'Hotelzimmer mit großem Bett im Hotel Goldener Falke in Augsburg-Oberhausen', '', { priority: true, sizes: '(max-width: 800px) 100vw, 800px', style: 'width: 100%; height: auto; max-height: 420px; object-fit: cover; border-radius: 12px; display: block;' })}
        </div>

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
                            "text": "Unsere regulären Check-In Zeiten sind Montag bis Freitag von 15:00 bis 18:00 Uhr. Darüber hinaus können Sie unser 24h Check-In-Terminal (elektronisch) durchgehend von Montag bis Sonntag von 0:00 bis 24:00 Uhr nutzen. Der Check-out erfolgt in der Regel bis 10:00 Uhr."
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
                    <p style="margin-top: 15px; line-height: 1.6;">Unsere regulären Check-In Zeiten sind Montag bis Freitag von 15:00 bis 18:00 Uhr. Darüber hinaus können Sie unser <strong>24h Check-In-Terminal (elektronisch)</strong> durchgehend von Montag bis Sonntag von 0:00 bis 24:00 Uhr nutzen. Der Check-out erfolgt in der Regel bis 10:00 Uhr.</p>
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
