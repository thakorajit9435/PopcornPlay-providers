import { EpisodeLink, Info, Link, ProviderContext } from "../types";

export const getMeta = async function ({
  link,
  providerContext,
}: {
  link: string;
  providerContext: ProviderContext;
}): Promise<Info> {
  try {
    const { axios, cheerio, getBaseUrl } = providerContext;
    const baseUrl = await getBaseUrl("protonMovies");

    console.log("all", link);
    const res = await axios.get(`${baseUrl}${link}`);
    const data = res.data;

    function decodeHtml(encodedArray: string[]): string {
      // Join array elements into a single string
      const joined = encodedArray.join("");

      // Replace escaped quotes
      const unescaped = joined.replace(/\\"/g, '"').replace(/\\'/g, "'");

      // Remove remaining escape characters
      const cleaned = unescaped
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\r/g, "\r");

      // Convert literal string representations back to characters
      const decoded = cleaned
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");

      return decoded;
    }

    const $$ = cheerio.load(data);
    const htmlArray = $$('script:contains("decodeURIComponent")')
      .text()
      .split(" = ")?.[1]
      ?.split("protomovies")?.[0]
      ?.trim()
      ?.slice(0, -1); // remove the last character
    // console.log('protonGetInfo', htmlArray);
    const html = decodeHtml(JSON.parse(htmlArray));
    // console.log('all', html);
    const $ = cheerio.load(html);

    const title = $(
      ".trending-text.fw-bold.texture-text.text-uppercase.my-0.fadeInLeft.animated.d-inline-block"
    ).text();
    const image = $("#thumbnail").attr("src");
    const type = link.includes("series") ? "series" : "movie";
    const synopsis =
      $(".col-12.iq-mb-30.animated.fadeIn").first().text() ||
      $(".description-content").text();
    const tags = $(".p-0.mt-2.list-inline.d-flex.flex-wrap.movie-tag")
      .find("li")
      .map((i, el) => $(el).text())
      .slice(0, 3)
      .get();

    const links: Link[] = [];

    if (type === "movie") {
      const directLinks: EpisodeLink[] = [];
      directLinks.push({ title: "Movie", link: baseUrl + link });
      links.push({ title: "Movie", directLinks: directLinks });
    } else {
      $("#episodes")
        .children()
        .map((i, element) => {
          let directLinks: EpisodeLink[] = [];
          $(element)
            .find(".episode-block")
            .map((j, ep) => {
              const link = baseUrl + $(ep).find("a").attr("href") || "";
              const title =
                "Episode " + $(ep).find(".episode-number").text().split("E")[1];
              directLinks.push({ title, link });
            });
          links.push({ title: "Season " + (i + 1), directLinks: directLinks });
        });
    }

    return {
      image: image || "",
      imdbId: "",
      linkList: links,
      title: title || "",
      synopsis: synopsis,
      tags: tags,
      type: type,
    };
  } catch (err) {
    console.error("prton", err);
    return {
      title: "",
      synopsis: "",
      image: "",
      imdbId: "",
      type: "movie",
      linkList: [],
    };
  }
};
