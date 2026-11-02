from html.parser import HTMLParser
from pathlib import Path
import hashlib
import json
import re
import subprocess
from datetime import datetime, timezone
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parent
REPORTS = ROOT.parent / "informes"
REPORTS.mkdir(exist_ok=True)
(ROOT / "referencias" / "capturas").mkdir(exist_ok=True)


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.meta = {}
        self.hidden = 0
        self.text = []

    def handle_starttag(self, tag, attributes):
        values = dict(attributes)
        if tag == "meta":
            name = values.get("property", values.get("name"))
            if name:
                self.meta[name] = values.get("content", "")
        if tag in ("script", "style", "noscript"):
            self.hidden += 1

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript"):
            self.hidden = max(0, self.hidden - 1)

    def handle_data(self, data):
        if not self.hidden and data.strip():
            self.text.append(data.strip())


instagram = PageParser()
instagram.feed((ROOT / "instagram.html").read_text())
(ROOT / "instagram-metadatos.json").write_text(json.dumps(instagram.meta, ensure_ascii=False, indent=2) + "\n")
avatar = instagram.meta.get("og:image")
if avatar:
    target = ROOT / "imagenes" / "logo-instagram.jpg"
    result = subprocess.run(["curl", "-L", "--fail", "--silent", "--show-error", "--max-time", "60", avatar, "-o", str(target)], capture_output=True, text=True)
    records = json.loads((ROOT / "descargas.json").read_text())
    record = {"id": "logo-instagram", "url": avatar, "obtenido_en": datetime.now(timezone.utc).isoformat(), "archivo": "investigacion/imagenes/logo-instagram.jpg", "exito": result.returncode == 0}
    if record["exito"]:
        data = target.read_bytes()
        record.update(bytes=len(data), sha256=hashlib.sha256(data).hexdigest())
    else:
        record["error"] = result.stderr.strip()
    records = [item for item in records if item["id"] != "logo-instagram"] + [record]
    (ROOT / "descargas.json").write_text(json.dumps(records, indent=2, ensure_ascii=False) + "\n")
    print("Avatar Instagram:", "descargado" if record["exito"] else record["error"])

metadata = {}
for pdf in sorted((ROOT / "originales").glob("*.pdf")):
    result = subprocess.run(["pdfinfo", str(pdf)], capture_output=True, text=True, check=True)
    metadata[pdf.name] = dict(line.split(":", 1) for line in result.stdout.splitlines() if ":" in line)
    metadata[pdf.name] = {key.strip(): value.strip() for key, value in metadata[pdf.name].items()}
(ROOT / "pdf-metadatos.json").write_text(json.dumps(metadata, indent=2, ensure_ascii=False) + "\n")

annex = ["# Cartas completas de Bucaré", "", "Extracción textual íntegra de los tres PDFs públicos, sin unificar sucursales. Se preservan precios, ingredientes, marcas vegetarianas, erratas y guiones de la fuente. Fecha de consulta: 02/11/2026. La distribución de columnas puede perder información visual: ante una duda manda el PDF. No es una confirmación de vigencia ni de stock.", "", "[Promociones completas](../investigacion/textos/promos-transcripcion.md)", ""]
for identifier, title in [("menu-florida", "Florida"), ("menu-olivos", "Olivos / Brew Pub"), ("menu-tren", "Tren")]:
    text = (ROOT / "textos" / f"{identifier}.txt").read_text()
    pages = text.split("\f")
    pages = [content for content in pages if content.strip()]
    expected = int(metadata[f"{identifier}.pdf"]["Pages"])
    assert len(pages) == expected, f"Cantidad de páginas distinta: {identifier}"
    annex.extend([f"## {title}", "", f"[PDF original](../investigacion/originales/{identifier}.pdf). {expected} páginas.", ""])
    for number, content in enumerate(pages, 1):
        annex.extend([f"### Página {number}", "", "```text", content.strip(), "```", ""])
(REPORTS / "02-cartas-completas.md").write_text("\n".join(annex))

logo = Image.open(ROOT / "imagenes" / "logo-publicado.jpg").convert("RGB")
quantized = logo.quantize(colors=12)
palette = quantized.getpalette()
colors = []
for count, index in sorted(quantized.getcolors(), reverse=True):
    red, green, blue = palette[index * 3:index * 3 + 3]
    colors.append({"hex": f"#{red:02X}{green:02X}{blue:02X}", "porcentaje_imagen": round(count / (logo.width * logo.height) * 100, 2)})
(ROOT / "paleta-muestreada.json").write_text(json.dumps({"metodo": "Cuantización adaptativa Pillow a 12 colores del avatar completo de Linktree. Incluye el blanco exterior al círculo; no son colores oficiales ni tinta plana.", "dimensiones": list(logo.size), "colores": colors}, indent=2) + "\n")

if (ROOT / "imagenes" / "logo-instagram.jpg").exists():
    instagram_logo = Image.open(ROOT / "imagenes" / "logo-instagram.jpg").convert("RGB")
    sampled = instagram_logo.quantize(colors=5)
    palette_values = sampled.getpalette()
    sampled_colors = []
    for count, index in sorted(sampled.getcolors(), reverse=True):
        components = palette_values[index * 3:index * 3 + 3]
        sampled_colors.append({"hex": "#" + "".join(f"{component:02X}" for component in components), "porcentaje_imagen": round(count / (instagram_logo.width * instagram_logo.height) * 100, 2)})
    (ROOT / "paleta-instagram.json").write_text(json.dumps({"metodo": "Cuantización adaptativa Pillow a 5 colores del JPEG público de Instagram, incluyendo blanco exterior y antialiasing. Aproximación RGB, no especificación oficial.", "dimensiones": list(instagram_logo.size), "colores": sampled_colors}, indent=2) + "\n")
    print("Paleta Instagram:", sampled_colors)

photographs = list((ROOT / "imagenes").glob("florida-*.jpg"))
sheet = Image.new("RGB", (1200, 340 * ((len(photographs) + 2) // 3)), "white")
draw = ImageDraw.Draw(sheet)
for index, photograph in enumerate(sorted(photographs)):
    preview = ImageOps.fit(Image.open(photograph).convert("RGB"), (380, 300))
    horizontal = (index % 3) * 400 + 10
    vertical = (index // 3) * 340
    sheet.paste(preview, (horizontal, vertical))
    draw.text((horizontal, vertical + 305), photograph.name, fill="black")
sheet.save(ROOT / "imagenes" / "contacto-florida.jpg", quality=90)

for reference in sorted((ROOT / "referencias").glob("*.html")):
    parser = PageParser()
    parser.feed(reference.read_text())
    reference.with_suffix(".txt").write_text("\n".join(parser.text) + "\n")

print("PDFs:", {name: item["Pages"] for name, item in metadata.items()})
print("Anexo:", REPORTS / "02-cartas-completas.md")
print("Paleta cuantizada:", colors)
print("Lámina de fotografías:", len(photographs), "imágenes")