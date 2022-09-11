import { fetch, FetchResultTypes } from "@sapphire/fetch";

export default class CryptoHelper {
  public static async getCryptoPrice(coin: string): Promise<Response[]> {
    const coins = coin.split(",");

    return fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd,vnd`,
      FetchResultTypes.Text
    ).then((res) => {
      let result: Response[] = [];

      for (const coin of coins) {
        result.push({
          coin: coin,
          currency: JSON.parse(res)[coin],
        });
      }

      return result;
    });
  }
}

interface Response {
  coin: string;
  currency: Currency;
}

interface Currency {
  usd: number;
  vnd: number;
}
