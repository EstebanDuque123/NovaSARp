import csv
import io
import json
import re
import sys
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Callable

import requests


# ============================================================
# CONFIGURACIÓN
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

CARPETA_SALIDA = BASE_DIR / "datos_json"

TAMANO_BLOQUE = 10000

CITA_FUENTE = "Fuente: Portal de Datos Abiertos www.datos.gov.co"

API_BASE = "https://www.datos.gov.co/resource"

LIMITE_PAGINA = 50000

TIEMPO_ESPERA = 300

MAX_INTENTOS = 5

ESPERA_REINTENTO = 10

CABECERAS = {
    "User-Agent": (
        "ETL-DatosAbiertos/1.0 "
        "(Portal de Datos Abiertos Colombia)"
    )
}

FORMATOS_FECHA = [
    "%Y %b %d %I:%M:%S %p",
    "%Y-%m-%dT%H:%M:%S.%f",
    "%Y-%m-%dT%H:%M:%S",
    "%Y-%m-%d",
    "%d/%m/%Y",
]

INDICADORES_JURIDICA = [
    "S.A.S",
    "S.A.",
    "S.A ",
    "LTDA",
    "LIMITADA",
    "E.U.",
    "E.U ",
    "S. EN C.",
    "S EN C",
    "S.C.A.",
    "S.C.A",
    "COOPERATIVA",
    "FUNDACION",
    "FUNDACIÓN",
    "CORPORACION",
    "CORPORACIÓN",
    "ASOCIACION",
    "ASOCIACIÓN",
    "SOCIEDAD",
]


# ============================================================
# EXTRACT - DESCARGA POR API
# ============================================================

URL_SIC = f"{API_BASE}/73dx-n59j.csv"

URL_SECOP_II = f"{API_BASE}/it5q-hg94.csv"

URL_RESPONSABILIDAD_FISCAL = f"{API_BASE}/jr8e-e8tu.csv"

URL_CONTADORES = f"{API_BASE}/fs36-azrv.json"


def pedir_pagina(url, offset):
    """
    Descarga una página del endpoint reintentando ante fallos de red.
    """

    parametros = {
        "$limit": LIMITE_PAGINA,
        "$offset": offset
    }

    ultimo_error = None

    for intento in range(1, MAX_INTENTOS + 1):

        try:

            respuesta = requests.get(
                url,
                params=parametros,
                headers=CABECERAS,
                timeout=TIEMPO_ESPERA
            )

            respuesta.raise_for_status()

            return respuesta

        except requests.RequestException as error:

            ultimo_error = error

            if intento == MAX_INTENTOS:
                break

            espera = ESPERA_REINTENTO * intento

            print(
                f"    reintento {intento}/{MAX_INTENTOS} "
                f"en {espera}s ({error.__class__.__name__})"
            )

            time.sleep(espera)

    raise ConnectionError(
        f"No se pudo descargar {url}: {ultimo_error}"
    )


def leer_pagina(respuesta, formato):
    """
    Normaliza la respuesta a una lista de diccionarios.
    """

    if formato == "json":
        return respuesta.json()

    texto = respuesta.content.decode("utf-8-sig")

    return list(
        csv.DictReader(
            io.StringIO(texto)
        )
    )


def descargar_fuente(url, formato):
    """
    Generador que recorre el endpoint por páginas de 50.000.
    """

    offset = 0

    while True:

        respuesta = pedir_pagina(url, offset)

        filas = leer_pagina(respuesta, formato)

        if not filas:
            return

        yield filas

        if len(filas) < LIMITE_PAGINA:
            return

        offset += LIMITE_PAGINA


# ============================================================
# LIMPIEZA GENERAL
# ============================================================

def limpiar_texto(valor):
    """
    Limpia espacios normales, espacios Unicode y valores nulos.
    """

    if valor is None:
        return ""

    valor = str(valor).replace("\xa0", " ")

    return re.sub(r"\s+", " ", valor).strip()


