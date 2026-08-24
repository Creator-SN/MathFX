"""Generate missing renderer i18n entries with an OpenAI-compatible API.

Run from the project root: ``python scripts/translator.py``.
Set ``DEEPSEEK_API_KEY`` or enter it interactively. ``DEEPSEEK_BASE_URL``
and ``DEEPSEEK_MODEL`` can override the default DeepSeek endpoint/model.
"""

import getpass
import json
import os
import re
import subprocess
from pathlib import Path
from typing import Dict, Iterable, List

import requests

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "src" / "renderer" / "src" / "js" / "i18n.js"
SOURCE_PREFIX = ROOT / "src" / "renderer" / "src"
BASE_URL = os.environ.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com").rstrip("/")
MODEL = os.environ.get("DEEPSEEK_MODEL", "deepseek-chat")
LOCAL_PATTERN = r"local\([\"'`]([^\"'`]+)[\"'`]\)"
CHUNK_SIZE = 100


def load_i18n_map(raw_text: str) -> Dict[str, dict]:
    text = raw_text.replace("export default", "", 1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        node_script = r"""
const fs = require('fs'); const vm = require('vm');
const path = process.argv[1];
const src = fs.readFileSync(path, 'utf8').replace('export default', '').trim();
process.stdout.write(JSON.stringify(vm.runInNewContext('(' + src + ')', {})));
"""
        proc = subprocess.run(
            ["node", "-e", node_script, str(DATA_PATH)],
            check=True,
            capture_output=True,
        )
        return json.loads(proc.stdout.decode("utf-8"))


def ensure_entry_shape(key: str, value) -> dict:
    if isinstance(value, dict):
        return {"en": value.get("en", key), "cn": value.get("cn", "")}
    if isinstance(value, list):
        return {"en": value[0] if value else key, "cn": value[1] if len(value) > 1 else ""}
    if isinstance(value, str):
        return {"en": key, "cn": value}
    return {"en": key, "cn": ""}


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="gbk", errors="ignore")


def source_files() -> Iterable[Path]:
    return (p for p in SOURCE_PREFIX.rglob("*") if p.is_file() and p.suffix in {".js", ".vue", ".html"})


def collect_missing_keys(i18n_map: Dict[str, dict]) -> List[str]:
    keys = set()
    for path in source_files():
        for key in re.findall(LOCAL_PATTERN, read_text(path)):
            if key not in i18n_map:
                keys.add(key)
    return sorted(keys)


def chunks(items: List[str], size: int) -> Iterable[List[str]]:
    for index in range(0, len(items), size):
        yield items[index:index + size]


def extract_json_object(text: str) -> dict:
    text = (text or "").strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.S)
        if not match:
            raise
        return json.loads(match.group(0))


def translate_chunk(keys: List[str], api_key: str) -> Dict[str, str]:
    payload = {
        "model": MODEL,
        "temperature": 0,
        "max_tokens": max(256, len(keys) * 24),
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": 'Return JSON only in the form {"English":"Chinese"}. Translate UI strings to natural Simplified Chinese and keep every key unchanged.'},
            {"role": "user", "content": json.dumps(keys, ensure_ascii=False, separators=(",", ":"))},
        ],
    }
    response = requests.post(
        f"{BASE_URL}/chat/completions",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json=payload,
        timeout=60,
    )
    response.raise_for_status()
    content = response.json()["choices"][0]["message"]["content"]
    result = extract_json_object(content)
    if not isinstance(result, dict):
        raise ValueError("response is not a JSON object")
    return {str(k): "" if v is None else str(v) for k, v in result.items()}


def request_api_key() -> str:
    key = os.environ.get("DEEPSEEK_API_KEY", "").strip()
    if key:
        return key
    try:
        return getpass.getpass("DeepSeek API Key: ").strip()
    except (EOFError, KeyboardInterrupt):
        return ""


def main():
    raw = load_i18n_map(DATA_PATH.read_text(encoding="utf-8"))
    result = {key: ensure_entry_shape(key, value) for key, value in raw.items()}
    missing = collect_missing_keys(result)
    if not missing:
        print("No missing i18n keys.")
        return

    api_key = request_api_key()
    for batch in chunks(missing, CHUNK_SIZE):
        translations = {}
        if api_key:
            try:
                translations = translate_chunk(batch, api_key)
            except (requests.RequestException, KeyError, ValueError, json.JSONDecodeError) as error:
                print(f"[warn] translation failed, using English fallback: {error}")
        for key in batch:
            chinese = translations.get(key, "").strip() or key
            result[key] = {"en": key, "cn": chinese}
            print(f"{key} -> {chinese}")

    DATA_PATH.write_text("export default " + json.dumps(result, indent=4, ensure_ascii=False) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
