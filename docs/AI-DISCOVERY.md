# Discovery publishing boundaries

R79 adds human-readable bilingual about/contribution HTML, visible welcome links, canonical URLs, a sitemap and optional llms summary. It does not guarantee indexing, ranking, answer inclusion or citations, and it does not submit the project to external services.

The repository-announced canonical origin is https://tour.bkeel.com/gugong/. Both root-preview and /gugong/ builds must retain working relative local links; canonical URLs identify the announced production URL, not the local preview host. This is not proof that this candidate has been deployed.

robots.txt is effective only at the domain root, https://tour.bkeel.com/robots.txt. A /gugong/robots.txt cannot set that policy, so this release intentionally adds no robots file and does not change the site's existing root policy. The site owner may separately inspect root rules, CDN responses and relevant search crawler access. No permission for model training is inferred or changed.

A deployed sitemap may be made discoverable through the domain's existing root robots policy or an owner-managed search console. Neither is changed or submitted here. Public pages must return successful HTML responses rather than a game fallback or login page. New about/contribution paths remain deployment-pending until the selected release is actually published.

llms.txt is an optional accurate summary, not a standardized inclusion guarantee. Links to repository documents are absolute. It must never contain instructions to override a reader's task, fake endorsements, reviews or citations.

CITATION.cff describes the actual project/authors and existing MIT license, with no invented DOI, ORCID or author transliteration. GitHub's citation control depends on the file reaching the default branch; a development-branch file alone does not activate that control.

Primary implementation guidance:
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec
- https://developers.openai.com/api/docs/bots
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/crawling-indexing/robots/intro
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-citation-files

These links describe mechanisms, not promises that this particular project has been indexed or cited.