def es_vacio(valor, ignorados=()):
    """
    Indica si un valor debe omitirse de la observación.
    """

    valor = limpiar_texto(valor).lower()

    if not valor:
        return True

    return valor in ignorados


def construir_observacion(campos, ignorados=()):
    """
    Une pares (etiqueta, valor) descartando los vacíos.

        [
            ("Radicado", "123"),
            ("Valor", "")
        ]

    produce:

        "Radicado: 123"
    """

    partes = []

    for etiqueta, valor in campos:

        if es_vacio(valor, ignorados):
            continue

        partes.append(
            f"{etiqueta}: "
            f"{limpiar_texto(valor)}"
        )

    return ". ".join(partes)


# ============================================================
# IDENTIFICACIÓN
# ============================================================

def limpiar_documento(valor):
    """
    Quita todos los separadores:

        19,437,076  ->  19437076
        8.600.345.941  ->  8600345941
        900 123 456  ->  900123456
    """

    return re.sub(
        r"[^\d]",
        "",
        limpiar_texto(valor)
    )


# ============================================================
# FECHAS
# ============================================================

def convertir_fecha(valor):
    """
    Normaliza cualquier fecha recognized a YYYY-MM-DD.
    """

    valor = limpiar_texto(valor)

    if not valor:
        return ""

    for formato in FORMATOS_FECHA:

        try:

            return datetime.strptime(
                valor,
                formato
            ).strftime("%Y-%m-%d")

        except ValueError:
            continue

    return ""


# ============================================================
# VALORES MONETARIOS
# ============================================================

def limpiar_valor_punto_miles(valor):
    """
    Para datasets con punto como separador de miles:

        2.947.500  ->  2947500
    """

    valor = limpiar_texto(valor)

    if not valor:
        return ""

    valor = valor.replace("$", "")
    valor = valor.replace(".", "")
    valor = valor.replace(",", ".")

    return valor


def limpiar_valor_secop(valor):
    """
    Para SECOP II, donde la coma es decimal:

        2.619.000  ->  2619000
        694.636,8  ->  694636.8
    """

    valor = limpiar_texto(valor)

    if not valor:
        return ""

    valor = valor.replace("$", "")
    valor = valor.replace(" ", "")

    if "." in valor and "," in valor:

        valor = valor.replace(".", "")
        valor = valor.replace(",", ".")

    elif "," in valor:

        valor = valor.replace(",", ".")

    elif valor.count(".") > 1:

        valor = valor.replace(".", "")

    return valor


def limpiar_monto(valor):
    """
    Para montos que solo requieren quitar símbolos y separadores de miles:

        $ 6,012,499,968.00  ->  6012499968.00

    Se mantiene como texto para no perder precisión.
    """

    valor = limpiar_texto(valor)

    if not valor:
        return ""

    return valor.replace("$", "").replace(",", "").strip()


def normalizar_booleano(valor):
    """
    True / False -> Sí / No
    """

    valor = limpiar_texto(valor).lower()

    if valor == "true":
        return "Sí"

    if valor == "false":
        return "No"

    return valor


# ============================================================
# TIPO DE PERSONA
# ============================================================

def determinar_tipo(nombre):
    """
    Clasifica heurísticamente el nombre como Natural o Jurídica.
    """

    nombre = limpiar_texto(nombre).upper()

    for indicador in INDICADORES_JURIDICA:

        if indicador in nombre:
            return "Jurídica"

    return "Natural"


def determinar_tipo_por_identificacion(row):
    """
    Clasifica a partir del tipo de identificación del registro.
    """

    identificacion = limpiar_texto(
        row.get("identificaci_n", "")
    ).upper()

    if identificacion == "NIT":
        return "Jurídica"

    return "Natural"


# ============================================================
# REGISTRO ESTÁNDAR
# ============================================================

def crear_registro(
    fuente,
    nombre,
    tipo,
    numero_id,
    fecha_hecho,
    observacion,
    link
):
    return {
        "fuente": fuente,
        "nombre": nombre,
        "tipo": tipo,
        "numeroId": numero_id,
        "fechaHecho": fecha_hecho,
        "observacion": observacion,
        "link": link,
        "citaFuente": CITA_FUENTE
    }


