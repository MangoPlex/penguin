export default class OsUtils {
  public static isWin() {
    return process.platform === "win32";
  }

  public static isMacOS() {
    return process.platform === "darwin";
  }

  public static isLinux() {
    return process.platform === "linux";
  }
}
