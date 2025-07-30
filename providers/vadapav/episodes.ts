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
    const baseUrl = url?.split("/").slice(0, 3).join("/");
    const res = await axios.get(url);
    const html = res.data;
    let $ = cheerio.load(html);
    const episodeLinks: EpisodeLink[] = [];

    $('.file-entry:not(:contains("Parent Directory"))').map((i, element) => {
      const link = $(element).attr("href");
      if (
        link &&
        ($(element).text()?.includes(".mp4") ||
          $(element).text()?.includes(".mkv"))
      ) {
        episodeLinks.push({
          title:
            $(element).text()?.match(/E\d+/)?.[0]?.replace("E", "Episode ") ||
            i + 1 + ". " + $(element).text()?.replace(".mkv", ""),
          link: baseUrl + link,
        });
      }
    });

    return episodeLinks;
  } catch (err) {
    return [];
  }
};