# ============================================================
# TRANSFORMADORES POR FUENTE
# ============================================================

def transformar_sic(row):
    """
    Sanciones impuestas en firme por la SIC.
    """

    nombre = limpiar_texto(
        row.get("multado", "")
    )

    fecha_emitida = convertir_fecha(
        row.get("fecha_emitida", "")
    )

    observacion = construir_observacion([
        ("Radicado", row.get("radicado", "")),
        ("Resolución sanción", row.get("res_sancion", "")),
        ("Fecha emitida", fecha_emitida),
        ("Valor", limpiar_valor_punto_miles(
            row.get("valor", "")
        )),
        ("Conducta", row.get("conducta", "")),
        ("Sector", row.get("sector", ""))
    ])

    return crear_registro(
        fuente="Sanciones impuestas en firme por la SIC",
        nombre=nombre,
        tipo=determinar_tipo(nombre),
        numero_id="",
        fecha_hecho=fecha_emitida,
        observacion=observacion,
        link=LINK_SIC
    )


def transformar_secop_ii(row):
    """
    SECOP II - Multas y sanciones.
    """

    nombre = limpiar_texto(
        row.get(
            "nombre_proveedor_objeto_de",
            ""
        )
    )

    fecha_evento = convertir_fecha(
        row.get("fecha_evento", "")
    )

    observacion = construir_observacion(
        campos=[
            ("Tipo de sanción", row.get("tipo_de_sancion", "")),
            ("Descripción otro tipo", row.get(
                "descripcion_otro_tipo_de",
                ""
            )),
            ("Acto", row.get("numero_de_acto", "")),
            ("Fecha evento", fecha_evento),
            ("Valor", limpiar_valor_secop(
                row.get("valor", "")
            )),
            ("Valor pagado", limpiar_valor_secop(
                row.get("valor_pagado", "")
            )),
            ("Aplicó garantías", normalizar_booleano(
                row.get("aplico_garantias", "")
            )),
            ("Estado", row.get("estado", "")),
            ("Referencia proceso", row.get("referencia_proceso", "")),
            ("ID proceso", row.get("id_proceso", "")),
            ("ID contrato", row.get("id_contrato", "")),
            ("Entidad", row.get("nombre_entidad_creadora", "")),
            ("Tipo de registro", row.get("tipo", "")),
            ("Versión", row.get("numero_de_version", ""))
        ],
        ignorados=("no definido",)
    )

    return crear_registro(
        fuente="SECOP II - Multas y Sanciones",
        nombre=nombre,
        tipo=determinar_tipo(nombre),
        numero_id=limpiar_documento(
            row.get(
                "as_codigo_proveedor_objeto",
                ""
            )
        ),
        fecha_hecho=fecha_evento,
        observacion=observacion,
        link=LINK_SECOP_II
    )


def transformar_responsabilidad_fiscal(row):
    """
    Responsabilidad Fiscal.

    Los nombres de campo del API vienen truncados por Socrata,
    por ejemplo "n_mero_de_resoluci_n_de_la".
    """

    fecha_resolucion = convertir_fecha(row.get(
        "fecha_de_resoluci_n_de_la",
        ""
    ))

    observacion = construir_observacion([
        ("Tipo de sanción", row.get(
            "tipo_de_sanci_n_multa", ""
        )),
        ("Tema", row.get("tema_clasificaci_n_o_motivo", "")),
        ("Resolución", row.get(
            "n_mero_de_resoluci_n_de_la", ""
        )),
        ("Fecha resolución", fecha_resolucion),
        ("Monto", limpiar_monto(
            row.get("monto_de_la_multa_o_sanci", "")
        )),
        ("Fecha de firmeza", convertir_fecha(row.get(
            "fecha_de_firmeza_de_la_decisi", ""
        ))),
        ("Resolución del recurso", row.get(
            "n_mero_de_resoluci_n_que", ""
        )),
        ("Fecha resolución del recurso", convertir_fecha(row.get(
            "fecha_de_resoluci_n_que", ""
        ))),
        ("Recursos interpuestos", row.get(
            "informaci_n_de_recursos", ""
        )),
        ("Descripción", row.get(
            "descripci_n_o_detalle_resumen", ""
        )),
        ("Fuente", row.get("fuente", ""))
    ])

    return crear_registro(
        fuente="Responsabilidad Fiscal",
        nombre=limpiar_texto(
            row.get("raz_n_social_de_la_entidad", "")
        ),
        tipo=determinar_tipo_por_identificacion(row),
        numero_id=limpiar_documento(
            row.get("n_mero_de_identificaci_n", "")
        ),
        fecha_hecho=fecha_resolucion,
        observacion=observacion,
        link=LINK_RESPONSABILIDAD_FISCAL
    )


