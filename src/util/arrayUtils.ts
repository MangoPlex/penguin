export default class ArrayUtils {
  public static divQueue(arr: any[], chunkSize: number): any[] {
    return arr.reduce((resultArray: any[], item, index) => {
      const chunkIndex = Math.floor(index / chunkSize);

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = [];
      }
      resultArray[chunkIndex].push(item);
      return resultArray;
    }, []);
  }
}
