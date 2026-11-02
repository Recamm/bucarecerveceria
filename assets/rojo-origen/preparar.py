from pathlib import Path
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse
from datetime import datetime, timezone
import hashlib
import json
import random
import shutil
import subprocess
from PIL import Image, ImageFilter, ImageDraw

ASSETS = Path(__file__).resolve().parent
ROOT = ASSETS.parent.parent
ARCHIVE = ROOT / "investigacion" / "imagenes"
records = {"fecha": datetime.now(timezone.utc).isoformat(), "nota": "Preparación para pruebas visuales. Los logos y fotos conservan los derechos de sus titulares. No equivale a un archivo maestro de marca.", "archivos": []}
original = ARCHIVE / "logo-instagram.jpg"
shutil.copyfile(original, ASSETS / "logo-instagram-original.jpg")
source = ASSETS / "logo-instagram-original.jpg"
method = "Ampliación Lanczos y enfoque suave del JPEG archivado; no recupera detalle inexistente ni constituye un vector oficial."
metadata = json.loads((ROOT / "investigacion" / "instagram-metadatos.json").read_text())
url = metadata.get("og:image", "")
if url:
    parts = urlparse(url)
    query = [(key, value) for key, value in parse_qsl(parts.query) if key != "stp"]
    candidate_url = urlunparse(parts._replace(query=urlencode(query)))
    candidate = ASSETS / "logo-instagram-alta.jpg"
    result = subprocess.run(["curl", "-L", "--fail", "--silent", "--show-error", "--max-time", "35", candidate_url, "-o", str(candidate)], capture_output=True, text=True)
    if result.returncode == 0:
        try:
            candidate_image = Image.open(candidate)
            if candidate_image.width > Image.open(source).width and abs(candidate_image.width - candidate_image.height) < 3:
                source = candidate
                method = "Avatar público recuperado desde el CDN de Instagram sin la reducción de miniatura; no es una reconstrucción tipográfica."
                records["url_avatar_alta"] = candidate_url
            else:
                candidate.unlink()
        except OSError:
            candidate.unlink(missing_ok=True)
    else:
        records["intento_alta"] = "El CDN no entregó una imagen mayor accesible; se conserva el original archivado."
        candidate.unlink(missing_ok=True)

logo = Image.open(source).convert("RGBA")
for size in (256, 1024):
    rendered = logo.resize((size, size), Image.Resampling.LANCZOS)
    if logo.width < size:
        rendered = rendered.filter(ImageFilter.UnsharpMask(radius=1.2, percent=90, threshold=4))
    mask = Image.new("L", (size * 2, size * 2))
    ImageDraw.Draw(mask).ellipse((1, 1, size * 2 - 2, size * 2 - 2), fill=255)
    rendered.putalpha(mask.resize((size, size), Image.Resampling.LANCZOS))
    rendered.save(ASSETS / f"logo-instagram-{size}.png", optimize=True)
records["logo"] = {"original_archivado": "investigacion/imagenes/logo-instagram.jpg", "fuente_utilizada": source.name, "dimensiones_fuente": list(logo.size), "metodo": method, "salidas": ["logo-instagram-256.png", "logo-instagram-1024.png"]}

photographs = [("florida-canillas.jpg", "barra.webp"), ("florida-fachada.jpg", "fachada.webp"), ("florida-salon.jpg", "salon.webp")]
for filename, target in photographs:
    picture = Image.open(ARCHIVE / filename).convert("RGB")
    picture.thumbnail((1600, 1300), Image.Resampling.LANCZOS)
    picture.save(ASSETS / target, "WEBP", quality=87, method=6)
    records["archivos"].append({"archivo": target, "fuente": f"investigacion/imagenes/{filename}", "uso": "Fotografía pública de Florida: confirmar licencia y vigencia antes de publicar comercialmente."})

wood = Image.open(ARCHIVE / "florida-canillas.jpg").convert("RGB").crop((8, 8, 280, 800))
wood.save(ASSETS / "madera-real.webp", "WEBP", quality=92, method=6)
records["archivos"].append({"archivo": "madera-real.webp", "fuente": "Recorte de madera de florida-canillas.jpg; no de la imagen adjunta por el usuario."})

random.seed(26)
chalk = Image.new("RGB", (512, 512))
chalk.putdata([(base, base + 3, base + 1) for base in (random.randint(32, 44) for index in range(512 * 512))])
chalk = chalk.filter(ImageFilter.GaussianBlur(0.35))
chalk.save(ASSETS / "pizarra.webp", "WEBP", quality=83)
records["archivos"].append({"archivo": "pizarra.webp", "fuente": "Textura bitmap generada localmente, ruido de grafito/tiza; sin foto de terceros."})

font_url = "https://cdn.jsdelivr.net/npm/@fontsource/caveat@5.2.6/files/caveat-latin-600-normal.woff2"
font_result = subprocess.run(["curl", "-L", "--fail", "--silent", "--show-error", "--max-time", "35", font_url, "-o", str(ASSETS / "caveat-latin-600-normal.woff2")], capture_output=True, text=True)
if font_result.returncode != 0:
    raise RuntimeError(font_result.stderr)
subprocess.run(["curl", "-L", "--fail", "--silent", "--show-error", "--max-time", "35", "https://cdn.jsdelivr.net/npm/@fontsource/caveat@5.2.6/LICENSE", "-o", str(ASSETS / "caveat-LICENSE.txt")], check=True)
assert (ASSETS / "caveat-latin-600-normal.woff2").read_bytes()[:4] == b"wOF2"
records["archivos"].append({"archivo": "caveat-latin-600-normal.woff2", "fuente": font_url, "licencia": "caveat-LICENSE.txt"})
for filename in sorted(ASSETS.iterdir()):
    if filename.suffix in (".png", ".jpg", ".webp", ".svg", ".woff2"):
        data = filename.read_bytes()
        records.setdefault("hashes", {})[filename.name] = {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
(ASSETS / "procedencia.json").write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n")
print("Logo:", logo.size, method)
print("Assets listos: logos PNG transparentes, tres fotos WebP, madera real, pizarra y tipografía local.")