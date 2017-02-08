export class Utils {
  private static readonly REGEXP_ESCAPE = /[\\^$*+?.()|[\]{}]/g;

  public static readonly toRegExpSafe = (str: string) => str.replace(Utils.REGEXP_ESCAPE, '\\$&');
  public static readonly highlightTerm = (result: string, term: string) =>
    result.replace(new RegExp(`(${Utils.toRegExpSafe(term)})`, 'gi'), `<strong>$1</strong>`);
}