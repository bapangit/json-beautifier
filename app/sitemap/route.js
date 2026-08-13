export function GET(request) {
  return Response.redirect(new URL("/sitemap.xml", request.url), 308);
}
