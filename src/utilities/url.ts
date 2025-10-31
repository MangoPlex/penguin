export function removeQueryParams(url: string): string {
  try {
    const parsedUrl = new URL(url);
    parsedUrl.search = "";
    return parsedUrl.toString();
  } catch (error) {
    console.error(`Invalid URL provided: ${url}`);
    return url;
  }
}

export function checkUrlDomain(url: string, domain: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
    );
  } catch (error) {
    console.error(`Invalid URL provided: ${url}`);
    return false;
  }
}

export function replaceDomain(url: string, newDomain: string): string {
  try {
    const parsedUrl = new URL(url);
    parsedUrl.hostname = newDomain;
    return parsedUrl.toString();
  } catch (error) {
    console.error(`Invalid URL provided: ${url}`);
    return url;
  }
}
