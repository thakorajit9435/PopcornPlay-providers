import { ProviderContext, Stream } from "../types";

export const getStream = async ({
  link: id,
  providerContext,
}: {
  link: string;
  providerContext: ProviderContext;
}): Promise<Stream[]> => {
  const { getBaseUrl } = providerContext;
  try {
    let providerValue = "netflixMirror";
    const baseUrl = await getBaseUrl("nfMirror");
    console.log("nfGetStream, baseUrl:", baseUrl);
    const url = `https://netmirror.8man.dev/api/net-proxy?url=${baseUrl}${
      providerValue === "netflixMirror"
        ? "/mobile/playlist.php?id="
        : "/pv/playlist.php?id="
    }${id}&t=${Math.round(new Date().getTime() / 1000)}`;
    console.log("nfGetStream, url:", url);
    const res = await fetch(url, {
      credentials: "omit",
    });
    const resJson = await res.json();
    const data = resJson?.[0];
    const streamLinks: Stream[] = [];
    data?.sources.forEach((source: any) => {
      streamLinks.push({
        server: source.label,
        link: source.file?.startsWith("http")
          ? source.file
          : `${baseUrl}${source.file}`,
        type: "m3u8",
        headers: {
          Referer: baseUrl,
          origin: baseUrl,
          Cookie: "hd=on",
        },
      });
    });
    console.log(streamLinks);
    return streamLinks;
  } catch (err) {
    console.error(err);
    return [];
  }
};
