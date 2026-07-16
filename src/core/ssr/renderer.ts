import { Infographic } from '../runtime';

export async function renderToString(
  syntax: string,
): Promise<string> {
  const infographic = new Infographic(syntax);
  return infographic.render();
}
