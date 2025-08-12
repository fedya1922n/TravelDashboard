export async function fetchWikiInfo(title, language = 'ru') {
  try {
    let languages;
    switch (language) {
      case 'zh':
        languages = ['zh', 'en', 'ru'];
        break;
      case 'uz':
        languages = ['uz', 'ru', 'en'];
        break;
      case 'en':
        languages = ['en', 'ru', 'uz'];
        break;
      default:
        languages = ['ru', 'en', 'uz'];
    }

    const search = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(title)}&language=${language}&format=json&origin=*`
    ).then((r) => r.json());

    if (!search || !search.search || search.search.length === 0) return null;

    const entity = search.search[0];
    const qid = entity.id;

    const data = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qid}&format=json&languages=${languages.join(',')}&props=descriptions|claims|sitelinks&origin=*`
    ).then((r) => r.json());

    const ent = data.entities?.[qid];
    if (!ent) return null;

    let desc = null;
    for (const lang of languages) {
      if (ent.descriptions?.[lang]?.value) {
        desc = ent.descriptions[lang].value;
        break;
      }
    }

    let wiki = null;
    for (const lang of languages) {
      const wikiKey = `${lang}wiki`;
      if (ent.sitelinks?.[wikiKey]?.url) {
        wiki = ent.sitelinks[wikiKey].url;
        break;
      }
    }

    const imgName = ent.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
    const img = imgName
      ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(imgName)}`
      : null;

    return { description: desc, wikipedia: wiki, image: img };
  } catch (e) {
    return null;
  }
}