def transformar_contadores(row):
    """
    Registro de sanciones a contadores.
    """

    observacion = construir_observacion([
        ("Tipo", row.get("tipo", "")),
        ("Proceso jurídico", row.get("proceso_jur_dico", "")),
        ("Resolución", row.get("resoluci_n", "")),
        ("Fecha resolución", convertir_fecha(
            row.get("fecha_resoluci_n", "")
        )),
        ("Fecha ejecutoria", convertir_fecha(
            row.get("fecha_ejecutoria", "")
        )),
        ("Fecha inicio", convertir_fecha(
            row.get("fecha_inicio", "")
        )),
        ("Meses", row.get("meses", "")),
        ("Fecha fin", convertir_fecha(
            row.get("fecha_fin", "")
        )),
        ("Fecha registro", convertir_fecha(
            row.get("fecha_registro", "")
        ))
    ])

    return crear_registro(
        fuente="Registro de Sanciones a Contadores",
        nombre=limpiar_texto(
            row.get("contador", "")
        ),
        tipo="Natural",
        numero_id=limpiar_documento(
            row.get("c_dula", "")
        ),
        fecha_hecho=convertir_fecha(
            row.get("fecha_inicio", "")
        ),
        observacion=observacion,
        link=LINK_CONTADORES
    )


# ============================================================
# ENLACES
# ============================================================

LINK_SIC = (
    "https://www.datos.gov.co/Comercio-Industria-y-Turismo/Sanciones-impuestas-en-firme-por-la-SIC/73dx-n59j/about_data"
)

LINK_SECOP_II = (
    "https://www.datos.gov.co/Estad-sticas-Nacionales/SECOPII-Multas-y-Sanciones/it5q-hg94/about_data"
)

LINK_RESPONSABILIDAD_FISCAL = (
    "https://www.datos.gov.co/Organismos-de-Control/Responsabilidad-Fiscal/jr8e-e8tu/about_data"
)

LINK_CONTADORES = (
    "https://www.datos.gov.co/Funci-n-p-blica/Registro-de-Sanciones-Contadores/fs36-azrv/about_data"
)


# ============================================================
# REGISTRO DE FUENTES
# ============================================================

@dataclass(frozen=True)
class Fuente:
    clave: str
    titulo: str
    url_api: str
    formato: str
    numero: int
    link: str
    transformar: Callable[[dict], dict]


FUENTES = {
    fuente.clave: fuente
    for fuente in [
        Fuente(
            clave="contadores",
            titulo="Sanciones a contadores",
            url_api=URL_CONTADORES,
            formato="json",
            numero=1,
            link=LINK_CONTADORES,
            transformar=transformar_contadores
        ),
        Fuente(
            clave="responsabilidad-fiscal",
            titulo="Responsabilidad Fiscal",
            url_api=URL_RESPONSABILIDAD_FISCAL,
            formato="csv",
            numero=2,
            link=LINK_RESPONSABILIDAD_FISCAL,
            transformar=transformar_responsabilidad_fiscal
        ),
        Fuente(
            clave="secop-ii",
            titulo="SECOP II - Multas y sanciones",
            url_api=URL_SECOP_II,
            formato="csv",
            numero=3,
            link=LINK_SECOP_II,
            transformar=transformar_secop_ii
        ),
        Fuente(
            clave="sic",
            titulo="Sanciones en firme por la SIC",
            url_api=URL_SIC,
            formato="csv",
            numero=4,
            link=LINK_SIC,
            transformar=transformar_sic
        )
    ]
}


