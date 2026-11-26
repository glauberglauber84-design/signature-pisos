// Redireciona www -> domínio sem www (301), preservando caminho e query.
export function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.hostname === 'www.signaturepisos.com.br') {
    url.hostname = 'signaturepisos.com.br';
    url.protocol = 'https:';
    return Response.redirect(url.toString(), 301);
  }
  return next();
}
