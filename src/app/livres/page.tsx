import { Shuffle } from "@/components/Shuffle";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Portrait } from "@/components/Portrait";
import { UI_COPY } from "@/lib/copy";
import { portraitOf } from "@/lib/images";
import { essaisByRayon, isAffiliate, livresByBloc } from "@/lib/livres";
import { absolute } from "@/lib/site";

const t = UI_COPY.livres;

export const metadata: Metadata = {
  title:
    "Lire les candidats : le livre de chaque candidat à la présidentielle 2027",
  description:
    "Les livres écrits par les candidats à la présidentielle 2027, de l’extrême gauche à l’extrême droite, rangés par famille politique selon la grille officielle des nuances.",
  alternates: { canonical: "/livres" },
};

export default function LivresPage() {
  const blocs = livresByBloc();
  const shelves = essaisByRayon();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t.title,
    url: absolute("/livres"),
    itemListElement: blocs
      .flatMap((b) => b.livres)
      .map((l, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Book",
          ...(l.title ? { name: l.title } : {}),
          author: {
            "@type": "Person",
            name: l.actor.name,
            url: absolute(`/candidats/${l.actor.slug}`),
          },
          url: l.url,
        },
      })),
  };
  return (
    <div className="container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <PageHeader kicker={t.kicker} title={t.title} lede={t.lede} />
      <p className="small muted measure">
        {isAffiliate ? t.affiliate : t.plain} {t.blocNote}
      </p>
      <p>
        <Link
          className="btn btn--highlight"
          href="/quiz/flash/dis-moi-qui-tu-es-je-te-dirai-quoi-lire"
        >
          {t.quiz}
        </Link>
      </p>
      <Shuffle as="div">
        {blocs.map((b) => (
          <section
            key={b.id}
            className="section"
            aria-labelledby={`bloc-${b.id}`}
          >
            <h2 id={`bloc-${b.id}`} style={{ fontSize: "var(--h3)" }}>
              {b.label}
            </h2>
            <Shuffle className="livres" role="list">
              {b.livres.map((l) => (
                <li key={l.actor.slug} className="card card--flat livre">
                  {l.cover ? (
                    <Cover src={l.cover} />
                  ) : (
                    <Portrait
                      src={portraitOf(l.actor.slug)}
                      name={l.actor.name}
                      bloc={b.id}
                      size={56}
                    />
                  )}
                  <div>
                    <p className="livre__title">
                      <a
                        href={l.url}
                        rel="sponsored noopener noreferrer"
                        target="_blank"
                      >
                        {l.title ?? t.untitled}
                      </a>
                    </p>
                    <p className="small" style={{ margin: 0 }}>
                      <Link href={`/candidats/${l.actor.slug}`}>
                        {l.actor.name}
                      </Link>
                      {l.actor.party ? (
                        <span className="muted"> · {l.actor.party}</span>
                      ) : null}
                      {l.actor.status === "retire" ? (
                        <span className="muted"> · {t.retired}</span>
                      ) : null}
                    </p>
                  </div>
                </li>
              ))}
            </Shuffle>
          </section>
        ))}
      </Shuffle>
      {shelves.length > 0 && (
        <section className="section" aria-labelledby="essais">
          <h2 id="essais">{t.essaisTitle}</h2>
          <p className="small muted measure">{t.essaisNote}</p>
          {shelves.map((r) => (
            <div key={r.id} className="section">
              <h3>{r.label}</h3>
              <ul className="livres" role="list">
                {r.essais.map((e) => (
                  <li key={e.url} id={e.id} className="card card--flat livre">
                    {e.cover && <Cover src={e.cover} />}
                    <div>
                      <p className="livre__title">
                        <a
                          href={e.url}
                          rel="sponsored noopener noreferrer"
                          target="_blank"
                        >
                          {e.title}
                        </a>
                      </p>
                      <p className="small muted" style={{ margin: 0 }}>
                        {e.author}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
      <p className="small section">
        <Link href="/contact">{t.missing}</Link> ·{" "}
        <Link href="/candidats">Tous les candidats</Link>
      </p>
    </div>
  );
}

/** Couverture servie par le site (aucune image tierce), décorative : le titre est juste à côté */
function Cover({ src }: { src: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      className="livre__cover"
      src={src}
      alt=""
      width={72}
      height={110}
      loading="lazy"
      decoding="async"
    />
  );
}
