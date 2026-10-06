import shutil
import subprocess
from pathlib import Path


# ============================================================
# RUTAS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

ETL = BASE_DIR / "etl.py"

CARPETA_JSON = BASE_DIR / "datos_json"

CARPETA_NOVASARP = (
    BASE_DIR.parent
    / "NovaSARp"
)

# IMPORTANTE:
# Esta es la carpeta FUENTE de Angular.
# No debemos copiar directamente a dist porque ng build
# vuelve a generar dist desde src/assets.
CARPETA_DATA = (
    CARPETA_NOVASARP
    / "src"
    / "assets"
    / "data"
)

# Carpeta generada por Angular después del build
CARPETA_DIST_DATA = (
    CARPETA_NOVASARP
    / "dist"
    / "demo"
    / "browser"
    / "assets"
    / "data"
)


# ============================================================
# 1. EJECUTAR ETL
# ============================================================

print("=" * 70)
print("1. EJECUTANDO ETL")
print("=" * 70)

resultado = subprocess.run(
    ["python", str(ETL)],
    cwd=BASE_DIR
)

if resultado.returncode != 0:
    print("\nERROR: El ETL terminó con errores.")
    raise SystemExit(1)


# ============================================================
# 2. PREPARAR CARPETA FUENTE DE ANGULAR
# ============================================================

print("\n" + "=" * 70)
print("2. ACTUALIZANDO JSON DEL PORTAL")
print("=" * 70)

CARPETA_DATA.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# 3. ELIMINAR JSON ANTERIORES
# ============================================================

for archivo in CARPETA_DATA.glob("datos-*.json"):
    print(f"Eliminando: {archivo.name}")
    archivo.unlink()


# ============================================================
# 4. COPIAR JSON NUEVOS
# ============================================================

archivos_json = sorted(
    CARPETA_JSON.glob("datos-*.json")
)

if not archivos_json:
    print("\nERROR: No se encontraron archivos JSON.")
    raise SystemExit(1)

for archivo in archivos_json:

    destino = CARPETA_DATA / archivo.name

    shutil.copy2(
        archivo,
        destino
    )

    print(f"Copiado: {archivo.name}")


print(
    f"\nTotal de archivos copiados: "
    f"{len(archivos_json)}"
)


# ============================================================
# 5. BUILD ANGULAR
# ============================================================

print("\n" + "=" * 70)
print("3. GENERANDO BUILD ANGULAR")
print("=" * 70)

resultado = subprocess.run(
    [
        "ng.cmd",
        "build",
        "--base-href",
        "/NovaSARp/"
    ],
    cwd=CARPETA_NOVASARP
)

if resultado.returncode != 0:
    print("\nERROR: Falló el build de Angular.")
    raise SystemExit(1)


# ============================================================
# 6. VALIDAR JSON GENERADOS EN DIST
# ============================================================

print("\n" + "=" * 70)
print("4. VALIDANDO BUILD")
print("=" * 70)

archivos_dist = sorted(
    CARPETA_DIST_DATA.glob("datos-*.json")
)

if not archivos_dist:
    print("\nERROR: El build no generó los archivos JSON.")
    print(f"Ruta esperada: {CARPETA_DIST_DATA}")
    raise SystemExit(1)

print(f"Archivos JSON encontrados en dist: {len(archivos_dist)}")

for archivo in archivos_dist:
    print(f"OK: {archivo.name}")


# Verificar que estén los mismos archivos
nombres_fuente = sorted(
    archivo.name for archivo in archivos_json
)

nombres_dist = sorted(
    archivo.name for archivo in archivos_dist
)

if nombres_fuente != nombres_dist:

    print("\nERROR: Los archivos JSON de dist no coinciden")
    print("con los archivos generados por el ETL.")

    print("\nFuente:")
    for nombre in nombres_fuente:
        print(f"  - {nombre}")

    print("\nDist:")
    for nombre in nombres_dist:
        print(f"  - {nombre}")

    raise SystemExit(1)

print("\nVALIDACIÓN OK:")
print("Los JSON generados por el ETL están presentes en el build.")


# ============================================================
# 7. PUBLICAR GITHUB PAGES
# ============================================================

print("\n" + "=" * 70)
print("5. PUBLICANDO GITHUB PAGES")
print("=" * 70)

resultado = subprocess.run(
    [
        "npx.cmd",
        "angular-cli-ghpages",
        "--dir=dist/demo/browser"
    ],
    cwd=CARPETA_NOVASARP
)

if resultado.returncode != 0:
    print("\nERROR: Falló la publicación.")
    raise SystemExit(1)


# ============================================================
# FINAL
# ============================================================

print("\n" + "=" * 70)
print("PROCESO COMPLETADO")
print("=" * 70)

print("\nPortal actualizado:")
print("https://estebanduque123.github.io/NovaSARp/")
