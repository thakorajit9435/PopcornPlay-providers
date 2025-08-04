import { EpisodeLink, ProviderContext } from "../types";

export const getEpisodes = async function ({
  url,
  providerContext,
}: {
  url: string;
  providerContext: ProviderContext;
}): Promise<EpisodeLink[]> {
  const { axios, cheerio } = providerContext;
  try {
    if (url.includes("url=")) {
      url = atob(url.split("url=")[1]);
    }
    const res = await axios.get(url);
    const html = res.data;
    let $ = cheerio.load(html);
    if (url.includes("url=")) {
      const newUrl = $("meta[http-equiv='refresh']")
        .attr("content")
        ?.split("url=")[1];
      const res2 = await axios.get(newUrl || url);
      const html2 = res2.data;
      $ = cheerio.load(html2);
    }
    const episodeLinks: EpisodeLink[] = [];
    $("h3,h4").map((i, element) => {
      const seriesTitle = $(element).text();
      const episodesLink = $(element).find("a").attr("href");
      if (episodesLink && episodesLink !== "#") {
        episodeLinks.push({
          title: seriesTitle.trim() || "No title found",
          link: episodesLink || "",
        });
      }
    });
    $("a.maxbutton").map((i, element) => {
      const seriesTitle = $(element).children("span").text();
      const episodesLink = $(element).attr("href");
      if (episodesLink && episodesLink !== "#") {
        episodeLinks.push({
          title: seriesTitle.trim() || "No title found",
          link: episodesLink || "",
        });
      }
    });
    return episodeLinks;
  } catch (err) {
    console.error(err);
    return [];
  }
};