# ============================================================
# LOAD
# ============================================================

def guardar_bloque(fuente, numero, registros):
    """
    Escribe un bloque de registros en su propio archivo JSON.

    Una sola fuente produce:

        datos-4.json

    Si supera el tamaño de bloque, se numera cada parte:

        datos-4-1.json
        datos-4-2.json
    """

    base = f"datos-{fuente.numero}"

    archivo = CARPETA_SALIDA / f"{base}.json"

    if numero > 1:

        if numero == 2:

            archivo.replace(
                CARPETA_SALIDA / f"{base}-1.json"
            )

        archivo = (
            CARPETA_SALIDA /
            f"{base}-{numero}.json"
        )

    with open(
        archivo,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            registros,
            f,
            ensure_ascii=False,
            separators=(",", ":")
        )

    print(
        f"    {archivo.name} "
        f"-> {len(registros):,} registros"
    )


# ============================================================
# ETL
# ============================================================

def procesar_fuente(fuente):
    """
    Execute extract + transform + load for a single source.
    """

    print(f"\n[{fuente.clave}] {fuente.titulo}")
    print(f"    {fuente.url_api}")

    bloque = []
    numero = 1
    total = 0
    archivos = 0

    try:

        for filas in descargar_fuente(
            fuente.url_api,
            fuente.formato
        ):

            for row in filas:

                registro = fuente.transformar(row)

                if not registro["nombre"] and not registro["numeroId"]:
                    continue

                bloque.append(registro)
                total += 1

                if len(bloque) >= TAMANO_BLOQUE:

                    guardar_bloque(fuente, numero, bloque)

                    numero += 1
                    archivos += 1
                    bloque = []

    except (ConnectionError, ValueError) as error:

        print(f"  ERROR: {error}")

        return None

    if bloque:

        guardar_bloque(fuente, numero, bloque)

        archivos += 1

    return total, archivos


def configurar_consola():
    """
    Evita fallos al imprimir acentos en consolas cp1252.
    """

    for flujo in (sys.stdout, sys.stderr):

        try:

            flujo.reconfigure(encoding="utf-8")

        except (AttributeError, ValueError):
            continue


def ejecutar_etl():
    """
    Runs all configured sources.
    """

    configurar_consola()

    CARPETA_SALIDA.mkdir(
        parents=True,
        exist_ok=True
    )

    print("=" * 70)
    print("ETL - PORTAL DE DATOS ABIERTOS")
    print("=" * 70)

    resumen = []
    gran_total = 0

    for fuente in FUENTES.values():

        resultado = procesar_fuente(fuente)

        if resultado is None:
            resumen.append((fuente.clave, 0, 0, False))
            continue

        total, archivos = resultado

        resumen.append((fuente.clave, total, archivos, True))
        gran_total += total

    print("\n" + "=" * 70)
    print("RESUMEN")
    print("=" * 70)

    print(
        f"{'FUENTE':<24}"
        f"{'REGISTROS':>14}"
        f"{'ARCHIVOS':>12}"
    )

    print("-" * 70)

    for clave, total, archivos, ok in resumen:

        marca = "" if ok else " (error)"

        print(
            f"{clave:<24}"
            f"{total:>14,}"
            f"{archivos:>12,}"
            f"{marca}"
        )

    print("-" * 70)

    print(
        f"{'TOTAL':<24}"
        f"{gran_total:>14,}"
    )

    print(
        f"\nSalida: {CARPETA_SALIDA}"
    )


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    ejecutar_etl()
