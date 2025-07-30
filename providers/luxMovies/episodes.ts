import { EpisodeLink, ProviderContext } from "../types";

export const getEpisodes = async function ({
  url,
  providerContext,
}: {
  url: string;
  providerContext: ProviderContext;
}): Promise<EpisodeLink[]> {
  const { axios, cheerio, commonHeaders: headers } = providerContext;
  console.log("getEpisodeLinks", url);
  try {
    const res = await axios.get(url, { headers });
    const $ = cheerio.load(res.data);
    const container = $(".entry-content,.entry-inner");
    $(".unili-content,.code-block-1").remove();
    const episodes: EpisodeLink[] = [];
    container.find("h4").each((index, element) => {
      const el = $(element);
      const title = el.text().replace(/-/g, "").replace(/:/g, "");
      const link = el
        .next("p")
        .find(
          '.btn-outline[style="background:linear-gradient(135deg,#ed0b0b,#f2d152); color: white;"]'
        )
        .parent()
        .attr("href");
      if (title && link) {
        episodes.push({ title, link });
      }
    });
    // console.log(episodes);
    return episodes;
  } catch (err) {
    console.log("getEpisodeLinks error: ");
    // console.error(err);
    return [];
  }
};
